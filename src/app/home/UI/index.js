"use client";
//
import React from "react";
//
import Graphics_p5 from "./Graphics_p5";
import Graphics_three from "./Graphics_three";
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
            //
        };

        //
    }

    orientation_activated_or_cancelled = () => {
        const Z = this;
        Z.children.Graphics_p5?.orientation_activated_or_cancelled();
    };

    render() {
        const Z = this;

        return (
            <div className={`${styles.UI}`}>
                <div className={`${styles.renderer_2d_wrap}`}>
                    <Graphics_p5 parent={Z} />
                </div>
                <div className={`${styles.renderer_3d_wrap}`}>
                    <Graphics_three parent={Z} />
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
