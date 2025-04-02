//
// Example usage:
// const noise = createPerlinNoise(42); // optional seed
// const value = noise(10.5, 20.3);
// console.log(value); // Range ~[-1, 1]
//

// 2D Perlin noise generator
function create_perlin_noise(seed = 0) {
    const perm = new Uint8Array(512);
    const grad2 = [
        [1, 1],
        [-1, 1],
        [1, -1],
        [-1, -1],
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
    ];

    // Simple LCG seedable random generator
    function lcg(seed) {
        let s = seed;
        return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
    }

    // Build permutation table
    const rand = lcg(seed);
    const p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) p[i] = i;
    for (let i = 255; i > 0; i--) {
        const j = (rand() * (i + 1)) | 0;
        [p[i], p[j]] = [p[j], p[i]];
    }
    for (let i = 0; i < 512; i++) perm[i] = p[i & 255];

    function fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10); // 6t⁵ - 15t⁴ + 10t³
    }

    function lerp(t, a, b) {
        return a + t * (b - a);
    }

    function grad(hash, x, y) {
        const g = grad2[hash & 7];
        return g[0] * x + g[1] * y;
    }

    return function perlin(x, y) {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;

        const xf = x - Math.floor(x);
        const yf = y - Math.floor(y);

        const u = fade(xf);
        const v = fade(yf);

        const aa = perm[X + perm[Y]];
        const ab = perm[X + perm[Y + 1]];
        const ba = perm[X + 1 + perm[Y]];
        const bb = perm[X + 1 + perm[Y + 1]];

        const x1 = lerp(u, grad(aa, xf, yf), grad(ba, xf - 1, yf));
        const x2 = lerp(u, grad(ab, xf, yf - 1), grad(bb, xf - 1, yf - 1));

        return lerp(v, x1, x2); // Result in range [-1, 1]
    };
}

//
//
export default create_perlin_noise;
//
//
