import React from "react";
import Stats from "stats.js";
//
import get_corner_pixels from "@/methods/get_pixels/corner";
import pause from "@/methods/pause";
//
import styles from "./styles.module.scss";
//
const IS_DEV = process.env.NODE_ENV === "development";
//
//

var PX_SIZE = 2; // must be a whole number

class Graphics extends React.Component {
    constructor(props) {
        super(props);
        const Z = this;
        Z.parent = props.parent;
        Z.parent.children.Graphics_p5 = Z;

        Z.static = {
            enable_stats: false,
        };

        Z.state = {
            // ...
        };

        Z.vars = {
            loaded: false,
            opacity: 0.0,
        };

        Z.mem = {
            instance: {
                p5: null,
                stats: null,
            },
            image: {},
            px: {
                corner: null,
            },
            graphics: {},
            tap_hint: null,
        };

        // uniforms:
        Z.uni = {
            t: 0,
            f: 0,
        };

        Z.cache = {
            ref: {
                t_start: null,
            },
            graphics: {
                bbox: null,
            },
            display: {
                // before scale
                size: { width: 0, height: 0 },
                native: { width: 0, height: 0, pixel_density: 1.0 },
                diode_width: 1.0, // 1.0 -> 3x3;  2.0 -> 6x6;
                graphics_px_mult: 3.0, // visuals will have half the resolution vs. text layer
                pixels: [],
            },
            pointer: {
                pos: {
                    t: Date.now(),
                    x: 0,
                    y: 0,
                    z: 0,
                },
                pos_pushed: {
                    t: Date.now() - 1,
                    x: 0,
                    y: 0,
                    z: 0,
                },
            },
        };

        Z.doc = {
            graphics: {
                gui: null,
                gui_3d: null,
                scaled: null,
                textured: null,
                composite: null,
                texture_paper: null,
                paper_grain: null,
            },
            buffer: {
                pixels: null,
            },
            shader: {
                composite: null,
            },
            px_font: null,
            image: {
                paper_dust: null,
                paper_concrete: null,
                paper_grain: null,
            },
        };

        Z.lib = {
            p5: null,
        };

        Z.dom = {
            graphics: null,
            canvas_wrap: null,
            stats: null,
        };

        //
    }

    componentDidMount() {
        const Z = this;
        Z.init();
    }
    componentWillUnmount() {
        const Z = this;
    }
    componentDidUpdate(prev_props) {
        const Z = this;
        if (Z.props.visible && !prev_props.visible) {
            Z.intro();
        }
    }
    set_state = (new_state) => new Promise((resolve) => this.setState(new_state, resolve));

    init = async () => {
        const Z = this;
        Z.measure();
        //
        Z.lib.p5 = require("p5");
        //

        Z.mem.px.corner = await get_corner_pixels();

        //
        Z.mem.instance.p5 = new Z.lib.p5(Z.SKETCH, Z.dom.canvas_wrap);
        //
        if (Z.static.enable_stats) {
            Z.mem.instance.stats = new Stats();
            Z.mem.instance.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
            Z.dom.stats.appendChild(Z.mem.instance.stats.dom);
        }
    };

    intro = async () => {
        const Z = this;
        // Z.mem.instance.p5.noLoop();
    };

    SKETCH = (p5) => {
        const Z = this;

        var px_size; // + ...

        p5.preload = async () => {
            // ...
        };

        p5.setup = () => {
            Z.measure();
            p5.createCanvas(Z.cache.graphics.bbox.width, Z.cache.graphics.bbox.height);
            // p5.pixelDensity(1);
            // p5.frameRate(60);
            p5.noLoop();
        };

        p5.windowResized = () => {
            Z.measure();
            p5.resizeCanvas(Z.cache.graphics.bbox.width, Z.cache.graphics.bbox.height);
            p5.redraw();
        };

        p5.draw = () => {
            if (Z.mem.instance.stats) Z.mem.instance.stats.begin();
            //
            var _now = performance.now();
            //
            p5.clear();
            p5.push();
            //
            const px_size = PX_SIZE; // must be a whole number
            const rows_count = Z.mem.px.corner.length;
            const cols_count = Z.mem.px.corner[0].length;
            const corner_offset = {
                x: Math.floor(cols_count * 0.5),
                y: Math.floor(cols_count * 0.75),
                // y: Math.floor(rows_count * 0.5),
            };

            // MARK: top-left corner mark
            p5.push();
            p5.fill(243, 242, 243);
            p5.noStroke();
            p5.translate(corner_offset.x * px_size, corner_offset.y * px_size);
            for (var row_i = 0; row_i < Z.mem.px.corner.length; row_i++) {
                const row = Z.mem.px.corner[row_i];
                for (var col_i = 0; col_i < row.length; col_i++) {
                    const px_val = row[col_i];
                    if (px_val >= 0.5) {
                        p5.rect(col_i * px_size, row_i * px_size, px_size, px_size);
                    }
                }
            }
            p5.pop();

            // MARK: bottom-right corner mark
            p5.push();
            p5.fill(243, 242, 243);
            p5.noStroke();
            p5.translate(p5.width - corner_offset.x * px_size, p5.height - corner_offset.y * px_size);
            p5.rotate(Math.PI * 1.0);
            for (var row_i = 0; row_i < Z.mem.px.corner.length; row_i++) {
                const row = Z.mem.px.corner[row_i];
                for (var col_i = 0; col_i < row.length; col_i++) {
                    const px_val = row[col_i];
                    if (px_val >= 0.5) {
                        p5.rect(col_i * px_size, row_i * px_size, px_size, px_size);
                    }
                }
            }
            p5.pop();

            //
            p5.pop();
            if (Z.mem.instance.stats) Z.mem.instance.stats.end();
        };
    };

    measure = () => {
        const Z = this;
        const px_size = Z.cache.display.diode_width * 3.0;
        Z.cache.graphics.bbox = Z.dom.graphics.getBoundingClientRect();
    };

    orientation_activated_or_cancelled = () => {
        const Z = this;
        Z.mem.tap_hint.opacity = 0.0;
        // Z.on_frame();
    };

    render() {
        const Z = this;

        return (
            <div className={`${styles.Graphics}`} ref={(el) => (Z.dom.graphics = el)}>
                <div className={`${styles.floaters}`}>
                    <div className={`${styles.stats}`} ref={(el) => (Z.dom.stats = el)}></div>
                </div>
                <div className={`${styles.canvas_wrap}`} ref={(el) => (Z.dom.canvas_wrap = el)}></div>
            </div>
        );
    }
}

//
//

//
//
export default Graphics;
//
//
