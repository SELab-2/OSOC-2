import React from "react";
import { NotificationType } from "../../types";
import styles from "./Notification.module.scss";

export const Notification: React.FC<{
    message: string;
    index: number;
    onDelete: (index: number) => void;
    type: NotificationType;
}> = ({ message, index, onDelete, type }) => {
    return (
        <div
            className={`notification ${
                type === NotificationType.SUCCESS
                    ? styles.success
                    : type === NotificationType.WARNING
                    ? styles.warning
                    : styles.error
            }`}
        >
            <div className="delete" onClick={() => onDelete(index)} />
            <p>{message}</p>
        </div>
    );
};
