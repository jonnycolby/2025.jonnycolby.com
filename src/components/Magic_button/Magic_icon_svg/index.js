"use client";
//
import React from "react";
//
import create_perlin_noise from "@/methods/noise/perlin";
//
import styles from "./styles.module.scss";
//
//

class Magic_icon extends React.Component {
    constructor(props) {
        super(props);
        const Z = this;

        Z.noise = create_perlin_noise(42); // generate a new 2D noise instance with optional seed

        Z.static = {
            line_count: 18,
            symmetrical: true,
        };

        Z.state = {
            lines: [], // we setState once to render the lines, but then we update state and DOM directly for performance
            rotation_deg: 0.0,
        };

        Z.vars = {
            _mounted: false,
        };

        Z.dom = {
            Magic_icon: null,
            sparkle_group: null,
            line: [],
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
        var total_lines = Z.static.line_count;
        if (Z.static.symmetrical) total_lines = Math.round(total_lines * 0.5);
        const lines = [];
        for (let l_i = 0; l_i < total_lines; l_i++) {
            const line = {
                angle: Math.PI * (Z.static.symmetrical ? 1.0 : 2.0) * (l_i / total_lines),
                length: 50.0,
                weight: 5.0,
                // opacity: 1.0,
                points: [
                    { x: 0, y: 0 },
                    { x: 0, y: 0 },
                ],
            };
            lines.push(line);
        }
        await Z.set_state({ lines: lines });
        //
        Z.tick(); // start the animation loop
    };

    tick = () => {
        const Z = this;
        const _now = performance.now();
        // NOTE: we update state values and DOM directly for performance -> IMPORTANT: avoid calling setState on every frame!

        Z.state.rotation_deg = _now * 0.001 * Math.PI * 2.0 * 2.0; // rotate the whole SVG

        for (let l_i = 0; l_i < Z.state.lines.length; l_i++) {
            const line = Z.state.lines[l_i];

            line.length =
                (Z.noise(
                    (l_i / Z.static.line_count) * 100.0, // dimension 1
                    _now * 0.001, // dimension 2
                ) *
                    0.5 +
                    0.5) *
                50.0;

            line.weight =
                (Z.noise(
                    (l_i / Z.static.line_count) * 100.0, // dimension 1
                    _now * 0.001 + 72945, // dimension 2
                ) *
                    0.5 +
                    0.5) *
                    10.0 +
                0.0;

            line.opacity =
                (Z.noise(
                    (l_i / Z.static.line_count) * 100.0, // dimension 1
                    _now * 0.001 + 29535, // dimension 2
                ) *
                    0.5 +
                    0.5) *
                    0.5 +
                0.5;

            // line.angle += Math.PI * 2.0 * 0.0005;
            // line.weight = Math.sin(_now * 0.001 + l_i) * 2.0 + 3.0;
            // line.opacity = Math.sin(_now * 0.001 + l_i) * 0.5 + 0.5;

            Z.update_line_points(line); // updates x/y values

            // update DOM:
            const line_dom = Z.dom.line[l_i];

            // line_dom.setAttribute("stroke-width", line.weight);
            Z.dom.line[l_i].setAttribute("x1", line.points[0].x);
            Z.dom.line[l_i].setAttribute("y1", line.points[0].y);
            Z.dom.line[l_i].setAttribute("x2", line.points[1].x);
            Z.dom.line[l_i].setAttribute("y2", line.points[1].y);
            Z.dom.line[l_i].setAttribute("stroke-width", line.weight);
            Z.dom.line[l_i].setAttribute("opacity", line.opacity);

            Z.dom.sparkle_group.style.transform = `translate(${50}px, ${50}px) rotate(${Z.state.rotation_deg}deg)`;
        }

        Z.vars.first = true;
        requestAnimationFrame(Z.tick);
    };

    update_line_points = (line) => {
        const Z = this;
        if (Z.static.symmetrical) {
            // symmetrical:
            line.points[0].x = 0 + Math.cos(line.angle) * line.length;
            line.points[0].y = 0 + Math.sin(line.angle) * line.length;
            line.points[1].x = 0 - Math.cos(line.angle) * line.length;
            line.points[1].y = 0 - Math.sin(line.angle) * line.length;
        } else {
            // asymmetrical:
            line.points[0].x = 0;
            line.points[0].y = 0;
            line.points[1].x = 0 + Math.cos(line.angle) * line.length;
            line.points[1].y = 0 + Math.sin(line.angle) * line.length;
        }
    };

    render() {
        const Z = this;

        // for perlin noise demo:
        /* const squares = [];
        const square_size = 1;
        const square_count = 100;
        const noise_scale = 0.1;
        const noise_strength = 10;
        for (let s_i_y = 0; s_i_y < square_count; s_i_y++) {
            squares.push([]);
            for (let s_i_x = 0; s_i_x < square_count; s_i_x++) {
                const square = {};
                square.x = s_i_x;
                square.y = s_i_y;
                square.width = square_size;
                square.height = square_size;
                square.fill = `currentColor`;
                square.noise_value = Z.noise(s_i_x * noise_scale, s_i_y * noise_scale);
                square.opacity = square.noise_value * 0.5 + 0.5;
                squares[s_i_y].push(square);
            }
        } */

        return (
            <div className={`${styles.Magic_icon}`} ref={(el) => (Z.dom.Magic_icon = el)}>
                {/* <canvas className={`${styles.canvas}`} ref={(el) => (Z.dom.canvas = el)} /> */}
                <svg className={`${styles.svg}`} viewBox="0 0 100 100">
                    <g
                        ref={(el) => (Z.dom.sparkle_group = el)}
                        style={{
                            transform: `translate(${50}px, ${50}px) rotate(${Z.state.rotation_deg}deg)`,
                        }}
                    >
                        {Z.state.lines.map((line, l_i) => {
                            return (
                                <line
                                    key={l_i} //
                                    ref={(el) => (Z.dom.line[l_i] = el)}
                                    className={`${styles.line}`}
                                    x1={`${line.points[0].x}px`}
                                    y1={`${line.points[0].y}px`}
                                    x2={`${line.points[1].x}px`}
                                    y2={`${line.points[1].y}px`}
                                    stroke={`currentColor`}
                                    strokeWidth={line.weight}
                                    // opacity={`1.0`}
                                />
                            );
                        })}
                    </g>

                    {/* demo 2D perlin noise with squares */}
                    {/* <g className={`${styles.squares}`}>
                        {squares.map((row, s_i_y) => {
                            return row.map((square, s_i_x) => {
                                return (
                                    <rect
                                        key={`${s_i_x}-${s_i_y}`} //
                                        x={square.x * square_size}
                                        y={square.y * square_size}
                                        width={square.width}
                                        height={square.height}
                                        fill={square.fill}
                                        opacity={square.opacity}
                                    />
                                );
                            });
                        })}
                    </g> */}
                </svg>
            </div>
        );
    }
}

//
//
export default Magic_icon;
//
//
