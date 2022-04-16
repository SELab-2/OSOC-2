import styles from "./UserFilter.module.css";
import React, {SyntheticEvent, useContext, useState} from "react";
import Image from "next/image";
import AdminIconColor from "../../public/images/admin_icon_color.png";
import AdminIcon from "../../public/images/admin_icon.png";
import CoachIconColor from "../../public/images/coach_icon_color.png"
import CoachIcon from "../../public/images/coach_icon.png"
import ForbiddenIcon from "../../public/images/forbidden_icon.png"
import ForbiddenIconColor from "../../public/images/forbidden_icon_color.png"
import {AccountStatus, getNextSort, LoginUser, Sort} from "../../types/types";
import SessionContext from "../../contexts/sessionProvider";

export const UserFilter: React.FC<{ updateUsers: (users: Array<LoginUser>) => void }> = ({updateUsers}) => {

    const [nameFilter, setNameFilter] = useState<string>("")
    const [emailFilter, setEmailFilter] = useState<string>("")
    const [nameSort, setNameSort] = useState<Sort>(Sort.NONE)
    const [emailSort, setEmailSort] = useState<Sort>(Sort.NONE)
    const [adminFilter, setAdminFilter] = useState<boolean>(false)
    const [coachFilter, setCoachFilter] = useState<boolean>(false)
    const [statusFilter, setStatusFilter] = useState<AccountStatus>(AccountStatus.PENDING)
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
        setAdminFilter(!adminFilter);
    }

    const toggleCoachFilter = async (e: SyntheticEvent) => {
        e.preventDefault();
        setCoachFilter(!coachFilter);
    }

    const togglePendingStatus = async (e: SyntheticEvent) => {
        e.preventDefault()
        if (statusFilter === AccountStatus.PENDING) {
            setStatusFilter(AccountStatus.ACTIVATED)
        } else {
            setStatusFilter(AccountStatus.PENDING)
        }
    }

    const toggleDisabledStatus = async (e: SyntheticEvent) => {
        e.preventDefault();
        if (statusFilter === AccountStatus.DISABLED) {
            setStatusFilter(AccountStatus.ACTIVATED)
        } else {
            setStatusFilter(AccountStatus.DISABLED)
        }
    }

    const search = async (e: SyntheticEvent) => {
        e.preventDefault();
        // TODO -- The query should be built dynamically, that is not every field should be in the query
        //      -- Set the same variable queries in the frontend url so we can share and reuse the filter
        const nameOrder = nameSort ? "Desc" : "Asc"
        const emailOrder = emailSort ? "Desc" : "Asc"
        console.log(nameFilter)
        console.log(nameOrder)
        console.log(emailOrder)
        console.log(emailFilter)

        const query = "?isAdminFilter=" + adminFilter
        //"?nameFilter=" + nameFilter + "&nameSort=" + nameOrder + "&emailFilter=" + emailFilter +
        //"&emailSort=" + emailOrder + "&isAdminFilter=" + adminFilter + "&isCoachFilter=" + coachFilter + "&statusFilter=" + statusFilter
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
                               src={statusFilter === AccountStatus.DISABLED ? ForbiddenIconColor : ForbiddenIcon}
                               width={30} height={30} alt={"Disabled"}
                               onClick={toggleDisabledStatus}/>
                        <p>Disabled</p>
                    </div>

                </div>
            </form>
        </div>)
}
