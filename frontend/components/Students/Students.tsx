import React, { useEffect, useState } from "react";
import styles from "./Students.module.scss";
import { Display, Evaluation, Student } from "../../types";
import { StudentFilter } from "../Filter/StudentFilter/StudentFilter";
import { StudentCard } from "../StudentCard/StudentCard";
import { EvaluationBar } from "../StudentCard/EvaluationBar";
import { StudentOverview } from "../StudentOverview/StudentOverview";
import { Draggable, Droppable } from "react-beautiful-dnd";

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
}> = ({ alwaysLimited = false, dragDisabled }) => {
    const [students, setStudents] = useState<Student[]>([]);
    // the index of the selected student if the given id matches with one of the fetched students
    const [selectedStudent, setSelectedStudent] = useState<number>(-1);
    const [display, setDisplay] = useState<Display>(
        alwaysLimited ? Display.LIMITED : Display.FULL
    );

    /**
     * Updates the list of students and sets the selected student index
     * @param filteredStudents
     */
    const setFilteredStudents = (filteredStudents: Array<Student>) => {
        setSelectedStudent(selectedStudent);
        setStudents([...filteredStudents]);
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
    };

    /**
     * Clears the current selection
     */
    const clearSelection = () => {
        if (!alwaysLimited) {
            setDisplay(Display.FULL);
        }
        setSelectedStudent(-1);
    };

    /**
     * Handles clicking on a student
     * Ctrl + Click or Alt + Click should open the student on a seperate page /students/:id
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
        if (selectedStudent !== -1) {
            students[selectedStudent].evaluation.evaluations =
                evalutationsCoach;
        }
        setStudents([...students]);
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
                    setFilteredStudents={setFilteredStudents}
                />
                <div className={styles.scrollView}>
                    <div className={styles.topShadowCaster} />
                    <div
                        className={`${styles.studentCards} ${
                            display === Display.LIMITED ? styles.limited : ""
                        }`}
                    >
                        <Droppable droppableId={"students"}>
                            {(provided) => (
                                <div ref={provided.innerRef}>
                                    {students.map((student, index) => {
                                        const id = student.student.student_id;
                                        id_to_index[id] = index;
                                        return (
                                            <Draggable
                                                key={"student:" + id.toString()}
                                                draggableId={
                                                    "student:" + id.toString()
                                                }
                                                index={index}
                                                isDragDisabled={dragDisabled}
                                            >
                                                {(provided) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className={styles.card}
                                                        onClick={(e) =>
                                                            clickStudent(
                                                                e,
                                                                student.student
                                                                    .student_id,
                                                                index
                                                            )
                                                        }
                                                    >
                                                        <StudentCard
                                                            student={
                                                                student as Student
                                                            }
                                                            display={display}
                                                        />
                                                        {student.evaluation.evaluations.filter(
                                                            (evaluation) =>
                                                                !evaluation.is_final
                                                        ).length > 0 ? (
                                                            <EvaluationBar
                                                                evaluations={
                                                                    student
                                                                        .evaluation
                                                                        .evaluations
                                                                }
                                                            />
                                                        ) : null}
                                                    </div>
                                                )}
                                            </Draggable>
                                        );
                                    })}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
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
    );
};
