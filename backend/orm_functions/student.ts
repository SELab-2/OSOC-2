import { email_status_enum, type_enum } from '@prisma/client';
import { prisma } from '../prisma/prisma'
import {CreateStudent, CreateEvaluationForStudent, UpdateStudent, UpdateEvaluationForStudent, CreateContract, UpdateContract } from './orm_types';

// TODO: how do we make sure there is no student for this person_id yet?
/**
 * 
 * @param student: student object with the needed information
 */
export async function createStudent(student: CreateStudent) {
    const result = prisma.student.create({
        data: {
            person_id: student.personId,
            pronouns: student.pronouns,
            phone_number: student.phoneNumber,
            nickname: student.nickname,
            alumni: student.alumni,
        }
    });
    return result;
} 

/**
 * 
 * @returns a list of all the student objects in the database together with their personal info
 */
export async function getAllStudents() {
    const result = await prisma.student.findMany({
         include : {
             person: true,
         }
    });
    return result
}

/**
 * 
 * @param studentId: this is the id of the student we are looking up in the database
 * @returns: object with all the info about this student together with their personal info
 */
export async function getStudent(studentId: number) {
    const result = await prisma.student.findUnique({
        where: {
            student_id: studentId,
        },
        include: {
            person: true,
        }
    });
    return result;
}

/**
 * 
 * @param student: UpdateStudent object with the values that need to be updated
 * @returns the updated entry in the database 
 */
export async function updateStudent(student: UpdateStudent) {
    const result = await prisma.student.update({
        where: {
            student_id: student.studentId,
        },
        data: {
            pronouns: student.pronouns,
            phone_number: student.phoneNumber,
            nickname: student.nickname,
            alumni: student.alumni,
        }
    });
    return result;
}

/**
 * 
 * @param studentId the student who's info we are deleting from the student-table
 * @returns personal info about the student, this info can be used to further remove the personal info about this student in other tables
 */
export async function deleteStudent(studentId: number) {
    const result = await prisma.student.delete({
        where: {
            student_id: studentId,
        },
        include: { // returns the person info of the removed student, can later be used to also remove everything from this person?
            person: true
        }
    });
    return result;
}

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
 * helper function of createEvaluationForStudent
 * 
 * @param jobApplicationId: the jobApplicationId we are checking for if there is already a final evaluation
 * @returns the found evaluation or throws an error if no evaluation found.
 */
async function checkIfFinalEvaluationExists(jobApplicationId: number) {
    const result = await prisma.evaluation.findFirst({
        where: {
            job_application_id: jobApplicationId,
            is_final: true,
        },
        select: {
            evaluation_id: true,
        },
        rejectOnNotFound: true,
    });
    return result;
}

// TODO: check if this really works?
/**
 * 
 * @param evaluation: this has an object that contains all the information for a new evaluation.
 *  however if the evaluation is final AND there is already another evaluation, then we modify this earlier "final" decision
 * @returns a promise with the created evaluation
 */
export async function createEvaluationForStudent(evaluation: CreateEvaluationForStudent) {
    
    return await checkIfFinalEvaluationExists(evaluation.jobApplicationId)
        .then((value: { evaluation_id: number; }) => {
            return updateEvaluationForStudent({
                evaluation_id: value.evaluation_id,
                loginUserId: evaluation.loginUserId,
                decision: evaluation.decision,
                motivation: evaluation.motivation
            })
        }).catch(() => {
            return prisma.evaluation.create({
                data: {
                    login_user_id: evaluation.loginUserId,
                    job_application_id: evaluation.jobApplicationId,
                    decision: evaluation.decision,
                    motivation: evaluation.motivation,
                    is_final: evaluation.isFinal
                }
            });
        });
}

/**
 * 
 * @param evaluation: the updated evaluation. This evaluation only contains some field because we don't want everything changeable.
 * @returns the updated evaluation.
 */
export async function updateEvaluationForStudent(evaluation:UpdateEvaluationForStudent) {
    const result = await prisma.evaluation.update({
        where: {
            evaluation_id: evaluation.evaluation_id,
        },
        data: {
            login_user_id: evaluation.loginUserId,
            decision: evaluation.decision,
            motivation: evaluation.motivation,
        }
    });
    return result;
}

/**
 * add contract created by login_user_id for student_id that has the role project_role_id
 * 
 * @param contract: CreateContract object with all the info about the contract we want to create (who made the contract for which student for which job)
 * @returns created contract object in the database
 */
export async function createContract(contract: CreateContract) {
    const result = await prisma.contract.create({
        data: {
            student_id: contract.studentId,
            project_role_id: contract.projectRoleId,
            information: contract.information,
            created_by_login_user_id: contract.loginUserId,
            contract_status: contract.contractStatus,
        }
    });
    return result;
}

/**
 * add contract created by login_user_id for student_id that has the role project_role_id
 * 
 * @param contract: the updated contract. Only the information and contractStatus field can be changed.
 * The created_by_login_user_id is updated to the user that made these last changes
 * @returns the updated contract
 */
export async function updateContract(contract: UpdateContract) {
    const result = await prisma.contract.update({
        where: {
            contract_id: contract.contractId
        },
        data: {
            created_by_login_user_id: contract.loginUserId,
            contract_status: contract.contractStatus,
            information: contract.information
        }
    });
    return result;
}

/**
 * remove all the contracts associated with studentId
 * 
 * @param studentId: the id of the student who's contracts we are removing
 * @returns the number of removed contracts {count: number}
 */ 
export async function removeContractsFromStudent(studentId: number) {
    const result = await prisma.contract.deleteMany({
        where: {
            student_id: studentId
        }
    });
    return result;
}

/**
 * remove the contract with contractId 
 * 
 * @param contractId: the id of the contract we are removing
 * @returns the removed contract
 */ 
export async function removeContract(contractId: number) {
    const result = await prisma.contract.delete({
        where: {
            contract_id: contractId
        }
    });
    return result;
}

/**
 * create an attachment for job_application_id
 * 
 * @param job_application_id: the application to which this attachment belongs
 * @param url: url where we can find this attachment back
 * @param type: the type of the attachment (CV, PORTFOLIO, FILE)
 * @returns the created attachment
 */
export async function createAttachment(job_application_id: number, url: string, type: type_enum) {
    const result = await prisma.attachment.create({
        data: {
            job_application_id: job_application_id,
            url: url,
            type: type
        }
    });
    return result;
}

/**
 * 
 * @param attachmentId: the attachment we are going to remove
 * @returns the removed entry in the database
 */
export async function deleteAttachment(attachmentId:number) {
    const result = await prisma.attachment.delete({
        where: {
            attachment_id: attachmentId
        }
    });
    return result;
}


/**
 * removes all attachments associated with given application
 * 
 * @param jobApplicationId: the attachments that belong to this job_application are going to be removed
 * @returns the number of removed attachments {count: number}
 */
export async function deleteAllAttachmentsForApplication(jobApplicationId:number) {
    const result = await prisma.attachment.deleteMany({
        where: {
            job_application_id: jobApplicationId
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