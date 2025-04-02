"use client";
//
import React from "react";
//
import create_perlin_noise from "@/methods/noise/perlin";
//
import styles from "./styles.module.scss";
//
//

const PX_SIZE = 2; // must be a whole number
const COLOR = [221, 220, 221];

class Magic_icon extends React.Component {
    constructor(props) {
        super(props);
        const Z = this;

        Z.lib = { p5: null };

        Z.noise = create_perlin_noise(42); // generate a new 2D noise instance with optional seed

        Z.static = {
            line_count: 18,
            // symmetrical: true,
        };

        Z.state = {
            // rotation_deg: 0.0,
        };

        Z.vars = {
            _mounted: false,
            // lines: [],
        };

        Z.cache = {
            bbox: null,
            size: null,
        };

        Z.mem = {
            instance: { p5: null },
            graphics: {
                img: null,
            },
        };

        Z.dom = {
            Magic_icon: null,
            // canvas: null,
        };
    }
    componentDidMount() {
        const Z = this;
        if (Z.vars._mounted) return; // only run once
        Z.vars._mounted = true;
        Z.init(); // async
    }
    set_state = (new_state) => new Promise((resolve) => this.setState(new_state, resolve));

    init = async () => {
        const Z = this;
        Z.cache.bbox = Z.dom.Magic_icon.getBoundingClientRect();
        Z.lib.p5 = require("p5");
        Z.mem.instance.p5 = new Z.lib.p5(Z.SKETCH, Z.dom.Magic_icon);
    };

    SKETCH = (p5) => {
        const Z = this;

        // p5.preload = async () => {};

        p5.setup = () => {
            p5.createCanvas(Z.cache.bbox.width, Z.cache.bbox.height, p5.P2D);
            p5.pixelDensity(1);
            p5.noSmooth();
            //
            Z.cache.size = {
                width: Math.floor(Z.cache.bbox.width / PX_SIZE),
                height: Math.floor(Z.cache.bbox.height / PX_SIZE),
            };
            Z.mem.graphics.img = p5.createGraphics(Z.cache.size.width, Z.cache.size.height, p5.WEBGL);
            Z.mem.graphics.img.pixelDensity(1);
            Z.mem.graphics.img.noSmooth();
            Z.mem.graphics.img.background(...COLOR, 0);
        };

        // p5.windowResized = () => {};

        p5.draw = () => {
            const IMG = Z.mem.graphics.img;
            const _now = performance.now() * 0.001; // seconds

            let fraction;
            IMG.clear();
            IMG.push();
            IMG.noFill();
            IMG.stroke(...COLOR, 255);
            IMG.strokeWeight(1.0); // TODO: adapt to the size of the image
            IMG.rotateZ(Math.PI * 2.0 * (_now * 0.1));
            for (let i = 0; i < Z.static.line_count; i++) {
                IMG.push();
                fraction = i / Z.static.line_count;
                length =
                    Z.noise(
                        fraction * 1234 + 567, //
                        _now * 3.0,
                    ) * IMG.width;
                IMG.rotateZ(Math.PI * fraction); // * 2.0 if { symmetrical: true }
                IMG.line(0, length * -0.5, 0, 0, length * 0.5, 0);
                IMG.pop();
            }
            IMG.pop();

            // ->

            p5.clear();
            p5.push();
            p5.image(IMG, 0, 0, IMG.width * PX_SIZE, IMG.height * PX_SIZE);
            p5.pop();
        };
    };

    render() {
        const Z = this;

        return (
            <div className={`${styles.Magic_icon}`} ref={(el) => (Z.dom.Magic_icon = el)}>
                {/* <canvas className={`${styles.canvas}`} ref={(el) => (Z.dom.canvas = el)} /> */}
            </div>
        );
    }
}

//
//
export default Magic_icon;
//
//
