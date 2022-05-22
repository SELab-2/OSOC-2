import { NextPage } from "next";
import React, { useContext, useEffect, useState } from "react";
import { User } from "../components/User/User";
import styles from "../styles/users.module.css";
import { UserFilter } from "../components/Filters/UserFilter";
import {
    AccountStatus,
    LoginUser,
    OsocEdition,
    NotificationType,
    Pagination,
    Sort,
    UserFilterParams,
} from "../types";
import SessionContext from "../contexts/sessionProvider";
import { useRouter } from "next/router";
import { Paginator } from "../components/Paginator/Paginator";
import { useSockets } from "../contexts/socketProvider";
import { NotificationContext } from "../contexts/notificationProvider";

/**
 * The `manage users` page, only accessible for admins
 * @constructor
 */
const Users: NextPage = () => {
    const [users, setUsers] = useState<Array<LoginUser>>();
    const [loading, isLoading] = useState<boolean>(false); // Check if we are executing a request
    const { getSession, sessionKey } = useContext(SessionContext);
    const router = useRouter();
    const [pagination, setPagination] = useState<Pagination>({
        page: 0,
        count: 0,
    });
    // 20 users per page
    const pageSize = 20;
    const [searchParams, setSearchParams] = useState<UserFilterParams>({
        nameFilter: "",
        emailFilter: "",
        nameSort: Sort.NONE,
        emailSort: Sort.NONE,
        adminFilter: false,
        coachFilter: false,
        statusFilter: AccountStatus.NONE,
    });

    const [osocEditions, setOsocEditions] = useState<OsocEdition[]>([]);

    const { socket } = useSockets();
    const { notify } = useContext(NotificationContext);

    /**
     * remove the listeners when dismounting the component
     */
    useEffect(() => {
        return () => {
            socket.off("loginUserUpdated");
            socket.off("registrationReceived");
            socket.off("osocWasCreatedOrDeleted");
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (getSession) {
            // Only admins may see the manage users screen
            getSession().then(({ isAdmin, sessionKey }) => {
                if (!isAdmin) {
                    return router.push("/").then();
                }

                fetchAllOsocEditions(sessionKey).then();
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /**
     * when the server notifies that a user has changed, we should re-fetch to get the latest changes
     * we need the dependency array to make sure we use the latest version of the filter fields
     */
    useEffect(() => {
        socket.off("loginUserUpdated"); // remove the earlier added listeners
        socket.off("registrationReceived");
        socket.off("osocWasCreatedOrDeleted");
        // add new listener
        socket.on("loginUserUpdated", () => {
            const scrollPosition = window.scrollY;
            search(
                {
                    nameFilter: searchParams.nameFilter,
                    nameSort: searchParams.nameSort,
                    emailFilter: searchParams.emailFilter,
                    emailSort: searchParams.emailSort,
                    adminFilter: searchParams.adminFilter,
                    coachFilter: searchParams.coachFilter,
                    statusFilter: searchParams.statusFilter,
                },
                pagination.page
            ).then();
            window.scrollTo(0, scrollPosition);
        });
        socket.on("registrationReceived", () => {
            const scrollPosition = window.scrollY;
            search(
                {
                    nameFilter: searchParams.nameFilter,
                    nameSort: searchParams.nameSort,
                    emailFilter: searchParams.emailFilter,
                    emailSort: searchParams.emailSort,
                    adminFilter: searchParams.adminFilter,
                    coachFilter: searchParams.coachFilter,
                    statusFilter: searchParams.statusFilter,
                },
                pagination.page
            ).then(() => window.scrollTo(0, scrollPosition));
        });
        // when an osoc edition is deleted or removed this should be updated in the dropdown
        socket.on("osocWasCreatedOrDeleted", () => {
            const scrollPosition = window.scrollY;
            fetchAllOsocEditions(sessionKey).then(() =>
                window.scrollTo(0, scrollPosition)
            );
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socket, searchParams, pagination]);

    /**
     * Gets all osoc editions from the backend
     * @param sessionKey
     */
    const fetchAllOsocEditions = async (sessionKey: string) => {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/osoc/all`,
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
            .catch((reason) => console.log(reason));
        if (response !== undefined && response.success) {
            setOsocEditions(response.data);
        }
    };

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
            {
                nameFilter: searchParams.nameFilter,
                nameSort: searchParams.nameSort,
                emailFilter: searchParams.emailFilter,
                emailSort: searchParams.emailSort,
                adminFilter: searchParams.adminFilter,
                coachFilter: searchParams.coachFilter,
                statusFilter: searchParams.statusFilter,
            },
            page
        ).then();
    };

    /**
     * manual filter. This happens when we explicitly pressed the button => go back to first page
     */
    const filter = async (
        nameFilter: string,
        nameSort: Sort,
        emailFilter: string,
        emailSort: Sort,
        adminFilter: boolean,
        coachFilter: boolean,
        statusFilter: AccountStatus
    ) => {
        setSearchParams({
            nameFilter: nameFilter,
            nameSort: nameSort,
            emailFilter: emailFilter,
            emailSort: emailSort,
            adminFilter: adminFilter,
            coachFilter: coachFilter,
            statusFilter: statusFilter,
        });
        // reset the page to the first page when manual searching!
        setPagination({ page: 0, count: 0 });
        await search(
            {
                nameFilter: nameFilter,
                nameSort: nameSort,
                emailFilter: emailFilter,
                emailSort: emailSort,
                adminFilter: adminFilter,
                coachFilter: coachFilter,
                statusFilter: statusFilter,
            },
            0
        );
    };

    /**
     * Build and execute the query
     */
    const search = async (params: UserFilterParams, currentPage: number) => {
        if (loading) return;

        const filters = [];
        if (params.nameFilter !== "") {
            filters.push(`nameFilter=${params.nameFilter}`);
        }

        if (params.nameSort !== Sort.NONE) {
            filters.push(`nameSort=${params.nameSort}`);
        }

        if (params.emailFilter !== "") {
            filters.push(`emailFilter=${params.emailFilter}`);
        }

        if (params.emailSort !== Sort.NONE) {
            filters.push(`emailSort=${params.emailSort}`);
        }

        if (params.adminFilter) {
            filters.push(`isAdminFilter=${params.adminFilter}`);
        }

        if (params.coachFilter) {
            filters.push(`isCoachFilter=${params.coachFilter}`);
        }

        if (params.statusFilter !== AccountStatus.NONE) {
            filters.push(`statusFilter=${params.statusFilter}`);
        }

        filters.push(`currentPage=${currentPage}`);
        filters.push(`pageSize=${pageSize}`);

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
        if (response.success && response.data && response.pagination) {
            updateUsers(response.data);
            setPagination(response.pagination);
        } else if (response && !response.success && notify) {
            notify(
                "Something went wrong:" + response.reason,
                NotificationType.ERROR,
                2000
            );
        }
        isLoading(false);
    };

    return (
        <div className={styles.body}>
            <UserFilter search={filter} />
            <div>
                {users !== undefined
                    ? users.map((user) => {
                          return (
                              <User
                                  user={user}
                                  key={user.login_user_id}
                                  removeUser={removeUser}
                                  editions={osocEditions}
                              />
                          );
                      })
                    : null}
            </div>
            <Paginator
                pageSize={pageSize}
                pagination={pagination}
                navigator={navigator}
            />
        </div>
    );
};

export default Users;
