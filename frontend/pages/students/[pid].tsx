import { NextPage } from "next";
import { useRouter } from "next/router";
import SessionContext from "../../contexts/sessionProvider";
import { useContext, useEffect, useState } from "react";
import { Student } from "../../types";
import { StudentOverview } from "../../components/StudentOverview/StudentOverview";
import styles from "../../components/StudentOverview/StudentOverview.module.scss";
import { useSockets } from "../../contexts/socketProvider";

const Pid: NextPage = () => {
    const router = useRouter();
    const { getSession } = useContext(SessionContext);
    const [student, setStudent] = useState<Student>();
    const { pid, year } = router.query; // pid is the student id
    const { socket } = useSockets();

    /**
     * remove listeners on dismount
     */
    useEffect(() => {
        return () => {
            socket.off("studentSuggestionCreated");
        };
    }, []);

    /**
     * update on websocket event if the student with the id that was changed is the student that is currently loaded
     */
    useEffect(() => {
        socket.off("studentSuggestionCreated");
        socket.on("studentSuggestionCreated", (studentId: number) => {
            if (studentId === student?.student.student_id) {
                console.log("received");
                const scrollPosition = window.scrollY;
                fetchStudent().then(() => window.scrollTo(0, scrollPosition));
            }
        });
    }, [student, socket]);

    const fetchStudent = async () => {
        if (getSession !== undefined && pid !== undefined) {
            getSession().then(async ({ sessionKey }) => {
                if (sessionKey !== "") {
                    const query = year === undefined ? "" : "?year=" + year;
                    const response = await fetch(
                        `${process.env.NEXT_PUBLIC_API_URL}/student/${pid}` +
                            query,
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
                        setStudent(response);
                    }
                }
            });
        }
    };

    useEffect(() => {
        fetchStudent().then();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router.query]);

    return (
        <div className={styles.studentPage}>
            {student !== undefined ? (
                <StudentOverview
                    student={student}
                    year={
                        typeof year === "string"
                            ? year
                            : year
                            ? year[0]
                            : undefined
                    }
                />
            ) : null}
        </div>
    );
};

export default Pid;
