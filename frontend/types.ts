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

export enum ContractStatus {
    APPROVED = "APPROVED",
    CANCELLED = "CANCELLED",
    DRAFT = "DRAFT",
    SENT = "SENT",
    SIGNED = "SIGNED",
    WAIT_APPROVAL = "WAIT_APPROVAL",
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
    if (sort === Sort.ASCENDING) {
        return Sort.DESCENDING;
    }

    if (sort === Sort.DESCENDING) {
        return Sort.NONE;
    }

    return Sort.ASCENDING;
};

export enum Decision {
    YES = "YES",
    MAYBE = "MAYBE",
    NO = "NO",
}

export interface Evaluation {
    evaluation_id: number;
    decision: Decision;
    motivation: string;
    is_final: boolean;
    login_user: LoginUser;
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
    data: string[];
    type: AttachmentType[];
}

export interface JobApplicationSkill {
    is_best: boolean;
    is_preferred: boolean;
    job_application_id: number;
    job_application_skill_id: number;
    language_id: number;
    level: number;
    skill: string;
}

export interface Student {
    evaluation: {
        evaluations: Evaluation[];
        osoc: {
            year: number;
        };
    };

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
        job_application_skill: [JobApplicationSkill];
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
            name: string;
            github: string;
            github_id: string;
        };
        person_id: number;
        phone_number: string;
        pronouns: string;
        student_id: number;
    };
}

export interface LoginUser {
    person_data: {
        id: number;
        email: string;
        name: string;
        github: string;
    };
    login_user_id: number;
    coach: boolean;
    admin: boolean;
    activated: AccountStatus;
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
    registrationReceived: () => void;
}

/**
 * types for socket.io when sending something from the client to the server
 */
export interface ClientToServerEvents {
    updateRoleUser: () => void;
    activateUser: () => void;
    disableUser: () => void;
    submitRegistration: () => void;
}

export interface ProjectPerson {
    email: string;
    github: string;
    github_id: string;
    person_id: number;
    name: string;
}

export interface ProjectLoginUser {
    login_user: {
        is_admin: boolean;
        is_coach: boolean;
        login_user_id: number;
        person: ProjectPerson;
    };
}

export interface ProjectRole {
    positions: number;
    project_id: number;
    project_role_id: number;
    role_id: number;
    role: {
        name: string;
    };
}

export interface Contract {
    contract_id: number;
    contract_status: string; // TODO: Make ENUM for this
    project_role: ProjectRole;
    students: [Student];
}

export interface Project {
    coaches: [ProjectLoginUser];
    end_date: string;
    id: number;
    name: string;
    osoc_id: number;
    partner: string;
    positions: number;
    start_date: string;
    description: string | null;
    contracts: [Contract];
    roles: [
        {
            name: string;
            positions: number;
        }
    ];
}
