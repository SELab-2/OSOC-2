/**
 * Will be shown to every user that is not yet accepted by an admin
 * TODO
 */

import {NextPage} from "next";
import {UnderConstruction} from "../components/UnderConstruction/UnderConstruction";
import {Header} from "../components/Header/Header";

const Pending: NextPage = () => {
    return (
        <>
            <Header/>
            <h2>You are not yet accepted by an admin...</h2>
            <UnderConstruction/>
        </>
    )
}

export default Pending;
