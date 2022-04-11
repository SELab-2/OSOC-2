/**
 * This file contains every interface and type that is used across multiple files.
 */

export enum Decision {
    YES = "YES",
    MAYBE = "MAYBE",
    NO = "NO"
}

export enum AccountStatus {
    ACTIVATED = "ACTIVATED",
    PENDING = "PENDING",
    NO = "NO"
}

export interface Student {
    evaluations: [{
        evaluation: [{
            evaluation_id: number;
            decision: Decision;
            motivation: string;
            is_final: boolean;
        }];
        osoc: {
            year: number;
        };
    }];

    jobApplication: {
        applied_role: [{
            job_application_id: number;
            applied_role_id: number;
            role_id: number;
        }];
        attachment: [{
            job_application_id: number;
            attachment_id: number;
            data: string;
            type: string; // TODO -- possibly an enum
        }];
        created_at: Date;
        edu_duration: number;
        edu_institute: string;
        edu_level: string;
        edu_year: number;
        edus: [string];
        email_status: string; // TODO -- make an enum, i don't know the exact values
        fun_fact: string;
        job_application_id: number;
        job_application_skill: [{
            is_best: boolean;
            is_preferred: boolean;
            job_application_id: number;
            job_application_skill_id: number;
            language_id: number;
            level: number;
            skill: string;
        }];
        osoc_id: number;
        responsibilities: string;
        student_coach: boolean;
        student_id: number;
        student_volunteer_info: string;
    };

    languages: [string];
    roles: [string];

    student: {
        alumni: boolean;
        gender: string;
        nickname: string;
        person: {
            person_id: number,
            email: string,
            firstname: string;
            lastname: string;
            github: string
        };
        person_id: number;
        phone_number: string;
        pronouns: [string];
        student_id: number;
    };
}

export interface Loginuser {
    login_user: {
        person: {
            person_id: number,
            email: string,
            firstname: string;
            lastname: string;
            github: string
        };
        login_user_id: number,
        person_id: number,
        is_admin: boolean,
        is_coach: boolean,
        account_status: AccountStatus
    }
}
