import {NextPage} from "next";
import React, {useContext, useEffect, useState} from "react";
import SessionContext from "../contexts/sessionProvider";
import {User} from "../components/User/User";
import styles from "../styles/users.module.css"
import {UserFilter} from "../components/UserFilter/UserFilter";

/**
 * The `manage users` page, only accessible for admins
 * @constructor
 */
const Users: NextPage = () => {

    const {getSessionKey, setSessionKey} = useContext(SessionContext)
    const [users, setUsers] = useState<Array<{ person_data: { id: number, name: string, email: string }, coach: boolean, admin: boolean, activated: string }>>()
    const userSet = new Set<{ person_data: { id: number, name: string, email: string }, coach: boolean, admin: boolean, activated: string }>()

    // Load all users upon page load
    useEffect(() => {
        const getTempSession = () => {
            if (getSessionKey) {
                return getSessionKey()
            }
            return ""
        }
        // boilerplate for the admin/coaches route (pass admin/coach as string)
        const getAllUsers = async (route: string, sessionkey: string) => {
            return await fetch(`${process.env.NEXT_PUBLIC_API_URL}/` + route + "/all", {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `auth/osoc2 ${sessionkey}`
                }
            })
                .then(response => response.json()).then(json => {
                    if (!json.success) {

                        //TODO Popup of zoiets
                        return {success: false};
                    } else return json;
                })
                .catch(err => {
                    console.log(err)
                    //TODO Popup of zoiets
                    return {success: false};
                })
        }

        let tempSes = getTempSession()

        let test: Array<{ person_data: { id: number, name: string, email: string }, coach: boolean, admin: boolean, activated: string }> = [];
        getAllUsers("admin", tempSes).then(response => {
            tempSes = response.sessionkey
            test = [...response.data]
            test.forEach(userSet.add, userSet);
        }).then(() => {
            getAllUsers("coach", tempSes).then(response => {
                if (setSessionKey) {
                    setSessionKey(response.sessionkey)
                }
                test.concat(response.data);
            }).then(() => setUsers(Array.from(userSet)));
        })

        // We need to disable this warning. We of course do not want do reload the page when the data is changed
        // because that is exactly what this function does.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])


    return (<div className={styles.body}>
        <UserFilter/>
        <div>
            {users !== undefined ? users.map((user, index) => {
                console.log(user)
                return <User userName={user.person_data.name} userEmail={user.person_data.email}
                             userIsAdmin={user.admin}
                             userIsCoach={user.coach} userStatus={user.activated} key={index}
                             userId={user.person_data.id}/>
            }) : null}
        </div>
    </div>)
}

export default Users;
