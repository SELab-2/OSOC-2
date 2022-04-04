import {NextPage} from "next";
import {useRouter} from "next/router";
import {useContext, useEffect} from "react";
import SessionContext from "../../contexts/sessionProvider";

/**
 * Can be used when redirect from a different site to log in given credentials in the URL
 * Being of form /login/sessionkey?is_admin=boolean&is_coach=boolean
 * @constructor
 */
const Pid: NextPage = () => {

    const router = useRouter()
    const {setSessionKey, setIsAdmin, setIsCoach} = useContext(SessionContext)
    const { pid, is_admin, is_coach } = router.query // pid is the session key

    useEffect(() => {
        if (pid !== undefined && typeof pid === 'string' && setSessionKey !== undefined) {
            setSessionKey(pid)
        }
        if (is_admin !== undefined && is_admin === 'true' && setIsAdmin !== undefined) {
            setIsAdmin(true)
        }
        if (is_coach !== undefined && is_coach === 'true' && setIsCoach !== undefined) {
            setIsCoach(true)
        }

        // redirect to /students
        if (pid !== undefined && typeof pid === 'string') {
            router.push("/students").then()
        }
    })

    return <></>
}

export default Pid;
