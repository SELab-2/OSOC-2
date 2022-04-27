import prisma from "../../prisma/prisma";
import { deleteAppliedRolesByJobApplication } from "../../orm_functions/applied_role";

it("should delete the applied roles for the job application", async () => {
    const [job_applications, roles] = await Promise.all([
        prisma.job_application.findMany(),
        prisma.role.findMany(),
    ]);

    const deleted = await deleteAppliedRolesByJobApplication(
        job_applications[1].job_application_id
    );
    expect(deleted).toHaveProperty("count", 2);

    await prisma.applied_role.createMany({
        data: [
            {
                job_application_id: job_applications[1].job_application_id,
                role_id: roles[2].role_id,
            },
            {
                job_application_id: job_applications[1].job_application_id,
                role_id: roles[3].role_id,
            },
        ],
    });
});
