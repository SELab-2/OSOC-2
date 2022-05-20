import styles from "./Filter.module.css";
import React, { SyntheticEvent, useEffect, useState } from "react";
import { getNextSort, ProjectFilterParams, Sort } from "../../types";

export const ProjectFilter: React.FC<{
    search: (params: ProjectFilterParams) => void;
}> = ({ search }) => {
    const [projectNameFilter, setProjectNameFilter] = useState<string>("");
    const [clientFilter, setClientFilter] = useState<string>("");
    const [fullyAssigned, setFullyAssigned] = useState<boolean>(false);
    const [osocYear, setOsocYear] = useState<string>("");
    const [projectNameSort, setProjectNameSort] = useState<Sort>(Sort.NONE);
    const [clientSort, setClientSort] = useState<Sort>(Sort.NONE);

    /**
     * is executed on first load of the page.
     * We parse all the arguments in the URL and apply them to the search
     */
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);

        // get all the arguments from the search string
        const clientNameFilter = urlParams.get("clientNameFilter");
        const projectNameFilter = urlParams.get("projectNameFilter");
        const clientNameSort = urlParams.get("clientNameSort");
        const projectNameSort = urlParams.get("projectNameSort");
        const osocYear = urlParams.get("osocYearProject");
        const fullyAssigned = urlParams.get("fullyAssignedFilter");

        if (clientNameFilter !== null) {
            setClientFilter(clientNameFilter);
        }
        if (projectNameFilter !== null) {
            setProjectNameFilter(projectNameFilter);
        }
        if (
            clientNameSort !== null &&
            Object.values(Sort).includes(clientNameSort as Sort)
        ) {
            setClientSort(clientNameSort as Sort);
        }
        if (
            projectNameSort !== null &&
            Object.values(Sort).includes(projectNameSort as Sort)
        ) {
            setProjectNameSort(projectNameSort as Sort);
        }
        if (osocYear !== null && new RegExp("[0-9]+").test(osocYear)) {
            setOsocYear(osocYear);
        }
        if (fullyAssigned === "true" || fullyAssigned === "false") {
            setFullyAssigned(fullyAssigned === "true");
        }

        const params: ProjectFilterParams = {
            nameFilter: projectNameFilter ? projectNameFilter : "",
            clientFilter: clientNameFilter ? clientNameFilter : "",
            fullyAssigned: fullyAssigned === "true",
            osocYear:
                osocYear && new RegExp("[0-9]+").test(osocYear) ? osocYear : "",
            projectNameSort: projectNameSort
                ? (projectNameSort as Sort)
                : Sort.NONE,
            clientSort: clientNameSort ? (clientNameSort as Sort) : Sort.NONE,
        };

        search(params);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const searchPress = () => {
        const params: ProjectFilterParams = {
            nameFilter: projectNameFilter,
            clientFilter: clientFilter,
            projectNameSort: projectNameSort,
            clientSort: clientSort,
            fullyAssigned: fullyAssigned,
            osocYear: osocYear,
        };
        search(params);
    };

    const toggleNameSort = async (e: SyntheticEvent) => {
        e.preventDefault();
        setProjectNameSort((prev) => getNextSort(prev));

        // execute new search
        const params: ProjectFilterParams = {
            nameFilter: projectNameFilter,
            clientFilter: clientFilter,
            projectNameSort: getNextSort(projectNameSort),
            clientSort: clientSort,
            fullyAssigned: fullyAssigned,
            osocYear: osocYear,
        };
        search(params);
    };

    const toggleClientSort = async (e: SyntheticEvent) => {
        e.preventDefault();
        setClientSort((prev) => getNextSort(prev));

        // execute new search
        const params: ProjectFilterParams = {
            nameFilter: projectNameFilter,
            clientFilter: clientFilter,
            projectNameSort: projectNameSort,
            clientSort: getNextSort(clientSort),
            fullyAssigned: fullyAssigned,
            osocYear: osocYear,
        };
        search(params);
    };

    const toggleFullyAssigned = async (e: SyntheticEvent) => {
        e.preventDefault();
        setFullyAssigned((prev) => !prev);

        // execute new search
        const params: ProjectFilterParams = {
            nameFilter: projectNameFilter,
            clientFilter: clientFilter,
            projectNameSort: projectNameSort,
            clientSort: clientSort,
            fullyAssigned: !fullyAssigned,
            osocYear: osocYear,
        };
        search(params);
    };

    return (
        <div className={styles.projectfilter}>
            <div className={styles.query}>
                <div onClick={toggleNameSort}>
                    Project Name
                    <div className={styles.triangleContainer}>
                        <div
                            className={`${
                                projectNameSort === Sort.ASCENDING
                                    ? styles.up
                                    : ""
                            } ${
                                projectNameSort === Sort.NONE
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
                    onChange={(e) => setProjectNameFilter(e.target.value)}
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
