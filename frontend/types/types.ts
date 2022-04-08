/**
 * File to store all types, interfaces, enums... that are used across multiple files
 */

export enum Sort {
    Ascending = "asc",
    Descending = "desc",
    None = ""
}

/**
 * A function that helps cycling through sorting methods
 * @param sort
 */
export const getNextSort = (sort: Sort) => {
    if (sort == Sort.Ascending) {
        return Sort.Descending
    }

    if (sort == Sort.Descending) {
        return Sort.None
    }

    return Sort.Ascending
}
