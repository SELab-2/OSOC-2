import type {NextPage} from 'next'
import {useContext, useEffect} from "react";
import SessionContext from "../contexts/sessionProvider";
import {useRouter} from "next/router";

/**
 * Checks if a user is logged in and redirects to the corresponding page
 * Coaches have restricted acces to some pages / features
 * @constructor
 */
const Home: NextPage = () => {

    const {getSessionKey} = useContext(SessionContext)
    const router = useRouter()

    useEffect(() => {
        let sessionKey = ""
        if (getSessionKey) {
            sessionKey = getSessionKey()
        }
        // No user is logged in
        if (sessionKey === "") {
            router.push("/login").then()
        } else {
            router.push("/students").then()
        }
    }, [getSessionKey, router])

    return (<></>)
}

export default Home;
