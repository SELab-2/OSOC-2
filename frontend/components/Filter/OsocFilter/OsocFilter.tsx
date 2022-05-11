import styles from "../Filter.module.css";
import React, { SyntheticEvent, useContext, useEffect, useState } from "react";
import { getNextSort, OsocEdition, Sort } from "../../../types";
import SessionContext from "../../../contexts/sessionProvider";
import { useRouter } from "next/router";

export const OsocCreateFilter: React.FC<{
    updateOsoc: (osocs: Array<OsocEdition>) => void;
}> = ({ updateOsoc }) => {
    const [osocCreate, setOsocCreate] = useState<string>("");
    const [yearFilter, setYearFilter] = useState<string>("");
    const [yearSort, setYearSort] = useState<Sort>(Sort.NONE);
    const { getSession } = useContext(SessionContext);

    const router = useRouter();

    /**
     * Every time a filter changes we perform a search, on initial page load we also get the filter settings from
     * the query parameters
     * This makes the filter responsible for all the user data fetching
     */
    useEffect(() => {
        search().then();
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
        search().then();
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
     * Build and execute the query
     */
    const search = async () => {
        const filters = [];

        if (yearFilter !== "") {
            filters.push(`yearFilter=${yearFilter}`);
        }

        if (yearSort !== Sort.NONE) {
            filters.push(`yearSort=${yearSort}`);
        }

        const query = filters.length > 0 ? `?${filters.join("&")}` : "";
        await router.push(`/osocs${query}`);

        const { sessionKey } = getSession
            ? await getSession()
            : { sessionKey: "" };
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/osoc/filter` + query,
            {
                method: "GET",
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
        updateOsoc(response.data);
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
        console.log(response);
        search().then();
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

                {/* This shouldn't be a styles query probably */}
                <div className={styles.query}>
                    <input
                        data-testid={"yearInput"}
                        className={`input ${styles.input}`}
                        type="text"
                        placeholder="Year.."
                        onChange={(e) => setOsocCreate(e.target.value)}
                    />
                    <button data-testid={"createButton"} onClick={createPress}>
                        Create
                    </button>
                </div>
            </form>
        </div>
    );
};
