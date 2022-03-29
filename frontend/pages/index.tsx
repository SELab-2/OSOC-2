import type {NextPage} from 'next'
import {useContext} from "react";
import SessionContext from "./contexts/sessionProvider";

const Home: NextPage = () => {

    // TODO
    const {sessionKey} = useContext(SessionContext)

    return (<>
        <p>{sessionKey}</p>
    </>)
}

export default Home;
