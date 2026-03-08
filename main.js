'use strict';

const DIR_THEME = {
    edge: '#38bdf8',
    nodeFill: '#0c1a2e',
    nodeStroke: '#38bdf8',
    nodeText: '#e0f2fe',
};

const UNDIR_THEME = {
    edge: '#a78bfa',
    nodeFill: '#130c2e',
    nodeStroke: '#a78bfa',
    nodeText: '#ede9fe',
};

function renderMatrixTable(tableEl, matrix, color) {
    tableEl.innerHTML = '';
    matrix.forEach(row => {
        const tr = document.createElement('tr');
        row.forEach(val => {
            const td = document.createElement('td');
            td.textContent = val;
            td.className = val ? 'cell-one' : 'cell-zero';
            td.style.setProperty('--accent', color);
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

    renderMatrixTable(document.getElementById('matrix-dir'),   Adir,   '#38bdf8');
    renderMatrixTable(document.getElementById('matrix-undir'), Aundir, '#a78bfa');

    document.getElementById('results').style.display = 'block';
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('build-btn').addEventListener('click', build);

    document.getElementById('variant-input').addEventListener('keydown', e => {
        if (e.key === 'Enter') build();
    });
});
