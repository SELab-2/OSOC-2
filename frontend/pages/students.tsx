import {NextPage} from "next";
import SessionContext from "../contexts/sessionProvider";
import {useContext, useEffect, useState} from "react";
import {StudentCard} from "../components/StudentCard/StudentCard";
import {Student} from "../types/types"
import styles from "../styles/students.module.scss"
import {useRouter} from "next/router";


const Students: NextPage = () => {
    const {getSessionKey, setSessionKey} = useContext(SessionContext);
    const [students, setStudents] = useState<(Student)[]>([]);
    const router = useRouter()

    const fetchStudents = async () => {
        const sessionKey = getSessionKey != undefined ? getSessionKey() : ""
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/student/all`, {
            method: 'GET',
            headers: {
                'Authorization': `auth/osoc2 ${sessionKey}`
            }
        }).then(response => response.json()).catch(error => console.log(error));
        if (response !== undefined && response.success) {
            if (setSessionKey) {
                setSessionKey(response.sessionkey)
            }
            setStudents(response.data)
        }
    }

    const divClickedHandler = (event: React.MouseEvent<HTMLDivElement>) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const div = event.currentTarget;
        router.push("/student/overview").then()
      };

    useEffect(() => {
        fetchStudents().then();
        // We do not want to reload the data when the data changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className={styles.students} >
            {students.map(student => <StudentCard key={student.student.student_id} student={student as Student} clickHandler={divClickedHandler}/>)}
        </div>
    )
}

export default Students;
