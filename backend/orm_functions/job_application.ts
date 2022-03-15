import { email_status_enum } from "@prisma/client";
import prisma from "../prisma/prisma";
import { CreateJobApplication } from "./orm_types";

/**
 * 
 * @param studentId: the student who's evaluations we are looking for (final and temporary evaluations)
 * @returns al the evaluations associated with this student together with the osoc year
 */
 export async function getStudentEvaluationsTotal(studentId: number) {
    const result = await prisma.job_application.findMany({
        where: {
            student_id: studentId
        },
        select : {
            osoc: {
                select: {
                    year: true,
                }
            },
            evaluation: {
                select: {
                    decision: true,
                    motivation: true,
                }
            }
        }
    });
    return result;
}

/**
 * 
 * @param studentId: the student who's evaluations we are looking for, but only final decisions
 * @returns al the evaluations associated with this student together with the osoc year
 */
export async function getStudentEvaluationsFinal(studentId: number) {
    const result = await prisma.job_application.findMany({
        where: {
            student_id: studentId
        },
        select : {
            osoc: {
                select: {
                    year: true,
                }
            },
            evaluation: {
                where:  {
                    is_final: true,
                },
                select: {
                    decision: true,
                    motivation: true,
                }
            }
        }
    });
    return result;
}

/**
 * 
 * @param studentId: the student who's evaluations we are looking for, but only temporary decisions
 * @returns al the evaluations associated with this student together with the osoc year
 */
export async function getStudentEvaluationsTemp(studentId: number) {
    const result = await prisma.job_application.findMany({
        where: {
            student_id: studentId
        },
        select : {
            osoc: {
                select: {
                    year: true,
                }
            },
            evaluation: {
                where:  {
                    is_final: false,
                },
                select: {
                    decision: true,
                    motivation: true,
                }
            }
        }
    });
    return result;
}

/**
 * removes all job applications from a given student
 * 
 * @param studentId: the student who's applications will be deleted
 * @returns the number of deleted job applications {count: number}
 */
 export async function deleteJobApplicationsFromStudent(studentId: number) {
    const result = await prisma.job_application.deleteMany({
        where: {
            student_id: studentId
        }
    });
    return result;
}

/**
 * change the email status of a given job application
 * 
 * @param jobApplicationId: the application who's email status we want to change
 * @param emailStatus: the new email status
 * @returns: the updated database record
 */
export async function changeEmailStatusOfJobApplication(jobApplicationId: number, emailStatus: email_status_enum) {
    const result = await prisma.job_application.update({
        where: {
            job_application_id: jobApplicationId
        },
        data: {
            email_status: emailStatus
        }
    });
    return result;
}

/**
 * remove a specific job application
 * 
 * @param jobApplicationId: the id of the job application we want to remove
 * @returns the removed job application
 */
export async function deleteJobApplication(jobApplicationId: number) {
    const result = await prisma.job_application.delete({
        where: {
            job_application_id: jobApplicationId,
        }
    });
    return result;
}


/**
 * 
 * @param jobApplication: CreateJobApplicationObject that contains all the information about the job application
 */
export async function createJobApplication(jobApplication: CreateJobApplication) {
    
    const result = await prisma.job_application.create({
        data: {
            student_id: jobApplication.studentId,
            motivation: jobApplication.motivation,
            responsibilities: jobApplication.responsibilities,
            fun_fact: jobApplication.funFact,
            is_volunteer: jobApplication.isVolunteer,
            student_coach: jobApplication.studentCoach,
            osoc_id: jobApplication.osocId,
            edus: jobApplication.edus,
            edu_level: jobApplication.eduLevel,
            edu_duration: jobApplication.eduDuration,
            edu_year: jobApplication.eduYear,
            edu_institute: jobApplication.eduInstitute,
            email_status: jobApplication.emailStatus,
            created_at: jobApplication.created_at
        }
    });
    return result;
}

/**
 * 
 * @param studentId: the student who's job applications we are looking for
 * @returns the found job applications of the given student
 */
export async function getLatestJobApplicationOfStudent(studentId: number) {
    const result = await prisma.job_application.findFirst({
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
    return result;
}


/**
 * 
 * @param jobApplicationId: the job application we are looking for
 * @returns the found job application
 */
export async function getJobApplication(jobApplicationId: number) {
    const result = await prisma.job_application.findUnique({
        where: {
            job_application_id: jobApplicationId,
        },
        include: {
            attachment: true,
            job_application_skill: true,
            applied_role: true
        }
    });
    return result;
}

/**
 * 
 * @param year: the year that we are looking up all the job applications for
 * @returns all the job applications associated with the given year
 */
 export async function getJobApplicationByYear(year:number) {
    const result = await prisma.job_application.findMany({
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
    return result;
}


