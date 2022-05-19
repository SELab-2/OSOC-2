import { Osoc } from "../components/Osoc/Osoc";
import {
    NotificationType,
    OsocEdition,
    OsocFilterParams,
    Sort,
} from "../types";
import { NextPage } from "next";
import React, { useContext, useState } from "react";
import styles from "../styles/users.module.css";
import { OsocCreateFilter } from "../components/Filter/OsocFilter/OsocFilter";
import SessionContext from "../contexts/sessionProvider";
import { Paginator } from "../components/Paginator/Paginator";
import { Pagination } from "../types";
import { NotificationContext } from "../contexts/notificationProvider";

/**
 * The `osoc edition` page, only accessible for admins
 * @constructor
 */
const Osocs: NextPage = () => {
    const { getSession } = useContext(SessionContext);

    const [osocEditions, setEditions] = useState<Array<OsocEdition>>([]);
    const [params, setParams] = useState<OsocFilterParams>();
    const [loading, isLoading] = useState(false);
    const [pagination, setPagination] = useState<Pagination>({
        page: 0,
        count: 0,
    });
    const { notify } = useContext(NotificationContext);

    const removeOsoc = (osoc: OsocEdition) => {
        if (osocEditions !== undefined) {
            const index = osocEditions.indexOf(osoc, 0);
            if (index > -1) {
                osocEditions.splice(index, 1);
                setEditions([...osocEditions]);
            }
        }
    };

    const navigator = (page: number) => {
        if (params !== undefined) {
            search(params, page).then();
        }
    };

    /**
     * Called by the osocfilter to filter
     * @param params
     */
    const filter = async (params: OsocFilterParams) => {
        setParams(params);
        search(params, 0).then();
    };

    /**
     * Search function with pagination
     * @param params
     * @param page
     */
    const search = async (params: OsocFilterParams, page: number) => {
        if (loading) return;
        isLoading(true);
        const filters = [];

        if (params.yearFilter !== "") {
            filters.push(`yearFilter=${params.yearFilter}`);
        }

        if (params.yearSort !== Sort.NONE) {
            filters.push(`yearSort=${params.yearSort}`);
        }

        filters.push(`currentPage=${page}`);

        const query = filters.length > 0 ? `?${filters.join("&")}` : "";

        const { sessionKey } = getSession
            ? await getSession()
            : { sessionKey: "" };
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/osoc/filter` + query,
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
        if (response.data && response.pagination) {
            setEditions(response.data);
            setPagination(response.pagination);
        } else if (!response.success && notify) {
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
            <div>
                <OsocCreateFilter search={filter} />
                {osocEditions !== undefined
                    ? osocEditions.map((osoc) => {
                          return (
                              <Osoc
                                  osoc={osoc}
                                  key={osoc.osoc_id}
                                  removeOsoc={removeOsoc}
                              />
                          );
                      })
                    : null}
            </div>
            <Paginator pagination={pagination} navigator={navigator} />
        </div>
    );
};

export default Osocs;
