import { decision_enum } from '@prisma/client';
import { prisma } from '../prisma/prisma'

// TODO: how do we make sure there is no student for this person_id yet?
// creates a student
export async function create_student(person_id: number, pronouns: string[], phone_number: string, nickname: string | null, alumni: boolean) {
    const result = prisma.student.create({
        data: {
            person_id: person_id,
            pronouns: pronouns,
            phone_number: phone_number,
            nickname: nickname,
            alumni: alumni,
        }
    });
    return result;
} 

// returns all the students in the database (together with their person_info)
export async function get_all_students() {
    const result = await prisma.student.findMany({
         include : {
             person: true,
         }
    });
    return result
}

// returns all info about the student with the given id
export async function get_student(student_id: number) {
    const result = prisma.student.findUnique({
        where: {
            student_id: student_id,
        },
        include: {
            person: true,
        }
    });
    return result;
}

// updates the info of the student with the given student_id
export async function update_student(student_id: number, pronouns: string[], phone_number: string, nickname: string | null, alumni: boolean) {
    const result = prisma.student.update({
        where: {
            student_id: student_id,
        },
        data: {
            pronouns: pronouns,
            phone_number: phone_number,
            nickname: nickname,
            alumni: alumni,
        }
    });
    return result;
}

// deletes the student-information of the student with the given id
export async function delete_student(student_id: number) {
    const result = prisma.student.delete({
        where: {
            student_id: student_id,
        },
        include: { // returns the person info of the removed student, can later be used to also remove everything from this person?
            person: true
        }
    });
    return result;
}

// returns all the suggestions
export async function get_student_suggestions_total(student_id: number) {
    const result = prisma.job_application.findMany({
        where: {
            student_id: student_id
        },
        select : {
            osoc_id: true,
            job_application_id: true,
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

// returns all the final suggestions
export async function get_student_suggestions_final(student_id: number) {
    const result = prisma.job_application.findMany({
        where: {
            student_id: student_id
        },
        select : {
            osoc_id: true,
            job_application_id: true,
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

// returns all the temporary suggestions
export async function get_student_suggestions_temp(student_id: number) {
    const result = prisma.job_application.findMany({
        where: {
            student_id: student_id
        },
        select : {
            osoc_id: true,
            job_application_id: true,
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

// overwrites the old decision if needed, otherwise creates a new evaluation/suggestion
export async function create_suggestion_for_student(evaluation_exists: boolean, evaluation_id: number,
        login_user_id: number, job_application_id: number, decision: decision_enum, motivation: string | null,
        is_final: boolean) {
        
    const data = {
        login_user_id: login_user_id,
        job_application_id: job_application_id,
        decision: decision,
        motivation: motivation,
        is_final: is_final,
    }

    let result;

    if (evaluation_exists) {
        result = prisma.evaluation.update({
            where : {
                evaluation_id: evaluation_id,
            },
            data: data
        });
    } else {
        result = prisma.evaluation.create({
            data: data
        });
    }
    return result;
}



