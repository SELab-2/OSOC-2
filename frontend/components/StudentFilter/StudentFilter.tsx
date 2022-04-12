import styles from "./StudentFilter.module.css";
import React, {SyntheticEvent, useContext, useState} from "react";
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
import {Role, Student} from "../../types/types";
import {RolesComponent} from "../RoleComponent/RolesComponent";
import SessionContext from "../../contexts/sessionProvider";

export const StudentFilter: React.FC<{ roles: Array<Role>, setFilteredStudents: (user: Array<Student>) => void }> = ({roles,setFilteredStudents}) => {
    const [nameSort, setNameSort] = useState<boolean>(false);
    const [emailSort, setEmailSort] = useState<boolean>(false);
    const [filterYes, setFilterYes] = useState<boolean>(false);
    const [filterMaybe, setFilterMaybe] = useState<boolean>(false);
    const [filterNo, setFilterNo] = useState<boolean>(false);
    const [alumni, setAlumni] = useState<boolean>(false);
    const [studentCoach, setstudentCoach] = useState<boolean>(false);
    const [selectedRoles, setSelectedRoles] = useState<Array<string>>([]);
    const {sessionKey, setSessionKey} = useContext(SessionContext);

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

    const search = async (e: SyntheticEvent) => {
        e.preventDefault();
        const nameText = (document.getElementById("nameText") as HTMLInputElement).value;
        const emailText = (document.getElementById("emailText") as HTMLInputElement).value;
        const nameOrder = nameSort ? "Desc" : "Asc";
        const emailOrder = emailSort ? "Desc" : "Asc";
        const query = "name=" + nameText + "&sort=" + nameOrder + "&email=" + emailText + "&sort=" + emailOrder +
            "&Yes=" + filterYes + "&maybe=" + filterMaybe + "&no=" + filterNo + "&studentCoach=" + studentCoach +
            "&alumni=" + alumni + "&roles=" + roles;
        console.log(query);

        //TODO hier moet de query nog verbonden worden
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/student/filter`, {
            method: 'GET',
            headers: {
                'Authorization': `auth/osoc2 ${sessionKey}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        })
            .then(response => response.json()).then(json => {
                console.log(json)
                if (!json.success) {
                    return {success: false};
                } else return json;
            })
            .catch(err => {
                console.log(err)
                return {success: false};
            });
        if (setSessionKey) {
            setSessionKey(response.sessionkey);
        }
        setFilteredStudents(response.data)


    }

    const changeSelectedRolesProp = (changeRole: string) => {
        const roles = selectedRoles
        console.log(roles)
        const index = selectedRoles.indexOf(changeRole, 0);
        if (index > -1) {
            roles.splice(index, 1);

        } else {
            roles.push(changeRole)
        }
        setSelectedRoles(roles);
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
            <div>
                roles
                {roles.map(role => <RolesComponent role={role} key={role.role_id}
                                                   setSelected={changeSelectedRolesProp}/>)}
            </div>
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