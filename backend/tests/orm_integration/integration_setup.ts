import prisma from "../../prisma/prisma";

beforeAll(async () => {
    // create products
    await prisma.person.createMany({
        data: [
            {
                email: 'email@testmail.com',
                firstname: "firstNameTest",
                lastname: "lastNameTest",
            },
            {
                github: "test@github.com",
                firstname: "firstNameTest2",
                lastname: "lastNameTest2",
            },
        ],
    })
});

afterAll(async () => {
    const deleteLanguageDetails = prisma.language.deleteMany();
    const deleteJobApplicationSkillDetails = prisma.job_application_skill.deleteMany();
    const deleteAttachmentDetails = prisma.attachment.deleteMany();
    const deleteAppliedRoleDetails = prisma.applied_role.deleteMany();
    const deleteEvaluationDetails = prisma.evaluation.deleteMany();
    const deleteApplicationDetails = prisma.job_application.deleteMany();
    // const deleteSessionKeysDetails = prisam.session_keys.deleteMany();
    const deleteProjectUserDetails = prisma.project_user.deleteMany();
    const deleteContractDetails = prisma.contract.deleteMany();
    const deleteProjectRoleDetails = prisma.project_role.deleteMany();
    const deleteProjectDetails = prisma.project.deleteMany();
    const deleteOsocDetails = prisma.osoc.deleteMany();
    const deleteStudentDetails = prisma.student.deleteMany();
    const deleteLoginUserDetails = prisma.login_user.deleteMany();
    const deleteRoleDetails = prisma.role.deleteMany();
    const deletePersonDetails = prisma.person.deleteMany();

    await prisma.$transaction([
        deleteLanguageDetails,
        deleteJobApplicationSkillDetails,
        deleteAttachmentDetails,
        deleteAppliedRoleDetails,
        deleteEvaluationDetails,
        deleteApplicationDetails,
        //deleteSessionKeysDetails,
        deleteProjectUserDetails,
        deleteContractDetails,
        deleteProjectRoleDetails,
        deleteProjectDetails,
        deleteOsocDetails,
        deleteStudentDetails,
        deleteLoginUserDetails,
        deleteRoleDetails,
        deletePersonDetails,
    ])

    await prisma.$disconnect()
});