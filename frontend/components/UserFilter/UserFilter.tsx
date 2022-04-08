import styles from "./UserFilter.module.css";
import React, {SyntheticEvent, useState} from "react";
import Image from "next/image";
import AdminIconColor from "../../public/images/admin_icon_color.png";
import AdminIcon from "../../public/images/admin_icon.png";
import CoachIconColor from "../../public/images/coach_icon_color.png"
import CoachIcon from "../../public/images/coach_icon.png"
import ForbiddenIcon from "../../public/images/forbidden_icon.png"
import ForbiddenIconColor from "../../public/images/forbidden_icon_color.png"
import {getNextSort, Sort} from "../../types/types";

export const UserFilter: React.FC = () => {

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [nameFilter, setNameFilter] = useState<string>("")
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [emailFilter, setEmailFilter] = useState<string>("")
    const [nameSort, setNameSort] = useState<Sort>(Sort.None)
    const [emailSort, setEmailSort] = useState<Sort>(Sort.None)
    const [adminFilter, setAdminFilter] = useState<boolean>(false)
    const [coachFilter, setCoachFilter] = useState<boolean>(false)
    const [pendingFilter, setPendingFilter] = useState<boolean>(false)

    const toggleNameSort = async (e: SyntheticEvent) => {
        e.preventDefault();
        setNameSort(getNextSort(nameSort));
    }


    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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


    const togglePendingFilter = async (e: SyntheticEvent) => {
        e.preventDefault();
        setPendingFilter(!pendingFilter);
    }

    const search = async (e: SyntheticEvent) => {
        e.preventDefault();
        // TODO -- The query should be built dynamically, that is not every field should be in the query
        //      -- Set the same variable queries in the frontend url so we can share and reuse the filter
        const nameText = (document.getElementById("nameText") as HTMLInputElement).value;
        const emailText = (document.getElementById("emailText") as HTMLInputElement).value;
        const nameOrder = nameSort ? "Desc" : "Asc"
        const emailOrder = emailSort ? "Desc" : "Asc"
        const query = "name=" + nameText + "&sort=" + nameOrder + "&email=" + emailText + "&sort=" + emailOrder
            + "&admin=" + adminFilter + "&coach=" + coachFilter + "&pending=" + pendingFilter
        console.log(query)
        // TODO Execute the query
    }

    return (
        <div className={styles.filter}>
            <form>
                <label>
                    Names
                    <input type="text" placeholder="Search.." onChange={e => setNameFilter(e.target.value)}/>
                    <div className={`${nameSort === Sort.None ? styles.line : styles.triangle}`} onClick={toggleNameSort}/>
                </label>

                <label>
                    Email
                    <input type="text" placeholder="Search.." onChange={e => setEmailFilter(e.target.value)}/>
                </label>

                <div className={styles.dropdownContent}>
                    <Image className={styles.buttonImage}
                           src={adminFilter ? AdminIconColor : AdminIcon}
                           width={30} height={30} alt={"Disabled"}
                           onClick={toggleAdminFilter}/>

                    <Image className={styles.buttonImage}
                           src={coachFilter ? CoachIconColor : CoachIcon}
                           width={30} height={30} alt={"Disabled"}
                           onClick={toggleCoachFilter}/>
                    <Image className={styles.buttonImage}
                           src={pendingFilter ? ForbiddenIconColor : ForbiddenIcon}
                           width={30} height={30} alt={"Disabled"}
                           onClick={togglePendingFilter}/>
                </div>

                <button onClick={search}>Search</button>
            </form>
        </div>)
}
