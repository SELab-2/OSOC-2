/**
 * File to store all types, interfaces, enums... that are used across multiple files
 */

export enum Display {
    LIMITED,
    FULL,
}

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

export enum EmailStatus {
    NONE = "NONE",
    DRAFT = "DRAFT",
    SENT = "SENT",
    FAILED = "FAILED",
    SCHEDULED = "SCHEDULED",
    EMPTY = "",
}

export enum StudentStatus {
    EMPTY = "",
    YES = "YES",
    MAYBE = "MAYBE",
    NO = "NO",
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

export interface EvaluationCoach {
    evaluation_id: number;
    senderFirstname: string;
    senderLastname: string;
    reason: string;
    decision: Decision;
    isFinal: boolean;
}

export interface Evaluation {
    evaluation_id: number;
    decision: Decision;
    motivation: string;
    is_final: boolean;
}

export enum AttachmentType {
    CV_URL = "CV_URL",
    PORTFOLIO_URL = "PORTFOLIO_URL",
    FILE_URL = "FILE_URL",
    MOTIVATION_STRING = "MOTIVATION_STRING",
    MOTIVATION_URL = "MOTIVATION_URL",
}

export interface Attachment {
    job_application_id: number;
    attachment_id: number;
    data: string;
    type: AttachmentType;
}

export interface Student {
    evaluations: [
        {
            evaluation: [Evaluation];
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
        attachment: [Attachment];
        created_at: Date;
        edu_duration: string;
        edu_institute: string;
        edu_level: string;
        edu_year: string;
        edus: [string];
        email_status: EmailStatus;
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
        github_id: number;
    };
    login_user_id: number;
    person_id: number;
    is_admin: boolean;
    is_coach: boolean;
    account_status: AccountStatus;
}

export interface OsocEdition {
    osoc_id: number;
    year: number;
    _count: ProjectCount;
}

export interface ProjectCount {
    project: number;
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
    loginUserActivated: () => void;
    loginUserDisabled: () => void;
}

/**
 * types for socket.io when sending something from the client to the server
 */
export interface ClientToServerEvents {
    updateRoleUser: () => void;
    activateUser: () => void;
    disableUser: () => void;
}
