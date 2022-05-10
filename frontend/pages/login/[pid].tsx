import { NextPage } from "next";
import { useRouter } from "next/router";
import { useContext, useEffect } from "react";
import SessionContext from "../../contexts/sessionProvider";
import { useSockets } from "../../contexts/socketProvider";

/**
 * Can be used when redirect from a different site to log in given credentials in the URL
 * Being of form /login/[sessionkey]
 * @constructor
 */
const Pid: NextPage = () => {
    const router = useRouter();
    const { setSessionKey } = useContext(SessionContext);
    const { pid, is_signup } = router.query; // pid is the session key, is_signup is used if we need to emit a socket event
    const { socket } = useSockets();

    useEffect(() => {
        if (
            pid !== undefined &&
            typeof pid === "string" &&
            setSessionKey !== undefined
        ) {
            setSessionKey(pid);
            // redirect to /, root will then verify the session key
            router.push("/").then();

            // send a submitRegistration event because there was a new registration via github
            if (
                is_signup !== undefined &&
                typeof is_signup === "string" &&
                is_signup === "true"
            ) {
                socket.emit("submitRegistration");
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router.query]);

    return <></>;
};

export default Pid;
