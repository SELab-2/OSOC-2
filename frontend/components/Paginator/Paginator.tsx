import { pageSize, Pagination } from "../../types";
import React from "react";
import styles from "./Paginator.module.scss";

export const Paginator: React.FC<{
    pagination: Pagination;
    navigator: (page: number) => void;
}> = ({ pagination, navigator }) => {
    const paginator = [];
    const pages = Math.ceil(pagination.count / pageSize);
    for (let i = 0; i < pages; i++) {
        paginator.push(
            <li key={i}>
                <a
                    onClick={() => navigator(i)}
                    className={`pagination-link ${
                        i === pagination.page ? "is-current" : ""
                    }`}
                >
                    {i + 1}
                </a>
            </li>
        );
    }

    const previousPage = () => {
        if (pagination.page === 0) return;
        navigator(pagination.page - 1);
    };

    const nextPage = () => {
        if (pagination.page === pages - 1) return;
        navigator(pagination.page + 1);
    };

    return (
        <nav
            className={`is-centered pagination ${styles.pagination}`}
            role="navigation"
            aria-label="pagination"
        >
            <a
                onClick={previousPage}
                className={`pagination-previous ${
                    pagination.page === 0 ? "is-disabled" : ""
                }`}
                title="This is the first page"
            >
                Previous
            </a>
            <ul className="pagination-list">{paginator}</ul>
            <a
                onClick={nextPage}
                className={`pagination-next ${
                    pagination.page === pages - 1 || pages === 0
                        ? "is-disabled"
                        : ""
                }`}
            >
                Next page
            </a>
        </nav>
    );
};
