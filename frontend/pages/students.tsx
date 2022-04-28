import { NextPage } from "next";
import { useState } from "react";
import { StudentCard } from "../components/StudentCard/StudentCard";
import { StudentFilter } from "../components/Filter/StudentFilter/StudentFilter";
import { Student } from "../types";
import styles from "../styles/students.module.scss";

const Students: NextPage = () => {
    const [students, setStudents] = useState<Student[]>([]);

    const setFilteredStudents = (filteredStudents: Array<Student>) => {
        setStudents([...filteredStudents]);
    };

    return (
        <div className={styles.students}>
            <StudentFilter setFilteredStudents={setFilteredStudents} />
            {students.map((student) => {
                return (
                    <StudentCard
                        key={student.student.student_id}
                        student={student as Student}
                    />
                );
            })}
        </div>
    );
};

export default Students;
