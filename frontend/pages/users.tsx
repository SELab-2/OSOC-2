import {NextPage} from "next";
import {Header} from "../components/Header/Header";
import React, {useContext, useEffect, useState} from "react";
import SessionContext from "../contexts/sessionProvider";
import {User} from "../components/User/User";
import styles from "../styles/users.module.css"

/**
 * The `manage users` page, only accessible for admins
 * @constructor
 */
const Users: NextPage = () => {

    const {sessionKey, setSessionKey} = useContext(SessionContext)
    const [users, setUsers] = useState<Array<{ person_data: { id: number, name: string }, coach: boolean, admin: boolean, activated: string }>>()


    // Load all users upon page load
    useEffect(() => {
        // boilerplate for the admin/coaches route (pass admin/coach as string)
        const getAllUsers = async (route: string) => {
            console.log(`${process.env.NEXT_PUBLIC_API_URL}/` + route + "/all")
            return await fetch(`${process.env.NEXT_PUBLIC_API_URL}/` + route + "/all", {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `auth/osoc2 ${sessionKey}`
                }
            })
                .then(response => response.json()).then(json => {
                    if (!json.success) {

                        //TODO logica van niet gelukt
                        return {success: false};
                    } else return json;
                })
                .catch(err => {
                    console.log(err)
                    //TODO logica van niet gelukt
                    return {success: false};
                })
        }

        getAllUsers("admin").then(response => {
            console.log(response)
            if (setSessionKey) {
                setSessionKey(response.sessionkey)
            }
            setUsers(response.data)
        })
        // We need to disable this warning. We of course do not want do reload the page when the data is changed
        // because that is exactly what this function does.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])


    return (<>
        <Header/>
        <div className={styles.body}>
            {users !== undefined ? users.map((value, index) => {
                return <User userName={value.person_data.name} userEmail="mauricevanwassenhove@gmail.com TODO"
                             userIsAdmin={value.admin}
                             userIsCoach={value.coach} userStatus={value.activated} key={index}/>
            }) : null}
        </div>
    </>)
}

export default Users;
