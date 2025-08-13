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
    matrixData = numeric.random([nr, nt]);
    displayMatrix(matrixData, "matrixContainer");
}

function performSVD() {
    if (matrixData.length === 0) {
        showError('Please simulate a channel first.');
        return;
    }

    try {
        svdResult = numeric.svd(matrixData);
        const { S } = svdResult;
        const threshold = 1e-10;
        const R = S.filter(val => Math.abs(val) > threshold).length;
        
        document.getElementById("svdMatrixDisplay").style.display = "block";
        document.getElementById("metricsDisplay").style.display = "block";

        const Sigma = numeric.diag(S);
        displayMatrix(Sigma, "sigmaMatrixContainer", true);

        document.getElementById("rankOutput").innerText = R;
        calculateCapacity(S);
        
        const analysisInfo = document.getElementById("analysisInfo");
        analysisInfo.innerHTML = `<p>The SVD decomposes the channel into <strong>${R}</strong> independent parallel sub-channels (eigenbeams).</p>`;
        analysisInfo.style.display = "block";

        document.getElementById("eigenbeamBtn").style.display = "block";
        document.getElementById("svdBtn").disabled = true;

    } catch (error) {
        showError('Error performing SVD: ' + error.message);
    }
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

function visualizeEigenbeams() {
    if (!svdResult) {
        showError('Please perform SVD first.');
        return;
    }

    try {
        const { S } = svdResult;
        const threshold = 1e-10;
        const R = S.filter(val => Math.abs(val) > threshold).length;

        renderAntennas(R, R);

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
                ctx.strokeStyle = "var(--accent-color)";
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(endX, startY);
                ctx.stroke();

                const midX = (startX + endX) / 2;
                ctx.fillStyle = "var(--primary-color)";
                ctx.font = "bold 14px sans-serif";
                ctx.textAlign = "center";
                ctx.textBaseline = "bottom";
                ctx.fillText(`λ${i+1}: ${s_i.toFixed(2)}`, midX, startY - 10);
            });

            const conditionNumber = (S[0] > threshold && S[R-1] > threshold) ? (S[0] / S[R - 1]).toFixed(2) : "∞";
            const analysisInfo = document.getElementById("analysisInfo");
            analysisInfo.innerHTML = `<p>Showing <strong>${R}</strong> eigenbeams. Line thickness represents the strength (singular value) of each sub-channel. Condition Number: ${conditionNumber}.</p>`;
            
            const eigenbeamBtn = document.getElementById("eigenbeamBtn");
            eigenbeamBtn.textContent = "Return to Channel View";
            eigenbeamBtn.onclick = () => {
                eigenbeamBtn.textContent = "Visualize Eigenbeams";
                eigenbeamBtn.onclick = visualizeEigenbeams;
                analysisInfo.innerHTML = `<p>The SVD decomposes the channel into <strong>${R}</strong> independent parallel sub-channels (eigenbeams).</p>`;
                
                // Get current values from input fields when returning to channel view
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