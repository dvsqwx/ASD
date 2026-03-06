'use strict';

// ASD Lab 3


const fs = require('fs');

const variant = parseInt(process.argv[2]) || 1209;

const n1 = Math.floor(variant / 1000);
const n2 = Math.floor((variant % 1000) / 100);
const n3 = Math.floor((variant % 100) / 10);
const n4 = variant % 10;

const n = 10 + n3;
const k = 1.0 - n3 * 0.02 - n4 * 0.005 - 0.25;

console.log(`variant: ${variant} => n1=${n1}, n2=${n2}, n3=${n3}, n4=${n4}`);
console.log(`vertices: ${n}, k: ${k}`);



const makeRandom = (seed) => {
    let state = seed >>> 0;
    return () => {
        state = ((Math.imul(214013, state) + 2531011) >>> 0);
        return (((state >>> 16) & 0x7FFF) / 32767) * 2.0; // returns [0, 2.0)
    };
};



const randm = (size, randFn) =>
    Array.from({ length: size }, () =>
        Array.from({ length: size }, () => randFn())
    );

const mulmr = (matrix, coef) =>
    matrix.map(row =>
        row.map(val => (val * coef >= 1.0 ? 1 : 0))
    );

const makeUndirected = (dirMatrix) => {
    const size = dirMatrix.length;
    const result = dirMatrix.map(row => [...row]);
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (result[i][j] === 1) result[j][i] = 1;
        }
    }
    return result;
};

const rng   = makeRandom(variant);
const T     = randm(n, rng);
const Adir  = mulmr(T, k);
const Aundir = makeUndirected(Adir);

const printMatrix = (matrix, name) => {
    console.log(`\n${name}:`);
    matrix.forEach(row => console.log(row.join(' ')));
};

printMatrix(Adir,   'Directed adjacency matrix Adir');
printMatrix(Aundir, 'Undirected adjacency matrix Aundir');



const W  = 700;
const H  = 700;
const cx = W / 2;
const cy = H / 2;
const R  = 240;

const spreadOnPerimeter = (count, polyVerts) => {
    const sideLengths = polyVerts.map((v, i) => {
        const next = polyVerts[(i + 1) % polyVerts.length];
        return Math.sqrt((next.x - v.x) ** 2 + (next.y - v.y) ** 2);
    });
    const totalLen = sideLengths.reduce((acc, l) => acc + l, 0);

    return Array.from({ length: count }, (_, i) => {
        const target = (i / count) * totalLen;
        let acc = 0;
        for (let s = 0; s < polyVerts.length; s++) {
            if (target < acc + sideLengths[s] + 1e-9) {
                const t = (target - acc) / sideLengths[s];
                const from = polyVerts[s];
                const to   = polyVerts[(s + 1) % polyVerts.length];
                return {
                    x: from.x + (to.x - from.x) * t,
                    y: from.y + (to.y - from.y) * t,
                };
            }
            acc += sideLengths[s];
        }
    });
};

const getVertexPositions = (count, layoutType) => {
    if (layoutType <= 1) {
        return Array.from({ length: count }, (_, i) => {
            const angle = (2 * Math.PI * i / count) - Math.PI / 2;
            return { x: cx + R * Math.cos(angle), y: cy + R * Math.sin(angle) };
        });
    }

    if (layoutType <= 3) {
        const corners = [
            { x: cx - R * 1.3, y: cy - R * 0.9 },
            { x: cx + R * 1.3, y: cy - R * 0.9 },
            { x: cx + R * 1.3, y: cy + R * 0.9 },
            { x: cx - R * 1.3, y: cy + R * 0.9 },
        ];
        return spreadOnPerimeter(count, corners);
    }

    if (layoutType <= 5) {
        const r2 = R * 1.1;
        const corners = [
            { x: cx,                              y: cy - r2 },
            { x: cx + r2 * Math.cos(Math.PI / 6), y: cy + r2 * 0.5 },
            { x: cx - r2 * Math.cos(Math.PI / 6), y: cy + r2 * 0.5 },
        ];
        return spreadOnPerimeter(count, corners);
    }

    if (layoutType <= 7) {
        const ring = Array.from({ length: count - 1 }, (_, i) => {
            const angle = (2 * Math.PI * i / (count - 1)) - Math.PI / 2;
            return { x: cx + R * Math.cos(angle), y: cy + R * Math.sin(angle) };
        });
        return [{ x: cx, y: cy }, ...ring];
    }

    const corners = [
        { x: cx - R * 1.3, y: cy - R * 0.9 },
        { x: cx + R * 1.3, y: cy - R * 0.9 },
        { x: cx + R * 1.3, y: cy + R * 0.9 },
        { x: cx - R * 1.3, y: cy + R * 0.9 },
    ];
    return [{ x: cx, y: cy }, ...spreadOnPerimeter(count - 1, corners)];
};



const VR = 18; // vertex radius

const isPointNearSegment = (ax, ay, bx, by, px, py) => {
    const dx = bx - ax, dy = by - ay;
    const len2 = dx ** 2 + dy ** 2;
    if (len2 < 1) return false;
    const t = ((px - ax) * dx + (py - ay) * dy) / len2;
    if (t < 0.15 || t > 0.85) return false;
    const dist = Math.sqrt((px - (ax + t * dx)) ** 2 + (py - (ay + t * dy)) ** 2);
    return dist < VR + 4;
};

const buildSVG = (matrix, verts, isDirected, title) => {
    const size = matrix.length;
    const parts = [];

    parts.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">`);
    parts.push(`<rect width="${W}" height="${H}" fill="white"/>`);
    parts.push(`<defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5"
      markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="black"/>
    </marker>
  </defs>`);
    parts.push(`<text x="${W / 2}" y="25" text-anchor="middle"
    font-family="Arial" font-size="16" font-weight="bold">${title}</text>`);

    const stroke = `fill="none" stroke="black" stroke-width="1.5"`;
    const arrow  = isDirected ? ' marker-end="url(#arrow)"' : '';

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (matrix[i][j] !== 1) continue;
            if (!isDirected && i > j) continue;

            const { x: x1, y: y1 } = verts[i];
            const { x: x2, y: y2 } = verts[j];

            if (i === j) {
                const lx = (x1 + VR * 0.7 + 14).toFixed(1);
                const ly = (y1 - VR * 0.7 - 14).toFixed(1);
                parts.push(`<circle cx="${lx}" cy="${ly}" r="14" ${stroke}${arrow}/>`);
                continue;
            }

            const dx = x2 - x1, dy = y2 - y1;
            const len = Math.sqrt(dx ** 2 + dy ** 2);
            const ux = dx / len, uy = dy / len;

            const bidir   = isDirected && matrix[j][i] === 1;
            const blocked = verts.some((v, m) =>
                m !== i && m !== j && isPointNearSegment(x1, y1, x2, y2, v.x, v.y)
            );

            const trim  = isDirected ? VR + 10 : VR;
            const sx    = (x1 + ux * VR).toFixed(1);
            const sy    = (y1 + uy * VR).toFixed(1);

            if (!bidir && !blocked) {
                const ex = (x2 - ux * trim).toFixed(1);
                const ey = (y2 - uy * trim).toFixed(1);
                parts.push(`<line x1="${sx}" y1="${sy}" x2="${ex}" y2="${ey}" ${stroke}${arrow}/>`);
            } else {
                const bend = bidir ? 40 : 55;
                const qx = (x1 + x2) / 2 - uy * bend;
                const qy = (y1 + y2) / 2 + ux * bend;

                const edx = x2 - qx, edy = y2 - qy;
                const el  = Math.sqrt(edx ** 2 + edy ** 2);
                const ex  = (x2 - (edx / el) * trim).toFixed(1);
                const ey  = (y2 - (edy / el) * trim).toFixed(1);

                parts.push(`<path d="M${sx},${sy} Q${qx.toFixed(1)},${qy.toFixed(1)} ${ex},${ey}" ${stroke}${arrow}/>`);
            }
        }
    }

    verts.forEach(({ x, y }, i) => {
        parts.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${VR}" fill="white" stroke="black" stroke-width="1.8"/>`);
        parts.push(`<text x="${x.toFixed(1)}" y="${(y + 5).toFixed(1)}" text-anchor="middle"
      font-family="Arial" font-size="13" font-weight="bold">${i + 1}</text>`);
    });

    parts.push('</svg>');
    return parts.join('\n');
};

const verts = getVertexPositions(n, n4);

fs.writeFileSync('graph_directed.svg',   buildSVG(Adir,   verts, true,  `Directed graph, variant ${variant}`));
fs.writeFileSync('graph_undirected.svg', buildSVG(Aundir, verts, false, `Undirected graph, variant ${variant}`));

console.log('\nsaved: graph_directed.svg');
console.log('saved: graph_undirected.svg');
