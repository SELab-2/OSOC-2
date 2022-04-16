import {NextPage} from "next";
import React, {useContext, useEffect, useState} from "react";
import SessionContext from "../contexts/sessionProvider";
import {User} from "../components/User/User";
import styles from "../styles/users.module.css"
import {UserFilter} from "../components/UserFilter/UserFilter";
import {LoginUser} from "../types/types";

/**
 * The `manage users` page, only accessible for admins
 * @constructor
 */
const Users: NextPage = () => {

    const {getSessionKey, setSessionKey} = useContext(SessionContext)
    const [users, setUsers] = useState<Array<LoginUser>>()

    const getAllUsers = async () => {
        if (getSessionKey !== undefined) {
            getSessionKey().then(async sessionKey => {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/all`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': `auth/osoc2 ${sessionKey}`
                    }
                })
                    .then(response => response.json()).catch(error => console.log(error))
                if (response !== undefined) {
                    if (setSessionKey) {
                        setSessionKey(response.sessionkey)
                    }
                    setUsers(response.data)
                }
            })
        }
    }

    // Load all users upon page load
    useEffect(() => {
        getAllUsers().then()
        // We need to disable this warning. We of course do not want do reload the page when the data is changed
        // because that is exactly what this function does.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])


    const removeUser = (user: LoginUser) => {
        if (users !== undefined) {
            const index = users.indexOf(user, 0);
            console.log(index)
            console.log(users)
            if (index > -1) {
                users.splice(index, 1);
                setUsers([...users])
            }
        }
    }
    const updateUsers = (users: Array<LoginUser>) => {
        setUsers(users);
    }

    return (<div className={styles.body}>
        <UserFilter updateUsers={updateUsers}/>
        <div>

            {users !== undefined ? users.map((user) => {
                return <User user={user} key={user.login_user_id} removeUser={removeUser}/>
            }) : null}
        </div>
    </div>)
}

export default Users;
