import { EmailStatus, Student } from "./types";

export const defaultUser: Student = {
    evaluation: {
        evaluations: [],
        osoc: {
            year: -1,
        },
    },

    jobApplication: {
        applied_role: [
            {
                job_application_id: -1,
                applied_role_id: -1,
                role_id: -1,
            },
        ],
        attachment: [],
        created_at: new Date(),
        edu_duration: "",
        edu_institute: "",
        edu_level: "",
        edu_year: "",
        edus: [],
        email_status: EmailStatus.NONE,
        fun_fact: "",
        job_application_id: -1,
        job_application_skill: [],
        osoc_id: -1,
        responsibilities: "",
        student_coach: false,
        student_id: -1,
        student_volunteer_info: "",
    },
    roles: [""],

    student: {
        alumni: false,
        gender: "",
        nickname: "",
        person: {
            person_id: -1,
            email: "",
            name: "<<DELETED>>",
            github: "",
            github_id: "",
        },
        person_id: -1,
        phone_number: "",
        pronouns: "",
        student_id: -1,
    },
};
