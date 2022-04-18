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
    DISABLED = "DISABLED"
}

export interface Student {
    evaluations: [{
        evaluation: [{
            evaluation_id: number,
            decision: Decision,
            motivation: string,
            is_final: boolean,
        }],
        osoc: {
            year: number,
        },
    }],

    jobApplication: {
        applied_role: [{
            job_application_id: number,
            applied_role_id: number,
            role_id: number,
        }],
        attachment: [{
            job_application_id: number,
            attachment_id: number,
            data: string,
            type: string, // TODO -- possibly an enum
        }],
        created_at: Date,
        edu_duration: string,
        edu_institute: string,
        edu_level: string,
        edu_year: string,
        edus: [string],
        email_status: string, // TODO -- make an enum, i don't know the exact values
        fun_fact: string,
        job_application_id: number,
        job_application_skill: [{
            is_best: boolean,
            is_preferred: boolean,
            job_application_id: number,
            job_application_skill_id: number,
            language_id: number,
            level: number,
            skill: string,
        }],
        osoc_id: number,
        responsibilities: string,
        student_coach: boolean,
        student_id: number,
        student_volunteer_info: string,
    },
    roles: [string],

    student: {
        alumni: boolean,
        gender: string,
        nickname: string,
        person: {
            person_id: number,
            email: string,
            firstname: string,
            lastname: string,
            github: string
        },
        person_id: number,
        phone_number: string,
        pronouns: [string],
        student_id: number,
    }
}
