import type { NextPage } from "next";
import { useContext, useEffect } from "react";
import SessionContext from "../contexts/sessionProvider";
import { useRouter } from "next/router";

/**
 * Checks if a user is logged in and redirects to the corresponding page
 * Coaches have restricted acces to some pages / features
 * @constructor
 */
const Home: NextPage = () => {
    const { getSessionKey } = useContext(SessionContext);
    const router = useRouter();

    useEffect(() => {
        if (getSessionKey) {
            getSessionKey().then((sessionKey) => {
                if (sessionKey !== "") {
                    router.push("/students").then();
                }
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <></>;
};

export default Home;
