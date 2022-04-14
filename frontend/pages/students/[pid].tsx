import { NextPage } from "next";
import {useRouter} from "next/router";
import SessionContext from "../../contexts/sessionProvider";
import { useContext, useState, useEffect } from "react"
import {Student} from "../../types/types"


const Pid: NextPage = () => {
    const router = useRouter();
    const { getSessionKey, setSessionKey } = useContext(SessionContext);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [student, setStudent] = useState<(Student)[]>([]);
    const { pid } = router.query; // pid is the student id

    const fetchStudent = async () => {
        if (getSessionKey !== undefined && pid !== undefined) {
            console.log(pid);
            getSessionKey().then(async sessionKey => {
                if (sessionKey != "") {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/student/${pid}`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `auth/osoc2 ${sessionKey}`
                        }
                    }).then(response => response.json()).catch(error => console.log(error));
                    if (response !== undefined && response.success) {
                        if (setSessionKey) {
                            setSessionKey(response.sessionkey)
                        }
                        setStudent(response.data)
                    }
                }
            })
        }
    }

    useEffect(() => {
        fetchStudent().then();
        // We do not want to reload the data when the data changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div>
            <p>Hej hallo</p>
        </div>
    )
}


export default Pid;
