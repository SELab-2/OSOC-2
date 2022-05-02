import { NextPage } from "next";
import styles from "../styles/pending.module.scss";
import { useContext, useEffect } from "react";
import SessionContext from "../contexts/sessionProvider";
import { useRouter } from "next/router";

/**
 * Will be shown to every user that is not yet accepted by an admin
 */
const Pending: NextPage = () => {
    const router = useRouter();
    const { getSession } = useContext(SessionContext);
    // check if user is logged in, if the user is logged in, redirect away from this page
    useEffect(() => {
        if (getSession) {
            getSession().then(({ sessionKey }) => {
                // The user is already logged in, redirect the user
                if (sessionKey != "") {
                    router.push("/students").then();
                }
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div>
            <h2 className={styles.pending}>
                Your account is pending approval of an admin.
            </h2>
            <h2 className={styles.pending}>Awaiting approval...</h2>
        </div>
    );
};

export default Pending;
