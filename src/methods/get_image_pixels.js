"use client";
//
//

const get_image_pixels = (image_url) => {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const img = new Image();
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const pixels = imageData.data;

            const pixels_rgba = [];
            var px_index = -1;
            var px_row = -1;
            for (var px_i = 0; px_i < pixels.length; px_i += 4) {
                px_index = px_i / 4;
                px_row = Math.floor(px_index / img.width);
                const r = pixels[px_i + 0];
                const g = pixels[px_i + 1];
                const b = pixels[px_i + 2];
                const a = pixels[px_i + 3];
                //
                const px_rgba = [r, g, b, a];
                //
                if (!pixels_rgba[px_row]) pixels_rgba[px_row] = [];
                pixels_rgba[px_row].push(px_rgba);
            }
            canvas.remove();
            resolve(pixels_rgba);
        };

        img.src = image_url; // Replace with the actual image URL
    });
};

//
//
export default get_image_pixels;
//
//
