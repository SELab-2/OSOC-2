/**
 * This file contains every interface and type that is used across multiple files.
 */

export enum Decision {
    "YES", "MAYBE", "NO"
}

export interface Student {
    person: {
        person_id: number,
        email: string,
        firstname: string;
        lastname: string;
        github: string
    };

    student_id: number;
    gender: string;
    pronouns: [string];
    phone_number: string;
    nickname: string;
    alumni: boolean;
    languages: [string];

    evaluations: [{
        evaluation: {
            evaluation_id: number;
            decision: Decision;
            motivation: string;
            is_final: boolean;
        };
        osoc: [{
            year: number;
        }]

    }];

    jobApplication: {
        job_application_id: number;
        edus: [string];
        created_at: Date;
        edu_duration: number;
        edu_institute: string;
        edu_level: string;
        edu_year: number;
        email_status: string; // TODO -- make an enum, i don't know the exact values
        fun_fact: string;
        osoc_id: number;
        responsibilities: string;
        student_coach: boolean;
        student_id: number;
        student_volunteer_info: string;
        attackment: [{
            job_application_id: number;
            attachment_id: number;
            data: string;
            type: string; // TODO -- possibly an enum
        }];

        job_application_skill: [{
            job_application_id: number;
            job_application_skill_id: number;
            skill: string;
            is_best: boolean;
            language_id: number;
            is_preferred: boolean;
            level: number;
        }];

        applied_role: [{
            job_application_id: number;
            applied_role_id: number;
            role_id: number;
        }]
    };
}

export interface Role {
    role_id: number;
    name: string;
}
