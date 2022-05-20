import { NextPage } from "next";
import { useRouter } from "next/router";
import SessionContext from "../../contexts/sessionProvider";
import { useContext, useEffect, useState } from "react";
import { NotificationType, Student } from "../../types";
import { StudentOverview } from "../../components/StudentOverview/StudentOverview";
import styles from "../../components/StudentOverview/StudentOverview.module.scss";
import { NotificationContext } from "../../contexts/notificationProvider";

const Pid: NextPage = () => {
    const router = useRouter();
    const { getSession } = useContext(SessionContext);
    const [student, setStudent] = useState<Student>();
    const { pid } = router.query; // pid is the student id
    const { notify } = useContext(NotificationContext);

    const fetchStudent = async () => {
        if (getSession !== undefined && pid !== undefined) {
            getSession().then(async ({ sessionKey }) => {
                if (sessionKey !== "") {
                    const response = await fetch(
                        `${process.env.NEXT_PUBLIC_API_URL}/student/${pid}`,
                        {
                            method: "GET",
                            headers: {
                                Authorization: `auth/osoc2 ${sessionKey}`,
                            },
                        }
                    )
                        .then((response) => response.json())
                        .catch((err) => {
                            console.log(err);
                        });

                    if (response && response.success) {
                        setStudent(response);
                    } else if (response && !response.success && notify) {
                        notify(
                            "Something went wrong:" + response.reason,
                            NotificationType.ERROR,
                            2000
                        );
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
                <StudentOverview student={student} />
            ) : null}
        </div>
    );
};

export default Pid;
