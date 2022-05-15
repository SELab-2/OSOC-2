import React from "react";

export const Notification: React.FC<{
    message: string;
    index: number;
    onDelete: (index: number) => void;
}> = ({ message, index, onDelete }) => {
    return (
        <div className="notification">
            <div className="delete" onClick={() => onDelete(index)} />
            <p>
                {message} {index}
            </p>
        </div>
    );
};
