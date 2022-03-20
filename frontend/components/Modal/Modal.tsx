import React, {SyntheticEvent} from "react";
import styles from './Modal.module.css'

/**
 * A popup modal
 * Will display it's children inside the modal
 * @param children - The children to be shown inside the modal
 * @param visible - Set the modal to be visible or not
 * @param handleClose - The callback to close the modal
 */
// eslint-disable-next-line no-unused-vars
export const Modal: React.FC<{ visible: boolean, handleClose: (e :SyntheticEvent) => void }> = ({
                                                                                                        children,
                                                                                                        visible,
                                                                                                        handleClose
                                                                                                    }) => {
    return (
        <div className={`${styles.modal} ${visible ? styles.displayBlock : styles.displayNone}`}>
            <div className={styles.modalMain}>
                <button className={styles.modalButton} type="button" onClick={handleClose}>Close</button>
                {children}
            </div>
        </div>
    )
}
