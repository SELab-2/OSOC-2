import styles from "./StudentFilter.module.css";
import React, {SyntheticEvent, useState} from "react";
import Image from "next/image";
import Filter from "../../public/images/filter.png"
import ArrowUp from "../../public/images/arrowUp.png"
import ArrowDown from "../../public/images/arrowDown.png"
import ForbiddenIcon from "../../public/images/forbidden_icon.png"
import ForbiddenIconColor from "../../public/images/forbidden_icon_color.png"
import CheckIcon from "../../public/images/green_check_mark.png"
import CheckIconColor from "../../public/images/green_check_mark_color.png"
import ExclamationIcon from "../../public/images/exclamation_mark.png"
import ExclamationIconColor from "../../public/images/exclamation_mark_color.png"

export const StudentFilter: React.FC = () => {

    const [nameSort, setNameSort] = useState<boolean>(false)
    const [emailSort, setEmailSort] = useState<boolean>(false)
    const [filterYes, setFilterYes] = useState<boolean>(false)
    const [filterMaybe, setFilterMaybe] = useState<boolean>(false)
    const [filterNo, setFilterNo] = useState<boolean>(false)
    const [alumni, setAlumni] = useState<boolean>(false)
    const [studentCoach, setstudentCoach] = useState<boolean>(false)
    const [selectedRoles, setSelectedRoles] = useState<Array<string>>([])

    const toggleNameSort = async (e: SyntheticEvent) => {
        e.preventDefault();
        setNameSort(bool => !bool);
    }
    const toggleEmailSort = async (e: SyntheticEvent) => {
        e.preventDefault();
        setEmailSort(bool => !bool);
    }
    const toggleFilterYes = async (e: SyntheticEvent) => {
        e.preventDefault();
        setFilterYes(bool => !bool);
    }
    const toggleFilterMaybe = async (e: SyntheticEvent) => {
        e.preventDefault();
        setFilterMaybe(bool => !bool);
    }
    const toggleFilterNo = async (e: SyntheticEvent) => {
        e.preventDefault();
        setFilterNo(bool => !bool);
    }
    const toggleAlumni = async (e: SyntheticEvent) => {
        e.preventDefault();
        setAlumni(bool => !bool);
    }
    const toggleStudentCoach = async (e: SyntheticEvent) => {
        e.preventDefault();
        setstudentCoach(bool => !bool);
    }

    const getRoles = async () => {
        console.log(alumni)
        console.log(studentCoach)
        console.log(selectedRoles)
    }


    console.log(getRoles())
    const search = async (e: SyntheticEvent) => {
        e.preventDefault();
        const nameText = (document.getElementById("nameText") as HTMLInputElement).value;
        const emailText = (document.getElementById("emailText") as HTMLInputElement).value;
        const nameOrder = nameSort ? "Desc" : "Asc"
        const emailOrder = emailSort ? "Desc" : "Asc"
        const roles = ["Backend dev", "Frontend dev"]
        setSelectedRoles(roles)
        const query = "name=" + nameText + "&sort=" + nameOrder + "&email=" + emailText + "&sort=" + emailOrder +
            "&Yes=" + filterYes + "&maybe=" + filterMaybe + "&no=" + filterNo + "&studentCoach=" + studentCoach +
            "&alumni=" + alumni + "&roles=" + roles
        console.log(query)
        //TODO hier moet de call naar de backend gebeuren en dan de data naar Students brengen
    }

    return (
        <div className={styles.filter}>
            <text>Name
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
            <button onClick={toggleAlumni}>
                Alumni
            </button>
            <button onClick={toggleStudentCoach}>
                StudentCoach
            </button>
            <div className={styles.dropdown}>
                <Image src={Filter} width={30} height={30} className={styles.dropbtn} alt={"Disabled"}>
                </Image>

                <div className={styles.dropdownContent}>
                    <Image className={styles.buttonImage}
                           src={filterYes ? CheckIconColor : CheckIcon}
                           width={30} height={30} alt={"Disabled"}
                           onClick={toggleFilterYes}/>
                    <Image className={styles.buttonImage}
                           src={filterMaybe ? ExclamationIconColor : ExclamationIcon}
                           width={30} height={30} alt={"Disabled"}
                           onClick={toggleFilterMaybe}/>
                    <Image className={styles.buttonImage}
                           src={filterNo ? ForbiddenIconColor : ForbiddenIcon}
                           width={30} height={30} alt={"Disabled"}
                           onClick={toggleFilterNo}/>
                </div>
                <button onClick={search}>
                    search
                </button>
            </div>

        </div>)
}