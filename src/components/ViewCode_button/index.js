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
            //
        };
    }

    render() {
        const Z = this;

        return (
            <Button
                href={`https://github.com/jonnycolby/2025.jonnycolby.com`} // providing href will convert our button into a next/link component
                target={`_blank`}
                className={`${styles.ViewCode_button}`}
            >
                <span>{`<`}</span>
                <span className={`${styles.desktop_only}`}>{` source_`}</span>
                <span className={`${styles.mobile_only}`}>{` `}</span>
                <span>{`code />`}</span>
            </Button>
        );
    }
}

//
//
export default ViewCode_button;
//
//
