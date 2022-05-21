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
import { useSockets } from "../../contexts/socketProvider";
import { NotificationContext } from "../../contexts/notificationProvider";

/**
 * Constructs the complete students page with filter included
 * @param alwaysLimited Whether or not the page should always be shown limited
 * @param dragDisabled Whether or not the components are draggable
 * for in the projects panel for example
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
    const { socket } = useSockets();
    const { notify } = useContext(NotificationContext);

    /**
     * Updates the list of students and sets the selected student index
     * @param filteredStudents
     */
    const setFilteredStudents = (filteredStudents: Array<Student>) => {
        let index = -1;
        const searchParams = new URLSearchParams(window.location.search);
        const id = searchParams.get("id");
        if (selectedStudent === -1 || id) {
            if (id !== null) {
                const id_number = Number(id);
                if (!isNaN(id_number)) {
                    for (let i = 0; i < filteredStudents.length; i++) {
                        if (
                            filteredStudents[i].student.student_id === id_number
                        ) {
                            setSelectedStudent(i);
                            index = i;
                        }
                    }
                }
            }
        }
        setStudents([...filteredStudents]);
        if (!alwaysLimited) {
            if (index < 0) {
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
            socket.off("studentSuggestionCreated");
            socket.off("studentWasDeleted");
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /**
     * update on websocket event if the student with the id that was changed is the student that is currently loaded
     */
    useEffect(() => {
        // delete old listeners
        socket.off("studentSuggestionCreated");
        socket.off("studentWasDeleted");

        // add new listeners
        socket.on("studentSuggestionCreated", (studentId: number) => {
            if (params !== undefined) {
                for (const student of students) {
                    if (student.student.student_id === studentId) {
                        filterAutomatic(params).then();
                        break;
                    }
                }
            }
        });

        socket.on("studentWasDeleted", () => {
            if (params !== undefined) {
                filterAutomatic(params).then();
            }
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socket, params, pagination]);

    /**
     * Closes the student overview if escape is pressed
     * @param e
     */
    const handleKeyPress = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
            clearSelection().then();
        }
    };

    /**
     * Clears the current selection
     */
    const clearSelection = async () => {
        if (!alwaysLimited) {
            setDisplay(Display.FULL);
        }
        setSelectedStudent(-1);
        // delete the id from the url
        const params = new URLSearchParams(window.location.search);
        params.delete("id");
        // push the url
        return await router.push(
            `${window.location.pathname}?${params.toString()}`
        );
    };

    /**
     * Called when the current selected student is deleted
     */
    const studentDeleted = () => {
        clearSelection().then(() => {
            if (params !== undefined) {
                search(params, pagination.page).then();
            }
        });
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
            let url = `/students/${student_id}`;
            if (params?.osocYear) {
                url += `?year=${params?.osocYear}`;
            }
            window.open(url);
            return;
        }
        if (!alwaysLimited) {
            // on the students page
            if (e.ctrlKey || e.altKey || e.button == 1) {
                let url = `/students/${student_id}`;
                if (params?.osocYear) {
                    url += `?year=${params?.osocYear}`;
                }
                window.open(url);
                return;
            }
            // set the new id
            const paramsQuery = new URLSearchParams(window.location.search);
            paramsQuery.set("id", student_id.toString());
            if (params?.osocYear) {
                paramsQuery.set("year", params?.osocYear);
            }
            // push the url
            router.push(`/students?${paramsQuery.toString()}`).then();
            setDisplay(Display.LIMITED);
            setSelectedStudent(index);
        }
    };

    // Maps student id's to their index in the student list, so that we can update the info
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
     * @param evaluationsCoach
     */
    const updateStudentEvaluation = (
        studentId: number,
        evaluationsCoach: Evaluation[]
    ) => {
        if (selectedStudent !== -1) {
            students[selectedStudent].evaluation.evaluations = evaluationsCoach;
        }
        setStudents([...students]);
    };

    /**
     * Called by the studentfilter to filter when a button is (manually) pressed => set page back to 0
     * @param params
     */
    const filterManual = async (params: StudentFilterParams) => {
        setParams(params);
        clearSelection().then();
        setSelectedStudent(-1);
        search(params, 0).then();
    };

    /**
     * Called by the studentfilter to filter when a websocket event is received. We need to keep track of the current page!
     * @param params
     */
    const filterAutomatic = async (params: StudentFilterParams) => {
        setParams(params);
        // get the current page
        const currentPageStr = new URLSearchParams(window.location.search).get(
            "currentPageStudent"
        );
        const currentPageInt =
            currentPageStr !== null && new RegExp("d+").test(currentPageStr) // check if the argument only exists out of numbers
                ? Number(currentPageStr)
                : 0;
        setPagination({
            page: currentPageInt,
            count: 0, //TODO: what value should this be? I thought this would have to be currentPageInt * pageSize + 1
        });
        search(params, currentPageInt).then();
    };

    /**
     * Search function with pagination
     * @param params
     * @param page
     */
    const search = async (params: StudentFilterParams, page: number) => {
        if (loading) return;

        const scrollPosition = window.scrollY;

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
        const id = new URLSearchParams(window.location.search).get("id");
        // in the frontend we also keep the id of the selected student overview. This way overview stays open.
        const newSearchParams = new URLSearchParams(query);
        if (id !== null) {
            newSearchParams.set("id", id);
        }
        // set the page filter unique for the student to keep track of it in the frontend
        newSearchParams.delete("currentPage");
        newSearchParams.delete("pageSize");
        newSearchParams.set("currentPageStudent", page.toString());
        newSearchParams.set("pageSizeStudent", pageSize.toString());

        // we have to change the parameter name of osocYear to osocYear student to prevent conflicts with the selected year in the projects screen for projects
        const setYear = newSearchParams.get("osocYear");
        if (setYear !== null) {
            newSearchParams.set("osocYearStudent", setYear);
        }

        // get the current active search parameters, we'll update this value
        const updatedSearchParams = new URLSearchParams(window.location.search);
        // overwrite the values that are present in the new and old parameters
        newSearchParams.forEach((value, key) => {
            updatedSearchParams.set(key, value);
        });

        const studentFilterKeys = new Set([
            "nameFilter",
            "emailFilter",
            "nameSort",
            "emailSort",
            "alumniFilter",
            "coachFilter",
            "statusFilter",
            "osocYearStudent",
            "emailStatusFilter",
            "roleFilter",
        ]);

        // delete the values that are not present anymore in the new filter
        updatedSearchParams.forEach((_, key) => {
            if (!newSearchParams.has(key) && studentFilterKeys.has(key)) {
                updatedSearchParams.delete(key);
            }
        });

        router
            .push(
                `${window.location.pathname}?${updatedSearchParams.toString()}`
            )
            .then(() => window.scrollTo(0, scrollPosition));
    };

    return (
        <div
            className={`${styles.students} ${
                display === Display.LIMITED ? styles.limited : ""
            }`}
        >
            <div>
                <StudentFilter
                    display={display}
                    searchManual={filterManual}
                    searchAutomatic={filterAutomatic}
                />
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
                    year={params?.osocYear}
                    clearSelection={clearSelection}
                    studentDeleted={studentDeleted}
                />
            ) : null}
        </div>
    );
};
