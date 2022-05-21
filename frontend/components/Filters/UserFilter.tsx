import styles from "./Filter.module.css";
import React, { SyntheticEvent, useEffect, useState } from "react";
import Image from "next/image";
import AdminIconColor from "../../public/images/admin_icon_color.png";
import AdminIcon from "../../public/images/admin_icon.png";
import CoachIconColor from "../../public/images/coach_icon_color.png";
import CoachIcon from "../../public/images/coach_icon.png";
import ForbiddenIcon from "../../public/images/forbidden_icon.png";
import ForbiddenIconColor from "../../public/images/forbidden_icon_color.png";
import { AccountStatus, getNextSort, Sort } from "../../types";
import { useRouter } from "next/router";

export const UserFilter: React.FC<{
    search: (
        nameFilter: string,
        nameSort: Sort,
        emailFilter: string,
        emailSort: Sort,
        adminFilter: boolean,
        coachFilter: boolean,
        statusFilter: AccountStatus
    ) => void;
}> = ({ search }) => {
    const [nameFilter, setNameFilter] = useState<string>("");
    const [emailFilter, setEmailFilter] = useState<string>("");
    const [nameSort, setNameSort] = useState<Sort>(Sort.NONE);
    const [emailSort, setEmailSort] = useState<Sort>(Sort.NONE);
    const [adminFilter, setAdminFilter] = useState<boolean>(false);
    const [coachFilter, setCoachFilter] = useState<boolean>(false);
    const [statusFilter, setStatusFilter] = useState<AccountStatus>(
        AccountStatus.NONE
    );
    useRouter();

    /**
     * Every time a filter changes we perform a search, on initial page load we also get the filter settings from
     * the query parameters
     * This makes the filter responsible for all the user data fetching
     */
    useEffect(() => {
        search(
            nameFilter,
            nameSort,
            emailFilter,
            emailSort,
            adminFilter,
            coachFilter,
            statusFilter
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [nameSort, emailSort, adminFilter, coachFilter, statusFilter]);

    const toggleNameSort = async (e: SyntheticEvent) => {
        e.preventDefault();
        setNameSort(getNextSort(nameSort));
    };

    const toggleEmailSort = async (e: SyntheticEvent) => {
        e.preventDefault();
        setEmailSort(getNextSort(emailSort));
    };

    const toggleAdminFilter = async (e: SyntheticEvent) => {
        e.preventDefault();
        setAdminFilter(() => !adminFilter);
    };

    const toggleCoachFilter = async (e: SyntheticEvent) => {
        e.preventDefault();
        setCoachFilter(() => !coachFilter);
    };

    const togglePendingStatus = async (e: SyntheticEvent) => {
        e.preventDefault();
        if (statusFilter === AccountStatus.PENDING) {
            setStatusFilter(AccountStatus.NONE);
        } else {
            setStatusFilter(AccountStatus.PENDING);
        }
    };

    const toggleDisabledStatus = async (e: SyntheticEvent) => {
        e.preventDefault();
        if (statusFilter === AccountStatus.DISABLED) {
            setStatusFilter(() => AccountStatus.NONE);
        } else {
            setStatusFilter(() => AccountStatus.DISABLED);
        }
    };

    /**
     * Explicitly tell the frontend to execute the current query
     * @param e
     */
    const searchPress = async (e: SyntheticEvent) => {
        e.preventDefault();
        search(
            nameFilter,
            nameSort,
            emailFilter,
            emailSort,
            adminFilter,
            coachFilter,
            statusFilter
        );
    };

    return (
        <div className={styles.userfilter}>
            <form className={styles.form}>
                <div className={styles.query}>
                    <div data-testid={"nameSort"} onClick={toggleNameSort}>
                        Names
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
                        data-testid={"nameInput"}
                        className={`input ${styles.input}`}
                        type="text"
                        placeholder="Search.."
                        onChange={(e) => setNameFilter(e.target.value)}
                    />
                    <button
                        className={`${
                            statusFilter === AccountStatus.PENDING
                                ? styles.pendingActive
                                : styles.pendingButton
                        }`}
                        type="button"
                        onClick={togglePendingStatus}
                        data-testid={"pendingButton"}
                    >
                        Pending
                    </button>
                </div>

                <div className={styles.query}>
                    <div data-testid={"emailSort"} onClick={toggleEmailSort}>
                        Email
                        <div className={styles.triangleContainer}>
                            <div
                                className={`${
                                    emailSort === Sort.ASCENDING
                                        ? styles.up
                                        : ""
                                } ${
                                    emailSort === Sort.NONE
                                        ? styles.dot
                                        : styles.triangle
                                }`}
                            />
                        </div>
                    </div>

                    <input
                        data-testid={"emailInput"}
                        className={`input ${styles.input}`}
                        type="text"
                        placeholder="Search.."
                        onChange={(e) => setEmailFilter(e.target.value)}
                    />
                    <button data-testid={"searchButton"} onClick={searchPress}>
                        Search
                    </button>
                </div>

                <div className={styles.buttons}>
                    <div className={styles.buttonContainer}>
                        <Image
                            data-testid={"adminButton"}
                            className={styles.buttonImage}
                            src={adminFilter ? AdminIconColor : AdminIcon}
                            width={30}
                            height={30}
                            alt={"Disabled"}
                            onClick={toggleAdminFilter}
                        />
                        <p>Admin</p>
                    </div>

                    <div className={styles.buttonContainer}>
                        <Image
                            data-testid={"coachButton"}
                            className={styles.buttonImage}
                            src={coachFilter ? CoachIconColor : CoachIcon}
                            width={30}
                            height={30}
                            alt={"Disabled"}
                            onClick={toggleCoachFilter}
                        />
                        <p>Coach</p>
                    </div>

                    <div className={styles.buttonContainer}>
                        <Image
                            data-testid={"disabledButton"}
                            className={styles.buttonImage}
                            src={
                                statusFilter === AccountStatus.DISABLED
                                    ? ForbiddenIconColor
                                    : ForbiddenIcon
                            }
                            width={30}
                            height={30}
                            alt={"Disabled"}
                            onClick={toggleDisabledStatus}
                        />
                        <p>Disabled</p>
                    </div>
                </div>
            </form>
        </div>
    );
};
