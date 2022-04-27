import { NextPage } from "next";
import SessionContext from "../../contexts/sessionProvider";
import React, { useContext, useEffect, useState } from "react";
import { StudentCard } from "../../components/StudentCard/StudentCard";
import { Display, Student } from "../../types";
import styles from "../../styles/students.module.scss";
import { useRouter } from "next/router";
import { StudentOverview } from "../../components/StudentOverview/StudentOverview";
import { EvaluationBar } from "../../components/StudentCard/EvaluationBar";
import { StudentFilter } from "../../components/Filter/StudentFilter/StudentFilter";

const Index: NextPage = () => {
    const { getSessionKey } = useContext(SessionContext);
    const [students, setStudents] = useState<Student[]>([]);
    const router = useRouter();
    // the index of the selected student if the given id matches with one of the fetched students
    const [selectedStudent, setSelectedStudent] = useState<number>(-1);
    const [display, setDisplay] = useState<Display>(Display.FULL);

    /**
     * Fetches the student and selects a student if the query parameter is set
     * @param id
     */
    const fetchStudents = async (id: number) => {
        if (getSessionKey !== undefined) {
            getSessionKey().then(async (sessionKey) => {
                if (sessionKey != "" && id > -2) {
                    const response = await fetch(
                        `${process.env.NEXT_PUBLIC_API_URL}/student/all`,
                        {
                            method: "GET",
                            headers: {
                                Authorization: `auth/osoc2 ${sessionKey}`,
                            },
                        }
                    )
                        .then((response) => response.json())
                        .catch((error) => console.log(error));
                    if (response !== undefined && response.success) {
                        setStudents(response.data);

                        // A specific student was selected
                        if (id > -1) {
                            for (let i = 0; i < response.data.length; i++) {
                                if (
                                    id === response.data[i].student.student_id
                                ) {
                                    setSelectedStudent(i);
                                }
                            }
                        }
                    }
                }
            });
        }
    };

    const setFilteredStudents = (filteredStudents: Array<Student>) => {
        setStudents([...filteredStudents]);
        console.log([...filteredStudents]);
        console.log(students);
    };

    useEffect(() => {
        // We perform some magic here, because on first render the query parameters are always undefined
        // https://github.com/vercel/next.js/discussions/11484#discussioncomment-60563
        const queryKey = "id";
        let queryValue = Number(
            router.query[queryKey] ||
                router.asPath.match(new RegExp(`[&?]${queryKey}=(.*)(&|$)`))
        );
        if (queryValue === undefined || queryValue === 0) {
            queryValue = -1;
            setDisplay(Display.FULL);
            setSelectedStudent(-1);
        } else {
            setDisplay(Display.LIMITED);
        }
        fetchStudents(queryValue).then();

        // We do not want to reload the data when the data changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /**
     * Handles clicking on a student
     * Ctrl + Click or Alt + Click should upon the student on a seperate page /students/:id
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
        setDisplay(Display.LIMITED);
        setSelectedStudent(index);
        router.push(`/students?id=${student_id}`).then();
    };

    return (
        <div className={styles.student}>
            <StudentFilter setFilteredStudents={setFilteredStudents} />
            <div
                className={`${styles.students} ${
                    display === Display.LIMITED ? styles.limited : ""
                }`}
            >
                <div
                    className={`${styles.studentCards} ${
                        display === Display.LIMITED ? styles.limited : ""
                    }`}
                >
                    {students.map((student, index) => {
                        return (
                            <div
                                key={student.student.student_id}
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
                                {student.evaluations[0].evaluation.length >
                                0 ? (
                                    <EvaluationBar
                                        evaluations={
                                            student.evaluations[0].evaluation
                                        }
                                    />
                                ) : null}
                            </div>
                        );
                    })}
                </div>
                {selectedStudent !== -1 ? (
                    <StudentOverview student={students[selectedStudent]} />
                ) : null}
            </div>
        </div>
    );
};

export default Index;
