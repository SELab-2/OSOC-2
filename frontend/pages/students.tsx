import { NextPage } from "next";
import SessionContext from "../contexts/sessionProvider";
import { useContext, useEffect, useState } from "react";
import { StudentCard } from "../components/StudentCard/StudentCard";
import { Student } from "../types/types";
import styles from "../styles/students.module.scss";
import { useSockets } from "../contexts/socketProvider";

const Students: NextPage = () => {
    const { getSessionKey, setSessionKey } = useContext(SessionContext);
    const [students, setStudents] = useState<Student[]>([]);
    const { socket } = useSockets();

    const fetchStudents = async () => {
        if (getSessionKey !== undefined) {
            getSessionKey().then(async (sessionKey) => {
                if (sessionKey !== "") {
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
                        if (setSessionKey) {
                            setSessionKey(response.sessionkey);
                        }
                        setStudents(response.data);
                    }
                }
            });
        }
    };

    useEffect(() => {
        fetchStudents().then();
        return () => {
            socket.off("formAdded");
        }; // disconnect from the socket on dismount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        socket.on("formAdded", () => {
            fetchStudents().then();
        });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socket]);

    return (
        <div className={styles.students}>
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
