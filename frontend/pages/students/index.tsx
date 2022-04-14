import {NextPage} from "next";
import SessionContext from "../../contexts/sessionProvider";
import React, {useContext, useEffect, useState} from "react";
import {StudentCard} from "../../components/StudentCard/StudentCard";
import {Student} from "../../types/types"
import styles from "../../styles/students.module.scss"
import {useRouter} from "next/router";
import {StudentOverview} from "../../components/StudentOverview/StudentOverview";
import {EvaluationBar} from "../../components/StudentCard/EvaluationBar";


const Index: NextPage = () => {
    const {getSessionKey, setSessionKey} = useContext(SessionContext);
    const [students, setStudents] = useState<(Student)[]>([]);
    const router = useRouter()
    // the id query parameter that shows the selected student
    let id = -2
    // the index of the selected student if the given id matches with one of the fetched students
    const [selectedStudent, setSelectedStudent] = useState<number>(-1)

    const fetchStudents = async () => {
        if (getSessionKey !== undefined) {
            getSessionKey().then(async sessionKey => {
                if (sessionKey != "" && id > -1) {
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
                        for (let i = 0; i < response.data.length; i++) {
                            if (id === response.data[i].student.student_id) {
                                setSelectedStudent(i)
                            }
                        }
                    }
                }
            })
        }
    }

    useEffect(() => {
        // We perform some magic here, because on first render the query parameters are always undefined
        // https://github.com/vercel/next.js/discussions/11484#discussioncomment-60563
        const queryKey = 'id';
        const queryValue = router.query[queryKey] || router.asPath.match(new RegExp(`[&?]${queryKey}=(.*)(&|$)`))
        if (queryValue !== undefined) {
            // eslint-disable-next-line react-hooks/exhaustive-deps
            id = Number(queryValue)
        } else {
            id = 0
        }
        fetchStudents().then();
        // We do not want to reload the data when the data changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router]);

    /**
     * Handles clicking on a student
     * Ctrl + Click or Alt + Click should upon the student on a seperate page /students/:id
     * A normal click will upon on the same page and set the query parameter to /students?id=[id]
     * @param e
     * @param student_id
     * @param index
     */
    const clickStudent = (e: React.MouseEvent<HTMLDivElement>, student_id: number, index: number) => {
        e.preventDefault()

        if (e.ctrlKey || e.altKey || e.button == 1) {
            window.open(`/students/${student_id}`)
            return
        }
        router.push(`/students?id=${student_id}`).then()
        setSelectedStudent(index)
    }

    return (
        <div className={styles.students}>
            {students.map((student, index) => {
                return (<div key={student.student.student_id} className={styles.card}
                             onClick={e => clickStudent(e, student.student.student_id, index)}>
                    <StudentCard student={student as Student}/>
                    <EvaluationBar evaluations={student.evaluations[0].evaluation}/>
                </div>)
            })}
            {selectedStudent !== -1 ? <StudentOverview student={students[selectedStudent]}/> : null}
        </div>)
}

export default Index;
