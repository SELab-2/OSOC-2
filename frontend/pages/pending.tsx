import {NextPage} from "next";
import {Header} from "../components/Header/Header";
import styles from "../styles/pending.module.css"

/**
 * Will be shown to every user that is not yet accepted by an admin
 */
const Pending: NextPage = () => {
    return (
        <>
            <Header/>
            <h2 className={styles.pending}>Your account is pending approval of an admin.</h2>
            <h2 className={styles.pending}>Awaiting approval...</h2>
        </>
    )
}

export default Pending;
