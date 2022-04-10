/**
 * File to store all types, interfaces, enums... that are used across multiple files
 */

export enum Sort {
    ASCENDING = "asc",
    DESCENDING = "desc",
    NONE = ""
}

/**
 * An enum for an user account status
 */
export enum AccountStatus {
    ACTIVATED = "ACTIVATED",
    PENDING = "PENDING",
    DISABLED = "DISABLED"
}
/**
 * A function that helps cycling through sorting methods
 * @param sort
 */
export const getNextSort = (sort: Sort) => {
    if (sort == Sort.ASCENDING) {
        return Sort.DESCENDING
    }

    if (sort == Sort.DESCENDING) {
        return Sort.NONE
    }

    return Sort.ASCENDING
}
