import styles from "./UserFilter.module.css";
import React, {SyntheticEvent, useContext, useState} from "react";
import Image from "next/image";
import AdminIconColor from "../../public/images/admin_icon_color.png";
import AdminIcon from "../../public/images/admin_icon.png";
import CoachIconColor from "../../public/images/coach_icon_color.png"
import CoachIcon from "../../public/images/coach_icon.png"
import ForbiddenIcon from "../../public/images/forbidden_icon.png"
import ForbiddenIconColor from "../../public/images/forbidden_icon_color.png"
import {
    AccountStatus,
    FilterBoolean,
    getNextFilterBoolean,
    getNextSort,
    getNextStatusNoPending,
    LoginUser,
    Sort
} from "../../types/types";
import SessionContext from "../../contexts/sessionProvider";

export const UserFilter: React.FC<{ updateUsers: (users: Array<LoginUser>) => void }> = ({updateUsers}) => {

    const [nameFilter, setNameFilter] = useState<string>("")
    const [emailFilter, setEmailFilter] = useState<string>("")
    const [nameSort, setNameSort] = useState<Sort>(Sort.NONE)
    const [emailSort, setEmailSort] = useState<Sort>(Sort.NONE)
    const [adminFilter, setAdminFilter] = useState<FilterBoolean>(FilterBoolean.NONE)
    const [coachFilter, setCoachFilter] = useState<FilterBoolean>(FilterBoolean.NONE)
    const [statusFilter, setStatusFilter] = useState<AccountStatus>(AccountStatus.NONE)
    const {sessionKey, setSessionKey} = useContext(SessionContext)

    const toggleNameSort = async (e: SyntheticEvent) => {
        e.preventDefault();
        setNameSort(getNextSort(nameSort));
    }

    const toggleEmailSort = async (e: SyntheticEvent) => {
        e.preventDefault();
        setEmailSort(getNextSort(emailSort));
    }

    const toggleAdminFilter = async (e: SyntheticEvent) => {
        e.preventDefault();
        setAdminFilter(prev => getNextFilterBoolean(prev));
    }

    const toggleCoachFilter = async (e: SyntheticEvent) => {
        e.preventDefault();
        setCoachFilter(prev => getNextFilterBoolean(prev));
    }

    const togglePendingStatus = async (e: SyntheticEvent) => {
        e.preventDefault()
        if (statusFilter === AccountStatus.PENDING) {
            setStatusFilter(AccountStatus.NONE)
        } else {
            setStatusFilter(AccountStatus.PENDING)
        }
    }

    const toggleDisabledStatus = async (e: SyntheticEvent) => {
        e.preventDefault();
        setStatusFilter(prev => getNextStatusNoPending(prev))
    }

    const search = async (e: SyntheticEvent) => {
        e.preventDefault();
        let query = "?";
        if (nameFilter !== "") {
            query += "nameFilter=" + nameFilter
        }
        if (nameSort !== Sort.NONE) {
            const nameOrder = nameSort === Sort.DESCENDING ? "desc" : "asc";
            if (query.length > 1) {
                query += "&"
            }
            query += "nameSort=" + nameOrder
        }
        if (emailFilter !== "") {
            if (query.length > 1) {
                query += "&"
            }
            query += "emailFilter=" + emailFilter
        }
        if (emailSort !== Sort.NONE) {
            const emailOrder = emailSort === Sort.DESCENDING ? "desc" : "asc";
            if (query.length > 1) {
                query += "&"
            }
            query += "emailSort=" + emailOrder
        }


        if (adminFilter !== FilterBoolean.NONE) {
            if (query.length > 1) {
                query += "&"
            }
            query += "isAdminFilter=" + adminFilter
        }
        if (coachFilter !== FilterBoolean.NONE) {
            if (query.length > 1) {
                query += "&"
            }
            query += "isCoachFilter=" + coachFilter
        }
        if (statusFilter !== AccountStatus.NONE) {
            if (query.length > 1) {
                query += "&"
            }
            query += "statusFilter=" + statusFilter
        }

        console.log(query)

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/filter` + query, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `auth/osoc2 ${sessionKey}`

            }
        }).then(response => response.json()).then(json => {
            if (!json.success) {
                return {success: false};
            } else return json;
        }).catch(err => {
            console.log(err)
            return {success: false};
        });
        if (setSessionKey) {
            setSessionKey(response.sessionkey)
        }
        updateUsers(response.data)
    }

    return (
        <div className={styles.filter}>
            <form className={styles.form}>
                <div className={styles.query}>
                    <div onClick={toggleNameSort}>
                        Names
                        <div className={styles.triangleContainer}>
                            <div
                                className={`${nameSort === Sort.ASCENDING ? styles.up : ""} ${nameSort === Sort.NONE ? styles.dot : styles.triangle}`}
                            />
                        </div>
                    </div>

                    <input className={`input ${styles.input}`} type="text" placeholder="Search.."
                           onChange={e => setNameFilter(e.target.value)}/>
                    <button
                        className={`${statusFilter === AccountStatus.PENDING ? styles.pendingActive : styles.pendingButton}`}
                        onClick={togglePendingStatus}>Pending
                    </button>
                </div>

                <div className={styles.query}>
                    <div onClick={toggleEmailSort}>
                        Email
                        <div className={styles.triangleContainer}>
                            <div
                                className={`${emailSort === Sort.ASCENDING ? styles.up : ""} ${emailSort === Sort.NONE ? styles.dot : styles.triangle}`}
                            />
                        </div>
                    </div>

                    <input className={`input ${styles.input}`} type="text" placeholder="Search.."
                           onChange={e => setEmailFilter(e.target.value)}/>
                    <button onClick={search}>Search</button>
                </div>

                <div className={styles.buttons}>
                    <div className={styles.buttonContainer}>
                        <Image className={styles.buttonImage}
                               src={adminFilter ? AdminIconColor : AdminIcon}
                               width={30} height={30} alt={"Disabled"}
                               onClick={toggleAdminFilter}/>
                        <p>Admin</p>
                    </div>

                    <div className={styles.buttonContainer}>
                        <Image className={styles.buttonImage}
                               src={coachFilter ? CoachIconColor : CoachIcon}
                               width={30} height={30} alt={"Disabled"}
                               onClick={toggleCoachFilter}/>
                        <p>Coach</p>
                    </div>

                    <div className={styles.buttonContainer}>
                        <Image className={styles.buttonImage}
                               src={statusFilter === AccountStatus.NONE ? ForbiddenIcon : ForbiddenIconColor}
                               width={30} height={30} alt={"Disabled"}
                               onClick={toggleDisabledStatus}/>
                        <p>Disabled</p>
                    </div>

                </div>
            </form>
        </div>)
}
