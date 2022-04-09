/* eslint-disable @typescript-eslint/no-unused-vars */
//testcommit
import {NextPage} from "next";
import SessionContext from "../contexts/sessionProvider";
import {useContext, useEffect, useState} from "react";
import {StudentCard} from "../components/StudentCard/StudentCard";
import {Student} from "../types/types"


const Students: NextPage = () => {
    const { getSessionKey, setSessionKey } = useContext(SessionContext);
    const [students, setStudents] = useState<(Student)[]>([]);

    const fetchStudents = async () => {
        const sessionKey = getSessionKey != undefined ? getSessionKey() : ""
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/student/all`, {
            method: 'GET',
            headers: {
                'Authorization': `auth/osoc2 ${sessionKey}`
            }
        }).then(response => response.json()).catch(error => console.log(error));
        if (response.success) {
            if (setSessionKey) {
                setSessionKey(response.sessionkey)
            }
            setStudents(response.data)
        }
    }

    useEffect(() => {
        fetchStudents().then();
        // We do not want to reload the data when the data changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <ul>
            {students.map(student => (
                <li key={student.student.student_id}>
                    <StudentCard student={student}/>
                </li>
            ))}
        </ul>
    )
}

export default Students;
