import prisma from '../prisma/prisma'
import {CreateProjectUser} from './orm_types';

/**
 * 
 * @param projectUser: project user object with the needed information
 */
export async function createProject(projectUser: CreateProjectUser){
    const result = await prisma.project_user.create({
        data: {
            login_user_id: projectUser.loginUserId,
            project_id: projectUser.projectId
        },
    });
    return result;
}
