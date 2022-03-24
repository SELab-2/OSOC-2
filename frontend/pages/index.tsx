import type {NextPage} from 'next'
import {useRouter} from "next/router";
import { useSession } from "next-auth/react"
import {useEffect} from "react";

const Home: NextPage = () => {

    const router = useRouter()
    const session = useSession()

    useEffect(() => {
        // The user is logged in
        if (session !== null && session.status === "authenticated") {
            router.push("/students").then()
        } else {
            // The user is not logged in and will be redirected to /login
            router.push("/login").then()
        }
    })

    return (<></>)
}

export default Home;
