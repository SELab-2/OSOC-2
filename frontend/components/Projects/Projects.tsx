import React, { useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import SessionContext from "../../contexts/sessionProvider";
import { Pagination, Project, ProjectFilterParams, Sort } from "../../types";
import { ProjectCard } from "../ProjectCard/ProjectCard";
import styles from "./Projects.module.scss";
import scrollStyles from "../ScrollView.module.scss";
import { ProjectFilter } from "../Filters/ProjectFilter";
import { Paginator } from "../Paginator/Paginator";
import { useSockets } from "../../contexts/socketProvider";

/**
 * Projects page with project filter included
 * @constructor
 */
export const Projects: React.FC = () => {
    const router = useRouter();
    const { socket } = useSockets();
    const { getSession } = useContext(SessionContext);
    const [projects, setProjects] = useState<Project[]>([]);

    const [params, setParams] = useState<ProjectFilterParams>();
    const [pagination, setPagination] = useState<Pagination>({
        page: 0,
        count: 0,
    });

    // 5 projects per page
    const pageSize = 5;

    const [loading, isLoading] = useState(false);

    /**
     * the code in the return value is executed when leaving the page. This will remove the listeners
     */
    useEffect(() => {
        return () => {
            socket.off("projectWasCreatedOrDeleted");
            socket.off("projectWasModified");
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        // remove earlier listeners
        socket.off("projectWasCreatedOrDeleted");
        socket.off("projectWasModified");

        // add the new listeners
        socket.on("projectWasCreatedOrDeleted", () => {
            if (params !== undefined) {
                filterAutomatic(params).then();
            }
        });
        socket.on("projectWasModified", (projectId: number) => {
            if (params !== undefined) {
                for (const project of projects) {
                    if (project.id === projectId) {
                        filterAutomatic(params).then();
                        break;
                    }
                }
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socket, params, pagination]);

    /**
     * Called by the studentfilter to filter
     * Resets the pagination
     * @param params
     */
    const filterManual = async (params: ProjectFilterParams) => {
        setParams(params);
        search(params, 0).then();
    };

    /**
     * Called by the studentfilter to filter when a websocket event is received. We need to keep track of the current page!
     * @param params
     */
    const filterAutomatic = async (params: ProjectFilterParams) => {
        setParams(params);
        // get the current page
        const currentPageStr = new URLSearchParams(window.location.search).get(
            "currentPageProject"
        );
        const currentPageInt =
            currentPageStr !== null && new RegExp("[0-9]+").test(currentPageStr) // check if the argument only exists out of numbers
                ? Number(currentPageStr)
                : 0;
        setPagination({
            page: currentPageInt,
            count: 0, //TODO: what value should this be? I thought this would have to be currentPageInt * pageSize + 1
        });
        search(params, currentPageInt).then();
    };

    /**
     * Search function that uses the current pagination
     * @param params
     * @param page
     */
    const search = async (params: ProjectFilterParams, page: number) => {
        if (loading) return;

        const scrollPosition = window.scrollY;

        isLoading(true);

        const filters = [];

        if (params.nameFilter !== "") {
            filters.push(`projectNameFilter=${params.nameFilter}`);
        }
        if (params.projectNameSort !== Sort.NONE) {
            filters.push(`projectNameSort=${params.projectNameSort}`);
        }
        if (params.clientFilter !== "") {
            filters.push(`clientNameFilter=${params.clientFilter}`);
        }
        if (params.clientSort !== Sort.NONE) {
            filters.push(`clientNameSort=${params.clientSort}`);
        }
        if (params.fullyAssigned) {
            filters.push(`fullyAssignedFilter=${params.fullyAssigned}`);
        }
        if (params.osocYear !== "") {
            filters.push(`osocYear=${params.osocYear}`);
        }

        filters.push(`currentPage=${page}`);
        filters.push(`pageSize=${pageSize}`);

        const query = filters.length > 0 ? `?${filters.join("&")}` : "";
        const { sessionKey } = getSession
            ? await getSession()
            : { sessionKey: "" };
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/project/filter${query}`,
            {
                method: "GET",
                headers: {
                    Authorization: `auth/osoc2 ${sessionKey}`,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            }
        )
            .then((response) => response.json())
            .catch((err) => {
                console.log(err);
            });

        if (response !== undefined && response.success) {
            setProjects(response.data);
            setPagination(response.pagination);
        }
        isLoading(false);

        // these are the search parameters we just sent
        const newSearchParams = new URLSearchParams(query);

        // set the page filter unique for the student to keep track of it in the frontend
        newSearchParams.delete("currentPage");
        newSearchParams.delete("pageSize");
        newSearchParams.set("currentPageProject", page.toString());
        newSearchParams.set("pageSizeProject", pageSize.toString());

        // we have to change the parameter name of osocYear to osocYearProject to prevent conflicts with the selected year for the student filter
        const setYear = newSearchParams.get("osocYear");
        if (setYear !== null) {
            newSearchParams.set("osocYearProject", setYear);
        }

        // get the current active search parameters, we'll update this value
        const updatedSearchParams = new URLSearchParams(window.location.search);
        // overwrite the values that are present in the new and old parameters
        newSearchParams.forEach((value, key) => {
            updatedSearchParams.set(key, value);
        });

        const projectFilterKeys = new Set([
            "projectYearFilter",
            "projectNameSort",
            "projectNameFilter",
            "clientNameSort",
            "clientNameFilter",
            "fullyAssignedFilter",
        ]);
        // delete the values that are not present anymore in the new filter and are project related
        updatedSearchParams.forEach((_, key) => {
            if (!newSearchParams.has(key) && projectFilterKeys.has(key)) {
                updatedSearchParams.delete(key);
            }
        });

        router
            .push(
                `${window.location.pathname}?${updatedSearchParams.toString()}`
            )
            .then(() => window.scrollTo(0, scrollPosition));
    };

    const navigator = (page: number) => {
        if (params !== undefined) {
            search(params, page).then();
        }
    };

    return (
        <div className={styles.projects}>
            <button
                onClick={() => {
                    router.push("/projects/create").then();
                }}
            >
                Add Project
            </button>
            <ProjectFilter
                searchManual={filterManual}
                searchAutomatic={filterAutomatic}
            />
            <div className={scrollStyles.scrollView}>
                <div className={scrollStyles.topShadowCaster} />
                <div className={styles.projectCards}>
                    {projects.map((project) => {
                        return (
                            <div key={project.id} className={styles.card}>
                                <ProjectCard
                                    updateProject={() => {
                                        if (params !== undefined) {
                                            search(
                                                params,
                                                pagination.page
                                            ).then();
                                        }
                                    }}
                                    project={project}
                                />
                            </div>
                        );
                    })}
                </div>
                <div className={scrollStyles.bottomShadowCaster} />
            </div>
            <Paginator
                pageSize={pageSize}
                pagination={pagination}
                navigator={navigator}
            />
        </div>
    );
};
