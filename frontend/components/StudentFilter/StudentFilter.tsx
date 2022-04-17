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
import {getNextSort, Role, Sort, Student} from "../../types/types";
import {RolesComponent} from "../RoleComponent/RolesComponent";
import SessionContext from "../../contexts/sessionProvider";
//import {useRouter} from "next/router";

export const StudentFilter: React.FC<{ roles: Array<Role>, setFilteredStudents: (user: Array<Student>) => void }> = ({
                                                                                                                         roles,
                                                                                                                         setFilteredStudents
                                                                                                                     }) => {
    const [firstNameSort, setFirstNameSort] = useState<Sort>(Sort.NONE);
    const [alumniSort, setAlumniSort] = useState<Sort>(Sort.NONE);
    const [lastNameSort, setLastNameSort] = useState<Sort>(Sort.NONE);
    const [emailSort, setEmailSort] = useState<Sort>(Sort.NONE);
    const [filterYes, setFilterYes] = useState<boolean>(false);
    const [filterMaybe, setFilterMaybe] = useState<boolean>(false);
    const [filterNo, setFilterNo] = useState<boolean>(false);
    const [alumni, setAlumni] = useState<boolean>(false);
    const [studentCoach, setstudentCoach] = useState<boolean>(false);
    const [selectedRoles, setSelectedRoles] = useState<Array<string>>([]);
    const {sessionKey, setSessionKey} = useContext(SessionContext);
    const [statusFilter, setStatusFilter] = useState<string>("");
    //const router = useRouter()

    //TODO dit werkt nog niet
    //useEffect(() => {
    //    search().then()
    //}, [firstNameSort,lastNameSort, emailSort, alumni, studentCoach, statusFilter])

    const toggleFirstNameSort = async (e: SyntheticEvent) => {
        e.preventDefault();
        setFirstNameSort(prev => getNextSort(prev));
    }
    const toggleAlumniSort = async (e: SyntheticEvent) => {
        e.preventDefault();
        setAlumniSort(prev => getNextSort(prev));
    }
    const toggleLastNameSort = async (e: SyntheticEvent) => {
        e.preventDefault();
        setLastNameSort(prev => getNextSort(prev));
    }
    const toggleEmailSort = async (e: SyntheticEvent) => {
        e.preventDefault();
        setEmailSort(prev => getNextSort(prev));
    }
    const toggleFilterYes = async (e: SyntheticEvent) => {
        e.preventDefault();
        //This is because the call is async
        if (!filterYes) {
            setStatusFilter(() => "YES");
        } else {
            setStatusFilter(() => "");
        }
        setFilterYes(bool => !bool);
        setFilterMaybe(false);
        setFilterNo(false);
    }
    const toggleFilterMaybe = async (e: SyntheticEvent) => {
        e.preventDefault();
        if (!filterMaybe) {
            setStatusFilter(() => "MAYBE");
        } else {
            setStatusFilter(() => "");
        }
        setFilterMaybe(bool => !bool);
        setFilterYes(false);
        setFilterNo(false);
    }
    const toggleFilterNo = async (e: SyntheticEvent) => {
        e.preventDefault();
        if (!filterNo) {
            setStatusFilter(() => "NO");
        } else {
            setStatusFilter(() => "");
        }
        setFilterNo(bool => !bool);
        setFilterYes(false);
        setFilterMaybe(false);

    }
    const toggleAlumni = async (e: SyntheticEvent) => {
        e.preventDefault();
        setAlumni(prev => !prev);
    }
    const toggleStudentCoach = async (e: SyntheticEvent) => {
        e.preventDefault();
        setstudentCoach(prev => !prev);
    }

    const search = async () => {
        const firstNameText = (document.getElementById("firstNameText") as HTMLInputElement).value;
        const lastNameText = (document.getElementById("lastNameText") as HTMLInputElement).value;
        const osocEditionText = (document.getElementById("osocEditionText") as HTMLInputElement).value;
        const emailText = (document.getElementById("emailText") as HTMLInputElement).value;
        const filters = []
        if (firstNameText !== "") {
            filters.push("firstNameFilter=" + firstNameText);
        }
        if (firstNameSort !== Sort.NONE) {
            filters.push(`firstNameSort=${firstNameSort}`);
        }
        if (lastNameText !== "") {
            filters.push(`lastNameFilter=${lastNameText}`);
        }
        if (lastNameSort !== Sort.NONE) {
            filters.push(`lastNameSort=${lastNameSort}`);
        }
        if (emailText !== "") {
            filters.push(`emailFilter=${emailText}`);
        }
        if (emailSort !== Sort.NONE) {
            filters.push(`emailSort=${emailSort}`);
        }
        if (alumni) {
            filters.push(`alumniFilter=${alumni}`);
        }
        if (alumniSort !== Sort.NONE) {
            filters.push(`alumniSort=${alumniSort}`);
        }
        if (studentCoach) {
            filters.push(`coachFilter=${studentCoach}`);
        }
        if (osocEditionText !== "") {
            filters.push(`osocYear=${osocEditionText}`);
        }
        if (selectedRoles.length !== 0) {
            filters.push(`roleFilter=${selectedRoles.toString()}`);
        }
        if (statusFilter !== "") {
            filters.push(`statusFilter=${statusFilter}`);
        }
        const query = filters.length > 0 ? `?${filters.join('&')}` : "";
        //await router.push(`/student/filter${query}`)

        console.log(query);
        console.log(`${process.env.NEXT_PUBLIC_API_URL}/student/filter` + query);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/student/filter` + query, {
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
        setFilteredStudents(response.data);
    }

    const changeSelectedRolesProp = (changeRole: string) => {
        const roles = selectedRoles;
        const index = selectedRoles.indexOf(changeRole, 0);
        if (index > -1) {
            roles.splice(index, 1);

        } else {
            roles.push(changeRole)
        }
        setSelectedRoles(roles);
    }

    const searchPress = (e: SyntheticEvent) => {
        e.preventDefault()
        search().then()
    }
    return (
        <div className={styles.filter}>
            <text>firstName
                <Image className={styles.buttonImage}
                       src={firstNameSort !== Sort.NONE ? ArrowUp : ArrowDown}
                       width={15} height={15} alt={"Disabled"}

                       onClick={toggleFirstNameSort}/>
            </text>
            <input id="firstNameText" type="text" placeholder="Will"/>
            <text>lastName
                <Image className={styles.buttonImage}
                       src={lastNameSort !== Sort.NONE ? ArrowUp : ArrowDown}
                       width={15} height={15} alt={"Disabled"}

                       onClick={toggleLastNameSort}/>
            </text>
            <input id="lastNameText" type="text" placeholder="Smith"/>
            <text>Osoc edition maybe dropdown?</text>
            <input id="osocEditionText" type="text" placeholder="2022"/>
            <text>Email
                <Image className={styles.buttonImage}
                       src={emailSort !== Sort.NONE ? ArrowUp : ArrowDown}
                       width={15} height={15} alt={"Disabled"}
                       onClick={toggleEmailSort}/>
            </text>
            <input id="emailText" type="text" placeholder="Search.."/>
            <Image className={styles.buttonImage}
                   src={alumniSort !== Sort.NONE ? ArrowUp : ArrowDown}
                   width={15} height={15} alt={"Disabled"}
                   onClick={toggleAlumniSort}/>
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
                <button onClick={searchPress}>
                    search
                </button>
            </div>

        </div>)
}