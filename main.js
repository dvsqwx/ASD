'use strict';

const DIR_THEME = {
    edge: '#000',
    nodeFill: '#fff',
    nodeStroke: '#000',
    nodeText: '#000',
};

const UNDIR_THEME = {
    edge: '#000',
    nodeFill: '#fff',
    nodeStroke: '#000',
    nodeText: '#000',
};

function renderMatrixTable(tableEl, matrix) {
    tableEl.innerHTML = '';
    matrix.forEach(row => {
        const tr = document.createElement('tr');
        row.forEach(val => {
            const td = document.createElement('td');
            td.textContent = val;
            td.className = val ? 'cell-one' : 'cell-zero';
            tr.appendChild(td);
        });
        tableEl.appendChild(tr);
    });
}

function build() {
    const input = document.getElementById('variant-input').value.trim();
    const result = parseVariant(input);

    const errorEl = document.getElementById('error-msg');
    if (result.error) {
        errorEl.textContent = result.error;
        errorEl.style.display = 'block';
        return;
    }
    errorEl.style.display = 'none';

    const { n4, seed, n, k, Adir, Aundir } = result;

    const dirCanvas = document.getElementById('canvas-dir');
    const undirCanvas = document.getElementById('canvas-undir');
    renderGraph(dirCanvas,   n, n4, Adir,   true,  DIR_THEME);
    renderGraph(undirCanvas, n, n4, Aundir, false, UNDIR_THEME);

    renderMatrixTable(document.getElementById('matrix-dir'),   Adir);
    renderMatrixTable(document.getElementById('matrix-undir'), Aundir);

    document.getElementById('results').style.display = 'block';
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('build-btn').addEventListener('click', build);

    document.getElementById('variant-input').addEventListener('keydown', e => {
        if (e.key === 'Enter') build();
    });
});
