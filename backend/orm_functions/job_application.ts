import { email_status_enum } from "@prisma/client";
import { prisma } from "../prisma/prisma";

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
 * @param studentId: the student who's evalutions we are looking for, but only temporary decisions
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
 * @param job_application_id: the application who's email status we want to change
 * @param email_status: the new email status
 * @returns: the updated database record
 */
export async function changeEmailStatusOfJobApplication(job_application_id: number, email_status: email_status_enum) {
    const result = await prisma.job_application.update({
        where: {
            job_application_id: job_application_id
        },
        data: {
            email_status: email_status
        }
    });
    return result;
}

// TODO: create add_job_application (but shouldn't we use some kind of object-type and not an argument per type for this?...)