"use client";
//
import React from "react";
//
import Button from "@/components/Button";
import Magic_icon from "./Magic_icon";
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
                is_icon={true}
                href={`https://jonnycolby.computer`} // providing href will convert our button into a next/link component
                target={`_blank`}
                className={`${styles.ViewCode_button} ${Z.state.hover ? styles._hover : ""}`}
                on_pointer_enter={Z.on_pointer_enter} // hover
                on_pointer_leave={Z.on_pointer_leave} // opposite of hover
            >
                <div className={`${styles.content}`}>
                    <Magic_icon />
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
