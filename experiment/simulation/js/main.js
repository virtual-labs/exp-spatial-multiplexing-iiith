document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('myForm').addEventListener('submit', function (e) {
        e.preventDefault();
        generateMatrix();
    });

    document.getElementById('svdPrecodingBtn').addEventListener('click', function () {
        performSVD();
        document.getElementById('capacityBtn').style.display = 'block'; // Show the Capacity Analysis button
    });

    document.getElementById('capacityBtn').addEventListener('click', function () {
        displayCapacityForm();
    });

    document.getElementById('getCapacity').addEventListener('click', function (e) {
        e.preventDefault();
        calculateCapacity(svdResult); // Pass svdResult as a parameter
    });
});

let matrixData = [];
let txElements = [], rxElements = [];
let svdResult = null;

document.addEventListener('DOMContentLoaded', () => {
    resetSimulation();
});

function validateAntennaCount(input) {
    // Ensure values are between 1-6
    if (input.value < 1) input.value = 1;
    if (input.value > 6) input.value = 6;
}

function resetSimulation() {
    document.getElementById("txCount").value = 4; // Default to 4 instead of hardcoded 6
    document.getElementById("rxCount").value = 4; // Default to 4 instead of hardcoded 6
    matrixData = [];
    svdResult = null;
    
    document.getElementById("channelMatrixDisplay").style.display = "none";
    document.getElementById("svdMatrixDisplay").style.display = "none";
    document.getElementById("metricsDisplay").style.display = "none";
    document.getElementById("analysisInfo").style.display = "none";
    document.getElementById("eigenbeamBtn").style.display = "none";
    
    document.getElementById("simulateBtn").disabled = false;
    const svdBtn = document.getElementById("svdBtn");
    svdBtn.style.display = "none";
    svdBtn.disabled = false;

    // Reset eigenbeam button to its original state
    const eigenbeamBtn = document.getElementById("eigenbeamBtn");
    eigenbeamBtn.textContent = "Visualize Eigenbeams";
    eigenbeamBtn.onclick = visualizeEigenbeams;

    document.getElementById("matrixContainer").innerHTML = '';
    document.getElementById("sigmaMatrixContainer").innerHTML = '';
    
    // Get values from input fields
    const txCount = parseInt(document.getElementById("txCount").value);
    const rxCount = parseInt(document.getElementById("rxCount").value);
    
    renderAntennas(txCount, rxCount);
    setTimeout(() => {
        drawChannelConnections();
    }, 50);
}

function simulate() {
    try {
        document.getElementById("svdMatrixDisplay").style.display = "none";
        document.getElementById("metricsDisplay").style.display = "none";
        document.getElementById("analysisInfo").style.display = "none";
        document.getElementById("eigenbeamBtn").style.display = "none";
        svdResult = null;
        
        // Get values from input fields
        const txCount = parseInt(document.getElementById("txCount").value);
        const rxCount = parseInt(document.getElementById("rxCount").value);
        
        generateChannelMatrix(rxCount, txCount);
        
        renderAntennas(txCount, rxCount);
        setTimeout(() => {
            drawChannelConnections();
        }, 50);
        
        document.getElementById("channelMatrixDisplay").style.display = "block";
        const svdButton = document.getElementById("svdBtn");
        svdButton.style.display = "block";
        svdButton.disabled = false;
        
        document.getElementById("simulateBtn").disabled = true;

    } catch (error) {
        showError(error.message);
    }
}

function renderAntennas(txCount, rxCount) {
    const txColumn = document.getElementById("txColumn");
    const rxColumn = document.getElementById("rxColumn");
    const canvas = document.getElementById("signalCanvas");
    if (!txColumn || !rxColumn || !canvas) return;
    
    // Clear existing elements
    txColumn.innerHTML = "";
    rxColumn.innerHTML = "";
    txElements = [];
    rxElements = [];

    // Create antenna elements
    for (let i = 0; i < txCount; i++) {
        txElements.push(txColumn.appendChild(createAntennaElement()));
    }
    for (let i = 0; i < rxCount; i++) {
        rxElements.push(rxColumn.appendChild(createAntennaElement()));
    }
    
    // Resize canvas after DOM update
    setTimeout(() => {
        const container = document.querySelector('.simulation-container');
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
        
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }, 10);
}

function createAntennaElement() {
    const div = document.createElement("div");
    div.className = "antenna";
    return div;
}

function drawChannelConnections() {
    const canvas = document.getElementById("signalCanvas");
    if (!canvas) return;
    
    const container = document.querySelector('.simulation-container');
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;
    
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "rgba(100, 100, 100, 0.6)";
    ctx.setLineDash([5, 5]);
    ctx.lineWidth = 1;

    for (let i = 0; i < txElements.length; i++) {
        for (let j = 0; j < rxElements.length; j++) {
            drawLine(txElements[i], rxElements[j], ctx);
        }
    }
}

function drawLine(tx, rx, ctx) {
    if(!tx || !rx) return;
    const txRect = tx.getBoundingClientRect();
    const rxRect = rx.getBoundingClientRect();
    const canvasRect = ctx.canvas.getBoundingClientRect();

    const txX = txRect.left + txRect.width / 2 - canvasRect.left;
    const txY = txRect.top + txRect.height / 2 - canvasRect.top;
    const rxX = rxRect.left + rxRect.width / 2 - canvasRect.left;
    const rxY = rxRect.top + rxRect.height / 2 - canvasRect.top;

    ctx.beginPath();
    ctx.moveTo(txX, txY);
    ctx.lineTo(rxX, rxY);
    ctx.stroke();
}

function generateChannelMatrix(nr, nt) {
    // Generate complex channel matrix with real and imaginary parts
    // Using randn-like distribution (mean 0, std 1) instead of uniform [0,1]
    const realPart = [];
    const imagPart = [];
    
    for (let i = 0; i < nr; i++) {
        realPart[i] = [];
        imagPart[i] = [];
        for (let j = 0; j < nt; j++) {
            // Box-Muller transform to generate Gaussian random variables
            const u1 = Math.random();
            const u2 = Math.random();
            const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
            const z1 = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2);
            
            realPart[i][j] = z0;
            imagPart[i][j] = z1;
        }
    }
    
    // Create complex matrix by combining real and imaginary parts
    matrixData = [];
    for (let i = 0; i < nr; i++) {
        matrixData[i] = [];
        for (let j = 0; j < nt; j++) {
            // Scale by 1/sqrt(2) to maintain proper power normalization
            const scale = 1 / Math.sqrt(2);
            matrixData[i][j] = {
                re: realPart[i][j] * scale,
                im: imagPart[i][j] * scale
            };
        }
    }
    
    displayComplexMatrix(matrixData, "matrixContainer");
}

function displayStreamMetrics(singularValues, snr_dB) {
    const container = document.getElementById("streamMetricsContainer");
    container.innerHTML = '';
    
    const snr_linear = Math.pow(10, snr_dB / 10);
    const R = singularValues.filter(s => s > 1e-10).length;
    
    const table = document.createElement('table');
    table.classList.add('matrix');
    
    // Header row
    const headerRow = document.createElement('tr');
    ['Stream', 'σ', 'λ (SNR)', 'SNR (dB)', 'Capacity (bps/Hz)'].forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);
    
    // Data rows
    singularValues.forEach((sigma_i, i) => {
        if (sigma_i > 1e-10) {
            const row = document.createElement('tr');
            
            // Stream number
            const cellStream = document.createElement('td');
            cellStream.textContent = i + 1;
            row.appendChild(cellStream);
            
            // Singular value
            const cellSigma = document.createElement('td');
            cellSigma.textContent = sigma_i.toFixed(3);
            row.appendChild(cellSigma);
            
            // Eigenvalue (SNR in linear)
            const eigenvalue = sigma_i * sigma_i;
            const cellEigen = document.createElement('td');
            cellEigen.textContent = eigenvalue.toFixed(3);
            row.appendChild(cellEigen);
            
            // SNR in dB
            const streamSNR_dB = snr_dB + 10 * Math.log10(eigenvalue);
            const cellSNR = document.createElement('td');
            cellSNR.textContent = streamSNR_dB.toFixed(2);
            row.appendChild(cellSNR);
            
            // Capacity
            const streamSNR = (snr_linear / R) * eigenvalue;
            const capacity = Math.log2(1 + streamSNR);
            const cellCap = document.createElement('td');
            cellCap.textContent = capacity.toFixed(3);
            row.appendChild(cellCap);
            
            table.appendChild(row);
        }
    });
    
    container.appendChild(table);
    document.getElementById("streamMetricsDisplay").style.display = "block";
}

function displayComplexMatrix(matrix, containerId, highlightDiagonal = false) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    const table = document.createElement('table');
    table.classList.add('matrix');

    for (let i = 0; i < matrix.length; i++) {
        const row = document.createElement('tr');
        for (let j = 0; j < matrix[0].length; j++) {
            const cell = document.createElement('td');
            const val = matrix[i][j];
            
            if (typeof val === 'object' && val.re !== undefined && val.im !== undefined) {
                // Complex number display
                const real = val.re.toFixed(2);
                const imag = val.im.toFixed(2);
                const sign = val.im >= 0 ? '+' : '';
                cell.innerHTML = `${real}${sign}${imag}j`;
            } else {
                // Real number display (for backward compatibility)
                cell.textContent = val.toFixed(2);
            }
            
            if (highlightDiagonal && i === j) {
                cell.style.fontWeight = "bold";
                cell.style.color = "var(--primary-color)";
            }
            row.appendChild(cell);
        }
        table.appendChild(row);
    }
    container.appendChild(table);
}

// Custom function to perform SVD on complex matrix H directly
function performComplexSVD(H) {
    const nr = H.length;
    const nt = H[0].length;
    
    // For SVD of complex matrix H, we compute H*H^H to get eigenvalues
    // But we need the singular values of H, not eigenvalues of H*H^H
    const HH = conjugateTranspose(H);
    
    let gramMatrix, isTransposed = false;
    
    // Choose the smaller Gram matrix for better numerical stability
    if (nr <= nt) {
        // Compute H*H^H (nr x nr matrix)
        gramMatrix = multiplyComplexMatrices(H, HH);
    } else {
        // Compute H^H*H (nt x nt matrix) 
        gramMatrix = multiplyComplexMatrices(HH, H);
        isTransposed = true;
    }
    
    // Extract real part for eigenvalue decomposition
    const realMatrix = [];
    for (let i = 0; i < gramMatrix.length; i++) {
        realMatrix[i] = [];
        for (let j = 0; j < gramMatrix[0].length; j++) {
            realMatrix[i][j] = gramMatrix[i][j].re;
        }
    }
    
    // Compute eigenvalues
    const eigenResult = numeric.eig(realMatrix);
    const eigenValues = eigenResult.lambda.x;
    
    // Singular values are square roots of eigenvalues
    let singularValues = eigenValues.map(val => Math.sqrt(Math.max(0, val))).sort((a, b) => b - a);
    
    // Pad with zeros to get min(nr, nt) singular values
    const minDim = Math.min(nr, nt);
    if (singularValues.length < minDim) {
        const padding = new Array(minDim - singularValues.length).fill(0);
        singularValues = singularValues.concat(padding);
    } else {
        singularValues = singularValues.slice(0, minDim);
    }
    
    return singularValues;
}

// Updated performSVD function to work directly on H matrix
function performSVD() {
    if (matrixData.length === 0) {
        showError('Please simulate a channel first.');
        return;
    }

    try {
        const H = matrixData;
        const nr = H.length;
        const nt = H[0].length;
        
        // Perform SVD directly on H to get singular values
        const singularValues = performComplexSVD(H);
        
        // Rank is always min(nr, nt)
        const R = Math.min(nr, nt);
        
        svdResult = { 
            S: singularValues,
            rank: R,
            nr: nr,
            nt: nt
        };

        // Get SNR from input field - DECLARE ONLY ONCE
        const baseSNR_dB = parseFloat(document.getElementById("snrInput").value);
        const totalSNR_dB = calculateTotalSNR(singularValues, baseSNR_dB);
    
        // Update the UI with all metrics
        document.getElementById("svdMatrixDisplay").style.display = "block";
        document.getElementById("metricsDisplay").style.display = "block";

        // Create and display sigma matrix (diagonal matrix of singular values)
        const Sigma = createSigmaMatrix(singularValues, nr, nt);
        displayMatrix(Sigma, "sigmaMatrixContainer", true);

        document.getElementById("rankOutput").innerText = R;

        // Calculate and display capacity
        calculateCapacity(singularValues);

        // Display per-stream metrics
        displayStreamMetrics(singularValues, baseSNR_dB);

        const analysisInfo = document.getElementById("analysisInfo");
        analysisInfo.innerHTML = `<p>The SVD decomposes the ${nr}×${nt} complex channel into <strong>${R}</strong> independent parallel sub-channels (eigenbeams).</p>`;
        analysisInfo.style.display = "block";

        document.getElementById("eigenbeamBtn").style.display = "block";
        document.getElementById("svdBtn").disabled = true;

    } catch (error) {
        showError('Error performing SVD: ' + error.message);
    }
}

// Helper function to create the Sigma matrix
function createSigmaMatrix(singularValues, nr, nt) {
    const sigma = [];
    for (let i = 0; i < nr; i++) {
        sigma[i] = [];
        for (let j = 0; j < nt; j++) {
            if (i === j && i < singularValues.length) {
                sigma[i][j] = singularValues[i];
            } else {
                sigma[i][j] = 0;
            }
        }
    }
    return sigma;
}

function conjugateTranspose(matrix) {
    const result = [];
    for (let j = 0; j < matrix[0].length; j++) {
        result[j] = [];
        for (let i = 0; i < matrix.length; i++) {
            result[j][i] = {
                re: matrix[i][j].re,
                im: -matrix[i][j].im  // Complex conjugate
            };
        }
    }
    return result;
}

function multiplyComplexMatrices(A, B) {
    const result = [];
    for (let i = 0; i < A.length; i++) {
        result[i] = [];
        for (let j = 0; j < B[0].length; j++) {
            result[i][j] = { re: 0, im: 0 };
            for (let k = 0; k < A[0].length; k++) {
                // Complex multiplication: (a+bi)(c+di) = (ac-bd) + (ad+bc)i
                const realPart = A[i][k].re * B[k][j].re - A[i][k].im * B[k][j].im;
                const imagPart = A[i][k].re * B[k][j].im + A[i][k].im * B[k][j].re;
                result[i][j].re += realPart;
                result[i][j].im += imagPart;
            }
        }
    }
    return result;
}

function displayMatrix(matrix, containerId, highlightDiagonal = false) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    const table = document.createElement('table');
    table.classList.add('matrix');

    for (let i = 0; i < matrix.length; i++) {
        const row = document.createElement('tr');
        for (let j = 0; j < matrix[0].length; j++) {
            const cell = document.createElement('td');
            cell.textContent = matrix[i][j].toFixed(2);
            if (highlightDiagonal && i === j) {
                cell.style.fontWeight = "bold";
                cell.style.color = "var(--primary-color)";
            }
            row.appendChild(cell);
        }
        table.appendChild(row);
    }
    container.appendChild(table);
}

// Updated function to calculate total SNR using singular values
function calculateTotalSNR(singularValues, baseSNR_dB) {
    let totalSNR = 0;
    const threshold = 1e-10;
    const baseSNR_linear = Math.pow(10, baseSNR_dB / 10);
    
    singularValues.forEach(sigma_i => {
        if (sigma_i > threshold) {
            // Eigenvalue (SNR for stream i) = sigma_i^2 * base_SNR
            const eigenvalue = sigma_i * sigma_i;
            const streamSNR_linear = eigenvalue * baseSNR_linear;
            totalSNR += streamSNR_linear;
        }
    });
    
    return 10 * Math.log10(totalSNR); // Convert back to dB
}

// Updated capacity calculation using singular values directly
function calculateCapacity(singularValues) {
    const snr_linear = 10; // 10 dB base SNR in linear scale
    let capacity = 0;
    const threshold = 1e-10;
    
    singularValues.forEach(sigma_i => {
        if (sigma_i > threshold) {
            // Each stream gets equal power allocation
            const streamSNR = (snr_linear / singularValues.length) * Math.pow(sigma_i, 2);
            capacity += Math.log2(1 + streamSNR);
        }
    });
    document.getElementById("capacityOutput").innerText = `${capacity.toFixed(2)} bps/Hz`;
}

// Updated visualizeEigenbeams function with corrected SNR and capacity calculations
function visualizeEigenbeams() {
    if (!svdResult) {
        showError('Please perform SVD first.');
        return;
    }

    try {
        const { S, rank } = svdResult;
        const R = rank;
        const snr_linear = 10; // Base SNR in linear scale (10 dB = 10)
        const baseSNR_dB = parseFloat(document.getElementById("snrInput").value);
        renderAntennas(R, R);

        let totalCapacity = 0;

        setTimeout(() => {
            const canvas = document.getElementById("signalCanvas");
            if (!canvas) return;
            
            const container = document.querySelector('.simulation-container');
            canvas.width = container.offsetWidth;
            canvas.height = container.offsetHeight;
            
            const ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.setLineDash([]);
            
            const max_s = Math.max(...S.filter(s => s > 1e-10));
            const canvasRect = canvas.getBoundingClientRect();

            for (let i = 0; i < R; i++) {
                const tx = txElements[i];
                const rx = rxElements[i];
                if (!tx || !rx) continue;

                const txRect = tx.getBoundingClientRect();
                const rxRect = rx.getBoundingClientRect();
                const startX = txRect.left + txRect.width / 2 - canvasRect.left;
                const startY = txRect.top + txRect.height / 2 - canvasRect.top;
                const endX = rxRect.left + rxRect.width / 2 - canvasRect.left;
                
                const sigma_i = S[i];
                ctx.lineWidth = Math.max(1.5, 6 * (sigma_i / max_s));
                
                ctx.strokeStyle = "#3498db"; 
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(endX, startY);
                ctx.stroke();

                const midX = (startX + endX) / 2;
                
                // Display singular value
                ctx.fillStyle = "#2c3e50";
                ctx.font = "bold 12px sans-serif";
                ctx.textAlign = "center";
                ctx.textBaseline = "bottom";
                ctx.fillText(`σ${i+1}: ${sigma_i.toFixed(3)}`, midX, startY - 35);
                
                // Calculate and display individual SNR (eigenvalue = sigma^2)
                const eigenvalue = sigma_i * sigma_i;
                const streamSNR_dB = baseSNR_dB + 10 * Math.log10(eigenvalue);
                ctx.fillStyle = "#27ae60";
                ctx.font = "bold 11px sans-serif";
                ctx.fillText(`SNR: ${eigenvalue.toFixed(3)} (${streamSNR_dB.toFixed(2)} dB)`, midX, startY - 20);
                
                // Calculate and display individual capacity
                const streamSNR = (snr_linear / R) * eigenvalue;
                const streamCapacity = Math.log2(1 + streamSNR);
                totalCapacity += streamCapacity;
                
                ctx.fillStyle = "#e74c3c";
                ctx.fillText(`C${i+1}: ${streamCapacity.toFixed(2)} bps/Hz`, midX, startY - 5);
            }

            const analysisInfo = document.getElementById("analysisInfo");
            analysisInfo.innerHTML = `<p>Showing <strong>${R}</strong> eigenbeams with singular values σ, eigenvalues λ=σ², and individual capacities.<br>Total capacity: <strong>${totalCapacity.toFixed(2)} bps/Hz</strong></p>`;

            const eigenbeamBtn = document.getElementById("eigenbeamBtn");
            eigenbeamBtn.textContent = "Return to Channel View";
            eigenbeamBtn.onclick = () => {
                eigenbeamBtn.textContent = "Visualize Eigenbeams";
                eigenbeamBtn.onclick = visualizeEigenbeams;
                analysisInfo.innerHTML = `<p>The SVD decomposes the ${svdResult.nr}×${svdResult.nt} complex channel into <strong>${R}</strong> independent parallel sub-channels (eigenbeams).</p>`;
                
                const txCount = parseInt(document.getElementById("txCount").value);
                const rxCount = parseInt(document.getElementById("rxCount").value);
                renderAntennas(txCount, rxCount);
                
                setTimeout(() => {
                   drawChannelConnections();
                }, 50);
            };
        }, 50);
    } catch (error) {
        showError('Error visualizing eigenbeams: ' + error.message);
    }
}

function showError(message) {
    const errorMsg = document.getElementById('errorMessage');
    errorMsg.textContent = message;
    errorMsg.style.display = 'block';
    setTimeout(() => { errorMsg.style.display = 'none'; }, 4000);
}

// OPTIMIZED VERSION - Replace your computeErgodicCapacity function with this
function computeErgodicCapacity() {
    const nt = parseInt(document.getElementById("txCountErgodic").value);
    const nr = parseInt(document.getElementById("rxCountErgodic").value);
    const snrMin = parseFloat(document.getElementById("snrMin").value);
    const snrMax = parseFloat(document.getElementById("snrMax").value);
    const snrStep = parseFloat(document.getElementById("snrStep").value);
    const numRealizations = parseInt(document.getElementById("numRealizations").value);
    
    // Validate inputs
    if (snrMin >= snrMax) {
        showError('SNR Min must be less than SNR Max');
        return;
    }
    
    if (snrStep <= 0) {
        showError('SNR Step must be positive');
        return;
    }
    
    // Show computing message with progress
    const canvas = document.getElementById('ergodicChart');
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#333';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Computing... 0%', centerX, centerY);
    
    // Generate SNR range
    const snrRange = [];
    for (let snr_dB = snrMin; snr_dB <= snrMax; snr_dB += snrStep) {
        snrRange.push(snr_dB);
    }
    
    const capacities = new Array(snrRange.length).fill(0);
    let currentRealization = 0;
    
    // OPTIMIZATION: Process in chunks to avoid blocking UI
    const CHUNK_SIZE = 20; // Process 20 realizations at a time
    
    function processChunk() {
        const chunkEnd = Math.min(currentRealization + CHUNK_SIZE, numRealizations);
        
        for (let real = currentRealization; real < chunkEnd; real++) {
            // Generate random complex channel
            const H = [];
            const scale = 1 / Math.sqrt(2);
            
            for (let i = 0; i < nr; i++) {
                H[i] = [];
                for (let j = 0; j < nt; j++) {
                    const u1 = Math.random();
                    const u2 = Math.random();
                    const mag = Math.sqrt(-2 * Math.log(u1));
                    const phase = 2 * Math.PI * u2;
                    
                    H[i][j] = {
                        re: mag * Math.cos(phase) * scale,
                        im: mag * Math.sin(phase) * scale
                    };
                }
            }
            
            // Compute singular values
            const singularValues = performComplexSVDOptimized(H);
            
            // Calculate capacity for all SNR values
            const R = Math.min(nr, nt);
            
            for (let snrIdx = 0; snrIdx < snrRange.length; snrIdx++) {
                const snr_dB = snrRange[snrIdx];
                const snr_linear = Math.pow(10, snr_dB / 10);
                let capacity = 0;
                
                for (let i = 0; i < singularValues.length; i++) {
                    const sigma_i = singularValues[i];
                    if (sigma_i < 1e-10) break; // Early exit
                    
                    const eigenvalue = sigma_i * sigma_i;
                    const streamSNR = (snr_linear / R) * eigenvalue;
                    capacity += Math.log2(1 + streamSNR);
                }
                
                capacities[snrIdx] += capacity;
            }
        }
        
        currentRealization = chunkEnd;
        
        // Update progress
        const progress = Math.round((currentRealization / numRealizations) * 100);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#333';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`Computing... ${progress}%`, centerX, centerY);
        
        // Continue processing or finalize
        if (currentRealization < numRealizations) {
            setTimeout(processChunk, 10); // Small delay to update UI
        } else {
            // Average the capacities
            for (let i = 0; i < capacities.length; i++) {
                capacities[i] /= numRealizations;
            }
            
            // Plot results
            plotErgodicCapacity(snrRange, capacities);
        }
    }
    
    // Start processing after a short delay
    setTimeout(processChunk, 50);
}

// OPTIMIZED: Faster random channel generation
function generateRandomChannel(nr, nt) {
    const H = new Array(nr);
    const scale = 1 / Math.sqrt(2);
    
    for (let i = 0; i < nr; i++) {
        H[i] = new Array(nt);
        for (let j = 0; j < nt; j++) {
            // Box-Muller transform
            const u1 = Math.random();
            const u2 = Math.random();
            const mag = Math.sqrt(-2 * Math.log(u1));
            const phase = 2 * Math.PI * u2;
            
            H[i][j] = {
                re: mag * Math.cos(phase) * scale,
                im: mag * Math.sin(phase) * scale
            };
        }
    }
    
    return H;
}

// OPTIMIZED SVD: Faster computation with early exit
function performComplexSVDOptimized(H) {
    const nr = H.length;
    const nt = H[0].length;
    const minDim = Math.min(nr, nt);
    
    // Choose smaller Gram matrix
    let gramMatrix;
    const HH = conjugateTranspose(H);
    
    if (nr <= nt) {
        gramMatrix = multiplyComplexMatricesOptimized(H, HH);
    } else {
        gramMatrix = multiplyComplexMatricesOptimized(HH, H);
    }
    
    // Extract real part (Gram matrix is Hermitian, so real part is symmetric)
    const dim = gramMatrix.length;
    const realMatrix = new Array(dim);
    for (let i = 0; i < dim; i++) {
        realMatrix[i] = new Array(dim);
        for (let j = 0; j < dim; j++) {
            realMatrix[i][j] = gramMatrix[i][j].re;
        }
    }
    
    // Compute eigenvalues
    const eigenResult = numeric.eig(realMatrix);
    const eigenValues = eigenResult.lambda.x;
    
    // Singular values (sorted descending)
    const singularValues = new Array(minDim);
    for (let i = 0; i < eigenValues.length && i < minDim; i++) {
        singularValues[i] = Math.sqrt(Math.max(0, eigenValues[i]));
    }
    
    // Pad with zeros if needed
    for (let i = eigenValues.length; i < minDim; i++) {
        singularValues[i] = 0;
    }
    
    // Sort descending
    singularValues.sort((a, b) => b - a);
    
    return singularValues;
}

// OPTIMIZED: Faster complex matrix multiplication
function multiplyComplexMatricesOptimized(A, B) {
    const rowsA = A.length;
    const colsA = A[0].length;
    const colsB = B[0].length;
    
    const result = new Array(rowsA);
    
    for (let i = 0; i < rowsA; i++) {
        result[i] = new Array(colsB);
        for (let j = 0; j < colsB; j++) {
            let re = 0, im = 0;
            
            for (let k = 0; k < colsA; k++) {
                const a = A[i][k];
                const b = B[k][j];
                
                // Complex multiplication: (a+bi)(c+di) = (ac-bd) + (ad+bc)i
                re += a.re * b.re - a.im * b.im;
                im += a.re * b.im + a.im * b.re;
            }
            
            result[i][j] = { re: re, im: im };
        }
    }
    
    return result;
}

// ADDITIONAL OPTIMIZATION: Use lookup table for power calculations
const snrLookup = new Map();

function getSNRLinear(snr_dB) {
    if (!snrLookup.has(snr_dB)) {
        snrLookup.set(snr_dB, Math.pow(10, snr_dB / 10));
    }
    return snrLookup.get(snr_dB);
}

// ALTERNATIVE: Reduce number of realizations with better sampling
function computeErgodicCapacityFast() {
    // Reduce realizations but use better statistical methods
    const defaultRealizations = parseInt(document.getElementById("numRealizations").value);
    const adaptiveRealizations = Math.max(50, Math.min(defaultRealizations, 200));
    
    document.getElementById("numRealizations").value = adaptiveRealizations;
    
    computeErgodicCapacity();
}

function plotErgodicCapacity(snrRange, capacities) {
    const canvas = document.getElementById('ergodicChart');
    
    if (!canvas) {
        showError('Canvas element not found');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    
    // Destroy existing chart if it exists
    if (window.ergodicChart && typeof window.ergodicChart.destroy === 'function') {
        window.ergodicChart.destroy();
    }
    
    // Clear any loading messages
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Create new chart
    window.ergodicChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: snrRange.map(val => val.toFixed(1)),
            datasets: [{
                label: 'Ergodic Capacity (bps/Hz)',
                data: capacities,
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                borderWidth: 3,
                pointRadius: 4,
                pointBackgroundColor: '#3498db',
                pointBorderColor: '#3498db',
                pointHoverRadius: 6,
                tension: 0.1,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        font: {
                            size: 14
                        }
                    }
                },
                title: {
                    display: true,
                    text: `MIMO Ergodic Capacity vs SNR (${document.getElementById('txCountErgodic').value}x${document.getElementById('rxCountErgodic').value})`,
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'SNR (dB)',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Capacity (bps/Hz)',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    beginAtZero: true,
                    grid: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                }
            }
        }
    });
}

function showTab(tabId) {
    // Hide all sections
    document.getElementById('TASK1').style.display = 'none';
    document.getElementById('TASK2').style.display = 'none';
    
    // Show selected section
    document.getElementById(tabId).style.display = 'block';
    
    // Update button states
    document.getElementById('tab1Btn').classList.remove('active');
    document.getElementById('tab2Btn').classList.remove('active');
    
    if (tabId === 'TASK1') {
        document.getElementById('tab1Btn').classList.add('active');
    } else {
        document.getElementById('tab2Btn').classList.add('active');
    }
}