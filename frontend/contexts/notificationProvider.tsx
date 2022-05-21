import React, {
    createContext,
    ReactNode,
    useEffect,
    useRef,
    useState,
} from "react";
import { INotification, NotificationType } from "../types";
import { Notification } from "../components/Notification/Notification";
import styles from "./notificationProvider.module.scss";

interface INotificationContext {
    notify?: (
        message: string,
        type: NotificationType,
        duration: number
    ) => void;
}

export const NotificationContext = createContext<INotificationContext>({});
/**
 * The notification provider allows us to make in browser notifications
 * @param children
 * @constructor
 */
export const NotificationProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const [notifications, setNotifications] = useState<INotification[]>([]);
    const interval = useRef<NodeJS.Timer>();

    useEffect(() => {
        // Every time the notifications change we set an interval
        // Delete the oldest notfication after it's duration
        if (notifications.length > 0) {
            interval.current = setInterval(
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
        if (index < 0) return;
        clearInterval(interval.current);
        const newnotifs = [];
        for (let i = 0; i < index; i++) {
            newnotifs.push(notifications[i]);
        }
        for (let i = index + 1; i < notifications.length; i++) {
            const newnotif: INotification = {
                message: notifications[i].message,
                index: notifications[i].index - 1,
                duration: notifications[i].duration,
                type: notifications[i].type,
            };
            newnotifs.push(newnotif);
        }
        setNotifications(newnotifs);
    };

    /**
     * Creates and displayes a new notification on top of possible existing notifications
     * @param message
     * @param type
     * @param duration
     */
    const notify = (
        message: string,
        type: NotificationType,
        duration: number
    ) => {
        clearInterval(interval.current);
        const newnotifs = [];
        newnotifs.push({
            message: message,
            index: 0,
            duration: duration,
            type: type,
        });
        for (const notification of notifications) {
            const newnotif: INotification = {
                message: notification.message,
                index: notification.index + 1,
                duration: notification.duration,
                type: notification.type,
            };
            newnotifs.push(newnotif);
        }
        setNotifications(newnotifs);
    };

    return (
        <NotificationContext.Provider value={{ notify: notify }}>
            <div>
                <div className={styles.notifications}>
                    {notifications.map((notification) => {
                        return (
                            <Notification
                                key={notification.index}
                                message={notification.message}
                                index={notification.index}
                                onDelete={deleteNotification}
                                type={notification.type}
                            />
                        );
                    })}
                </div>
                {children}
            </div>
        </NotificationContext.Provider>
    );
};
