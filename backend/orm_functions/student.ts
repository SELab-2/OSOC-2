import prisma from '../prisma/prisma'
import {CreateStudent, UpdateStudent} from './orm_types';

// TODO: how do we make sure there is no student for this person_id yet?
/**
 * 
 * @param student: student object with the needed information
 */
export async function createStudent(student: CreateStudent) {
    return prisma.student.create({
        data: {
            person_id: student.personId,
            gender: student.gender,
            pronouns: student.pronouns,
            phone_number: student.phoneNumber,
            nickname: student.nickname,
            alumni: student.alumni,
        }
    });
} 

/**
 * 
 * @returns a list of all the student objects in the database together with their personal info
 */
export async function getAllStudents() {
    return await prisma.student.findMany({
        include: {
            person: true,
        }
    })
}

/**
 * 
 * @param studentId: this is the id of the student we are looking up in the database
 * @returns: object with all the info about this student together with their personal info
 */
export async function getStudent(studentId: number) {
    return await prisma.student.findUnique({
        where: {
            student_id: studentId,
        },
        include: {
            person: true,
        }
    });
}

/**
 * 
 * @param student: UpdateStudent object with the values that need to be updated
 * @returns the updated entry in the database 
 */
export async function updateStudent(student: UpdateStudent) {
    return await prisma.student.update({
        where: {
            student_id: student.studentId,
        },
        data: {
            pronouns: student.pronouns,
            phone_number: student.phoneNumber,
            nickname: student.nickname,
            alumni: student.alumni,
        },
        include: {
            person: true,
        }
    });
}

/**
 * 
 * @param studentId the student who's info we are deleting from the student-table
 * @returns personal info about the student, this info can be used to further remove the personal info about this student in other tables
 */
export async function deleteStudent(studentId: number) {
    return await prisma.student.delete({
        where: {
            student_id: studentId,
        },
        include: { // returns the person info of the removed student, can later be used to also remove everything from this person?
            person: true
        }
    });
}

/**
 *
 * @param gender: This is the gender of the persons we are looking, can be firstname as lastname
 * @returns: a list of all the person objects in the database that match
 */
export async function searchStudentByGender(gender: string){
    return prisma.student.findMany({
        where: {
            gender: gender
        },
        include: {
            person: true,
        }
    });
}
