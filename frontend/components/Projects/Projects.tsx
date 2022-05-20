import React, { useContext, useState } from "react";
import { useRouter } from "next/router";
import SessionContext from "../../contexts/sessionProvider";
import { Pagination, Project, ProjectFilterParams, Sort } from "../../types";
import { ProjectCard } from "../ProjectCard/ProjectCard";
import styles from "./Projects.module.scss";
import scrollStyles from "../ScrollView.module.scss";
import { ProjectFilter } from "../Filters/ProjectFilter";
import { Paginator } from "../Paginator/Paginator";

/**
 * Projects page with project filter included
 * @constructor
 */
export const Projects: React.FC = () => {
    const router = useRouter();
    const { getSession } = useContext(SessionContext);
    const [projects, setProjects] = useState<Project[]>([]);

    const [params, setParams] = useState<ProjectFilterParams>();
    const [pagination, setPagination] = useState<Pagination>({
        page: 0,
        count: 0,
    });

    const [loading, isLoading] = useState(false);
    const pageSize = 5;

    /**
     * Called by the studentfilter to filter
     * Resets the pagination
     * @param params
     */
    const filter = async (params: ProjectFilterParams) => {
        setParams(params);
        search(params, 0).then();
    };

    /**
     * Search function that uses the current pagination
     * @param params
     * @param page
     */
    const search = async (params: ProjectFilterParams, page: number) => {
        if (loading) return;
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
            <ProjectFilter search={filter} />
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
