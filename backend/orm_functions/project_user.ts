import prisma from "../prisma/prisma";

import { ProjectUser } from "./orm_types";

/**
 *
 * @param projectUser: project user object with the needed information
 */
export async function createProjectUser(projectUser: ProjectUser) {
    const result = await prisma.project_user.create({
        data: {
            login_user_id: projectUser.loginUserId,
            project_id: projectUser.projectId,
        },
    });
    return result;
}

/**
 *  Gets the users associated with the given project.
 *  @param project The ID of the project to get users for.
 */
export async function getUsersFor(project: number) {
    return await prisma.project_user.findMany({
        where: { project_id: project },
        select: {
            project_user_id: true,
            login_user: {
                select: {
                    login_user_id: true,
                    is_admin: true,
                    is_coach: true,
                    person: true,
                },
            },
        },
    });
}

/**
 *
 * @param projectUserId the project_user we are deleting from the project_user-table
 * @returns a promise with the deleted record inside
 */
export async function deleteProjectUser(projectUser: ProjectUser) {
    return await prisma.project_user.deleteMany({
        where: {
            project_id: projectUser.projectId,
            login_user_id: projectUser.loginUserId,
        },
    });
}
