import {NextPage} from "next";
import React, {useState} from "react";
import {User} from "../components/User/User";
import styles from "../styles/users.module.css"
import {UserFilter} from "../components/UserFilter/UserFilter";
import {LoginUser} from "../types/types";

/**
 * The `manage users` page, only accessible for admins
 * @constructor
 */
const Users: NextPage = () => {

    const [users, setUsers] = useState<Array<LoginUser>>()

    const removeUser = (user: LoginUser) => {
        if (users !== undefined) {
            const index = users.indexOf(user, 0);
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
