import prisma from '../prisma/prisma'

import {CreateProjectUser} from './orm_types';

/**
 *
 * @param projectUser: project user object with the needed information
 */
export async function createProjectUser(projectUser: CreateProjectUser) {
  const result = await prisma.project_user.create({
    data : {
      login_user_id : projectUser.loginUserId,
      project_id : projectUser.projectId
    },
  });
  return result;
}

export async function getUsersFor(project: number) {
  return await prisma.project_user.findMany({
    where : {project_id : project},
    select : {
      login_user : {
        select : {
          login_user_id : true,
          is_admin : true,
          is_coach : true,
          person : true
        }
      }
    }
  })
}
