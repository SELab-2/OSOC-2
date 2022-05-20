import styles from "./Osoc.module.css";
import React, { SyntheticEvent, useContext, useState } from "react";
import SessionContext from "../../contexts/sessionProvider";
import { NotificationType, OsocEdition } from "../../types";
import { Modal } from "../Modal/Modal";
import { NotificationContext } from "../../contexts/notificationProvider";

export const Osoc: React.FC<{
    osoc: OsocEdition;
    removeOsoc: (osoc: OsocEdition) => void;
}> = ({ osoc, removeOsoc }) => {
    const [year] = useState<number>(osoc.year);
    const [projects] = useState<number>(osoc._count.project);
    const { sessionKey, isAdmin } = useContext(SessionContext);
    const osocId = osoc.osoc_id;
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const { notify } = useContext(NotificationContext);

    const deleteOsoc = async (e: SyntheticEvent) => {
        e.preventDefault();
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/osoc/` + osocId.toString(),
            {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `auth/osoc2 ${sessionKey}`,
                },
            }
        )
            .then((response) => response.json())
            .then(async (json) => {
                if (json.success) {
                    removeOsoc(osoc);
                }
                return json;
            })
            .catch((err) => {
                if (notify) {
                    notify(
                        "Something went wrong:" + err,
                        NotificationType.ERROR,
                        2000
                    );
                }
                return { success: false };
            });
        if (response && response.success && notify) {
            notify(
                "Successfully deleted osoc edition!",
                NotificationType.SUCCESS,
                2000
            );
        } else if (response && !response.success && notify) {
            notify(
                "Something went wrong:" + response.reason,
                NotificationType.ERROR,
                2000
            );
        }
    };

    return (
        <div className={styles.row}>
            <div className={styles.name}>
                <p>Osoc Edition: {year}</p>
            </div>

            <p># Projects: {projects}</p>
            <Modal
                handleClose={() => setShowDeleteModal(false)}
                visible={showDeleteModal}
                title={`Delete Osoc ${year}`}
            >
                <p>
                    You are about to delete an osoc edition! Deleting an osoc
                    edition cannot be undone and will result in data loss. Are
                    you certain that you wish to delete osoc edition {year}?
                </p>
                <button onClick={deleteOsoc}>DELETE</button>
            </Modal>
            {/* Only admins can delete osoc editions */}
            {isAdmin ? (
                <button
                    className={`delete ${styles.delete}`}
                    onClick={() => setShowDeleteModal(true)}
                />
            ) : null}
        </div>
    );
};
