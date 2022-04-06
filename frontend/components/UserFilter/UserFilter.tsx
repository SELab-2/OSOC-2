import styles from "./UserFilter.module.css";
import React, {SyntheticEvent, useState} from "react";
import Image from "next/image";
import AdminIconColor from "../../public/images/admin_icon_color.png";
import AdminIcon from "../../public/images/admin_icon.png";
import CoachIconColor from "../../public/images/coach_icon_color.png"
import CoachIcon from "../../public/images/coach_icon.png"
import Filter from "../../public/images/filter.png"
import ArrowUp from "../../public/images/arrowUp.png"
import ArrowDown from "../../public/images/arrowDown.png"
import ForbiddenIcon from "../../public/images/forbidden_icon.png"
import ForbiddenIconColor from "../../public/images/forbidden_icon_color.png"

export const UserFilter: React.FC = () => {

    const [nameSort, setNameSort] = useState<boolean>(false)
    const [emailSort, setEmailSort] = useState<boolean>(false)
    const [adminFilter, setAdminFilter] = useState<boolean>(false)
    const [coachFilter, setCoachFilter] = useState<boolean>(false)
    const [pendingFilter, setPendingFilter] = useState<boolean>(false)

    const toggleNameSort = async (e: SyntheticEvent) => {
        e.preventDefault();
        setNameSort(bool => !bool);
    }


    const toggleEmailSort = async (e: SyntheticEvent) => {
        e.preventDefault();
        setEmailSort(bool => !bool);
    }


    const toggleAdminFilter = async (e: SyntheticEvent) => {
        e.preventDefault();
        setAdminFilter(bool => !bool);
    }


    const toggleCoachFilter = async (e: SyntheticEvent) => {
        e.preventDefault();
        setCoachFilter(bool => !bool);
    }


    const togglePendingFilter = async (e: SyntheticEvent) => {
        e.preventDefault();
        setPendingFilter(bool => !bool);
    }

    const search = async (e: SyntheticEvent) => {
        e.preventDefault();
        const nameText = (document.getElementById("nameText") as HTMLInputElement).value;
        const emailText = (document.getElementById("emailText") as HTMLInputElement).value;
        const nameOrder = nameSort ? "Desc" : "Asc"
        const emailOrder = emailSort ? "Desc" : "Asc"
        const query = "name=" + nameText + "&sort=" + nameOrder + "&email=" + emailText + "&sort=" + emailOrder
            + "&admin=" + adminFilter + "&coach=" + coachFilter + "&pending=" + pendingFilter
        console.log(query)
        //TODO hier moet de call naar de backend gebeuren en dan de data naar user brengen
    }

    return (
        <div className={styles.filter}>
            <text>Names
                <Image className={styles.buttonImage}
                       src={nameSort ? ArrowUp : ArrowDown}
                       width={15} height={15} alt={"Disabled"}

                       onClick={toggleNameSort}/>
            </text>
            <input id="nameText" type="text" placeholder="Will smith"/>
            <text>Email
                <Image className={styles.buttonImage}
                       src={emailSort ? ArrowUp : ArrowDown}
                       width={15} height={15} alt={"Disabled"}
                       onClick={toggleEmailSort}/>
            </text>
            <input id="emailText" type="text" placeholder="Search.."/>
            <text>Account Status</text>

            <div className={styles.dropdown}>
                <Image src={Filter} width={30} height={30} className={styles.dropbtn} alt={"Disabled"}>
                </Image>

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
                <button onClick={search}>
                    search
                </button>
            </div>

        </div>)
}
