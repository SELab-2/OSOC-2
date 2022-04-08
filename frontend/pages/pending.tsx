import {NextPage} from "next";
import styles from "../styles/pending.module.scss"

/**
 * Will be shown to every user that is not yet accepted by an admin
 */
const Pending: NextPage = () => {
    return (
        <div>
            <h2 className={styles.pending}>Your account is pending approval of an admin.</h2>
            <h2 className={styles.pending}>Awaiting approval...</h2>
        </div>
    )
}

export default Pending;
