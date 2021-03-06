import styles from "./Filter.module.css";
import React, { SyntheticEvent, useContext, useEffect, useState } from "react";
import {
    Display,
    EmailStatus,
    getNextSort,
    NotificationType,
    Role,
    Sort,
    StudentFilterParams,
    StudentStatus,
} from "../../types";
import SessionContext from "../../contexts/sessionProvider";
import Image from "next/image";
import CheckIconColor from "../../public/images/green_check_mark_color.png";
import CheckIcon from "../../public/images/green_check_mark.png";
import ExclamationIconColor from "../../public/images/exclamation_mark_color.png";
import ExclamationIcon from "../../public/images/exclamation_mark.png";
import ForbiddenIconColor from "../../public/images/forbidden_icon_color.png";
import ForbiddenIcon from "../../public/images/forbidden_icon.png";
import CrossIconColor from "../../public/images/close_icon_red.png";
import CrossIcon from "../../public/images/close_icon.png";
import { NotificationContext } from "../../contexts/notificationProvider";

export const StudentFilter: React.FC<{
    searchManual: (params: StudentFilterParams) => void;
    searchAutomatic: (params: StudentFilterParams) => void;
    display: Display;
}> = ({ searchManual, searchAutomatic, display }) => {
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
        EmailStatus.NONE
    );

    // set dropdowns active / inactive
    const [rolesActive, setRolesActive] = useState<boolean>(false);
    const [emailStatusActive, setEmailStatusActive] = useState<boolean>(false);

    // Roles used in the dropdown
    const [roles, setRoles] = useState<Array<Role>>([]);
    // A set of active roles
    const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set());
    const { notify } = useContext(NotificationContext);

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
            .catch((err) => {
                console.log(err);
            });
        if (responseRoles && responseRoles.data !== undefined) {
            setRoles(responseRoles.data);
        } else if (responseRoles && !responseRoles.success && notify) {
            notify(
                "Something went wrong:" + responseRoles.reason,
                NotificationType.ERROR,
                2000
            );
        }
    };

    // Load roles on page render
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);

        // get all the arguments from the search string
        const nameFilter = urlParams.get("nameFilter");
        const emailFilter = urlParams.get("emailFilter");
        const nameSort = urlParams.get("nameSort");
        const emailSort = urlParams.get("emailSort");
        const alumni = urlParams.get("alumniFilter");
        const studentCoach = urlParams.get("coachFilter");
        const statusFilter = urlParams.get("statusFilter");
        const osocYear = urlParams.get("osocYearStudent");
        const emailStatus = urlParams.get("emailStatusFilter");
        const roleFilter = urlParams.get("roleFilter");

        // parse all the arguments and set the state
        if (nameFilter !== null) {
            setNameFilter(nameFilter);
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
        if (osocYear !== null && new RegExp("[0-9]+").test(osocYear)) {
            setOsocYear(osocYear);
        }
        if (
            emailStatus !== null &&
            Object.values(EmailStatus).includes(emailStatus as EmailStatus)
        ) {
            setEmailStatus(emailStatus as EmailStatus);
        }
        const newRoles = new Set(roleFilter?.split(","));
        setSelectedRoles(newRoles);

        // manually set all the parameters (can't use state yet because setting state is asynchronous)
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
                osocYear && new RegExp("[0-9]+").test(osocYear) ? osocYear : "",
            emailStatus: emailStatus
                ? (emailStatus as EmailStatus)
                : EmailStatus.NONE,
            selectedRoles: newRoles,
        };
        // search
        searchAutomatic(params);

        // execute the fetch roles
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
        searchManual(params);
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
        searchManual(params);
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
        searchManual(params);
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
        searchManual(params);
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
        searchManual(params);
    };

    const toggleFilterNone = async (e: SyntheticEvent) => {
        e.preventDefault();
        let newVal;
        if (statusFilter !== StudentStatus.NONE) {
            newVal = StudentStatus.NONE;
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
        searchManual(params);
    };

    const toggleStatusApplied = async (e: SyntheticEvent) => {
        e.preventDefault();

        let newVal;
        if (emailStatus !== EmailStatus.APPLIED) {
            newVal = EmailStatus.APPLIED;
        } else {
            newVal = EmailStatus.NONE;
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
        searchManual(params);
    };

    const toggleStatusApproved = async (e: SyntheticEvent) => {
        e.preventDefault();

        let newVal;
        if (emailStatus !== EmailStatus.APPROVED) {
            newVal = EmailStatus.APPROVED;
        } else {
            newVal = EmailStatus.NONE;
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
        searchManual(params);
    };

    const toggleStatusAwaiting = async (e: SyntheticEvent) => {
        e.preventDefault();

        let newVal;
        if (emailStatus !== EmailStatus.AWAITING_PROJECT) {
            newVal = EmailStatus.AWAITING_PROJECT;
        } else {
            newVal = EmailStatus.NONE;
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
        searchManual(params);
    };

    const toggleStatusConfirmed = async (e: SyntheticEvent) => {
        e.preventDefault();

        let newVal;
        if (emailStatus !== EmailStatus.CONTRACT_CONFIRMED) {
            newVal = EmailStatus.CONTRACT_CONFIRMED;
        } else {
            newVal = EmailStatus.NONE;
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
        searchManual(params);
    };

    const toggleStatusDeclined = async (e: SyntheticEvent) => {
        e.preventDefault();

        let newVal;
        if (emailStatus !== EmailStatus.CONTRACT_DECLINED) {
            newVal = EmailStatus.CONTRACT_DECLINED;
        } else {
            newVal = EmailStatus.NONE;
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
        searchManual(params);
    };

    const toggleStatusRejected = async (e: SyntheticEvent) => {
        e.preventDefault();

        let newVal;
        if (emailStatus !== EmailStatus.REJECTED) {
            newVal = EmailStatus.REJECTED;
        } else {
            newVal = EmailStatus.NONE;
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
        searchManual(params);
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
        searchManual(params);
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
        searchManual(params);
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
            studentCoach: studentCoach,
            statusFilter: statusFilter,
            osocYear: osocYear,
            emailStatus: emailStatus,
            selectedRoles: newRoles,
        };
        searchManual(params);
    };

    const searchPress = (e: SyntheticEvent) => {
        e.preventDefault();
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
        searchManual(params);
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
                        className={`input ${styles.input}`}
                        type="text"
                        value={nameFilter}
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
                        value={emailFilter}
                        placeholder="Search.."
                        onChange={(e) => setEmailFilter(e.target.value)}
                    />
                </div>

                <div className={styles.query}>
                    Osoc Edition
                    {/* Maybe dropdown */}
                    <input
                        data-testid={"osocYearInput"}
                        className={`input ${styles.input}`}
                        type="text"
                        value={osocYear}
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

                <div
                    className={`dropdown is-right ${
                        rolesActive ? "is-active" : "is-hoverable"
                    }`}
                >
                    <div
                        onClick={() => setRolesActive((prev) => !prev)}
                        data-testid={"rolesSelectedFilterDisplay"}
                        className={`dropdown-trigger ${
                            selectedRoles.size === 0 && !rolesActive
                                ? styles.inactive
                                : styles.active
                        }`}
                    >
                        {selectedRoles.size > 0
                            ? selectedRoles.size === 1
                                ? `${selectedRoles.size} role selected`
                                : `${selectedRoles.size} roles selected`
                            : "No role selected"}
                        <div className={styles.triangleContainer}>
                            <div className={styles.triangle} />
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
                    className={`dropdown is-right ${
                        emailStatusActive ? "is-active" : "is-hoverable"
                    }`}
                >
                    <div
                        data-testid={"statusFilterDisplay"}
                        className={`dropdown-trigger ${
                            emailStatusActive ||
                            emailStatus !== EmailStatus.NONE
                                ? styles.active
                                : styles.inactive
                        } ${styles.dropdownTrigger}`}
                        onClick={() => setEmailStatusActive(!emailStatusActive)}
                    >
                        {emailStatus === EmailStatus.NONE
                            ? "No status selected"
                            : emailStatus}
                        <div className={styles.triangleContainer}>
                            <div className={styles.triangle} />
                        </div>
                    </div>
                    <div className="dropdown-menu">
                        <div className="dropdown-content">
                            <div
                                data-testid={"statusApplied"}
                                className={`${
                                    styles.dropdownItem
                                } dropdown-item 
                            ${
                                emailStatus === EmailStatus.APPLIED
                                    ? styles.selected
                                    : ""
                            }`}
                                onClick={toggleStatusApplied}
                            >
                                {EmailStatus.APPLIED}
                            </div>
                            <div
                                data-testid={"statusApproved"}
                                className={`${
                                    styles.dropdownItem
                                } dropdown-item 
                            ${
                                emailStatus === EmailStatus.APPROVED
                                    ? styles.selected
                                    : ""
                            }`}
                                onClick={toggleStatusApproved}
                            >
                                {EmailStatus.APPROVED}
                            </div>
                            <div
                                data-testid={"statusAwaiting"}
                                className={`${
                                    styles.dropdownItem
                                } dropdown-item 
                            ${
                                emailStatus === EmailStatus.AWAITING_PROJECT
                                    ? styles.selected
                                    : ""
                            }`}
                                onClick={toggleStatusAwaiting}
                            >
                                {EmailStatus.AWAITING_PROJECT}
                            </div>
                            <div
                                data-testid={"statusConfirmed"}
                                className={`${
                                    styles.dropdownItem
                                } dropdown-item 
                            ${
                                emailStatus === EmailStatus.CONTRACT_CONFIRMED
                                    ? styles.selected
                                    : ""
                            }`}
                                onClick={toggleStatusConfirmed}
                            >
                                {EmailStatus.CONTRACT_CONFIRMED}
                            </div>
                            <div
                                data-testid={"statusDeclined"}
                                className={`${
                                    styles.dropdownItem
                                } dropdown-item 
                            ${
                                emailStatus === EmailStatus.CONTRACT_DECLINED
                                    ? styles.selected
                                    : ""
                            }`}
                                onClick={toggleStatusDeclined}
                            >
                                {EmailStatus.CONTRACT_DECLINED}
                            </div>
                            <div
                                data-testid={"statusRejected"}
                                className={`${
                                    styles.dropdownItem
                                } dropdown-item 
                            ${
                                emailStatus === EmailStatus.REJECTED
                                    ? styles.selected
                                    : ""
                            }`}
                                onClick={toggleStatusRejected}
                            >
                                {EmailStatus.REJECTED}
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
                            alt="YesDecision"
                            width={30}
                            height={30}
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
                            alt="MaybeDecision"
                            width={30}
                            height={30}
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
                            alt="NoDecision"
                            width={30}
                            height={30}
                            onClick={toggleFilterNo}
                        />
                        <p>NO</p>
                    </div>

                    <div className={styles.buttonContainer}>
                        <Image
                            className={styles.buttonImage}
                            src={
                                statusFilter === StudentStatus.NONE
                                    ? CrossIconColor
                                    : CrossIcon
                            }
                            alt="NoneDecision"
                            width={30}
                            height={30}
                            onClick={toggleFilterNone}
                        />
                        <p>NONE</p>
                    </div>
                </div>

                <button data-testid={"searchButton"} onClick={searchPress}>
                    Search
                </button>
            </div>
        </div>
    );
};
