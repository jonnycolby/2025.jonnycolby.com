/* accepts parameters
 * r  Object = {r:x, g:y, b:z}
 * OR
 * r, g, b
 */
function rgb_to_hsv(r, g, b) {
    if (arguments.length === 1) {
        (g = r.g), (b = r.b), (r = r.r);
    }
    var max = Math.max(r, g, b),
        min = Math.min(r, g, b),
        d = max - min,
        h,
        s = max === 0 ? 0 : d / max,
        v = max / 255;

    switch (max) {
        case min:
            h = 0;
            break;
        case r:
            h = g - b + d * (g < b ? 6 : 0);
            h /= 6 * d;
            break;
        case g:
            h = b - r + d * 2;
            h /= 6 * d;
            break;
        case b:
            h = r - g + d * 4;
            h /= 6 * d;
            break;
    }

    return {
        h: h,
        s: s,
        v: v,
    };
}
