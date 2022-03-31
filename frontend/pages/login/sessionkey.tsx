import {NextPage} from "next";
import {useRouter} from "next/router";

const Sessionkey: NextPage = () => {
    const router = useRouter()
    const sessionKey = router.query
    return <p>{sessionKey}</p>
}

export default Sessionkey;
