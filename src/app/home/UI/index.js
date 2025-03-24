"use client";
//
import React from "react";
//
import Graphics_p5 from "./Graphics_p5";
import Graphics_three from "./Graphics_three";
import Button from "@/components/Button";
import ViewCode_button from "@/components/ViewCode_button";
//
import pause from "@/methods/pause";
//
import styles from "./styles.module.scss";
//
//

class UI extends React.Component {
    constructor(props) {
        super(props);
        const Z = this;

        Z.children = {
            Graphics_p5: null,
            Graphics_three: null,
        };

        Z.state = {
            show_3d: false,
            show_2d: false,
            show_decor: false,
        };

        //
    }
    componentDidMount() {
        const Z = this;
        Z.intro(); // async branch
    }
    set_state = (new_state) => new Promise((resolve) => this.setState(new_state, resolve));

    intro = async () => {
        const Z = this;
        await Z.set_state({ show_2d: true });
        await pause(1000 * 2.0);
        await Z.set_state({ show_3d: true });
        //
        await pause(1000 * 2.0);
        Z.setState({ show_decor: true }); // TODO: use this for "info" button
    };

    orientation_activated_or_cancelled = () => {
        const Z = this;
        Z.children.Graphics_p5?.orientation_activated_or_cancelled();
    };

    render() {
        const Z = this;

        return (
            <div className={`${styles.UI}`}>
                <div className={`${styles.renderer_2d_wrap}`}>
                    <Graphics_p5 parent={Z} visible={Z.state.show_2d} />
                </div>
                <div className={`${styles.renderer_3d_wrap}`}>
                    <Graphics_three parent={Z} visible={Z.state.show_3d} />
                </div>
                <div className={`${styles.floaters} ${Z.state.show_decor ? styles._visible : ""}`}>
                    <div className={`${styles.floater} ${styles.floater_bottom_left}`}>
                        <ViewCode_button />
                    </div>
                </div>
            </div>
        );
    }
}

//
//
export default UI;
//
//
