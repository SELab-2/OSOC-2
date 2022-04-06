import React, {SyntheticEvent} from "react";
import styles from './Modal.module.scss'

/**
 * A popup modal
 * Will display it's children inside the modal
 * @param children - The children to be shown inside the modal
 * @param visible - Set the modal to be visible or not
 * @param handleClose - The callback to close the modal
 */
// eslint-disable-next-line no-unused-vars
export const Modal: React.FC<{ title: string, visible: boolean, handleClose: (e: SyntheticEvent) => void }> = ({
                                                                                                                   children,
                                                                                                                   visible,
                                                                                                                   handleClose,
                                                                                                                   title
                                                                                                               }) => {
    return (
        <div className={`${styles.modal} ${visible ? styles.displayBlock : styles.displayNone}`}>
            <div className={styles.modalMain}>
                <div className={styles.header}>
                    <p>{title}</p>
                    <button className={styles.modalButton} type="button" onClick={handleClose}>Close</button>
                </div>
                {children}
            </div>
        </div>
    )
}
