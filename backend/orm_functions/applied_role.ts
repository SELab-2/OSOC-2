import prisma from '../prisma/prisma'
import {CreateAppliedRole} from './orm_types';

/**
 * 
 * @param appliedRole: applied role object with the needed information
 */
export async function createAppliedRole(appliedRole: CreateAppliedRole){
    const result = await prisma.applied_role.create({
        data: {
            job_application_id: appliedRole.jobApplicationId,
            role_id: appliedRole.roleId
        },
    });
    return result;
}
