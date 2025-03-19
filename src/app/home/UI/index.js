"use client";
//
import React from "react";
import Link from "next/link";
//
import Graphics_p5 from "./Graphics_p5";
import Graphics_three from "./Graphics_three";
//
import Button from "@/components/Button";
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
            show_decor: false,
        };

        //
    }
    componentDidMount() {
        const Z = this;
        Z.intro(); // async branch
    }

    intro = async () => {
        const Z = this;
        await pause(1000 * 2.0);
        Z.setState({ show_decor: true });
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
                    <Graphics_p5 parent={Z} />
                </div>
                <div className={`${styles.renderer_3d_wrap}`}>
                    <Graphics_three parent={Z} />
                </div>
                {/* <div className={`${styles.floaters} ${Z.state.show_decor ? styles._visible : ""}`}>
                    <div className={`${styles.floater} ${styles.floater_bottom_left}`}>
                        <Button
                            href={`https://github.com/jonnycolby/2025.jonnycolby.com`} // providing href will convert our button into a next/link component
                            target={`_blank`}
                            className={`${styles.button} ${styles.view_code_button}`}
                        >
                            <span>{`<`}</span>
                            <span className={`${styles.desktop_only}`}>{` source_`}</span>
                            <span className={`${styles.mobile_only}`}>{` `}</span>
                            <span>{`code />`}</span>
                        </Button>
                    </div>
                </div> */}
            </div>
        );
    }
}

//

const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

//
//
export default UI;
//
//
