import prisma from "../prisma/prisma";

import { CreatePerson, UpdatePerson } from "./orm_types";

/**
 *
 * @param person: person object with the needed information
 */
export async function createPerson(person: CreatePerson) {
    return await prisma.person.create({
        data: {
            name: person.name,
            github: person.github,
            email: person.email,
            github_id: person.github_id,
        },
    });
}

/**
 *
 * @returns a list of all the person objects in the database
 */
export async function getAllPersons() {
    return await prisma.person.findMany();
}

/**
 *
 * @param email: this is the email of the person we are looking up in the
 *     database
 * @returns: password of the login user matching with the person
 */
export async function getPasswordPersonByEmail(email: string) {
    return await prisma.person.findUnique({
        where: { email: email },
        select: {
            login_user: {
                select: {
                    password: true,
                    login_user_id: true,
                    account_status: true,
                    is_admin: true,
                    is_coach: true,
                },
            },
        },
    });
}

/**
 *
 * @param github: this is the GitHub username of the person we are looking up in
 *     the database
 * @returns: password of the login user matching with the person
 */
export async function getPasswordPersonByGithub(github: string) {
    return await prisma.person.findUnique({
        where: { github_id: github },
        select: {
            github: true,
            person_id: true,
            name: true,
            login_user: {
                select: {
                    password: true,
                    login_user_id: true,
                    account_status: true,
                    is_admin: true,
                    is_coach: true,
                },
            },
        },
    });
}

/**
 *
 * @param name: This is the name of the person we are looking, can be firstname
 *     as lastname
 * @returns: a list of all the person objects in the database that match
 */
export async function searchPersonByName(name: string) {
    return await prisma.person.findMany({
        where: {
            name: { contains: name },
        },
    });
}

/**
 *
 * @param login: This is the email or GitHub of the person we are looking for
 * @returns: a list of all the person objects in the database that match either
 * the email or github
 */
export async function searchPersonByLogin(login: string) {
    return prisma.person.findMany({
        where: {
            OR: [
                {
                    email: { contains: login },
                },
                {
                    github: { contains: login },
                },
            ],
        },
    });
}

/**
 *
 * @param person: UpdatePerson object with the values that need to be updated
 * @returns the updated entry in the database
 */
export async function updatePerson(person: UpdatePerson) {
    return await prisma.person.update({
        where: { person_id: person.personId },
        data: {
            name: person.name,
            github: person.github,
            email: person.email,
        },
    });
}

/**
 *
 * @param personId the person whose info we are deleting from the person-table
 * @returns the deleted person record
 */
export async function deletePersonById(personId: number) {
    return await prisma.person.delete({ where: { person_id: personId } });
}

/**
 * This query executes a full delete of all data associated with the person.
 * This includes all student AND login_user data that is associated with this person!
 * @param personId: the id of the person we want to delete
 * @returns the deleted record from the person-table in a promise or an error in a promise if the person was not found
 */
export async function deletePersonFromDB(personId: number) {
    // search the information about the person. We'll need the student_id and login_user_id later on
    const person = await prisma.person.findUnique({
        where: {
            person_id: personId,
        },
        include: {
            login_user: true,
            student: true,
        },
    });
    // the person was found
    if (person) {
        // the person is a login_user
        if (person.login_user) {
            const loginUserId = person.login_user.login_user_id;

            // Remove all the linked password reset
            await Promise.all([
                prisma.password_reset.deleteMany({
                    where: {
                        login_user_id: loginUserId,
                    },
                }),
                // Remove all the linked project users
                prisma.project_user.deleteMany({
                    where: {
                        login_user_id: loginUserId,
                    },
                }),
                // Remove all the linked sessionkeys
                prisma.session_keys.deleteMany({
                    where: {
                        login_user_id: loginUserId,
                    },
                }),
            ]);
            await prisma.login_user.delete({
                where: {
                    login_user_id: loginUserId,
                },
            });
        }

        // the person is a student
        if (person.student) {
            const studentId = person.student.student_id;

            const job_application_ids = await prisma.job_application.findMany({
                where: {
                    student_id: studentId,
                },
                select: {
                    job_application_id: true,
                },
            });

            // Remove all the linked attachments
            await prisma.attachment.deleteMany({
                where: {
                    job_application_id: {
                        in: job_application_ids.map(
                            (X) => X.job_application_id
                        ),
                    },
                },
            });

            // delete the student record
            await prisma.student.delete({
                where: {
                    student_id: studentId,
                },
                include: {
                    person: true,
                },
            });
        }

        // delete the person record
        await prisma.person.delete({
            where: {
                person_id: person.person_id,
            },
        });
    }
}
