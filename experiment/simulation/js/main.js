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
    const realPart = numeric.random([nr, nt]);
    const imagPart = numeric.random([nr, nt]);
    
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

// Updated performSVD function to calculate and display both SNR and Capacity
function performSVD() {
    if (matrixData.length === 0) {
        showError('Please simulate a channel first.');
        return;
    }

    try {
        // Complex SVD logic remains the same
        const H = matrixData;
        const HH = conjugateTranspose(H);
        const HH_H = multiplyComplexMatrices(HH, H);

        const realMatrix = [];
        for (let i = 0; i < HH_H.length; i++) {
        realMatrix[i] = [];
        for (let j = 0; j < HH_H[0].length; j++) {
            realMatrix[i][j] = HH_H[i][j].re;
        }
        }

        const eigenResult = numeric.eig(realMatrix);
        const eigenValues = eigenResult.lambda.x;
        const singularValues = eigenValues.map(val => Math.sqrt(Math.max(0, val))).sort((a, b) => b - a);

        svdResult = { S: singularValues };
        const threshold = 1e-10;
        const R = singularValues.filter(val => val > threshold).length;

    // --- Start of Changes ---

        // 1. Define a base SNR to use for calculations (e.g., 10 dB)
        const baseSNR_dB = 10; 

        // 2. Call the function to calculate total SNR
        const totalSNR_dB = calculateTotalSNR(singularValues, baseSNR_dB);
    
    // 3. Update the UI with all metrics
        document.getElementById("svdMatrixDisplay").style.display = "block";
        document.getElementById("metricsDisplay").style.display = "block";

        const Sigma = numeric.diag(singularValues);
        displayMatrix(Sigma, "sigmaMatrixContainer", true);

        document.getElementById("rankOutput").innerText = R;
        document.getElementById("totalSnrOutput").innerText = `${totalSNR_dB.toFixed(2)} dB`; // Display the calculated SNR

        // Call the capacity calculation as before
        calculateCapacity(singularValues); 
    
    // --- End of Changes ---

        const analysisInfo = document.getElementById("analysisInfo");
        analysisInfo.innerHTML = `<p>The SVD decomposes the complex channel into <strong>${R}</strong> independent parallel sub-channels (eigenbeams).</p>`;
        analysisInfo.style.display = "block";

        document.getElementById("eigenbeamBtn").style.display = "block";
        document.getElementById("svdBtn").disabled = true;

    } catch (error) {
        showError('Error performing SVD: ' + error.message);
    }
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

// New function to calculate total SNR
function calculateTotalSNR(singularValues, baseSNR) {
    let totalSNR = 0;
    const threshold = 1e-10;
    
    singularValues.forEach(s_i => {
        if (s_i > threshold) {
            // SNR for each eigenbeam is proportional to the square of singular value
            const streamSNR = baseSNR + 10 * Math.log10(s_i * s_i);
            totalSNR += Math.pow(10, streamSNR / 10); // Convert to linear scale and sum
        }
    });
    
    return 10 * Math.log10(totalSNR); // Convert back to dB
}

function calculateCapacity(singularValues) {
    const snr = 10;
    let capacity = 0;
    singularValues.forEach(s_i => {
        if (s_i > 1e-10) {
            capacity += Math.log2(1 + (snr / singularValues.length) * Math.pow(s_i, 2));
        }
    });
    document.getElementById("capacityOutput").innerText = `${capacity.toFixed(2)} bps/Hz`;
}

// Updated visualizeEigenbeams function to show individual capacities
function visualizeEigenbeams() {
    if (!svdResult) {
        showError('Please perform SVD first.');
        return;
    }

    try {
        const { S } = svdResult;
        const threshold = 1e-10;
        const R = S.filter(val => Math.abs(val) > threshold).length;
        const snr = 10; // Base SNR in linear scale (10 dB = 10)
        const baseSNR_dB = 10; // Base SNR in dB for display

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
            
            const max_s = S[0] > 1e-10 ? S[0] : 1;
            const canvasRect = canvas.getBoundingClientRect();

            txElements.forEach((tx, i) => {
                const rx = rxElements[i];
                if (!tx || !rx) return;

                const txRect = tx.getBoundingClientRect();
                const rxRect = rx.getBoundingClientRect();
                const startX = txRect.left + txRect.width / 2 - canvasRect.left;
                const startY = txRect.top + txRect.height / 2 - canvasRect.top;
                const endX = rxRect.left + rxRect.width / 2 - canvasRect.left;
                
                const s_i = S[i];
                ctx.lineWidth = Math.max(1.5, 6 * (s_i / max_s));
                
                ctx.strokeStyle = "#3498db"; 
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(endX, startY);
                ctx.stroke();

                const midX = (startX + endX) / 2;
                
                // --- START OF MODIFICATIONS ---

                // Display singular value (Adjusted Y position to make space)
                ctx.fillStyle = "#2c3e50"; // Dark color
                ctx.font = "bold 12px sans-serif";
                ctx.textAlign = "center";
                ctx.textBaseline = "bottom";
                ctx.fillText(`λ<sub>${i+1}</sub>: ${s_i.toFixed(2)}`, midX, startY - 10);
            });

            const analysisInfo = document.getElementById("analysisInfo");
            analysisInfo.innerHTML = `<p>Showing <strong>${R}</strong> eigenbeams with their individual capacities.<br>Total capacity is the sum of these streams: <strong>${totalCapacity.toFixed(2)} bps/Hz</strong>.</p>`;

            const eigenbeamBtn = document.getElementById("eigenbeamBtn");
            eigenbeamBtn.textContent = "Return to Channel View";
            eigenbeamBtn.onclick = () => {
                eigenbeamBtn.textContent = "Visualize Eigenbeams";
                eigenbeamBtn.onclick = visualizeEigenbeams;
                analysisInfo.innerHTML = `<p>The SVD decomposes the channel into <strong>${R}</strong> independent parallel sub-channels (eigenbeams).</p>`;
                
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
