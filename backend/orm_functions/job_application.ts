import {email_status_enum} from "@prisma/client";
import prisma from "../prisma/prisma";
import {CreateJobApplication} from "./orm_types";

/**
 * 
 * @param studentId: the student who's evaluations we are looking for (final and temporary evaluations)
 * @returns al the evaluations associated with this student together with the osoc year
 */
 export async function getStudentEvaluationsTotal(studentId: number) {
    return await prisma.job_application.findMany({
        where: {
            student_id: studentId
        },
        select: {
            osoc: {
                select: {
                    year: true,
                }
            },
            evaluation: {
                select: {
                    decision: true,
                    motivation: true,
                    evaluation_id: true,
                    is_final: true
                }
            }
        }
    });
}

/**
 * 
 * @param studentId: the student who's evaluations we are looking for, but only final decisions
 * @returns al the evaluations associated with this student together with the osoc year
 */
export async function getStudentEvaluationsFinal(studentId: number) {
    return await prisma.job_application.findMany({
        where: {
            student_id: studentId
        },
        select: {
            osoc: {
                select: {
                    year: true,
                }
            },
            evaluation: {
                where: {
                    is_final: true,
                },
                select: {
                    decision: true,
                    motivation: true,
                    evaluation_id: true,
                }
            }
        }
    });
}

/**
 * 
 * @param studentId: the student who's evaluations we are looking for, but only temporary decisions
 * @returns al the evaluations associated with this student together with the osoc year
 */
export async function getStudentEvaluationsTemp(studentId: number) {
    return await prisma.job_application.findMany({
        where: {
            student_id: studentId
        },
        select: {
            osoc: {
                select: {
                    year: true,
                }
            },
            evaluation: {
                where: {
                    is_final: false,
                },
                select: {
                    decision: true,
                    motivation: true,
                    evaluation_id: true,
                }
            }
        }
    });
}

/**
 *
 * @param studentId: the id of the student who's selected roles we are searching from his most recent job application
 * @return the list of selected roles in the application (if it exists)
 */
export async function getLatestApplicationRolesForStudent(studentId: number) {
    return await prisma.job_application.findFirst({
        where: {
            student_id: studentId
        },
        orderBy: { // use descending order in combination with findFirst to search further for the applied roles in the latest application
            created_at: "desc"
        },
        select: {
            applied_role: {
                select: {
                    role_id: true
                }
            }
        }
    });
}

/**
 * removes all job applications from a given student
 * 
 * @param studentId: the student whose applications will be deleted
 * @returns the number of deleted job applications {count: number}
 */
 export async function deleteJobApplicationsFromStudent(studentId: number) {
    return await prisma.job_application.deleteMany({
        where: {
            student_id: studentId
        }
    });
}

/**
 * change the email status of a given job application
 * 
 * @param jobApplicationId: the application whose email status we want to change
 * @param emailStatus: the new email status
 * @returns: the updated database record
 */
export async function changeEmailStatusOfJobApplication(jobApplicationId: number, emailStatus: email_status_enum) {
    return await prisma.job_application.update({
        where: {
            job_application_id: jobApplicationId
        },
        data: {
            email_status: emailStatus
        }
    });
}

/**
 * remove a specific job application
 * 
 * @param jobApplicationId: the id of the job application we want to remove
 * @returns the removed job application
 */
export async function deleteJobApplication(jobApplicationId: number) {
    return await prisma.job_application.delete({
        where: {
            job_application_id: jobApplicationId,
        }
    });
}


/**
 * 
 * @param jobApplication: CreateJobApplicationObject that contains all the information about the job application
 */
export async function createJobApplication(jobApplication: CreateJobApplication) {

    return await prisma.job_application.create({
        data: {
            student_id: jobApplication.studentId,
            responsibilities: jobApplication.responsibilities,
            fun_fact: jobApplication.funFact,
            student_volunteer_info: jobApplication.studentVolunteerInfo,
            student_coach: jobApplication.studentCoach,
            osoc_id: jobApplication.osocId,
            edus: jobApplication.edus,
            edu_level: jobApplication.eduLevel,
            edu_duration: jobApplication.eduDuration,
            edu_year: jobApplication.eduYear,
            edu_institute: jobApplication.eduInstitute,
            email_status: jobApplication.emailStatus,
            created_at: new Date(jobApplication.createdAt)
        }
    });
}

/**
 * 
 * @param studentId: the student whose job applications we are looking for
 * @returns the found job applications of the given student
 */
export async function getLatestJobApplicationOfStudent(studentId: number) {
    return await prisma.job_application.findFirst({
        where: {
            student_id: studentId
        },
        orderBy: { // order descending == get newest first
            created_at: 'desc'
        },
        include: {
            attachment: true,
            job_application_skill: true,
            applied_role: true
        }
    });
}


/**
 * 
 * @param jobApplicationId: the job application we are looking for
 * @returns the found job application
 */
export async function getJobApplication(jobApplicationId: number) {
    return await prisma.job_application.findUnique({
        where: {
            job_application_id: jobApplicationId,
        },
        include: {
            attachment: true,
            job_application_skill: true,
            applied_role: true
        }
    });
}

/**
 * 
 * @param year: the year that we are looking up all the job applications for
 * @returns all the job applications associated with the given year
 */
 export async function getJobApplicationByYear(year:number) {
    return await prisma.job_application.findMany({
        where: {
            osoc: {
                year: year
            }
        },
        include: {
            attachment: true,
            job_application_skill: true,
            applied_role: true
        }
    });
}


