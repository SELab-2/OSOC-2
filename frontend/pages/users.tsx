import { NextPage } from "next";
import React, { useContext, useEffect, useState } from "react";
import { User } from "../components/User/User";
import styles from "../styles/users.module.css";
import { UserFilter } from "../components/Filter/UserFilter/UserFilter";
import {
    AccountStatus,
    LoginUser,
    Pagination,
    Sort,
    UserFilterParams,
} from "../types";
import SessionContext from "../contexts/sessionProvider";
import { useRouter } from "next/router";
import { Paginator } from "../components/Paginator/Paginator";

/**
 * The `manage users` page, only accessible for admins
 * @constructor
 */
const Users: NextPage = () => {
    const [users, setUsers] = useState<Array<LoginUser>>();
    const [loading, isLoading] = useState<boolean>(false); // Check if we are executing a request
    const { getSession } = useContext(SessionContext);
    const router = useRouter();
    const [pagination, setPagination] = useState<Pagination>({
        page: 0,
        count: 0,
    });
    const [searchParams, setSearchParams] = useState<UserFilterParams>({
        nameFilter: "",
        emailFilter: "",
        nameSort: Sort.NONE,
        emailSort: Sort.NONE,
        adminFilter: false,
        coachFilter: false,
        statusFilter: AccountStatus.NONE,
    });

    useEffect(() => {
        if (getSession) {
            // Only admins may see the manage users screen
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

    const navigator = (page: number) => {
        search(
            searchParams.nameFilter,
            searchParams.nameSort,
            searchParams.emailFilter,
            searchParams.emailSort,
            searchParams.adminFilter,
            searchParams.coachFilter,
            searchParams.statusFilter,
            page
        ).then();
    };

    /**
     * search that is used when auto refreshing on websocket event,...
     * We keep the same page as before
     */
    const filterAutomatic = async (
        nameFilter: string,
        nameSort: Sort,
        emailFilter: string,
        emailSort: Sort,
        adminFilter: boolean,
        coachFilter: boolean,
        statusFilter: AccountStatus
    ) => {
        console.log(pagination.page);
        setSearchParams({
            nameFilter: nameFilter,
            nameSort: nameSort,
            emailFilter: emailFilter,
            emailSort: emailSort,
            adminFilter: adminFilter,
            coachFilter: coachFilter,
            statusFilter: statusFilter,
        });
        await search(
            nameFilter,
            nameSort,
            emailFilter,
            emailSort,
            adminFilter,
            coachFilter,
            statusFilter,
            pagination.page
        );
    };

    /**
     * manual filter. This happens when we explicitly pressed the button => go back to first page
     */
    const filterManual = async (
        nameFilter: string,
        nameSort: Sort,
        emailFilter: string,
        emailSort: Sort,
        adminFilter: boolean,
        coachFilter: boolean,
        statusFilter: AccountStatus
    ) => {
        console.log("manual(");
        // reset the page to the first page when manual searching!
        setPagination({ page: 0, count: 0 });
        await filterAutomatic(
            nameFilter,
            nameSort,
            emailFilter,
            emailSort,
            adminFilter,
            coachFilter,
            statusFilter
        );
    };

    /**
     * Build and execute the query
     */
    const search = async (
        nameFilter: string,
        nameSort: Sort,
        emailFilter: string,
        emailSort: Sort,
        adminFilter: boolean,
        coachFilter: boolean,
        statusFilter: AccountStatus,
        currentPage: number
    ) => {
        if (loading) return;

        const filters = [];
        if (nameFilter !== "") {
            filters.push(`nameFilter=${nameFilter}`);
        }

        if (nameSort !== Sort.NONE) {
            filters.push(`nameSort=${nameSort}`);
        }

        if (emailFilter !== "") {
            filters.push(`emailFilter=${emailFilter}`);
        }

        if (emailSort !== Sort.NONE) {
            filters.push(`emailSort=${emailSort}`);
        }

        if (adminFilter) {
            filters.push(`isAdminFilter=${adminFilter}`);
        }

        if (coachFilter) {
            filters.push(`isCoachFilter=${coachFilter}`);
        }

        if (statusFilter !== AccountStatus.NONE) {
            filters.push(`statusFilter=${statusFilter}`);
        }

        filters.push(`currentPage=${currentPage}`);

        const query = filters.length > 0 ? `?${filters.join("&")}` : "";

        const { sessionKey } = getSession
            ? await getSession()
            : { sessionKey: "" };
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/user/filter` + query,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `auth/osoc2 ${sessionKey}`,
                },
            }
        )
            .then((response) => response.json())
            .catch((err) => {
                console.log(err);
            });
        updateUsers(response.data);
        setPagination(response.pagination);
        isLoading(false);
    };

    return (
        <div className={styles.body}>
            <UserFilter
                searchAutomatic={filterAutomatic}
                searchManual={filterManual}
            />
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
            <Paginator pagination={pagination} navigator={navigator} />
        </div>
    );
};

export default Users;
