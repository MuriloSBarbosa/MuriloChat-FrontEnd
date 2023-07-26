import React, { useEffect } from "react";
import styles from "./Modal.module.css";

function Modal(props) {

    useEffect(() => {
        if (props.showModal) {
            if (props.time) {
                setTimeout(() => {
                    props.setShowModal(false);
                }, Number(props.time));
            }

        }
    }, [props.showModal])

    return (
        props.showModal &&
        <div className={styles.modal}>
            <div className={styles.content}>
                <h1>{props.modal.title}</h1>
                <div className={styles.text}>{props.modal.text}</div>
            </div>
        </div>
    );
}

export default Modal;