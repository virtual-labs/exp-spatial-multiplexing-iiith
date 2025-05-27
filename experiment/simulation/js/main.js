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
let svdResult = null;
let matrixData = [];

function generateMatrix() {
    const nr = parseInt(document.getElementById('nrInput').value);
    const nt = parseInt(document.getElementById('ntInput').value);

    if (isNaN(nr) || isNaN(nt) || nr <= 0 || nt <= 0) {
        alert('Please enter valid values for Nr and Nt.');
        return;
    }

    matrixData = []; // Reset matrix data

    const matrixContainer = document.getElementById('matrixContainer');
    matrixContainer.innerHTML = ''; // Clear previous content

    // Create 'H =' text element
    const hText = document.createElement('div');
    hText.textContent = 'H';
    hText.className = 'matrixLabel';
    matrixContainer.appendChild(hText);

    // Create the matrix table
    const matrixTable = document.createElement('table');
    matrixTable.classList.add('matrix');

    for (let i = 0; i < nr; i++) {
        const row = document.createElement('tr');
        const rowData = [];
        for (let j = 0; j < nt; j++) {
            const cell = document.createElement('td');
            // Generate random real numbers
            const value = (Math.random() * 10).toFixed(2);
            // Display the value in the cell
            cell.textContent = value;
            rowData.push(parseFloat(value));
            row.appendChild(cell);
        }
        matrixData.push(rowData);
        matrixTable.appendChild(row);
    }

    matrixContainer.appendChild(matrixTable);

    // Show the matrix container after generating the matrix
    matrixContainer.style.display = 'block';

    // Hide the SVD container
    document.getElementById('svdContainer').style.display = 'none';

    // Show SVD precoding button and hide others
    document.getElementById('svdPrecodingBtn').style.display = 'block';
    document.getElementById('capacityBtn').style.display = 'none';

    // Hide capacity analysis form and result
    document.getElementById('capacityForm').style.display = 'none';
    const capacityResult = document.querySelector('.capacityResult');
    if (capacityResult) {
        capacityResult.remove();
    }
}


function performSVD() {
    if (matrixData.length === 0) {
        alert('Please generate a matrix first.');
        return;
    }

    // Clear existing matrices in svdContainer
    const svdContainer = document.getElementById('svdContainer');
    svdContainer.innerHTML = '';

    // Perform Singular Value Decomposition
    svdResult = numeric.svd(matrixData);

    // Display U matrix
    displayMatrix('U ', svdResult.U, 'svdContainer');

    // Display Sigma matrix
    displayMatrix('Σ ', math.diag(svdResult.S), 'svdContainer');

    // Display V matrix
    const base='V';
    const superscriptH = '\u1D34'; // Unicode character for superscript 'H'

    const result = base + superscriptH;
    displayMatrix(result, svdResult.V, 'svdContainer');

    // Show the SVD container
    svdContainer.style.display = 'block';
}


function displayMatrix(label, matrix, containerId) {
    const container = document.getElementById(containerId);

    // Create label element
    const labelElement = document.createElement('div');
    labelElement.textContent = label;
    labelElement.className = 'matrixLabel';

    container.appendChild(labelElement);

    // Create table for matrix
    const table = document.createElement('table');
    table.classList.add('matrix');

    // Populate table with matrix values
    for (let i = 0; i < matrix.length; i++) {
        const row = document.createElement('tr');
        for (let j = 0; j < matrix[i].length; j++) {
            const cell = document.createElement('td');
            cell.textContent = matrix[i][j].toFixed(2);
            row.appendChild(cell);
        }
        table.appendChild(row);
    }

    // Append matrix table to container
    container.appendChild(table);
}


function displayCapacityForm() {
    const capacityForm = document.getElementById('capacityForm');
    const capacityBtn = document.getElementById('capacityBtn');

    // Toggle visibility of the capacity form
    if (capacityForm.style.display === 'none') {
        capacityForm.style.display = 'block';
    } else {
        capacityForm.style.display = 'none';
        capacityBtn.textContent = 'Capacity Analysis'; // Change button text
    }
}



function calculateCapacity() {
    // Retrieve input values
    const B = parseFloat(document.getElementById('bInput').value);
    const P = parseFloat(document.getElementById('pTotInput').value);
    const sigma_n = parseFloat(document.getElementById('sigmaInput').value);

    if (isNaN(B) || isNaN(P) || isNaN(sigma_n) || B <= 0 || P <= 0 || sigma_n <= 0) {
        alert('Please enter valid values for B, P, and σₙ.');
        return;
    }

    if (matrixData.length === 0) {
        alert('Please generate a matrix first.');
        return;
    }

    // Retrieve eigenvalues (σᵢ) from the SVD result
    const eigenvalues = svdResult.S;
    let totalCapacity = 0;

    // Calculate total capacity
    for (let i = 0; i < eigenvalues.length; i++) {
        const term = (P / eigenvalues.length) * (eigenvalues[i] / sigma_n);
        totalCapacity += B * Math.log2(1 + term);
    }

    // Remove existing capacity result if present
    const existingCapacityResult = document.querySelector('.capacityResult');
    if (existingCapacityResult) {
        existingCapacityResult.remove();
    }

    // Display the total capacity
    const capacityContainer = document.createElement('div');
    capacityContainer.textContent = 'Total Capacity = ' + totalCapacity.toFixed(2);
    capacityContainer.className = 'capacityResult';

    // Append the capacity result to the document
    const capacityForm = document.getElementById('capacityForm');
    capacityForm.appendChild(capacityContainer);
}
