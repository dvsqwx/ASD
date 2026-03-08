'use strict';

class CRand {
    constructor(seed) {
        this.state = (seed >>> 0);
    }

    rand() {
        this.state = ((this.state * 1103515245 + 12345) >>> 0);
        return (this.state >>> 16) & 0x7fff;
    }

    randFloat() {
        return (this.rand() / 32767.0) * 2.0;
    }
}

function buildAdir(seed, n, k) {
    const rng = new CRand(seed);
    const T = Array.from({ length: n }, () =>
        Array.from({ length: n }, () => rng.randFloat())
    );
    return T.map(row => row.map(v => v * k >= 1.0 ? 1 : 0));
}

function buildAundir(Adir) {
    const n = Adir.length;
    const A = Adir.map(r => [...r]);
    for (let i = 0; i < n; i++)
        for (let j = 0; j < n; j++)
            if (Adir[i][j]) { A[i][j] = 1; A[j][i] = 1; }
    return A;
}

function parseVariant(input) {
    const clean = input.replace(/\D/g, '');
    if (clean.length !== 4) return { error: 'Введіть рівно 4 цифри варіанту' };

    const [n1, n2, n3, n4] = clean.split('').map(Number);
    const seed = parseInt(clean, 10);
    const n = 10 + n3;
    const k = 1.0 - n3 * 0.02 - n4 * 0.005 - 0.25;
    const Adir = buildAdir(seed, n, k);
    const Aundir = buildAundir(Adir);

    return { n1, n2, n3, n4, seed, n, k, Adir, Aundir };
}