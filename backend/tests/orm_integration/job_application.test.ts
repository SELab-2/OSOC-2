import {
    changeEmailStatusOfJobApplication, createJobApplication, deleteJobApplication,
    deleteJobApplicationsFromStudent, getJobApplication, getJobApplicationByYear,
    getLatestApplicationRolesForStudent, getLatestJobApplicationOfStudent,
    getStudentEvaluationsFinal,
    getStudentEvaluationsTemp,
    getStudentEvaluationsTotal
} from "../../orm_functions/job_application";
import prisma from "../../prisma/prisma";
import {decision_enum, email_status_enum} from "@prisma/client";
import {CreateJobApplication} from "../../orm_functions/orm_types";

/**
 * aid function to compare most fields of the expected job application and the found job application
 * @param expected the application we expect as response from the database
 * @param found the actual response from the database
 */
function job_application_check(expected: {
                                   job_application_id?: number;
                                   student_id: number;
                                   student_volunteer_info: string;
                                   responsibilities: string | null;
                                   fun_fact: string | null;
                                   student_coach: boolean;
                                   osoc_id: number;
                                   edus: string[];
                                   edu_level: string | null;
                                   edu_duration: number | null;
                                   edu_institute: string | null;
                                   edu_year: string | null;
                                   created_at: Date;
                                   email_status: email_status_enum;
                               },
                               found: {
                                   job_application_id: number
                                   student_id: number;
                                   student_volunteer_info: string;
                                   responsibilities: string | null;
                                   fun_fact: string | null;
                                   student_coach: boolean;
                                   osoc_id: number;
                                   edus: string[];
                                   edu_level: string | null;
                                   edu_duration: number | null;
                                   edu_institute: string | null;
                                   edu_year: string | null;
                                   created_at: Date;
                                   email_status: email_status_enum;
                               }
) {
    expect(found).toHaveProperty("student_id", expected.student_id);
    expect(found).toHaveProperty("student_volunteer_info", expected.student_volunteer_info);
    expect(found).toHaveProperty("responsibilities", expected.responsibilities);
    expect(found).toHaveProperty("fun_fact", expected.fun_fact);
    expect(found).toHaveProperty("student_coach", expected.student_coach);
    expect(found).toHaveProperty("osoc_id", expected.osoc_id);
    expect(found).toHaveProperty("edus", expected.edus);
    expect(found).toHaveProperty("edu_level", expected.edu_level);
    expect(found).toHaveProperty("edu_duration", expected.edu_duration);
    expect(found).toHaveProperty("edu_institute", expected.edu_institute);
    expect(found).toHaveProperty("edu_year", expected.edu_year);
    expect(found).toHaveProperty("created_at", expected.created_at);
}

it("should return all student evaluations for the student with given id", async () => {
    const [students, osocs] = await Promise.all([prisma.student.findMany(), prisma.osoc.findMany()]);

    const evaluations = [
        {
            decision: decision_enum.MAYBE,
            motivation: "low education level",
            is_final: false,
        },
        {
            decision: decision_enum.YES,
            motivation: "awesome job application",
            is_final: true
        }
    ]

    const foundApplications = await getStudentEvaluationsTotal(students[0].student_id);
    foundApplications.forEach((found_eval) => {
        expect(found_eval).toHaveProperty("osoc", {year: osocs[0].year});
        expect(found_eval).toHaveProperty("evaluation");
        for (let i = 0; i < found_eval.evaluation.length; i++) {
            const evals = evaluations[i];
            expect(found_eval.evaluation[i]).toHaveProperty("decision", evals.decision);
            expect(found_eval.evaluation[i]).toHaveProperty("motivation", evals.motivation);
            expect(found_eval.evaluation[i]).toHaveProperty("evaluation_id");
            expect(found_eval.evaluation[i]).toHaveProperty("is_final", evals.is_final);
            // check if all the needed fields are selected (with the other checks we already insured we found the right evaluation)
            expect(found_eval.evaluation[i].login_user).toHaveProperty("login_user_id");
            expect(found_eval.evaluation[i].login_user.person).toHaveProperty("firstname");
            expect(found_eval.evaluation[i].login_user.person).toHaveProperty("lastname");
            expect(found_eval.evaluation[i].login_user.person).toHaveProperty("person_id");
            expect(found_eval.evaluation[i].login_user.person).toHaveProperty("github");
            expect(found_eval.evaluation[i].login_user.person).toHaveProperty("email");
        }
    });
});

it("should return all final student evaluations for the student with given id", async () => {
    const [students, osocs] = await Promise.all([prisma.student.findMany(), prisma.osoc.findMany()]);


    const evaluations = [
        {
            decision: decision_enum.YES,
            motivation: "awesome job application",
        }
    ]

    const foundApplications = await getStudentEvaluationsFinal(students[0].student_id);
    foundApplications.forEach((found_eval) => {
        expect(found_eval).toHaveProperty("osoc", {year: osocs[0].year});
        expect(found_eval).toHaveProperty("evaluation");
        for (let i = 0; i < found_eval.evaluation.length; i++) {
            const evals = evaluations[i];
            expect(found_eval.evaluation[i]).toHaveProperty("decision", evals.decision);
            expect(found_eval.evaluation[i]).toHaveProperty("motivation", evals.motivation);
            expect(found_eval.evaluation[i]).toHaveProperty("evaluation_id");
            // check if all the needed fields are selected (with the other checks we already insured we found the right evaluation)
            expect(found_eval.evaluation[i].login_user).toHaveProperty("login_user_id");
            expect(found_eval.evaluation[i].login_user.person).toHaveProperty("firstname");
            expect(found_eval.evaluation[i].login_user.person).toHaveProperty("lastname");
            expect(found_eval.evaluation[i].login_user.person).toHaveProperty("person_id");
            expect(found_eval.evaluation[i].login_user.person).toHaveProperty("github");
            expect(found_eval.evaluation[i].login_user.person).toHaveProperty("email");
        }

    });
});

it("should return all suggestion evaluations for the student with given id", async () => {
    const [students, osocs] = await Promise.all([prisma.student.findMany(), prisma.osoc.findMany()]);

    const evaluations = [
        {
            decision: decision_enum.MAYBE,
            motivation: "low education level",
            is_final: false,
        }
    ]

    const foundApplications = await getStudentEvaluationsTemp(students[0].student_id);
    foundApplications.forEach((found_eval) => {
        expect(found_eval).toHaveProperty("osoc", {year: osocs[0].year});
        expect(found_eval).toHaveProperty("evaluation");
        for (let i = 0; i < found_eval.evaluation.length; i++) {
            const evals = evaluations[i];
            expect(found_eval.evaluation[i]).toHaveProperty("decision", evals.decision);
            expect(found_eval.evaluation[i]).toHaveProperty("motivation", evals.motivation);
            expect(found_eval.evaluation[i]).toHaveProperty("evaluation_id");
            // check if all the needed fields are selected (with the other checks we already insured we found the right evaluation)
            expect(found_eval.evaluation[i].login_user).toHaveProperty("login_user_id");
            expect(found_eval.evaluation[i].login_user.person).toHaveProperty("firstname");
            expect(found_eval.evaluation[i].login_user.person).toHaveProperty("lastname");
            expect(found_eval.evaluation[i].login_user.person).toHaveProperty("person_id");
            expect(found_eval.evaluation[i].login_user.person).toHaveProperty("github");
            expect(found_eval.evaluation[i].login_user.person).toHaveProperty("email");
        }

    });
});

it("should return the last roles a student applied for", async () => {
    const [students, roles] = await Promise.all([prisma.student.findMany(), prisma.role.findMany()]);

    const roles_expected = [roles[2].role_id, roles[3].role_id]

    const applied_roles = await getLatestApplicationRolesForStudent(students[0].student_id);
    if (applied_roles) {
        applied_roles.applied_role.forEach(({role_id}, index) => {
            expect(role_id).toEqual(roles_expected[index])
        })
        expect(applied_roles.applied_role.length).toEqual(roles_expected.length);
    }
});

it("should delete all the job applications of the given student", async () => {
    const [students, osocs] = await Promise.all([prisma.student.findMany(), prisma.osoc.findMany()]);

    const applics = [
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
            email_status: email_status_enum.DRAFT,
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
            email_status: email_status_enum.SENT,
            created_at: new Date("December 31, 2021 03:24:00"),
        }
    ]

    const deleted = await deleteJobApplicationsFromStudent(students[2].student_id);
    expect(deleted.count).toEqual(applics.length);

    // add the deleted data back
    await prisma.job_application.createMany({
        data: applics
    });
});

it("should update the email status of the job application", async () => {
    const [students, osocs, applics] = await Promise.all([prisma.student.findMany(), prisma.osoc.findMany(), prisma.job_application.findMany()]);

    const applic = {
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
        email_status: email_status_enum.DRAFT,
        created_at: new Date("December 25, 2021 14:24:00"),
    }
    const changed = await changeEmailStatusOfJobApplication(applics[2].job_application_id, email_status_enum.SENT);
    job_application_check(applic, changed);
    expect(changed).toHaveProperty("email_status", email_status_enum.SENT);
    expect(changed).toHaveProperty("job_application_id", applics[2].job_application_id);
});


it("should delete the job application", async () => {
    const [students, osocs, applics] = await Promise.all([prisma.student.findMany(), prisma.osoc.findMany(), prisma.job_application.findMany()]);

    const app = {
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
        email_status: email_status_enum.SENT,
        created_at: new Date("December 25, 2021 14:24:00"),
    }

    const deleted = await deleteJobApplication(applics[3].job_application_id);
    job_application_check(app, deleted);
    expect(deleted).toHaveProperty("email_status", app.email_status);
    await prisma.job_application.create({
        data: app
    });
});

it("should create a new job_application", async () => {
    const [students, osocs] = await Promise.all([prisma.student.findMany(), prisma.osoc.findMany()]);

    const app = {
        student_id: students[2].student_id,
        student_volunteer_info: "no volunteer",
        responsibilities: "nothing",
        fun_fact: "this is a fun fact",
        student_coach: true,
        osoc_id: osocs[0].osoc_id,
        edus: ["something edu"],
        edu_level: "higher education",
        edu_duration: 3,
        edu_institute: "Hogent",
        edu_year: "2",
        email_status: email_status_enum.DRAFT,
        created_at: new Date("January 2, 2022 14:24:00"),
    }

    const input: CreateJobApplication = {
        studentId: students[2].student_id,
        studentVolunteerInfo: "no volunteer",
        responsibilities: "nothing",
        funFact: "this is a fun fact",
        studentCoach: true,
        osocId: osocs[0].osoc_id,
        edus: ["something edu"],
        eduLevel: "higher education",
        eduDuration: 3,
        eduInstitute: "Hogent",
        eduYear: "2",
        emailStatus: email_status_enum.DRAFT,
        createdAt: "January 2, 2022 14:24:00",
    }

    const created = await createJobApplication(input);
    job_application_check(app, created);
    expect(created).toHaveProperty("email_status", app.email_status);

    await deleteJobApplication(created.job_application_id);
});

/**
 * aid function to get some data used in the tests
 *
 */
function getDataAssociatedWithApplication(job_application_id: number | undefined) {
    return Promise.all([
        prisma.attachment.findMany({
            where: {
                job_application_id: job_application_id
            }
        }),
        prisma.applied_role.findMany({
            where: {
                job_application_id: job_application_id
            }
        }),
        prisma.job_application_skill.findMany({
            where: {
                job_application_id: job_application_id
            }
        })
    ]);
}

it("should return the most recent job application of a student", async () => {
    const [students, osocs] = await Promise.all([prisma.student.findMany(), prisma.osoc.findMany()]);

    const expected = {
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
        email_status: email_status_enum.SENT,
        created_at: new Date("December 20, 2021 03:24:00"),
    }

    const found = await getLatestJobApplicationOfStudent(expected.student_id);

    const [attachments, applied_roles, job_application_skill] = await getDataAssociatedWithApplication(found?.job_application_id)

    if (found) {
        job_application_check(expected, found);
    }
    expect(found).toHaveProperty("email_status", expected.email_status);
    expect(found).toHaveProperty("attachment", attachments);
    expect(found).toHaveProperty("job_application_skill", job_application_skill);
    expect(found).toHaveProperty("applied_role", applied_roles);
});

it("should return the job application", async () => {
    const applications = await prisma.job_application.findMany();

    const expected = applications[0]


    const found = await getJobApplication(applications[0].job_application_id);

    const [attachments, applied_roles, job_application_skill] = await getDataAssociatedWithApplication(found?.job_application_id)

    if (found) {
        job_application_check(expected, found)
    }
    expect(found).toHaveProperty("email_status", expected.email_status);
    expect(found).toHaveProperty("attachment", attachments);
    expect(found).toHaveProperty("job_application_skill", job_application_skill);
    expect(found).toHaveProperty("applied_role", applied_roles);
});

it("should return all job applications of a year", async () => {

    const found = await getJobApplicationByYear(2022);

    // just check if all "extra" fields are there
    found.forEach((app) => {
        expect(app).toHaveProperty("attachment");
        expect(app.attachment).toBeTruthy();
        expect(app).toHaveProperty("job_application_skill");
        expect(app.job_application_skill).toBeTruthy();
        expect(app).toHaveProperty("applied_role");
        expect(app.applied_role).toBeTruthy();
    });

    // only 3 applications for the given osoc edition
    expect(found.length).toEqual(3);
});
