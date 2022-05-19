import styles from "./Filter.module.css";
import React, { SyntheticEvent, useEffect, useState } from "react";
import { getNextSort, ProjectFilterParams, Sort } from "../../types";

export const ProjectFilter: React.FC<{
    search: (params: ProjectFilterParams) => void;
}> = ({ search }) => {
    const [nameFilter, setNameFilter] = useState<string>("");
    const [clientFilter, setClientFilter] = useState<string>("");
    const [fullyAssigned, setFullyAssigned] = useState<boolean>(false);
    const [osocYear, setOsocYear] = useState<string>("");
    const [nameSort, setNameSort] = useState<Sort>(Sort.NONE);
    const [clientSort, setClientSort] = useState<Sort>(Sort.NONE);

    /**
     * Execute search everytime the filter changes
     */
    useEffect(() => {
        const params: ProjectFilterParams = {
            nameFilter: nameFilter,
            clientFilter: clientFilter,
            projectNameSort: nameSort,
            clientSort: clientSort,
            fullyAssigned: fullyAssigned,
            osocYear: osocYear,
        };
        search(params);
    }, [nameSort, clientSort, fullyAssigned]);

    const searchPress = () => {
        const params: ProjectFilterParams = {
            nameFilter: nameFilter,
            clientFilter: clientFilter,
            projectNameSort: nameSort,
            clientSort: clientSort,
            fullyAssigned: fullyAssigned,
            osocYear: osocYear,
        };
        search(params);
    };

    const toggleNameSort = async (e: SyntheticEvent) => {
        e.preventDefault();
        setNameSort((prev) => getNextSort(prev));
    };

    const toggleClientSort = async (e: SyntheticEvent) => {
        e.preventDefault();
        setClientSort((prev) => getNextSort(prev));
    };

    const toggleFullyAssigned = async (e: SyntheticEvent) => {
        e.preventDefault();
        setFullyAssigned((prev) => !prev);
    };

    return (
        <div className={styles.projectfilter}>
            <div className={styles.query}>
                <div onClick={toggleNameSort}>
                    Project Name
                    <div className={styles.triangleContainer}>
                        <div
                            className={`${
                                nameSort === Sort.ASCENDING ? styles.up : ""
                            } ${
                                nameSort === Sort.NONE
                                    ? styles.dot
                                    : styles.triangle
                            }`}
                        />
                    </div>
                </div>
                <input
                    className={`input ${styles.input}`}
                    type="text"
                    placeholder="Search.."
                    onChange={(e) => setNameFilter(e.target.value)}
                />
            </div>

            <div className={styles.query}>
                <div onClick={toggleClientSort}>
                    Client
                    <div className={styles.triangleContainer}>
                        <div
                            className={`${
                                clientSort === Sort.ASCENDING ? styles.up : ""
                            } ${
                                clientSort === Sort.NONE
                                    ? styles.dot
                                    : styles.triangle
                            }`}
                        />
                    </div>
                </div>
                <input
                    className={`input ${styles.input}`}
                    type="text"
                    placeholder="Search.."
                    onChange={(e) => setClientFilter(e.target.value)}
                />
            </div>

            <div className={styles.query}>
                Osoc Edition
                {/* Maybe dropdown */}
                <input
                    className={`input ${styles.input}`}
                    type="text"
                    placeholder="Search.."
                    onChange={(e) => setOsocYear(e.target.value)}
                />
            </div>

            <button
                className={`${fullyAssigned ? styles.active : styles.inactive}`}
                onClick={toggleFullyAssigned}
            >
                Fully assigned
            </button>
            <button onClick={searchPress}>Search</button>
        </div>
    );
};
