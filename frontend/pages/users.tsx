import { NextPage } from "next";
import React, { useContext, useEffect, useState } from "react";
import { User } from "../components/User/User";
import styles from "../styles/users.module.css";
import { UserFilter } from "../components/Filters/UserFilter";
import { LoginUser } from "../types";
import SessionContext from "../contexts/sessionProvider";
import { useRouter } from "next/router";

/**
 * The `manage users` page, only accessible for admins
 * @constructor
 */
const Users: NextPage = () => {
    const [users, setUsers] = useState<Array<LoginUser>>();

    const { getSession } = useContext(SessionContext);
    const router = useRouter();

    useEffect(() => {
        if (getSession) {
            getSession().then(({ isAdmin }) => {
                if (!isAdmin) {
                    router.push("/").then();
                }
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const removeUser = (user: LoginUser) => {
        if (users !== undefined) {
            const index = users.indexOf(user, 0);
            if (index > -1) {
                users.splice(index, 1);
                setUsers([...users]);
            }
        }
    };
    const updateUsers = (users: Array<LoginUser>) => {
        setUsers(users);
    };

    return (
        <div className={styles.body}>
            <UserFilter updateUsers={updateUsers} />
            <div>
                {users !== undefined
                    ? users.map((user) => {
                          return (
                              <User
                                  user={user}
                                  key={user.login_user_id}
                                  removeUser={removeUser}
                              />
                          );
                      })
                    : null}
            </div>
        </div>
    );
};

export default Users;
