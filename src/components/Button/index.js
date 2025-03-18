"use client";
//
import React from "react";
import Link from "next/link";
//
import styles from "./styles.module.scss";
//
//

const STATIC = {
    button_background_offset_max_px: 12,
};

class Button extends React.Component {
    constructor(props) {
        super(props);
        const Z = this;

        Z.state = {
            lit: false, // if the pointer is hovering the button, we light it up
        };

        Z.cache = {
            bbox: null, // calculated during on_pointerenter
            max_bg_offset: 0, // calculated during on_pointerenter
            center: null, // calculated during on_pointerenter
        };

        Z.dom = {
            button: null,
            background: null,
            content: null,
        };
    }
    componentDidMount() {
        const Z = this;
        Z.dom.button.addEventListener("pointerenter", Z.on_pointerenter);
    }

    on_pointerenter = (e) => {
        const Z = this;
        //
        Z.cache.bbox = Z.dom.button.getBoundingClientRect();
        Z.cache.center = {
            x: Z.cache.bbox.left + Z.cache.bbox.width * 0.5,
            y: Z.cache.bbox.top + Z.cache.bbox.height * 0.5,
        };
        // Z.cache.max_bg_offset = Math.min(Z.cache.bbox.width, Z.cache.bbox.height) * STATIC.background_offset_proportion;
        //
        Z.setState({ lit: true });
        //
        window.addEventListener("pointermove", Z.on_pointermove);
        Z.dom.button.addEventListener("pointerleave", Z.on_pointerleave, { once: true });
    };

    on_pointerleave = (e) => {
        const Z = this;
        window.removeEventListener("pointermove", Z.on_pointermove);
        Z.setState({ lit: false });
        Z.dom.background.style.transform = "";
        Z.dom.content.style.transform = "";
        console.log("pointer leave");
    };

    on_pointermove = (e) => {
        const Z = this;
        //
        const offset = {
            x: e.clientX - Z.cache.center.x,
            y: e.clientY - Z.cache.center.y,
        };
        const ofset_uv = {
            x: offset.x / Z.cache.bbox.width,
            y: offset.y / Z.cache.bbox.height,
        };
        const bg_offset = {
            x: ofset_uv.x * STATIC.button_background_offset_max_px,
            y: ofset_uv.y * STATIC.button_background_offset_max_px,
        };

        Z.dom.background.style.transform = `translate(${bg_offset.x}px, ${bg_offset.y}px)`;
        Z.dom.content.style.transform = `translate(${bg_offset.x * 0.5}px, ${bg_offset.y * 0.5}px`;
    };

    render() {
        const Z = this;

        // const attributes = {};

        const inside_elements = (
            <>
                <div className={`${styles.button_background}`} ref={(el) => (Z.dom.background = el)}></div>
                <div className={`${styles.button_content} ${Z.props.className || ""}`} ref={(el) => (Z.dom.content = el)}>
                    {...Z.props.children}
                </div>
            </>
        );

        if (Z.props.href) {
            return (
                <Link
                    className={`${styles.Button}`}
                    ref={(el) => (Z.dom.button = el)} // get a reference to the DOM element
                    href={Z.props.href || undefined}
                    target={Z.props.target || undefined}
                >
                    {inside_elements}
                </Link>
            );
        } else {
            return (
                <button
                    className={`${styles.Button}`}
                    ref={(el) => (Z.dom.button = el)} // get a reference to the DOM element
                >
                    {inside_elements}
                </button>
            );
        }
    }
}

//
//
export default Button;
//
//
