import React, { useContext, useEffect, useState } from "react";
import styles from "./Students.module.scss";
import {
    Display,
    EmailStatus,
    Evaluation,
    Sort,
    Student,
    StudentFilterParams,
    StudentStatus,
    Pagination,
    NotificationType,
} from "../../types";
import { StudentFilter } from "../Filters/StudentFilter";
import { StudentCard } from "../StudentCard/StudentCard";
import { EvaluationBar } from "../StudentCard/EvaluationBar";
import { StudentOverview } from "../StudentOverview/StudentOverview";
import scrollStyles from "../ScrollView.module.scss";
import SessionContext from "../../contexts/sessionProvider";
import { Paginator } from "../Paginator/Paginator";
import { useRouter } from "next/router";
import { NotificationContext } from "../../contexts/notificationProvider";

/**
 * Constructs the complete students page with filter included
 * @param alwaysLimited Whether or not the page should always be shown limited
 * @param dragDisabled Whether or not the components are draggable
 * for in the projects panel for example
 * @param updateParentStudents
 * @constructor
 */
export const Students: React.FC<{
    alwaysLimited: boolean;
    dragDisabled: boolean;
}> = ({ alwaysLimited = false }) => {
    const router = useRouter();
    const { getSession } = useContext(SessionContext);
    const [students, setStudents] = useState<Student[]>([]);
    // the index of the selected student if the given id matches with one of the fetched students
    const [selectedStudent, setSelectedStudent] = useState<number>(-1);
    const [display, setDisplay] = useState<Display>(
        alwaysLimited ? Display.LIMITED : Display.FULL
    );
    const [params, setParams] = useState<StudentFilterParams>();
    const [pagination, setPagination] = useState<Pagination>({
        page: 0,
        count: 0,
    });
    // 10 students per page
    const pageSize = 10;
    const [loading, isLoading] = useState(false);
    const { notify } = useContext(NotificationContext);

    /**
     * Updates the list of students and sets the selected student index
     * @param filteredStudents
     */
    const setFilteredStudents = (filteredStudents: Array<Student>) => {
        setSelectedStudent(selectedStudent);
        setStudents(filteredStudents);
        if (!alwaysLimited) {
            if (selectedStudent < 0) {
                setDisplay(Display.FULL);
            } else {
                setDisplay(Display.LIMITED);
            }
        }
    };

    /**
     * We add a listener for keypresses
     */
    useEffect(() => {
        document.body.addEventListener("keydown", handleKeyPress);
        return () => {
            document.body.removeEventListener("keydown", handleKeyPress);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /**
     * Closes the student overview if escape is pressed
     * @param e
     */
    const handleKeyPress = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
            clearSelection();
        }
        router.push(`/students`).then();
    };

    /**
     * Clears the current selection
     */
    const clearSelection = () => {
        if (!alwaysLimited) {
            setDisplay(Display.FULL);
        }
        setSelectedStudent(-1);
        router.push(`/students`).then();
    };

    /**
     * Handles clicking on a student
     * Ctrl + Click or Alt + Click should open the student on a separate page /students/:id
     * A normal click will upon on the same page and set the query parameter to /students?id=[id]
     * @param e
     * @param student_id
     * @param index
     */
    const clickStudent = (
        e: React.MouseEvent<HTMLDivElement>,
        student_id: number,
        index: number
    ) => {
        e.preventDefault();

        if (e.ctrlKey || e.altKey || e.button == 1) {
            window.open(`/students/${student_id}`);
            return;
        }
        router.push(`/students?id=${student_id}`).then();
        setDisplay(Display.LIMITED);
        setSelectedStudent(index);
    };

    // Maps student id's to their index in the student list, so that we can update the infor
    // of just one student
    const id_to_index: Record<string, number> = {};

    const navigator = (page: number) => {
        if (params !== undefined) {
            search(params, page).then();
        }
    };

    /**
     * Callback that the student overview uses to update a student's suggestion list
     * @param studentId
     * @param evalutationsCoach
     */
    const updateStudentEvaluation = (
        studentId: number,
        evalutationsCoach: Evaluation[]
    ) => {
        if (selectedStudent !== -1) {
            students[selectedStudent].evaluation.evaluations =
                evalutationsCoach;
        }
        setStudents([...students]);
    };

    /**
     * Called by the studentfilter to filter
     * @param params
     */
    const filter = async (params: StudentFilterParams) => {
        setParams(params);
        search(params, 0).then();
    };

    /**
     * Search function with pagination
     * @param params
     * @param page
     */
    const search = async (params: StudentFilterParams, page: number) => {
        if (loading) return;
        isLoading(true);
        const filters = [];

        if (params.nameFilter !== "") {
            filters.push(`nameFilter=${params.nameFilter}`);
        }
        if (params.nameSort !== Sort.NONE) {
            filters.push(`nameSort=${params.nameSort}`);
        }
        if (params.emailFilter !== "") {
            filters.push(`emailFilter=${params.emailFilter}`);
        }
        if (params.emailSort !== Sort.NONE) {
            filters.push(`emailSort=${params.emailSort}`);
        }
        if (params.alumni) {
            filters.push(`alumniFilter=${params.alumni}`);
        }
        if (params.studentCoach) {
            filters.push(`coachFilter=${params.studentCoach}`);
        }
        if (params.osocYear !== "") {
            filters.push(`osocYear=${params.osocYear}`);
        }
        if (params.selectedRoles.size !== 0) {
            filters.push(
                `roleFilter=${Array.from(
                    params.selectedRoles.values()
                ).toString()}`
            );
        }
        if (params.statusFilter !== StudentStatus.EMPTY) {
            filters.push(`statusFilter=${params.statusFilter}`);
        }
        if (params.emailStatus !== EmailStatus.NONE) {
            filters.push(`emailStatusFilter=${params.emailStatus}`);
        }

        filters.push(`currentPage=${page}`);
        filters.push(`pageSize=${pageSize}`);

        const query = filters.length > 0 ? `?${filters.join("&")}` : "";

        const { sessionKey } = getSession
            ? await getSession()
            : { sessionKey: "" };
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
            .catch((err) => {
                console.log(err);
            });
        if (
            response &&
            response.success &&
            response.data &&
            response.pagination
        ) {
            setFilteredStudents(response.data);
            setPagination(response.pagination);
        } else if (response && !response.success && notify) {
            notify(
                "Something went wrong:" + response.reason,
                NotificationType.ERROR,
                2000
            );
        }
        isLoading(false);
    };

    return (
        <div
            className={`${styles.students} ${
                display === Display.LIMITED ? styles.limited : ""
            }`}
        >
            <div>
                <StudentFilter display={display} search={filter} />
                <div className={scrollStyles.scrollView}>
                    <div className={scrollStyles.topShadowCaster} />
                    <div
                        className={`${styles.studentCards} ${
                            display === Display.LIMITED ? styles.limited : ""
                        }`}
                    >
                        {students.map((student, index) => {
                            const id = student.student.student_id;
                            id_to_index[id] = index;
                            return (
                                <div
                                    key={id}
                                    className={styles.card}
                                    onClick={(e) =>
                                        clickStudent(
                                            e,
                                            student.student.student_id,
                                            index
                                        )
                                    }
                                >
                                    <StudentCard
                                        student={student as Student}
                                        display={display}
                                    />
                                    {student.evaluation.evaluations.filter(
                                        (evaluation) => !evaluation.is_final
                                    ).length > 0 ? (
                                        <EvaluationBar
                                            evaluations={
                                                student.evaluation.evaluations
                                            }
                                        />
                                    ) : null}
                                </div>
                            );
                        })}
                    </div>
                    <div className={scrollStyles.bottomShadowCaster} />
                </div>
                <Paginator
                    pageSize={pageSize}
                    pagination={pagination}
                    navigator={navigator}
                />
            </div>
            {selectedStudent !== -1 &&
            students[selectedStudent] !== undefined ? (
                <StudentOverview
                    updateEvaluations={updateStudentEvaluation}
                    student={students[selectedStudent]}
                    clearSelection={clearSelection}
                />
            ) : null}
        </div>
    );
};
