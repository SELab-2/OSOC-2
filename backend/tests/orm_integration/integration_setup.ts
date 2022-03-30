import prisma from "../../prisma/prisma";
import {decision_enum, email_status_enum} from "@prisma/client";

beforeAll(async () => {
    // create persons
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
            {
                email: 'testmail2@mail.com',
                firstname: "first",
                lastname: "last"
            }
        ],
    });
    const persons = await prisma.person.findMany();
    
    // create login users
    await prisma.login_user.createMany({
        data: [
            {   
                person_id: persons[0].person_id,
                password: "easy_password",
                is_admin: true,
                is_coach: true,
                account_status: "ACTIVATED"
            },
            {
                person_id: persons[1].person_id,
                password: "123_bad_pass",
                is_admin: true,
                is_coach: false,
                account_status: "PENDING"
            },
        ],
    });

    const login_users = await prisma.login_user.findMany();

    // create osoc editions
    await prisma.osoc.createMany({
       data: [
           {
               year: 2022
           },
           {
               year: 2023
           }
       ]
    });
    const osocs = await prisma.osoc.findMany();

    // create projects
    await prisma.project.createMany({
        data: [
            {   
                name: "project-test",
                osoc_id: osocs[0].osoc_id,
                partner: "partner-test",
                start_date: new Date("2022-05-22"),
                end_date: new Date("2022-06-31"),
                positions: 10
            },
            {
                name: "project-test-2",
                osoc_id: osocs[1].osoc_id,
                partner: "partner-test-2",
                start_date: new Date("2022-09-15"),
                end_date: new Date("2022-10-23"),
                positions: 9
            },
            {
                name: "project-test-3",
                osoc_id: osocs[1].osoc_id,
                partner: "partner-test-3",
                start_date: new Date("2022-09-15"),
                end_date: new Date("2022-10-23"),
                positions: 9
            }
        ],
    });

    await prisma.student.createMany({
        data : [
            {
                person_id: persons[2].person_id,
                gender: "Male",
                pronouns: ["He", "Him"],
                phone_number: "112",
                alumni: false,
            }
        ]
    })
    const students = await prisma.student.findMany();

    // create job applications
    await prisma.job_application.createMany({
       data : [
           {
               student_id: students[0].student_id,
               student_volunteer_info: "no volunteer",
               responsibilities: "no responsibilities",
               fun_fact: "this is a fun fact",
               student_coach: false,
               osoc_id: osocs[0].osoc_id,
               edus: ["basic education"],
               edu_level: "higher education",
               edu_duration: 5,
               edu_institute: "Ugent",
               edu_year: 2022,
               email_status: email_status_enum.DRAFT,
               created_at: new Date("December 17, 2021 14:24:00"),
           },
           {
               student_id: students[0].student_id,
               student_volunteer_info: "I'd like to volunteer",
               responsibilities: "no responsibilities2",
               fun_fact: "this is a fun fact too",
               student_coach: true,
               osoc_id: osocs[0].osoc_id,
               edus: ["higher education"],
               edu_level: "MaNaMa",
               edu_duration: 8,
               edu_institute: "Ugent",
               edu_year: 2023,
               email_status: email_status_enum.SENT,
               created_at: new Date("December 20, 2021 03:24:00"),
           }
       ]
    });

    const job_applications = await prisma.job_application.findMany();

    // create evaluations
    await prisma.evaluation.createMany({
        data : [
            {
                login_user_id: login_users[0].login_user_id,
                job_application_id: job_applications[0].job_application_id,
                decision: decision_enum.MAYBE,
                motivation: "low education level",
                is_final: false,
            },
            {
                login_user_id: login_users[0].login_user_id,
                job_application_id: job_applications[0].job_application_id,
                decision: decision_enum.YES,
                motivation: "awesome job application",
                is_final: true
            }
        ]
    })

    // create roles
    await prisma.role.createMany({
        data: [
            {   
                name: "Developer",

            },
            {
                name: "Marketeer"
            },
        ],
    });

    const projects = await prisma.project.findFirst();
    const role = await prisma.role.findFirst();
    // create roles
    await prisma.project_role.createMany({
        data: [
            {   
                project_id: projects!.project_id,
                role_id: role!.role_id,
                positions: 3

            },
            {
                project_id: projects!.project_id,
                role_id: role!.role_id,
                positions: 1
            },
        ],
    }); 

    // create languages
    await prisma.language.createMany({
        data: [
            {   
                name: "Dutch",

            },
            {
                name: "French"
            },
        ],
    });

    // create attachments
    await prisma.attachment.createMany({
        data : [
            {
                job_application_id: job_applications[1].job_application_id,
                data: "test-cv-link.com",
                type: "CV_URL"
            },
            {
                job_application_id: job_applications[1].job_application_id,
                data: "test-portfolio-link.com",
                type: "PORTFOLIO_URL"
            }
        ]
    })

});

afterAll(async () => {
    const deleteLanguageDetails = prisma.language.deleteMany();
    const deleteJobApplicationSkillDetails = prisma.job_application_skill.deleteMany();
    const deleteAttachmentDetails = prisma.attachment.deleteMany();
    const deleteAppliedRoleDetails = prisma.applied_role.deleteMany();
    const deleteEvaluationDetails = prisma.evaluation.deleteMany();
    const deleteApplicationDetails = prisma.job_application.deleteMany();
    const deleteSessionKeysDetails = prisma.session_keys.deleteMany();
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
        deleteSessionKeysDetails,
        deleteProjectUserDetails,
        deleteContractDetails,
        deleteProjectRoleDetails,
        deleteProjectDetails,
        deleteOsocDetails,
        deleteStudentDetails,
        deleteLoginUserDetails,
        deleteRoleDetails,
        deletePersonDetails,
    ]);

    await prisma.$disconnect()
});