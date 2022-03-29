import type {NextPage} from 'next'
import {useContext} from "react";
import SessionContext from "./contexts/sessionProvider";

/**
 * Checks if the logged in user is an admin or not.
 * Coaches have restricted acces to some pages / features
 * @constructor
 */
const Home: NextPage = () => {

    // TODO
    const {sessionKey} = useContext(SessionContext)

    return (<>
        <p>{sessionKey}</p>
    </>)
}

export default Home;
