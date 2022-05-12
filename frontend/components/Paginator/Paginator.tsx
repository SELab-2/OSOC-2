import { pageSize, Pagination } from "../../types";
import React from "react";

export const Paginator: React.FC<{
    pagination: Pagination;
    navigator: (page: number) => void;
}> = ({ pagination, navigator }) => {
    const paginator = [];
    const pages = pagination.count / pageSize;
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

    return (
        <nav className="pagination" role="navigation" aria-label="pagination">
            <ul className="pagination-list">{paginator}</ul>
        </nav>
    );
};
