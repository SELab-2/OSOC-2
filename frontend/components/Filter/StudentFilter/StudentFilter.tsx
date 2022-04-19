import styles from "../Filter.module.css";
import React, { SyntheticEvent, useContext, useEffect, useState } from "react";
import Image from "next/image";
import ForbiddenIcon from "../../../public/images/forbidden_icon.png";
import ForbiddenIconColor from "../../../public/images/forbidden_icon_color.png";
import CheckIcon from "../../../public/images/green_check_mark.png";
import CheckIconColor from "../../../public/images/green_check_mark_color.png";
import ExclamationIcon from "../../../public/images/exclamation_mark.png";
import ExclamationIconColor from "../../../public/images/exclamation_mark_color.png";
import { getNextSort, Role, Sort, Student } from "../../../types/types";
import { RolesComponent } from "../../RoleComponent/RolesComponent";
import SessionContext from "../../../contexts/sessionProvider";
import { useRouter } from "next/router";

export const StudentFilter: React.FC<{
    setFilteredStudents: (user: Array<Student>) => void;
}> = ({ setFilteredStudents }) => {
    const [firstNameFilter, setFirstNameFilter] = useState<string>("");
    const [lastNameFilter, setLastNameFilter] = useState<string>("");
    const [emailFilter, setEmailFilter] = useState<string>("");
    const [firstNameSort, setFirstNameSort] = useState<Sort>(Sort.NONE);
    const [lastNameSort, setLastNameSort] = useState<Sort>(Sort.NONE);
    const [emailSort, setEmailSort] = useState<Sort>(Sort.NONE);
    const [filterYes, setFilterYes] = useState<boolean>(false);
    const [filterMaybe, setFilterMaybe] = useState<boolean>(false);
    const [filterNo, setFilterNo] = useState<boolean>(false);
    const [alumni, setAlumni] = useState<boolean>(false);
    const [studentCoach, setstudentCoach] = useState<boolean>(false);
    const [selectedRoles, setSelectedRoles] = useState<Array<string>>([]);
    const { getSessionKey, setSessionKey } = useContext(SessionContext);
    const [statusFilter, setStatusFilter] = useState<string>("");
    const [osocYear, setOsocYear] = useState<string>("");
    const [roles, setRoles] = useState<Array<Role>>([]);
    const router = useRouter();

    const fetchRoles = async () => {
        const sessionKey =
            getSessionKey != undefined ? await getSessionKey() : "";
        const responseRoles = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/role/all`,
            {
                method: "GET",
                headers: {
                    Authorization: `auth/osoc2 ${sessionKey}`,
                },
            }
        )
            .then((response) => response.json())
            .then((json) => {
                if (!json.success) {
                    return { success: false };
                } else return json;
            })
            .catch((err) => {
                console.log(err);
                return { success: false };
            });
        if (setSessionKey) {
            setSessionKey(responseRoles.sessionkey);
        }
        setRoles(responseRoles.data);
    };

    useEffect(() => {
        if (roles === []) {
            fetchRoles().then();
        }
        search().then();
    }, [
        firstNameSort,
        lastNameSort,
        emailSort,
        alumni,
        studentCoach,
        statusFilter,
    ]);

    const toggleFirstNameSort = async (e: SyntheticEvent) => {
        e.preventDefault();
        setFirstNameSort((prev) => getNextSort(prev));
    };

    const toggleLastNameSort = async (e: SyntheticEvent) => {
        e.preventDefault();
        setLastNameSort((prev) => getNextSort(prev));
    };

    const toggleEmailSort = async (e: SyntheticEvent) => {
        e.preventDefault();
        setEmailSort((prev) => getNextSort(prev));
    };

    const toggleFilterYes = async (e: SyntheticEvent) => {
        e.preventDefault();
        //This is because the call is async
        if (!filterYes) {
            setStatusFilter(() => "YES");
        } else {
            setStatusFilter(() => "");
        }
        setFilterYes((bool) => !bool);
        setFilterMaybe(false);
        setFilterNo(false);
    };

    const toggleFilterMaybe = async (e: SyntheticEvent) => {
        e.preventDefault();
        if (!filterMaybe) {
            setStatusFilter(() => "MAYBE");
        } else {
            setStatusFilter(() => "");
        }
        setFilterMaybe((bool) => !bool);
        setFilterYes(false);
        setFilterNo(false);
    };

    const toggleFilterNo = async (e: SyntheticEvent) => {
        e.preventDefault();
        if (!filterNo) {
            setStatusFilter(() => "NO");
        } else {
            setStatusFilter(() => "");
        }
        setFilterNo((bool) => !bool);
        setFilterYes(false);
        setFilterMaybe(false);
    };

    const toggleAlumni = async (e: SyntheticEvent) => {
        e.preventDefault();
        setAlumni((prev) => !prev);
    };

    const toggleStudentCoach = async (e: SyntheticEvent) => {
        e.preventDefault();
        setstudentCoach((prev) => !prev);
    };

    const search = async () => {
        const filters = [];
        if (firstNameFilter !== "") {
            filters.push(`firstNameFilter=${firstNameFilter}`);
        }
        if (firstNameSort !== Sort.NONE) {
            filters.push(`firstNameSort=${firstNameSort}`);
        }
        if (lastNameFilter !== "") {
            filters.push(`lastNameFilter=${lastNameFilter}`);
        }
        if (lastNameSort !== Sort.NONE) {
            filters.push(`lastNameSort=${lastNameSort}`);
        }
        if (emailFilter !== "") {
            filters.push(`emailFilter=${emailFilter}`);
        }
        if (emailSort !== Sort.NONE) {
            filters.push(`emailSort=${emailSort}`);
        }
        if (alumni) {
            filters.push(`alumniFilter=${alumni}`);
        }
        if (studentCoach) {
            filters.push(`coachFilter=${studentCoach}`);
        }
        if (osocYear !== "") {
            filters.push(`osocYear=${osocYear}`);
        }
        if (selectedRoles.length !== 0) {
            filters.push(`roleFilter=${selectedRoles.toString()}`);
        }
        if (statusFilter !== "") {
            filters.push(`statusFilter=${statusFilter}`);
        }
        const query = filters.length > 0 ? `?${filters.join("&")}` : "";
        await router.push(`/students${query}`);

        const sessionKey = getSessionKey ? await getSessionKey() : "";
        if (sessionKey !== "") {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/student/filter` + query,
                {
                    method: "GET",
                    headers: {
                        Authorization: `auth/osoc2 ${sessionKey}`,
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                }
            )
                .then((response) => response.json())
                .then((json) => {
                    console.log(json);
                    if (!json.success) {
                        return { success: false };
                    } else return json;
                })
                .catch((err) => {
                    console.log(err);
                    return { success: false };
                });
            if (setSessionKey) {
                setSessionKey(response.sessionkey);
            }
            setFilteredStudents(response.data);
        }
    };

    const changeSelectedRolesProp = (changeRole: string) => {
        const roles = selectedRoles;
        const index = selectedRoles.indexOf(changeRole, 0);
        if (index > -1) {
            roles.splice(index, 1);
        } else {
            roles.push(changeRole);
        }
        setSelectedRoles(roles);
    };

    const searchPress = (e: SyntheticEvent) => {
        e.preventDefault();
        search().then();
    };
    return (
        <div className={styles.studentfilter}>
            <div className={styles.query}>
                <div onClick={toggleFirstNameSort}>
                    Firstname
                    <div className={styles.triangleContainer}>
                        <div
                            className={`${
                                firstNameSort === Sort.ASCENDING
                                    ? styles.up
                                    : ""
                            } ${
                                firstNameSort === Sort.NONE
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
                    onChange={(e) => setFirstNameFilter(e.target.value)}
                />
            </div>

            <div className={styles.query}>
                <div onClick={toggleLastNameSort}>
                    Lastname
                    <div className={styles.triangleContainer}>
                        <div
                            className={`${
                                lastNameSort === Sort.ASCENDING ? styles.up : ""
                            } ${
                                lastNameSort === Sort.NONE
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
                    onChange={(e) => setLastNameFilter(e.target.value)}
                />
            </div>

            <div className={styles.query}>
                Osoc edition
                {/* Maybe dropdown */}
                <input
                    className={`input ${styles.input}`}
                    type="text"
                    placeholder="2022"
                    onChange={(e) => setOsocYear(e.target.value)}
                />
            </div>

            <div className={styles.query}>
                <div onClick={toggleEmailSort}>
                    Email
                    <div className={styles.triangleContainer}>
                        <div
                            className={`${
                                emailSort === Sort.ASCENDING ? styles.up : ""
                            } ${
                                emailSort === Sort.NONE
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
                    onChange={(e) => setEmailFilter(e.target.value)}
                />
            </div>

            <button
                className={`${alumni ? styles.active : styles.inactive}`}
                onClick={toggleAlumni}
            >
                Alumni Only
            </button>

            <button
                className={`${studentCoach ? styles.active : styles.inactive}`}
                onClick={toggleStudentCoach}
            >
                Student Coach Only
            </button>

            <div className="dropdown">
                <div className="dropdown-trigger">Roles</div>
                <div className="dropdown-menu">
                    {roles !== undefined
                        ? roles.map((role) => (
                              <RolesComponent
                                  role={role}
                                  key={role.role_id}
                                  setSelected={changeSelectedRolesProp}
                              />
                          ))
                        : null}
                </div>
            </div>

            <div className={styles.buttons}>
                <div className={styles.buttonContainer}>
                    <Image
                        className={styles.buttonImage}
                        src={filterYes ? CheckIconColor : CheckIcon}
                        width={30}
                        height={30}
                        alt={"Disabled"}
                        onClick={toggleFilterYes}
                    />
                    <p>YES</p>
                </div>

                <div className={styles.buttonContainer}>
                    <Image
                        className={styles.buttonImage}
                        src={
                            filterMaybe ? ExclamationIconColor : ExclamationIcon
                        }
                        width={30}
                        height={30}
                        alt={"Disabled"}
                        onClick={toggleFilterMaybe}
                    />
                    <p>MAYBE</p>
                </div>

                <div className={styles.buttonContainer}>
                    <Image
                        className={styles.buttonImage}
                        src={filterNo ? ForbiddenIconColor : ForbiddenIcon}
                        width={30}
                        height={30}
                        alt={"Disabled"}
                        onClick={toggleFilterNo}
                    />
                    <p>NO</p>
                </div>
            </div>

            <button onClick={searchPress}>Search</button>
        </div>
    );
};
