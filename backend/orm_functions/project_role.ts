import prisma from '../prisma/prisma'


// Create Project Role
export async function createProjectRole(projectId : number, roleId : number, positions : number){
    const result = await prisma.project_role.create({
        data: {
            project_id : projectId,
            role_id : roleId,
            positions : positions
        },
    });
    return result;
}

// Get all Project Roles for a certain Project
export async function getProjectRolesByProject(projectId : number) {
    const result = prisma.project_role.findMany({
        where: { project_id : projectId},
    });
    return result;
}

// Get number of Project Roles for a certain Project and Project role
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
export async function getProjectRoleNamesByProject(projectId : number) {
    const result = prisma.project_role.findMany({
        where: { project_id : projectId},
        include : {
            role : true
        }
    });
    return result;
}

// Update ProjectRole
export async function updateProject(projectRoleId : number, positions : number){
        const result = await prisma.project_role.update({
        where : {
            project_role_id : projectRoleId
        },
        data: {
            positions : positions
        },
    });
    return result;
}

// Delete ProjectRole
export async function deleteProject(projectRoleId : number){
    const result = await prisma.project_role.delete({
        where : {
            project_role_id : projectRoleId
        }
    });
    return result;
}
