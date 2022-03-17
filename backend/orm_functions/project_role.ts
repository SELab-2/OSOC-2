import prisma from '../prisma/prisma'
import {CreateProjectRole, UpdateProjectRole} from './orm_types';

/**
 * 
 * @param projectRole: project role object with the needed information
 */
export async function createProjectRole(projectRole: CreateProjectRole){
    const result = await prisma.project_role.create({
        data: {
            project_id: projectRole.projectId,
            role_id: projectRole.roleId,
            positions: projectRole.positions
        },
    });
    return result;
}

/**
 * 
 * @param projectId: this is the id of the project for which we want all the roles
 * @returns: all the project role objects for that project
 */
export async function getProjectRolesByProject(projectId: number) {
    const result = prisma.project_role.findMany({
        where: { 
            project_id: projectId
        },
    });
    return result;
}

/**
 * 
 * @param projectId: this is the id of the project for which we want the number of positions
 * @param projectRoleId: this is the id of the projectRole for which we want the number of positions 
 * @returns: returns the number of positions for the projectrole of that project
 */
export async function getNumberOfRolesByProjectAndRole(projectId : number, projectRoleId : number) {
    const result = prisma.project_role.findMany({
        where: { 
            AND: [
                {
                    project_id: projectId
                },
                {
                    project_role_id: projectRoleId
                },
            ],
        }
    });
    return result;
}

// Get all Project Role Names for a certain Project
/**
 * 
 * @param projectId: this is the id of the project for which we want all the roles
 * @returns: returns all the projectroles object togheter with the role objects for that project
 */
export async function getProjectRoleNamesByProject(projectId: number) {
    const result = prisma.project_role.findMany({
        where: { 
            project_id: projectId
        },
        include: {
            role: true
        }
    });
    return result;
}

/**
 * 
 * @param projectRole: UpdateProject object with the values that need to be updated
 * @returns the updated entry in the database 
 */
export async function updateProject(projectRole: UpdateProjectRole){
        const result = await prisma.project_role.update({
        where: {
            project_role_id: projectRole.projectRoleId
        },
        data: {
            positions: projectRole.positions
        },
    });
    return result;
}

/**
 * 
 * @param projectRoleId the projectRole we are deleting from the project role-table
 * @returns TODO: what does this return?
 */
export async function deleteProject(projectRoleId: number){
    const result = await prisma.project_role.delete({
        where: {
            project_role_id: projectRoleId
        }
    });
    return result;
}
