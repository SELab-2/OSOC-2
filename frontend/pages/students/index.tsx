import { NextPage } from "next";
import React, { useState } from "react";
import { StudentCard } from "../../components/StudentCard/StudentCard";
import { Display, EvaluationCoach, Student } from "../../types";
import styles from "../../styles/students.module.scss";
import { useRouter } from "next/router";
import { StudentOverview } from "../../components/StudentOverview/StudentOverview";
import { EvaluationBar } from "../../components/StudentCard/EvaluationBar";
import { StudentFilter } from "../../components/Filter/StudentFilter/StudentFilter";

const Index: NextPage = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const router = useRouter();
    // the index of the selected student if the given id matches with one of the fetched students
    const [selectedStudent, setSelectedStudent] = useState<number>(-1);
    const [display, setDisplay] = useState<Display>(Display.FULL);

    /**
     * Updates the list of students and sets the selected student
     * @param filteredStudents
     * @param selectedStudent
     */
    const setFilteredStudents = (
        filteredStudents: Array<Student>,
        selectedStudent: number
    ) => {
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
        evalutationsCoach: EvaluationCoach[]
    ) => {
        console.log(studentId);
        console.log(evalutationsCoach);
        // TODO
    };

    return (
        <div>
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
                    <StudentFilter
                        display={display}
                        setFilteredStudents={setFilteredStudents}
                    />
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
                {selectedStudent !== -1 &&
                students[selectedStudent] !== undefined ? (
                    <StudentOverview
                        updateEvaluations={updateStudentEvaluation}
                        student={students[selectedStudent]}
                    />
                ) : null}
            </div>
        </div>
    );
};

export default Index;
