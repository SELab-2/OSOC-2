import { NextPage } from "next";
import { useRouter } from "next/router";
import { useContext, useEffect } from "react";
import SessionContext from "../../contexts/sessionProvider";

/**
 * Can be used when redirect from a different site to log in given credentials in the URL
 * Being of form /login/[sessionkey]
 * @constructor
 */
const Pid: NextPage = () => {
    const router = useRouter();
    const { setSessionKey } = useContext(SessionContext);
    const { pid } = router.query; // pid is the session key

    useEffect(() => {
        if (
            pid !== undefined &&
            typeof pid === "string" &&
            setSessionKey !== undefined
        ) {
            setSessionKey(pid);
            // redirect to /, root will then verify the session key
            router.push("/").then();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router.query]);

    return <></>;
};

export default Pid;
