import React, { ReactNode, SyntheticEvent } from "react";
import styles from "./Modal.module.scss";

/**
 * A popup modal
 * Will display it's children inside the modal
 * @param children - The children to be shown inside the modal
 * @param visible - Set the modal to be visible or not
 * @param handleClose - The callback to close the modal
 * @param title - The title for the modal
 */
export const Modal: React.FC<{
    children: ReactNode;
    title: string;
    visible: boolean;
    handleClose: (e: SyntheticEvent) => void;
}> = ({ children, visible, handleClose, title }) => {
    return (
        <div className={`modal ${visible ? "is-active" : ""}`}>
            <div className="modal-background" />
            <div className="modal-card">
                <header className={`${styles.header} modal-card-head`}>
                    <p className="modal-card-title">{title}</p>
                    <button
                        className="delete"
                        type="button"
                        onClick={handleClose}
                    >
                        Close
                    </button>
                </header>
                <section className={`modal-card-body ${styles.body}`}>
                    {children}
                </section>
            </div>
        </div>
    );
};
