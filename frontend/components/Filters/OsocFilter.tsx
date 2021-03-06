import styles from "./Filter.module.css";
import React, { SyntheticEvent, useContext, useEffect, useState } from "react";
import {
    getNextSort,
    NotificationType,
    OsocFilterParams,
    Sort,
} from "../../types";
import SessionContext from "../../contexts/sessionProvider";
import { NotificationContext } from "../../contexts/notificationProvider";
import { useSockets } from "../../contexts/socketProvider";

export const OsocCreateFilter: React.FC<{
    search: (params: OsocFilterParams) => void;
}> = ({ search }) => {
    const [osocCreate, setOsocCreate] = useState<string>("");
    const [yearFilter, setYearFilter] = useState<string>("");
    const [yearSort, setYearSort] = useState<Sort>(Sort.NONE);
    const { getSession } = useContext(SessionContext);
    const { notify } = useContext(NotificationContext);
    const { socket } = useSockets();

    const [isAdmin, setIsAdmin] = useState(false);

    /**
     * Every time a filter changes we perform a search, on initial page load we also get the filter settings from
     * the query parameters
     * This makes the filter responsible for all the user data fetching
     */
    useEffect(() => {
        if (getSession) {
            getSession().then(({ isAdmin }) => {
                setIsAdmin(isAdmin);
            });
        }
        const params: OsocFilterParams = {
            yearFilter: yearFilter,
            yearSort: yearSort,
        };
        search(params);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [yearSort]);

    const toggleYearSort = async (e: SyntheticEvent) => {
        e.preventDefault();
        setYearSort(getNextSort(yearSort));
    };

    /**
     * Explicitly tell the frontend to execute the current query
     * @param e
     */
    const searchPress = async (e: SyntheticEvent) => {
        e.preventDefault();
        const params: OsocFilterParams = {
            yearFilter: yearFilter,
            yearSort: yearSort,
        };
        search(params);
    };

    /**
     * Explicitly tell the frontend to execute the current query
     * @param e
     */
    const createPress = async (e: SyntheticEvent) => {
        e.preventDefault();
        create().then();
    };

    /**
     * Create the new osoc edition
     */
    const create = async () => {
        const { sessionKey } = getSession
            ? await getSession()
            : { sessionKey: "" };
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/osoc/create`,
            {
                method: "POST",
                body: JSON.stringify({
                    year: osocCreate,
                }),
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `auth/osoc2 ${sessionKey}`,
                },
            }
        )
            .then((response) => response.json())
            .catch((err) => {
                console.log(err);
            });
        if (response && response.success) {
            // get the current userId. This is needed to notify the other users on the manage user screen.
            // this loginUser id is used to notify which user year permissions need to be refetched there.
            const currentUser = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/user/self`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        Authorization: `auth/osoc2 ${sessionKey}`,
                    },
                }
            )
                .then((res) => res.json())
                .catch((err) => {
                    console.log(err);
                });
            socket.emit("osocCreated");
            socket.emit("yearPermissionUpdate", currentUser.login_user_id);
            const params: OsocFilterParams = {
                yearFilter: yearFilter,
                yearSort: yearSort,
            };
            search(params);
            if (notify) {
                notify(
                    "Successfully created a new osoc edition!",
                    NotificationType.SUCCESS,
                    2000
                );
            }
        } else if (response && !response.success && notify) {
            notify(
                "Something went wrong:" + response.reason,
                NotificationType.ERROR,
                2000
            );
        }
    };

    return (
        <div className={styles.osocfilter}>
            <form className={styles.form}>
                <div className={styles.query}>
                    <div data-testid={"yearSorter"} onClick={toggleYearSort}>
                        Year
                        <div className={styles.triangleContainer}>
                            <div
                                className={`${
                                    yearSort === Sort.ASCENDING ? styles.up : ""
                                } ${
                                    yearSort === Sort.NONE
                                        ? styles.dot
                                        : styles.triangle
                                }`}
                            />
                        </div>
                    </div>

                    <input
                        data-testid={"yearFilter"}
                        className={`input ${styles.input}`}
                        type="text"
                        placeholder="Year.."
                        onChange={(e) => setYearFilter(e.target.value)}
                    />
                    <button data-testid={"searchButton"} onClick={searchPress}>
                        Search
                    </button>
                </div>

                {/** Only admins should be able to create new osoc editions */}
                {isAdmin ? (
                    <div className={styles.query}>
                        <input
                            data-testid={"yearInput"}
                            className={`input ${styles.input}`}
                            type="text"
                            placeholder="Year.."
                            onChange={(e) => setOsocCreate(e.target.value)}
                        />
                        <button
                            data-testid={"createButton"}
                            onClick={createPress}
                        >
                            Create
                        </button>
                    </div>
                ) : null}
            </form>
        </div>
    );
};
