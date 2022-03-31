import {NextPage} from "next";
import {useRouter} from "next/router";

/**
 * Can be used when redirect from a different site to log in given credentials in the URL
 * Being of form /login/sessionkey?admin=boolean&coach=boolean
 * @constructor
 */
const Pid: NextPage = () => {
    const router = useRouter()
    const { pid } = router.query // pid is the session key
    return <p>{pid}</p>
}

export default Pid;
