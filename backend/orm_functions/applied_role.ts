import prisma from "../prisma/prisma";
import { CreateAppliedRole } from "./orm_types";

/**
 *
 * @param appliedRole: applied role object with the needed information
 */
export async function createAppliedRole(appliedRole: CreateAppliedRole) {
  const result = await prisma.applied_role.create({
    data: {
      job_application_id: appliedRole.jobApplicationId,
      role_id: appliedRole.roleId,
    },
  });
  return result;
}

/**
 *
 * @param jobApplicationId: this is the job application of the applied roles we are looking for in the database
 * @returns: all the applied roles
 */
export async function getAppliedRolesByJobApplication(
  jobApplicationId: number
) {
  const result = prisma.applied_role.findMany({
    where: {
      job_application_id: jobApplicationId,
    },
  });
  return result;
}
