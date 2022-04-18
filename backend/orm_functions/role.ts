import prisma from "../prisma/prisma";
import { UpdateRole } from "./orm_types";

/**
 *
 * @param name: the name of the role we want to add to the database
 */
export async function createRole(name: string) {
    const result = await prisma.role.create({
        data: {
            name: name,
        },
    });
    return result;
}

/**
 *
 * @returns a list of all the role objects in the database
 */
export async function getAllRoles() {
    return await prisma.role.findMany();
}

/**
 *
 * @param roleId: this is the id of the role we are looking up in the database
 * @returns: object with the name of the role
 */
export async function getRole(roleId: number) {
    return await prisma.role.findUnique({
        where: {
            role_id: roleId,
        },
    });
}

/**
 *
 * @param name: this is the name of the role we are looking up in the database
 * @returns: all the role objects with a matching name
 */
export async function getRolesByName(name: string) {
    return await prisma.role.findUnique({
        where: {
            name: name,
        },
    });
}

/**
 *
 * @param name the name of the role
 * @param projectId: the id of the project the searched project_role belongs to
 * @returns the project_role or an error from the database
 */
export async function getProjectRoleWithRoleName(
    name: string,
    projectId: number
) {
    const id = await prisma.role.findUnique({
        where: {
            name: name,
        },
        select: {
            role_id: true,
        },
    });
    if (id) {
        return await prisma.project_role.findFirst({
            where: {
                role_id: id.role_id,
                project_id: projectId,
            },
        });
    }
    return id;
}

/**
 *
 * @param role: UpdateRole object with the values that need to be updated
 * @returns the updated entry in the database
 */
export async function updateRole(role: UpdateRole) {
    return await prisma.role.update({
        where: {
            role_id: role.roleId,
        },
        data: {
            name: role.name,
        },
    });
}

/**
 *
 * @param roleId the role we are deleting from the role-table
 * @returns a promise with the deleted record inside
 */
export async function deleteRole(roleId: number) {
    return await prisma.role.delete({
        where: {
            role_id: roleId,
        },
    });
}

/**
 *
 * @param name the name of the role we are deleting from the role-table
 * @returns a promise with the deleted record inside
 */
export async function deleteRoleByName(name: string) {
    return await prisma.role.delete({
        where: {
            name: name,
        },
    });
}
