import { NextPage } from "next";
import React, { useEffect, useState } from "react";
import { StudentCard } from "../../components/StudentCard/StudentCard";
import { Display, Evaluation, Student } from "../../types";
import styles from "../../styles/students.module.scss";
import { StudentOverview } from "../../components/StudentOverview/StudentOverview";
import { EvaluationBar } from "../../components/StudentCard/EvaluationBar";
import { StudentFilter } from "../../components/Filter/StudentFilter/StudentFilter";

const Index: NextPage = () => {
    const [students, setStudents] = useState<Student[]>([]);
    // the index of the selected student if the given id matches with one of the fetched students
    const [selectedStudent, setSelectedStudent] = useState<number>(-1);
    const [display, setDisplay] = useState<Display>(Display.FULL);

    /**
     * Updates the list of students and sets the selected student index
     * @param filteredStudents
     */
    const setFilteredStudents = (filteredStudents: Array<Student>) => {
        setSelectedStudent(selectedStudent);
        setStudents([...filteredStudents]);
        console.log(filteredStudents);
        if (selectedStudent < 0) {
            setDisplay(Display.FULL);
        } else {
            setDisplay(Display.LIMITED);
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
    }, []);

    /**
     * Closes the student overview if escape is pressed
     * @param e
     */
    const handleKeyPress = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
            setDisplay(Display.FULL);
            setSelectedStudent(-1);
        }
    };

    /**
     * Clears the current selection
     */
    const clearSelection = () => {
        setDisplay(Display.FULL);
        setSelectedStudent(-1);
    };

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
    };

    // Maps student id's to their index in the student list, so that we can update the infor
    // of just one student
    const id_to_index: Record<string, number> = {};

    /**
     * Callback that the student overview uses to update a student's suggestion list
     * @param studentId
     * @param evalutationsCoach
     */
    const updateStudentEvaluation = (
        studentId: number,
        evalutationsCoach: Evaluation[]
    ) => {
        console.log(studentId);
        console.log(evalutationsCoach);
        if (selectedStudent !== -1) {
            students[selectedStudent].evaluation.evaluations =
                evalutationsCoach;
        }
        setStudents([...students]);
        // TODO
    };

    return (
        <div>
            <div
                className={`${styles.students} ${
                    display === Display.LIMITED ? styles.limited : ""
                }`}
            >
                <div>
                    <StudentFilter
                        display={display}
                        setFilteredStudents={setFilteredStudents}
                    />
                    <div className={styles.scrollView}>
                        <div className={styles.topShadowCaster} />
                        <div
                            className={`${styles.studentCards} ${
                                display === Display.LIMITED
                                    ? styles.limited
                                    : ""
                            }`}
                        >
                            {students.map((student, index) => {
                                const id = student.student.student_id;
                                id_to_index[id] = index;
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
                                        {student.evaluation.evaluations.length >
                                        0 ? (
                                            <EvaluationBar
                                                evaluations={
                                                    student.evaluation
                                                        .evaluations
                                                }
                                            />
                                        ) : null}
                                    </div>
                                );
                            })}
                        </div>
                        <div className={styles.bottomShadowCaster} />
                    </div>
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
        </div>
    );
};

export default Index;
