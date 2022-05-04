import * as dbtypes from "@prisma/client";
import prisma from "../prisma/prisma";
import * as config from "../config.json";
import * as bcrypt from "bcrypt";

export interface OGNamePass {
    name: string;
    pass: string;
}

export function personData() {
    return [
        {
            email: "email@testmail.com",
            firstname: "firstNameTest",
            lastname: "lastNameTest",
        },
        {
            github: "test@github.com",
            firstname: "firstNameTest2",
            lastname: "lastNameTest2",
        },
        {
            email: "testmail2@mail.com",
            firstname: "first",
            lastname: "last",
        },
        {
            email: "studentmail@mail.com",
            firstname: "student",
            lastname: "student",
        },
        {
            email: "coachmail@mail.com",
            firstname: "coach",
            lastname: "testcoach",
        },
    ];
}

export function loginuserData(people: dbtypes.person[]) {
    return [
        {
            person_id: people[0].person_id,
            password: "easy_password",
            is_admin: true,
            is_coach: true,
            account_status: "ACTIVATED" as dbtypes.account_status_enum,
        },
        {
            person_id: people[1].person_id,
            password: "123_bad_pass",
            is_admin: true,
            is_coach: false,
            account_status: "PENDING" as dbtypes.account_status_enum,
        },
        {
            person_id: people[4].person_id,
            password: "Mypassword",
            is_admin: true,
            is_coach: true,
            account_status: "ACTIVATED" as dbtypes.account_status_enum,
        },
    ];
}

export function osocsData() {
    return [
        {
            year: 2022,
        },
        {
            year: 2023,
        },
    ];
}

export function projectsData(osocs: dbtypes.osoc[]) {
    return [
        {
            name: "project-test",
            osoc_id: osocs[0].osoc_id,
            partner: "partner-test",
            start_date: new Date("2022-05-22"),
            end_date: new Date("2022-06-31"),
            positions: 10,
        },
        {
            name: "project-test-2",
            osoc_id: osocs[1].osoc_id,
            partner: "partner-test-2",
            start_date: new Date("2022-09-15"),
            end_date: new Date("2022-10-23"),
            positions: 9,
        },
        {
            name: "project-test-3",
            osoc_id: osocs[1].osoc_id,
            partner: "partner-test-3",
            start_date: new Date("2022-09-15"),
            end_date: new Date("2022-10-23"),
            positions: 9,
        },
    ];
}

export function studentsData(people: dbtypes.person[]) {
    return [
        {
            person_id: people[2].person_id,
            gender: "Male",
            pronouns: "He/ Him",
            phone_number: "112",
            alumni: false,
        },
        {
            person_id: people[1].person_id,
            gender: "Female",
            pronouns: "She/ Her",
            phone_number: "107",
            alumni: true,
        },
        {
            person_id: people[3].person_id,
            gender: "Female",
            pronouns: "She/ Her",
            phone_number: "111",
            alumni: false,
        },
    ];
}

export function jobApplicationsData(
    students: dbtypes.student[],
    osocs: dbtypes.osoc[]
) {
    return [
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
            edu_year: "4",
            email_status: dbtypes.email_status_enum.DRAFT,
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
            edu_year: "7",
            email_status: dbtypes.email_status_enum.SENT,
            created_at: new Date("December 20, 2021 03:24:00"),
        },
        {
            student_id: students[2].student_id,
            student_volunteer_info: "no volunteer",
            responsibilities: "no responsibilities",
            fun_fact: "this is a fun fact",
            student_coach: false,
            osoc_id: osocs[0].osoc_id,
            edus: ["something something"],
            edu_level: "higher education",
            edu_duration: 5,
            edu_institute: "Ugent",
            edu_year: "3",
            email_status: dbtypes.email_status_enum.DRAFT,
            created_at: new Date("December 25, 2021 14:24:00"),
        },
        {
            student_id: students[2].student_id,
            student_volunteer_info: "I'd like to volunteer",
            responsibilities: "no responsibilities2",
            fun_fact: "this is a fun fact too",
            student_coach: true,
            osoc_id: osocs[1].osoc_id,
            edus: ["higher education"],
            edu_level: "MaNaMa",
            edu_duration: 8,
            edu_institute: "Ugent",
            edu_year: "3",
            email_status: dbtypes.email_status_enum.SENT,
            created_at: new Date("December 31, 2021 03:24:00"),
        },
    ];
}

export function evaluationsData(
    users: dbtypes.login_user[],
    applics: dbtypes.job_application[]
) {
    return [
        {
            login_user_id: users[0].login_user_id,
            job_application_id: applics[0].job_application_id,
            decision: dbtypes.decision_enum.MAYBE,
            motivation: "low education level",
            is_final: false,
        },
        {
            login_user_id: users[0].login_user_id,
            job_application_id: applics[0].job_application_id,
            decision: dbtypes.decision_enum.YES,
            motivation: "awesome job application",
            is_final: true,
        },
    ];
}

export function rolesData() {
    return [
        {
            name: "Developer",
        },
        {
            name: "Marketeer",
        },
        {
            name: "Frontend",
        },
        {
            name: "Backend",
        },
    ];
}

export function projectRolesData(project: dbtypes.project, role: dbtypes.role) {
    return [
        {
            project_id: project.project_id,
            role_id: role.role_id,
            positions: 3,
        },
        {
            project_id: project.project_id,
            role_id: role.role_id,
            positions: 1,
        },
    ];
}

export function appliedRolesData(
    applics: dbtypes.job_application[],
    roles: dbtypes.role[]
) {
    return [
        {
            job_application_id: applics[0].job_application_id,
            role_id: roles[2].role_id,
        },
        {
            job_application_id: applics[1].job_application_id,
            role_id: roles[2].role_id,
        },
        {
            job_application_id: applics[1].job_application_id,
            role_id: roles[3].role_id,
        },
    ];
}

export function langaugesData() {
    return [
        {
            name: "Dutch",
        },
        {
            name: "French",
        },
    ];
}

export function attachmentsData(applics: dbtypes.job_application[]) {
    return [
        {
            job_application_id: applics[1].job_application_id,
            data: ["test-cv-link.com"],
            type: ["CV_URL"] as dbtypes.type_enum[],
        },
        {
            job_application_id: applics[1].job_application_id,
            data: ["test-portfolio-link.com"],
            type: ["PORTFOLIO_URL"] as dbtypes.type_enum[],
        },
    ];
}

export function applicSkillsData(
    applics: dbtypes.job_application[],
    langs: dbtypes.language[]
) {
    return [
        {
            job_application_id: applics[1].job_application_id,
            skill: "SQL",
            language_id: langs[0].language_id,
            level: 5,
            is_preferred: false,
            is_best: true,
        },
        {
            job_application_id: applics[0].job_application_id,
            skill: "Python",
            language_id: langs[0].language_id,
            level: 4,
            is_preferred: false,
            is_best: false,
        },
    ];
}

export function sessionKeyData(users: dbtypes.login_user[]) {
    const futureDate = new Date(Date.now()); // it's easier to mock Date.now
    futureDate.setDate(futureDate.getDate() + 15);
    return [
        {
            login_user_id: users[0].login_user_id,
            session_key: "key",
            valid_until: futureDate,
        },
        {
            login_user_id: users[0].login_user_id,
            session_key: "key2",
            valid_until: futureDate,
        },
    ];
}

export function passResetsData(users: dbtypes.login_user[]) {
    return [
        {
            login_user_id: users[2].login_user_id,
            reset_id: "5444024611562312170969914212450321",
            valid_until: new Date("2022-07-13"),
        },
    ];
}

export async function hashAllPasswords(): Promise<OGNamePass[]> {
    const users = await prisma.login_user.findMany({
        include: { person: true },
    });
    const ogs = users.map((x) => ({ name: x.person.email, pass: x.password }));

    await Promise.all(
        users.map(async (user) => {
            if (user.password == null) return;
            const newpass = await bcrypt.hash(
                user.password,
                config.encryption.encryptionRounds
            );
            await prisma.login_user.update({
                where: { login_user_id: user.login_user_id },
                data: { password: newpass },
            });
        })
    );

    return ogs.flatMap((x) => {
        const xn = x.name;
        const xp = x.pass; // trick ts compiler
        if (xn != null && xp != null) return [{ name: xn, pass: xp }];
        return [];
    });
}

export async function teardown() {
    await prisma.$transaction([
        prisma.password_reset.deleteMany(),
        prisma.job_application_skill.deleteMany(),
        prisma.language.deleteMany(),
        prisma.attachment.deleteMany(),
        prisma.applied_role.deleteMany(),
        prisma.evaluation.deleteMany(),
        prisma.job_application.deleteMany(),
        prisma.session_keys.deleteMany(),
        prisma.project_user.deleteMany(),
        prisma.contract.deleteMany(),
        prisma.project_role.deleteMany(),
        prisma.project.deleteMany(),
        prisma.osoc.deleteMany(),
        prisma.student.deleteMany(),
        prisma.login_user.deleteMany(),
        prisma.role.deleteMany(),
        prisma.person.deleteMany(),
    ]);
}

export async function setup(cleanFirst: boolean) {
    if (cleanFirst) await teardown();

    // create persons
    await prisma.person.createMany({
        data: personData(),
    });
    const persons = await prisma.person.findMany();

    // create login users
    await prisma.login_user.createMany({
        data: loginuserData(persons),
    });
    const login_users = await prisma.login_user.findMany();

    // create osoc editions
    await prisma.osoc.createMany({
        data: osocsData(),
    });
    const osocs = await prisma.osoc.findMany();

    // create projects
    await prisma.project.createMany({
        data: projectsData(osocs),
    });

    await prisma.student.createMany({
        data: studentsData(persons),
    });
    const students = await prisma.student.findMany();

    // create job applications
    await prisma.job_application.createMany({
        data: jobApplicationsData(students, osocs),
    });

    const job_applications = await prisma.job_application.findMany();

    // create evaluations
    await prisma.evaluation.createMany({
        data: evaluationsData(login_users, job_applications),
    });

    // create roles
    await prisma.role.createMany({
        data: rolesData(),
    });

    const project = await prisma.project.findFirst();
    const role = await prisma.role.findFirst();
    if (project && role) {
        // create roles
        await prisma.project_role.createMany({
            data: projectRolesData(project, role),
        });
    }
    const roles = await prisma.role.findMany();
    await prisma.applied_role.createMany({
        data: appliedRolesData(job_applications, roles),
    });

    // create languages
    await prisma.language.createMany({
        data: langaugesData(),
    });

    // create attachments
    await prisma.attachment.createMany({
        data: attachmentsData(job_applications),
    });

    const languages = await prisma.language.findMany();
    // create job application skills
    await prisma.job_application_skill.createMany({
        data: applicSkillsData(job_applications, languages),
    });

    // create session keys
    await prisma.session_keys.createMany({
        data: sessionKeyData(login_users),
    });

    // create password reset
    await prisma.password_reset.createMany({
        data: passResetsData(login_users),
    });
}
