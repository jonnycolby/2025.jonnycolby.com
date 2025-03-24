"use client";
//
import React from "react";
//
import Button from "@/components/Button";
//
import styles from "./styles.module.scss";
//
//

class ViewCode_button extends React.Component {
    constructor(props) {
        super(props);
        const Z = this;

        Z.state = {
            hover: false,
            expandable_width: 0, // current width
        };

        Z.vars = {
            expandable_width_full: 0,
        };

        Z.dom = {
            expandable: null,
            expandable_text: null,
        };
    }
    componentDidMount() {
        const Z = this;
        Z.init();
    }

    init = () => {
        const Z = this;
        Z.measure();
    };

    measure = () => {
        const Z = this;
        const text_bbox = Z.dom.expandable_text.getBoundingClientRect();
        Z.vars.expandable_width_full = text_bbox.width;
    };

    on_pointer_enter = (e) => {
        const Z = this;
        Z.setState({ hover: true });
    };

    on_pointer_leave = (e) => {
        const Z = this;
        Z.setState({ hover: false });
    };

    render() {
        const Z = this;

        return (
            <Button
                href={`https://github.com/jonnycolby/2025.jonnycolby.com`} // providing href will convert our button into a next/link component
                target={`_blank`}
                className={`${styles.ViewCode_button} ${Z.state.hover ? styles._hover : ""}`}
                on_pointer_enter={Z.on_pointer_enter} // hover
                on_pointer_leave={Z.on_pointer_leave} // opposite of hover
            >
                <div className={`${styles.content}`}>
                    <span className={`${styles.always_visible_text}`}>{`<`}</span>
                    <span
                        className={`${styles.expandable}`}
                        style={{
                            width: Z.state.hover ? Z.vars.expandable_width_full : 0,
                            opacity: Z.state.hover ? 1 : 0,
                        }}
                        ref={(el) => (Z.dom.expandable = el)}
                    >
                        <span className={`${styles.expandable_text}`} ref={(el) => (Z.dom.expandable_text = el)}>
                            <span>{` `}</span>
                            <span className={`${styles.smaller_text}`}>{`code`}</span>
                        </span>
                    </span>
                    <span className={`${styles.always_visible_text}`}>{` />`}</span>
                </div>
            </Button>
        );
    }
}

//
//
export default ViewCode_button;
//
//
