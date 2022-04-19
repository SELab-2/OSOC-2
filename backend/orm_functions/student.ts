import { decision_enum, email_status_enum } from "@prisma/client";
import prisma from "../prisma/prisma";
import {
    CreateStudent,
    FilterSort,
    FilterString,
    FilterBoolean,
    UpdateStudent,
    FilterStringArray,
} from "./orm_types";

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
        },
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
        },
    });
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
        },
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
            gender: student.gender,
        },
        include: {
            person: true,
        },
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
        include: {
            // returns the person info of the removed student, can later be used to also remove everything from this person?
            person: true,
        },
    });
}

/**
 *
 * @param gender: This is the gender of the persons we are looking, can be firstname as lastname
 * @returns: a list of all the person objects in the database that match
 */
export async function searchStudentByGender(gender: string) {
    return prisma.student.findMany({
        where: {
            gender: gender,
        },
        include: {
            person: true,
        },
    });
}

/**
 *
 * @param firstNameFilter firstname that we are filtering on (or undefined if not filtering on name)
 * @param lastNameFilter firstname that we are filtering on (or undefined if not filtering on name)
 * @param emailFilter email that we are filtering on (or undefined if not filtering on email)
 * @param roleFilterArray role that we are filtering on (or undefined if not filtering on role)
 * @param alumniFilter alumni status that we are filtering on (or undefined if not filtering on alumni status)
 * @param coachFilter coach status that we are filtering on (or undefined if not filtering on coach status)
 * @param statusFilter decision status that we are filtering on (or undefined if not filtering on status)
 * @param emailStatusFilter email status that we are filtering on (or undefined if not filtering on email status)
 * @param osocYear: the osoc year the application belongs to (or undefined if not filtering on year)
 * @param firstNameSort asc or desc if we want to sort on firstname, undefined if we are not sorting on firstname
 * @param lastNameSort asc or desc if we want to sort on lastname, undefined if we are not sorting on lastname
 * @param emailSort asc or desc if we are sorting on email, undefined if we are not sorting on email
 * @param alumniSort asc or desc if we are sorting on alumni status, undefined if we are not sorting on alumni status
 * @returns the filtered students with their person data and other filter fields in a promise
 */
export async function filterStudents(
    firstNameFilter: FilterString,
    lastNameFilter: FilterString,
    emailFilter: FilterString,
    roleFilterArray: FilterStringArray,
    alumniFilter: FilterBoolean,
    coachFilter: FilterBoolean,
    statusFilter: decision_enum | undefined,
    osocYear: number,
    emailStatusFilter: email_status_enum | undefined,
    firstNameSort: FilterSort,
    lastNameSort: FilterSort,
    emailSort: FilterSort,
    alumniSort: FilterSort
) {
    // manually create filter object for evaluation because evaluation doesn't need to exist
    // and then the whole object needs to be undefined
    let evaluationFilter;
    if (statusFilter) {
        evaluationFilter = {
            some: {
                decision: statusFilter,
            },
        };
    } else {
        evaluationFilter = undefined;
    }

    console.log(alumniFilter);
    return await prisma.student.findMany({
        where: {
            job_application: {
                some: {
                    email_status: emailStatusFilter,
                    student_coach: coachFilter,
                    osoc: {
                        year: osocYear,
                    },
                    applied_role: {
                        some: {
                            role: {
                                name: { in: roleFilterArray },
                            },
                        },
                    },
                    evaluation: evaluationFilter,
                },
            },
            person: {
                firstname: {
                    contains: firstNameFilter,
                    mode: "insensitive",
                },
                lastname: {
                    contains: lastNameFilter,
                    mode: "insensitive",
                },
                email: {
                    contains: emailFilter,
                    mode: "insensitive",
                },
            },
            alumni: alumniFilter,
        },
        orderBy: {
            person: {
                firstname: firstNameSort,
                lastname: lastNameSort,
                email: emailSort,
            },
            alumni: alumniSort,
        },
        include: {
            person: true,
            job_application: {
                select: {
                    student_coach: true,
                    applied_role: {
                        include: {
                            role: {
                                select: {
                                    name: true,
                                },
                            },
                        },
                    },
                    evaluation: {
                        select: {
                            decision: true,
                        },
                    },
                },
            },
        },
    });
}
