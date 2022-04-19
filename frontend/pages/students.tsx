import { NextPage } from "next";
import SessionContext from "../contexts/sessionProvider";
import { useContext, useEffect, useState } from "react";
import { StudentCard } from "../components/StudentCard/StudentCard";
import { StudentFilter } from "../components/Filter/StudentFilter/StudentFilter";
import { Role } from "../types/types";
import { Student } from "../types/types";
import styles from "../styles/students.module.scss";

const Students: NextPage = () => {
    const { getSessionKey, setSessionKey } = useContext(SessionContext);
    const [students, setStudents] = useState<Student[]>([]);
    const [roles, setRoles] = useState<Array<Role>>([]);

    const fetchStudentsAndRoles = async () => {
        let sessionKey =
            getSessionKey != undefined ? await getSessionKey() : "";
        const responseStudents = await fetch(
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
        console.log(responseStudents);
        if (responseStudents.success) {
            sessionKey = responseStudents.sessionkey;
            setStudents(responseStudents.data);
        }
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
                    //TODO popup van dat het is gefaald.
                    return { success: false };
                } else return json;
            })
            .catch((err) => {
                console.log(err);
                //TODO popup van dat het is gefaald.
                return { success: false };
            });
        if (setSessionKey) {
            setSessionKey(responseRoles.sessionkey);
        }
        setRoles(responseRoles.data);
    };

    useEffect(() => {
        fetchStudentsAndRoles().then();
        // We do not want to reload the data when the data changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const setFilteredStudents = (filteredStudents: Array<Student>) => {
        setStudents([...filteredStudents]);
    };

    return (
        <div className={styles.students}>
            <StudentFilter
                roles={roles}
                setFilteredStudents={setFilteredStudents}
            />
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
