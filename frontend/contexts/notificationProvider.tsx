import React, { createContext, ReactNode, useEffect, useState } from "react";
import { INotification } from "../types";
import { Notification } from "../components/Notification/Notification";
import styles from "./notificationProvider.module.scss";

interface INotificationContext {}

const NotificationContext = createContext<INotificationContext>({});
/**
 * The notification provider allows us to make in browser notifications
 * @param children
 * @constructor
 */
export const NotificationProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const [notifications, setNotifications] = useState<INotification[]>([]);
    let interval: NodeJS.Timer | undefined = undefined;

    useEffect(() => {
        // Every time the notifications change we set an interval
        // Delete the oldest notfication after it's duration
        if (notifications.length > 0 && interval === undefined) {
            interval = setInterval(
                () => deleteNotification(notifications.length - 1),
                notifications[notifications.length - 1].duration
            );
        }
    }, [notifications]);

    /**
     * Given an index of a notification, deletes the notification
     * @param index
     */
    const deleteNotification = (index: number) => {
        clearInterval(interval);
        interval = undefined;
        const newnotifs = [];
        for (let i = 0; i < index; i++) {
            newnotifs.push(notifications[i]);
        }
        for (let i = index + 1; i < notifications.length; i++) {
            const newnotif: INotification = {
                message: notifications[i].message,
                index: notifications[i].index - 1,
                duration: notifications[i].duration,
            };
            newnotifs.push(newnotif);
        }
        setNotifications(newnotifs);
    };

    /**
     * Creates and displayes a new notification on top of possible existing notifications
     * @param message
     */
    const notify = (message: string) => {
        const newnotifs = [];
        newnotifs.push({ message: message, index: 0, duration: 1000 });
        for (const notification of notifications) {
            const newnotif: INotification = {
                message: notification.message,
                index: notification.index + 1,
                duration: notification.duration,
            };
            newnotifs.push(newnotif);
        }
        setNotifications(newnotifs);
    };

    return (
        <NotificationContext.Provider value={{}}>
            <div>
                <div className={styles.notifications}>
                    {notifications.map((notification) => {
                        return (
                            <Notification
                                key={notification.index}
                                message={notification.message}
                                index={notification.index}
                                onDelete={deleteNotification}
                            />
                        );
                    })}
                    <button onClick={() => notify("Hello there")}>
                        Create notif
                    </button>
                </div>
                {children}
            </div>
        </NotificationContext.Provider>
    );
};
