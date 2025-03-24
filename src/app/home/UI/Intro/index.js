"use client";
//
import React from "react";
//
import pause from "@/methods/pause";
//
import styles from "./styles.module.scss";
//
//

class Intro extends React.Component {
    constructor(props) {
        super(props);
        const Z = this;

        Z.static = {
            interval_ms: 1000 * 0.0,
            visible_ms: 1000 * 3.6,
            hide_duration_ms: 1000 * 0.48,
            text: "Hello",
        };

        Z.state = {
            visible: true,
            characters_visible: 0,
            spacing_active: false,
            max_duration: Z.static.visible_ms + Z.static.hide_duration_ms,
        };
    }
    componentDidMount() {
        const Z = this;
    }
    componentDidUpdate(prev_props) {
        const Z = this;
        if (Z.props.active && !prev_props.active) Z.start();
    }
    set_state = (new_state) => new Promise((resolve) => this.setState(new_state, resolve));

    start = async () => {
        const Z = this;
        //
        await pause(1000 / 15); // makes sure there's at least one frame between DOM existence and animation start
        await Z.set_state({ spacing_active: true });
        //
        for (let char_i = 0; char_i < Z.static.text.length; char_i++) {
            await pause(Z.static.interval_ms);
            await Z.set_state({ characters_visible: char_i + 1 });
        }
        await pause(Z.static.visible_ms - Z.static.text.length * Z.static.interval_ms);
        await Z.set_state({ visible: false });
        await pause(Z.static.hide_duration_ms);
        Z.done();
    };

    done = () => {
        const Z = this;
        if (Z.props.on_complete && typeof Z.props.on_complete == "function") Z.props.on_complete();
    };

    render() {
        const Z = this;

        return (
            <div
                className={styles.Intro}
                style={{
                    [`--hide-duration`]: `${Z.static.hide_duration_ms * 0.001}s`,
                }}
            >
                <div className={`${styles.intro_text} ${Z.state.visible ? styles._visible : ""}`}>
                    <div
                        className={`${styles.intro_text_styled} ${Z.state.spacing_active ? styles._spacing_active : ""}`}
                        style={{
                            transition: `letter-spacing ${Z.state.max_duration * 0.001}s linear, font-weight ${Z.state.max_duration * 0.001}s linear`,
                        }}
                    >
                        {Z.static.text.split("").map((char, char_index) => {
                            return (
                                <span key={char_index} className={`${styles.character} ${char_index < Z.state.characters_visible ? styles._visible : ""}`}>
                                    {char}
                                </span>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }
}

//
//
export default Intro;
//
//
