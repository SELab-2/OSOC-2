import type {NextPage} from 'next'
import {UnderConstruction} from "../components/UnderConstruction/UnderConstruction";
import {useRouter} from "next/router";
import {useEffect} from "react";

const Home: NextPage = () => {

    const router = useRouter();

    useEffect(() => {
        router.push("/login").then()
    }, [router])

    return (
        <UnderConstruction/>
    )
}

export default Home;
