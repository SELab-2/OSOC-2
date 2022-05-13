import { getProjectRoleWithRoleName } from "./role";
import { AddStudentToProject } from "./orm_types";
import { contract_status_enum } from "@prisma/client";
import { createContract } from "./contract";

/**
 *
 * @param requestInfo: object with information about who makes to contract for which job about which student and project
 * @return the created contract
 */
export async function addStudentToProject(requestInfo: AddStudentToProject) {
    const project_role = await getProjectRoleWithRoleName(
        requestInfo.roleName,
        requestInfo.projectId
    );
    if (project_role) {
        return await createContract({
            studentId: requestInfo.studentId,
            projectRoleId: project_role.project_role_id,
            information: requestInfo.information,
            loginUserId: requestInfo.loginUserId,
            contractStatus: contract_status_enum.AWAITING_PROJECT,
        });
    }
    return project_role;
}
