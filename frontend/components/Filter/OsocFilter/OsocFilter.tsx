import styles from "../Filter.module.css";
import React, { SyntheticEvent, useContext, useEffect, useState } from "react";
import { getNextSort, OsocFilterParams, Sort } from "../../../types";
import SessionContext from "../../../contexts/sessionProvider";

export const OsocCreateFilter: React.FC<{
    search: (params: OsocFilterParams) => void;
}> = ({ search }) => {
    const [osocCreate, setOsocCreate] = useState<string>("");
    const [yearFilter, setYearFilter] = useState<string>("");
    const [yearSort, setYearSort] = useState<Sort>(Sort.NONE);
    const { getSession } = useContext(SessionContext);

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
        if (sessionKey !== "") {
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
            if (response.success) {
                const params: OsocFilterParams = {
                    yearFilter: yearFilter,
                    yearSort: yearSort,
                };
                search(params);
            }
        }
    };

    return (
        <div className={styles.osocfilter}>
            <form className={styles.form}>
                <div className={styles.query}>
                    <div onClick={toggleYearSort}>
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
                        className={`input ${styles.input}`}
                        type="text"
                        placeholder="Year.."
                        onChange={(e) => setYearFilter(e.target.value)}
                    />
                    <button onClick={searchPress}>Search</button>
                </div>

                {/** Only admins should be able to create new osoc editions */}
                {isAdmin ? (
                    <div className={styles.query}>
                        <input
                            className={`input ${styles.input}`}
                            type="text"
                            placeholder="Year.."
                            onChange={(e) => setOsocCreate(e.target.value)}
                        />
                        <button onClick={createPress}>Create</button>
                    </div>
                ) : null}
            </form>
        </div>
    );
};
