//
import get_image_pixels from "./image";
//
//

const get_spade_pixels = async () => {
    const img_px = await get_image_pixels("/img/pixel-spade-01--transparent.png");

    const xy = [];
    for (var row_i = 0; row_i < img_px.length; row_i++) {
        const row = img_px[row_i];
        if (xy.length < row_i + 1) xy.push([]);
        for (var col_i = 0; col_i < row.length; col_i++) {
            const px = row[col_i];
            const val = px[3] >= 0.5 ? 1 : 0;
            xy[row_i].push(val);
            // if (val === 1) one_count++;
        }
    }

    // ->
    return xy;
};

//
//
export default get_spade_pixels;
//
//
