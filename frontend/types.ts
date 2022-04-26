/**
 * File to store all types, interfaces, enums... that are used across multiple files
 */

export enum Sort {
    ASCENDING = "asc",
    DESCENDING = "desc",
    NONE = "",
}

export enum FilterBoolean {
    TRUE = "true",
    FALSE = "false",
    NONE = "",
}

export const getNextFilterBoolean = (bool: FilterBoolean) => {
    if (bool == FilterBoolean.TRUE) {
        return FilterBoolean.FALSE;
    }

    if (bool == FilterBoolean.FALSE) {
        return FilterBoolean.NONE;
    }

    return FilterBoolean.TRUE;
};

export const getNextStatusNoPending = (accountStatus: AccountStatus) => {
    if (accountStatus === AccountStatus.ACTIVATED) {
        return AccountStatus.DISABLED;
    } else if (accountStatus === AccountStatus.DISABLED) {
        return AccountStatus.NONE;
    }
    return AccountStatus.ACTIVATED;
};

/**
 * An enum for an user account status
 */
export enum AccountStatus {
    ACTIVATED = "ACTIVATED",
    PENDING = "PENDING",
    DISABLED = "DISABLED",
    NONE = "",
}

/**
 * A function that helps cycling through sorting methods
 * @param sort
 */
export const getNextSort = (sort: Sort) => {
    if (sort == Sort.ASCENDING) {
        return Sort.DESCENDING;
    }

    if (sort == Sort.DESCENDING) {
        return Sort.NONE;
    }

    return Sort.ASCENDING;
};

export enum Decision {
    YES = "YES",
    MAYBE = "MAYBE",
    NO = "NO",
}

export interface Student {
    evaluations: [
        {
            evaluation: [
                {
                    evaluation_id: number;
                    decision: Decision;
                    motivation: string;
                    is_final: boolean;
                }
            ];
            osoc: {
                year: number;
            };
        }
    ];

    jobApplication: {
        applied_role: [
            {
                job_application_id: number;
                applied_role_id: number;
                role_id: number;
            }
        ];
        attachment: [
            {
                job_application_id: number;
                attachment_id: number;
                data: string;
                type: string; // TODO -- possibly an enum
            }
        ];
        created_at: Date;
        edu_duration: string;
        edu_institute: string;
        edu_level: string;
        edu_year: string;
        edus: [string];
        email_status: string; // TODO -- make an enum, i don't know the exact values
        fun_fact: string;
        job_application_id: number;
        job_application_skill: [
            {
                is_best: boolean;
                is_preferred: boolean;
                job_application_id: number;
                job_application_skill_id: number;
                language_id: number;
                level: number;
                skill: string;
            }
        ];
        osoc_id: number;
        responsibilities: string;
        student_coach: boolean;
        student_id: number;
        student_volunteer_info: string;
    };
    roles: [string];

    student: {
        alumni: boolean;
        gender: string;
        nickname: string;
        person: {
            person_id: number;
            email: string;
            firstname: string;
            lastname: string;
            github: string;
        };
        person_id: number;
        phone_number: string;
        pronouns: [string];
        student_id: number;
    };
}

export interface LoginUser {
    person: {
        person_id: number;
        email: string;
        firstname: string;
        lastname: string;
        github: string;
    };
    login_user_id: number;
    person_id: number;
    is_admin: boolean;
    is_coach: boolean;
    password: string;
    account_status: AccountStatus;
}

export interface Role {
    role_id: number;
    name: string;
}

/**
 * types for socket.io when sending something from the server to the client
 */
export interface ServerToClientEvents {
    loginUserUpdated: () => void;
}

/**
 * types for socket.io when sending something from the client to the server
 */
export interface ClientToServerEvents {
    updateUser: (loginUserId: number) => void;
}
