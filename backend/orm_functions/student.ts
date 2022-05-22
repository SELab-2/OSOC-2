import { decision_enum, email_status_enum, Prisma } from "@prisma/client";
import prisma from "../prisma/prisma";
import {
    CreateStudent,
    FilterSort,
    FilterString,
    FilterBoolean,
    UpdateStudent,
    FilterStringArray,
    FilterNumber,
    DBPagination,
} from "./orm_types";
import { getOsocYearsForLoginUser } from "./login_user";
import { deletePersonFromDB } from "./person";
import { Decision } from "../types";

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
 * @param studentId the student whose info we are deleting from the database. all related records are deleted too!
 */
export async function deleteStudentFromDB(studentId: number) {
    // search the student to get the personId
    const student = await prisma.student.findUnique({
        where: {
            student_id: studentId,
        },
    });
    if (student) {
        // call the delete
        await deletePersonFromDB(student.person_id);
    }
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
 * @param pagination object representing the pagination
 * @param nameFilter name that we are filtering on (or undefined if not filtering on name)
 * @param emailFilter email that we are filtering on (or undefined if not filtering on email)
 * @param roleFilterArray role that we are filtering on (or undefined if not filtering on role)
 * @param alumniFilter alumni status that we are filtering on (or undefined if not filtering on alumni status)
 * @param coachFilter coach status that we are filtering on (or undefined if not filtering on coach status)
 * @param statusFilter decision status that we are filtering on (or undefined if not filtering on status)
 * @param emailStatusFilter email status that we are filtering on (or undefined if not filtering on email status)
 * @param osocYear: the osoc year the application belongs to (or undefined if not filtering on year)
 * @param nameSort asc or desc if we want to sort on name, undefined if we are not sorting on name
 * @param emailSort asc or desc if we are sorting on email, undefined if we are not sorting on email
 * @param loginUserId the id of the loginUser that is searching
 * @returns the filtered students with their person data and other filter fields in a promise
 */
export async function filterStudents(
    pagination: DBPagination,
    nameFilter: FilterString,
    emailFilter: FilterString,
    roleFilterArray: FilterStringArray,
    alumniFilter: FilterBoolean,
    coachFilter: FilterBoolean,
    statusFilter: decision_enum | undefined,
    osocYear: FilterNumber,
    emailStatusFilter: email_status_enum | undefined,
    nameSort: FilterSort,
    emailSort: FilterSort,
    loginUserId: number
) {
    const yearsAllowedToSee = await getOsocYearsForLoginUser(loginUserId);
    let searchYears;
    if (osocYear !== undefined) {
        if (!yearsAllowedToSee.includes(osocYear)) {
            return Promise.resolve({
                pagination: { page: 0, count: 0 },
                data: [],
            });
        } else {
            searchYears = [osocYear];
        }
    } else {
        searchYears = yearsAllowedToSee;
    }

    // manually create filter object for evaluation because evaluation doesn't need to exist
    // and then the whole object needs to be undefined
    let evaluationFilter;
    if ((statusFilter as Decision) === Decision.NONE) {
        evaluationFilter = {
            none: {
                is_final: true,
            },
        };
    } else if (statusFilter) {
        evaluationFilter = {
            some: {
                decision: statusFilter,
                is_final: true,
            },
        };
    } else {
        evaluationFilter = undefined;
    }

    const filter: Prisma.studentWhereInput = {
        job_application: {
            some: {
                email_status: emailStatusFilter,
                student_coach: coachFilter,
                osoc: {
                    year: {
                        in: searchYears,
                    },
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
            name: {
                contains: nameFilter,
                mode: "insensitive",
            },
            email: {
                contains: emailFilter,
                mode: "insensitive",
            },
        },
        alumni: alumniFilter,
    };

    const count = await prisma.student.count({ where: filter });
    const data = await prisma.student.findMany({
        where: filter,
        skip: pagination.currentPage * pagination.pageSize,
        take: pagination.pageSize,
        orderBy: [
            { person: { name: nameSort } },
            { person: { email: emailSort } },
        ],
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

    return {
        pagination: { page: pagination.currentPage, count: count },
        data: data,
    };
}

/**
 * @param studentId: the id of the student whose job application years we are searching
 * @returns a list of all the years the student has applied for
 */
export async function getAppliedYearsForStudent(studentId: number) {
    const student = await prisma.student.findUnique({
        where: {
            student_id: studentId,
        },
        select: {
            job_application: {
                select: {
                    osoc: {
                        select: {
                            year: true,
                        },
                    },
                },
            },
        },
    });

    if (student === null) {
        return [];
    }

    return student.job_application.map((app) => app.osoc.year);
}
