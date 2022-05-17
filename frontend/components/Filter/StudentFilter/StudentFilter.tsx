import styles from "../Filter.module.css";
import React, { SyntheticEvent, useContext, useEffect, useState } from "react";
import {
    Display,
    EmailStatus,
    getNextSort,
    Role,
    Sort,
    StudentFilterParams,
    StudentStatus,
} from "../../../types";
import SessionContext from "../../../contexts/sessionProvider";
import Image from "next/image";
import CheckIconColor from "../../../public/images/green_check_mark_color.png";
import CheckIcon from "../../../public/images/green_check_mark.png";
import ExclamationIconColor from "../../../public/images/exclamation_mark_color.png";
import ExclamationIcon from "../../../public/images/exclamation_mark.png";
import ForbiddenIconColor from "../../../public/images/forbidden_icon_color.png";
import ForbiddenIcon from "../../../public/images/forbidden_icon.png";

export const StudentFilter: React.FC<{
    search: (params: StudentFilterParams) => void;
    display: Display;
}> = ({ search, display }) => {
    const { getSession } = useContext(SessionContext);

    const [nameFilter, setNameFilter] = useState<string>("");
    const [emailFilter, setEmailFilter] = useState<string>("");
    const [nameSort, setNameSort] = useState<Sort>(Sort.NONE);
    const [emailSort, setEmailSort] = useState<Sort>(Sort.NONE);
    const [alumni, setAlumni] = useState<boolean>(false);
    const [studentCoach, setStudentCoach] = useState<boolean>(false);
    const [statusFilter, setStatusFilter] = useState<StudentStatus>(
        StudentStatus.EMPTY
    );
    const [osocYear, setOsocYear] = useState<string>("");
    const [emailStatus, setEmailStatus] = useState<EmailStatus>(
        EmailStatus.EMPTY
    );

    // Roles used in the dropdown
    const [roles, setRoles] = useState<Array<Role>>([]);
    // A set of active roles
    const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set());
    const [rolesActive, setRolesActive] = useState<boolean>(false);
    const [emailStatusActive, setEmailStatusActive] = useState<boolean>(false);

    const fetchRoles = async () => {
        const { sessionKey } = getSession
            ? await getSession()
            : { sessionKey: "" };
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
        setRoles(responseRoles.data);
    };

    // Load roles on page render
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);

        const nameFilter = urlParams.get("nameFilter");
        const emailFilter = urlParams.get("emailFilter");
        const nameSort = urlParams.get("nameSort");
        const emailSort = urlParams.get("emailSort");
        const alumni = urlParams.get("alumni");
        const studentCoach = urlParams.get("studentCoach");
        const statusFilter = urlParams.get("statusFilter");
        const osocYear = urlParams.get("osocYear");
        const emailStatus = urlParams.get("emailStatus");

        // parse all the arguments and set the state
        if (nameFilter !== null) {
            setNameFilter(nameFilter);
            console.log(nameFilter);
        }
        if (emailFilter !== null) {
            setEmailFilter(emailFilter);
        }
        if (
            nameSort !== null &&
            Object.values(Sort).includes(nameSort as Sort)
        ) {
            setNameSort(nameSort as Sort);
        }
        if (
            emailSort !== null &&
            Object.values(Sort).includes(emailSort as Sort)
        ) {
            setEmailSort(emailSort as Sort);
        }
        if (alumni === "true" || alumni === "false") {
            setAlumni(alumni === "true");
        }
        if (studentCoach === "true" || studentCoach === "false") {
            setStudentCoach(studentCoach === "true");
        }
        if (
            statusFilter !== null &&
            Object.values(StudentStatus).includes(statusFilter as StudentStatus)
        ) {
            setStatusFilter(statusFilter as StudentStatus);
        }
        if (osocYear !== null && new RegExp("d+").test(osocYear)) {
            setOsocYear(osocYear);
        }
        if (
            emailStatus !== null &&
            Object.values(EmailStatus).includes(emailStatus as EmailStatus)
        ) {
            setEmailStatus(emailStatus as EmailStatus);
        }
        const params: StudentFilterParams = {
            nameFilter: nameFilter ? nameFilter : "",
            emailFilter: emailFilter ? emailFilter : "",
            nameSort: nameSort ? (nameSort as Sort) : Sort.NONE,
            emailSort: emailSort ? (emailSort as Sort) : Sort.NONE,
            alumni: alumni === "true",
            studentCoach: studentCoach === "true",
            statusFilter: statusFilter
                ? (statusFilter as StudentStatus)
                : StudentStatus.EMPTY,
            osocYear:
                osocYear && new RegExp("d+").test(osocYear) ? osocYear : "",
            emailStatus: emailStatus
                ? (emailStatus as EmailStatus)
                : EmailStatus.EMPTY,
            selectedRoles: selectedRoles,
        };
        console.log(params);
        search(params);

        fetchRoles().then();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const toggleNameSort = async (e: SyntheticEvent) => {
        e.preventDefault();
        setNameSort((prev) => getNextSort(prev));

        setEmailStatusActive(false);
        setRolesActive(false);
        const params: StudentFilterParams = {
            nameFilter: nameFilter,
            emailFilter: emailFilter,
            nameSort: getNextSort(nameSort),
            emailSort: emailSort,
            alumni: alumni,
            studentCoach: studentCoach,
            statusFilter: statusFilter,
            osocYear: osocYear,
            emailStatus: emailStatus,
            selectedRoles: selectedRoles,
        };
        search(params);
    };

    const toggleEmailSort = async (e: SyntheticEvent) => {
        e.preventDefault();
        setEmailSort((prev) => getNextSort(prev));

        setEmailStatusActive(false);
        setRolesActive(false);
        const params: StudentFilterParams = {
            nameFilter: nameFilter,
            emailFilter: emailFilter,
            nameSort: nameSort,
            emailSort: getNextSort(emailSort),
            alumni: alumni,
            studentCoach: studentCoach,
            statusFilter: statusFilter,
            osocYear: osocYear,
            emailStatus: emailStatus,
            selectedRoles: selectedRoles,
        };
        search(params);
    };

    const toggleFilterYes = async (e: SyntheticEvent) => {
        e.preventDefault();
        let newVal;
        if (statusFilter !== StudentStatus.YES) {
            newVal = StudentStatus.YES;
        } else {
            newVal = StudentStatus.EMPTY;
        }
        setStatusFilter(newVal);

        setEmailStatusActive(false);
        setRolesActive(false);
        const params: StudentFilterParams = {
            nameFilter: nameFilter,
            emailFilter: emailFilter,
            nameSort: nameSort,
            emailSort: emailSort,
            alumni: alumni,
            studentCoach: studentCoach,
            statusFilter: newVal,
            osocYear: osocYear,
            emailStatus: emailStatus,
            selectedRoles: selectedRoles,
        };
        search(params);
    };

    const toggleFilterMaybe = async (e: SyntheticEvent) => {
        e.preventDefault();
        let newVal;
        if (statusFilter !== StudentStatus.MAYBE) {
            newVal = StudentStatus.MAYBE;
        } else {
            newVal = StudentStatus.EMPTY;
        }
        setStatusFilter(newVal);

        setEmailStatusActive(false);
        setRolesActive(false);
        const params: StudentFilterParams = {
            nameFilter: nameFilter,
            emailFilter: emailFilter,
            nameSort: nameSort,
            emailSort: emailSort,
            alumni: alumni,
            studentCoach: studentCoach,
            statusFilter: newVal,
            osocYear: osocYear,
            emailStatus: emailStatus,
            selectedRoles: selectedRoles,
        };
        search(params);
    };

    const toggleFilterNo = async (e: SyntheticEvent) => {
        e.preventDefault();
        let newVal;
        if (statusFilter !== StudentStatus.NO) {
            newVal = StudentStatus.NO;
        } else {
            newVal = StudentStatus.EMPTY;
        }
        setStatusFilter(newVal);

        setEmailStatusActive(false);
        setRolesActive(false);
        const params: StudentFilterParams = {
            nameFilter: nameFilter,
            emailFilter: emailFilter,
            nameSort: nameSort,
            emailSort: emailSort,
            alumni: alumni,
            studentCoach: studentCoach,
            statusFilter: newVal,
            osocYear: osocYear,
            emailStatus: emailStatus,
            selectedRoles: selectedRoles,
        };
        search(params);
    };

    const toggleEmailNone = async (e: SyntheticEvent) => {
        e.preventDefault();

        let newVal;
        if (emailStatus !== EmailStatus.NONE) {
            newVal = EmailStatus.NONE;
        } else {
            newVal = EmailStatus.EMPTY;
        }
        setEmailStatus(newVal);

        setEmailStatusActive(false);
        setRolesActive(false);
        const params: StudentFilterParams = {
            nameFilter: nameFilter,
            emailFilter: emailFilter,
            nameSort: nameSort,
            emailSort: emailSort,
            alumni: alumni,
            studentCoach: studentCoach,
            statusFilter: statusFilter,
            osocYear: osocYear,
            emailStatus: newVal,
            selectedRoles: selectedRoles,
        };
        search(params);
    };

    const toggleEmailDraft = async (e: SyntheticEvent) => {
        e.preventDefault();

        let newVal;
        if (emailStatus !== EmailStatus.DRAFT) {
            newVal = EmailStatus.DRAFT;
        } else {
            newVal = EmailStatus.EMPTY;
        }
        setEmailStatus(newVal);

        setEmailStatusActive(false);
        setRolesActive(false);
        const params: StudentFilterParams = {
            nameFilter: nameFilter,
            emailFilter: emailFilter,
            nameSort: nameSort,
            emailSort: emailSort,
            alumni: alumni,
            studentCoach: studentCoach,
            statusFilter: statusFilter,
            osocYear: osocYear,
            emailStatus: newVal,
            selectedRoles: selectedRoles,
        };
        search(params);
    };

    const toggleEmailSent = async (e: SyntheticEvent) => {
        e.preventDefault();

        let newVal;
        if (emailStatus !== EmailStatus.SENT) {
            newVal = EmailStatus.SENT;
        } else {
            newVal = EmailStatus.EMPTY;
        }
        setEmailStatus(newVal);

        setEmailStatusActive(false);
        setRolesActive(false);
        const params: StudentFilterParams = {
            nameFilter: nameFilter,
            emailFilter: emailFilter,
            nameSort: nameSort,
            emailSort: emailSort,
            alumni: alumni,
            studentCoach: studentCoach,
            statusFilter: statusFilter,
            osocYear: osocYear,
            emailStatus: newVal,
            selectedRoles: selectedRoles,
        };
        search(params);
    };

    const toggleEmailFailed = async (e: SyntheticEvent) => {
        e.preventDefault();

        let newVal;
        if (emailStatus !== EmailStatus.FAILED) {
            newVal = EmailStatus.FAILED;
        } else {
            newVal = EmailStatus.EMPTY;
        }
        setEmailStatus(newVal);

        setEmailStatusActive(false);
        setRolesActive(false);
        const params: StudentFilterParams = {
            nameFilter: nameFilter,
            emailFilter: emailFilter,
            nameSort: nameSort,
            emailSort: emailSort,
            alumni: alumni,
            studentCoach: studentCoach,
            statusFilter: statusFilter,
            osocYear: osocYear,
            emailStatus: newVal,
            selectedRoles: selectedRoles,
        };
        search(params);
    };

    const toggleEmailScheduled = async (e: SyntheticEvent) => {
        e.preventDefault();

        let newVal;
        if (emailStatus !== EmailStatus.SCHEDULED) {
            newVal = EmailStatus.SCHEDULED;
        } else {
            newVal = EmailStatus.EMPTY;
        }
        setEmailStatus(newVal);

        setEmailStatusActive(false);
        setRolesActive(false);
        const params: StudentFilterParams = {
            nameFilter: nameFilter,
            emailFilter: emailFilter,
            nameSort: nameSort,
            emailSort: emailSort,
            alumni: alumni,
            studentCoach: studentCoach,
            statusFilter: statusFilter,
            osocYear: osocYear,
            emailStatus: newVal,
            selectedRoles: selectedRoles,
        };
        search(params);
    };

    const toggleAlumni = async (e: SyntheticEvent) => {
        e.preventDefault();
        setAlumni((prev) => !prev);

        setEmailStatusActive(false);
        setRolesActive(false);
        const params: StudentFilterParams = {
            nameFilter: nameFilter,
            emailFilter: emailFilter,
            nameSort: nameSort,
            emailSort: emailSort,
            alumni: !alumni,
            studentCoach: studentCoach,
            statusFilter: statusFilter,
            osocYear: osocYear,
            emailStatus: emailStatus,
            selectedRoles: selectedRoles,
        };
        search(params);
    };

    const toggleStudentCoach = async (e: SyntheticEvent) => {
        e.preventDefault();
        setStudentCoach((prev) => !prev);

        setEmailStatusActive(false);
        setRolesActive(false);
        const params: StudentFilterParams = {
            nameFilter: nameFilter,
            emailFilter: emailFilter,
            nameSort: nameSort,
            emailSort: emailSort,
            alumni: alumni,
            studentCoach: !studentCoach,
            statusFilter: statusFilter,
            osocYear: osocYear,
            emailStatus: emailStatus,
            selectedRoles: selectedRoles,
        };
        search(params);
    };

    const selectRole = (role: string) => {
        // Unselect role
        if (selectedRoles.has(role)) {
            selectedRoles.delete(role);
        } else {
            // Select role
            selectedRoles.add(role);
        }

        const newRoles = new Set(selectedRoles);
        setSelectedRoles(newRoles);

        setEmailStatusActive(false);
        setRolesActive(false);
        const params: StudentFilterParams = {
            nameFilter: nameFilter,
            emailFilter: emailFilter,
            nameSort: nameSort,
            emailSort: emailSort,
            alumni: alumni,
            studentCoach: !studentCoach,
            statusFilter: statusFilter,
            osocYear: osocYear,
            emailStatus: emailStatus,
            selectedRoles: newRoles,
        };
        search(params);
    };

    const searchPress = (e: SyntheticEvent) => {
        e.preventDefault();
        setEmailStatusActive(false);
        setRolesActive(false);
        const params: StudentFilterParams = {
            nameFilter: nameFilter,
            emailFilter: emailFilter,
            nameSort: nameSort,
            emailSort: emailSort,
            alumni: alumni,
            studentCoach: studentCoach,
            statusFilter: statusFilter,
            osocYear: osocYear,
            emailStatus: emailStatus,
            selectedRoles: selectedRoles,
        };
        search(params);
    };

    return (
        <div className={styles.studentfilter}>
            <div
                className={`${
                    display === Display.LIMITED
                        ? styles.contents
                        : styles.studentfilterinputs
                }`}
            >
                <div className={styles.query}>
                    <div data-testid={"firstNameSort"} onClick={toggleNameSort}>
                        Name
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
                        data-testid={"firstNameInput"}
                        value={nameFilter}
                        className={`input ${styles.input}`}
                        type="text"
                        placeholder="Search.."
                        onChange={(e) => setNameFilter(e.target.value)}
                    />
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
                </div>

                <div className={styles.query}>
                    Osoc edition
                    {/* Maybe dropdown */}
                    <input
                        data-testid={"osocYearInput"}
                        className={`input ${styles.input}`}
                        type="text"
                        placeholder="Search.."
                        onChange={(e) => setOsocYear(e.target.value)}
                    />
                </div>
            </div>

            <div className={styles.studentButtonsContainer}>
                <button
                    data-testid={"alumniFilter"}
                    className={`${alumni ? styles.active : styles.inactive}`}
                    onClick={toggleAlumni}
                >
                    Alumni Only
                </button>

                <button
                    data-testid={"coachFilter"}
                    className={`${
                        studentCoach ? styles.active : styles.inactive
                    }`}
                    onClick={toggleStudentCoach}
                >
                    Student Coach Only
                </button>

                <div className={`dropdown ${rolesActive ? "is-active" : ""}`}>
                    <div
                        data-testid={"rolesSelectedFilterDisplay"}
                        className={`dropdown-trigger ${
                            rolesActive || selectedRoles.size > 0
                                ? styles.active
                                : styles.inactive
                        } ${styles.dropdownTrigger}`}
                        onClick={() => setRolesActive(!rolesActive)}
                    >
                        {selectedRoles.size > 0
                            ? selectedRoles.size === 1
                                ? `${selectedRoles.size} role selected`
                                : `${selectedRoles.size} roles selected`
                            : "No role selected"}
                        <div className={styles.triangleContainer}>
                            <div
                                className={`${rolesActive ? styles.up : ""} ${
                                    styles.triangle
                                }`}
                            />
                        </div>
                    </div>
                    <div className="dropdown-menu">
                        <div className="dropdown-content">
                            {roles !== undefined
                                ? roles.map((role) => (
                                      <div
                                          data-testid={`testRoleItem=${role.name}`}
                                          className={`${
                                              styles.dropdownItem
                                          } dropdown-item ${
                                              selectedRoles.has(role.name)
                                                  ? styles.selected
                                                  : ""
                                          }`}
                                          key={role.role_id}
                                          onClick={() => selectRole(role.name)}
                                      >
                                          {role.name}
                                      </div>
                                  ))
                                : null}
                        </div>
                    </div>
                </div>

                <div
                    className={`dropdown ${
                        emailStatusActive ? "is-active" : ""
                    }`}
                >
                    <div
                        data-testid={"emailFilterDisplay"}
                        className={`dropdown-trigger ${
                            emailStatusActive ||
                            emailStatus !== EmailStatus.EMPTY
                                ? styles.active
                                : styles.inactive
                        } ${styles.dropdownTrigger}`}
                        onClick={() => setEmailStatusActive(!emailStatusActive)}
                    >
                        {emailStatus === EmailStatus.EMPTY
                            ? "No email selected"
                            : emailStatus}
                        <div className={styles.triangleContainer}>
                            <div
                                className={`${
                                    emailStatusActive ? styles.up : ""
                                } ${styles.triangle}`}
                            />
                        </div>
                    </div>
                    <div className="dropdown-menu">
                        <div className="dropdown-content">
                            <div
                                data-testid={"emailFilterNone"}
                                className={`${
                                    styles.dropdownItem
                                } dropdown-item 
                            ${
                                emailStatus === EmailStatus.NONE
                                    ? styles.selected
                                    : ""
                            }`}
                                onClick={toggleEmailNone}
                            >
                                {EmailStatus.NONE}
                            </div>
                            <div
                                data-testid={"emailFilterDraft"}
                                className={`${
                                    styles.dropdownItem
                                } dropdown-item 
                            ${
                                emailStatus === EmailStatus.DRAFT
                                    ? styles.selected
                                    : ""
                            }`}
                                onClick={toggleEmailDraft}
                            >
                                {EmailStatus.DRAFT}
                            </div>
                            <div
                                data-testid={"emailFilterSent"}
                                className={`${
                                    styles.dropdownItem
                                } dropdown-item 
                            ${
                                emailStatus === EmailStatus.SENT
                                    ? styles.selected
                                    : ""
                            }`}
                                onClick={toggleEmailSent}
                            >
                                {EmailStatus.SENT}
                            </div>
                            <div
                                data-testid={"emailFilterFailed"}
                                className={`${
                                    styles.dropdownItem
                                } dropdown-item 
                            ${
                                emailStatus === EmailStatus.FAILED
                                    ? styles.selected
                                    : ""
                            }`}
                                onClick={toggleEmailFailed}
                            >
                                {EmailStatus.FAILED}
                            </div>
                            <div
                                data-testid={"emailFilterScheduled"}
                                className={`${
                                    styles.dropdownItem
                                } dropdown-item 
                            ${
                                emailStatus === EmailStatus.SCHEDULED
                                    ? styles.selected
                                    : ""
                            }`}
                                onClick={toggleEmailScheduled}
                            >
                                {EmailStatus.SCHEDULED}
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.studentButtons}>
                    <div className={styles.buttonContainer}>
                        <Image
                            data-testid={"emailFilterYes"}
                            className={styles.buttonImage}
                            src={
                                statusFilter === StudentStatus.YES
                                    ? CheckIconColor
                                    : CheckIcon
                            }
                            width={30}
                            height={30}
                            alt={"Disabled"}
                            onClick={toggleFilterYes}
                        />
                        <p>YES</p>
                    </div>

                    <div className={styles.buttonContainer}>
                        <Image
                            data-testid={"emailFilterMaybe"}
                            className={styles.buttonImage}
                            src={
                                statusFilter === StudentStatus.MAYBE
                                    ? ExclamationIconColor
                                    : ExclamationIcon
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
                            data-testid={"emailFilterNo"}
                            className={styles.buttonImage}
                            src={
                                statusFilter === StudentStatus.NO
                                    ? ForbiddenIconColor
                                    : ForbiddenIcon
                            }
                            width={30}
                            height={30}
                            alt={"Disabled"}
                            onClick={toggleFilterNo}
                        />
                        <p>NO</p>
                    </div>
                </div>

                <button data-testid={"searchButton"} onClick={searchPress}>
                    Search
                </button>
            </div>
        </div>
    );
};
