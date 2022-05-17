// only test successes because
// 1: checkSessionKey/isAdmin has been tested
// 2: orm functions are fully tested
// 3: respOrError has been tested
// 4: all parsers have been tested
// -> failures use those stacks and aren't usually caught in the routes
// -> if those stacks work, all failures work as well (because Promises).

import { getMockReq } from "@jest-mock/express";
import { Decision, WithUserID } from "../../types";
import {
    email_status_enum,
    type_enum,
    decision_enum,
    account_status_enum,
} from "@prisma/client";
import { errors } from "../../utility";

// setup mock for request
import * as req from "../../request";
jest.mock("../../request");
const reqMock = req as jest.Mocked<typeof req>;

// setup mock for utility
import * as util from "../../utility";
jest.mock("../../utility", () => {
    const og = jest.requireActual("../../utility");
    return {
        ...og,
        checkSessionKey: jest.fn(),
        isAdmin: jest.fn(),
    }; // we want to only mock checkSessionKey and isAdmin
});
const utilMock = util as jest.Mocked<typeof util>;

// setup mocks for orm
import * as ormo from "../../orm_functions/student";
jest.mock("../../orm_functions/student");
const ormoMock = ormo as jest.Mocked<typeof ormo>;

import * as ormoPerson from "../../orm_functions/person";
jest.mock("../../orm_functions/person");
const ormoMockPerson = ormoPerson as jest.Mocked<typeof ormoPerson>;

import * as ormoLogin from "../../orm_functions/login_user";
jest.mock("../../orm_functions/login_user");
const ormoMockLogin = ormoLogin as jest.Mocked<typeof ormoLogin>;

import * as ormoJob from "../../orm_functions/job_application";
jest.mock("../../orm_functions/job_application");
const ormoMockJob = ormoJob as jest.Mocked<typeof ormoJob>;

import * as ormoRole from "../../orm_functions/role";
jest.mock("../../orm_functions/role");
const ormoMockRole = ormoRole as jest.Mocked<typeof ormoRole>;

import * as ormoLanguage from "../../orm_functions/language";
jest.mock("../../orm_functions/language");
const ormoMockLanguage = ormoLanguage as jest.Mocked<typeof ormoLanguage>;

import * as ormoOsoc from "../../orm_functions/osoc";
jest.mock("../../orm_functions/osoc");
const ormoMockOsoc = ormoOsoc as jest.Mocked<typeof ormoOsoc>;

import * as ormoEval from "../../orm_functions/evaluation";
jest.mock("../../orm_functions/evaluation");
const ormoMockEval = ormoEval as jest.Mocked<typeof ormoEval>;

import * as student from "../../routes/student";

function expectCall<T, U>(func: T, val: U) {
    expect(func).toHaveBeenCalledTimes(1);
    expect(func).toHaveBeenCalledWith(val);
}

type KD<T> = { abcd: WithUserID<T>; defg: WithUserID<T> };
function keyData<T>(v: T): KD<T> {
    return {
        abcd: {
            userId: 0,
            data: v,
            accountStatus: "ACTIVATED",
            is_admin: true,
            is_coach: false,
        },
        defg: {
            userId: 0,
            data: v,
            accountStatus: "ACTIVATED",
            is_admin: false,
            is_coach: true,
        },
    };
}

const filter_student = {
    pagination: {
        page: 0,
        count: 3,
    },
    data: [
        {
            student_id: 0,
            person_id: 0,
            gender: "Male",
            pronouns: "",
            phone_number: "0457441257",
            nickname: "Wizard",
            alumni: true,
            person: {
                person_id: 0,
                name: "person0",
                email: "person0@mail.com",
                github: "",
                github_id: "0",
            },
            job_application: [
                {
                    job_application_id: 0,
                    student_id: 0,
                    responsibilities: "Responsibiliy0",
                    fun_fact: "Funfact0",
                    student_volunteer_info: "Volunteer0",
                    student_coach: true,
                    osoc_id: 0,
                    edus: ["Edu0"],
                    edu_level: "Master",
                    edu_duration: 5,
                    edu_year: "5",
                    edu_institute: "UGent",
                    email_status: email_status_enum.DRAFT,
                    created_at: new Date("2022-03-14 23:10:00+01"),
                    evaluation: [
                        {
                            evaluation_id: 0,
                            motivation: "good eval 0",
                            decision: decision_enum.YES,
                            is_final: true,
                            login_user: {
                                login_user_id: 0,
                                person: {
                                    person_id: 0,
                                    name: "person0",
                                    email: "person0@mail.com",
                                    github: "",
                                },
                            },
                        },
                    ],
                    attachment: [
                        {
                            attachment_id: 0,
                            job_application_id: 0,
                            data: ["attachment0"],
                            type: [type_enum.MOTIVATION_STRING],
                        },
                    ],
                    job_application_skill: [
                        {
                            job_application_skill_id: 0,
                            job_application_id: 0,
                            skill: "skill0",
                            language_id: 0,
                            level: 3,
                            is_preferred: true,
                            is_best: true,
                        },
                    ],
                    applied_role: [
                        {
                            role_id: 0,
                            applied_role_id: 0,
                            job_application_id: 0,
                            role: {
                                role_id: 0,
                                name: "Role0",
                            },
                        },
                    ],
                    language_id: 0,
                },
            ],
        },
    ],
};

const students = [
    {
        student_id: 0,
        person_id: 0,
        gender: "Male",
        pronouns: "",
        phone_number: "0457441257",
        nickname: "Wizard",
        alumni: true,
        person: {
            person_id: 0,
            name: "person0",
            email: "person0@mail.com",
            github: "",
            github_id: "0",
        },
    },
    {
        student_id: 1,
        person_id: 1,
        gender: "Female",
        pronouns: "",
        phone_number: "0489653214",
        nickname: "Unicorn",
        alumni: true,
        person: {
            person_id: 1,
            name: "person1",
            email: "person1@mail.com",
            github: "",
            github_id: "1",
        },
    },
    {
        student_id: 2,
        person_id: 2,
        gender: "Male",
        pronouns: "",
        phone_number: "0484623584",
        nickname: "Legend",
        alumni: false,
        person: {
            person_id: 2,
            name: "person2",
            email: "person2@mail.com",
            github: "",
            github_id: "2",
        },
    },
];

const latestJobApplication = [
    {
        job_application_id: 0,
        student_id: 0,
        responsibilities: "Responsibiliy0",
        fun_fact: "Funfact0",
        student_volunteer_info: "Volunteer0",
        student_coach: true,
        osoc_id: 0,
        edus: ["Edu0"],
        edu_level: "Master",
        edu_duration: 5,
        edu_year: "5",
        edu_institute: "UGent",
        email_status: email_status_enum.DRAFT,
        created_at: new Date("2022-03-14 23:10:00+01"),
        attachment: [
            {
                attachment_id: 0,
                job_application_id: 0,
                data: ["attachment0"],
                type: [type_enum.MOTIVATION_STRING],
            },
        ],
        job_application_skill: [
            {
                job_application_skill_id: 0,
                job_application_id: 0,
                skill: "skill0",
                language_id: 0,
                level: 3,
                is_preferred: true,
                is_best: true,
            },
        ],
        applied_role: [
            {
                role_id: 0,
                applied_role_id: 0,
                job_application_id: 0,
            },
        ],
        language_id: 0,
    },
    {
        job_application_id: 1,
        student_id: 1,
        responsibilities: "Responsibiliy1",
        fun_fact: "Funfact1",
        student_volunteer_info: "Volunteer1",
        student_coach: true,
        osoc_id: 0,
        edus: ["Edu0"],
        edu_level: "Master",
        edu_duration: 5,
        edu_year: "5",
        edu_institute: "UGent",
        email_status: email_status_enum.DRAFT,
        created_at: new Date("2022-03-14 23:10:00+01"),
        attachment: [
            {
                attachment_id: 1,
                job_application_id: 1,
                data: ["attachment1"],
                type: [type_enum.MOTIVATION_STRING],
            },
        ],
        job_application_skill: [
            {
                job_application_skill_id: 1,
                job_application_id: 1,
                skill: "skill1",
                language_id: 1,
                level: 3,
                is_preferred: true,
                is_best: true,
            },
        ],
        applied_role: [
            {
                role_id: 1,
                applied_role_id: 1,
                job_application_id: 1,
            },
        ],
        language_id: 1,
    },
    {
        job_application_id: 2,
        student_id: 2,
        responsibilities: "Responsibiliy2",
        fun_fact: "Funfact2",
        student_volunteer_info: "Volunteer2",
        student_coach: true,
        osoc_id: 0,
        edus: ["Edu0"],
        edu_level: "Master",
        edu_duration: 5,
        edu_year: "5",
        edu_institute: "UGent",
        email_status: email_status_enum.DRAFT,
        created_at: new Date("2022-03-14 23:10:00+01"),
        attachment: [
            {
                attachment_id: 2,
                job_application_id: 2,
                data: ["attachment2"],
                type: [type_enum.MOTIVATION_STRING],
            },
        ],
        job_application_skill: [
            {
                job_application_skill_id: 2,
                job_application_id: 2,
                skill: "skill2",
                language_id: 2,
                level: 3,
                is_preferred: true,
                is_best: true,
            },
        ],
        applied_role: [
            {
                role_id: 2,
                applied_role_id: 2,
                job_application_id: 2,
            },
        ],
        language_id: 2,
    },
];

const roles = [
    {
        role_id: 0,
        name: "Role0",
    },
    {
        role_id: 1,
        name: "Role1",
    },
    {
        role_id: 2,
        name: "Role2",
    },
];

const studentEvaluations = [
    [
        {
            osoc: { osocid: 0, year: 2022 },
            evaluation: [
                {
                    evaluation_id: 0,
                    motivation: "good eval 0",
                    decision: decision_enum.YES,
                    is_final: true,
                    login_user: {
                        login_user_id: 0,
                        person: {
                            person_id: 0,
                            name: "person0",
                            email: "person0@mail.com",
                            github: "",
                        },
                    },
                },
            ],
        },
    ],
    [
        {
            osoc: { osocid: 0, year: 2022 },
            evaluation: [
                {
                    evaluation_id: 0,
                    motivation: "good eval 0",
                    decision: decision_enum.YES,
                    is_final: true,
                    login_user: {
                        login_user_id: 0,
                        person: {
                            person_id: 0,
                            name: "person0",
                            email: "person0@mail.com",
                            github: "",
                        },
                    },
                },
            ],
        },
    ],
    [
        {
            osoc: { osocid: 0, year: 2022 },
            evaluation: [
                {
                    evaluation_id: 0,
                    motivation: "good eval 0",
                    decision: decision_enum.YES,
                    is_final: true,
                    login_user: {
                        login_user_id: 0,
                        person: {
                            person_id: 0,
                            name: "person0",
                            email: "person0@mail.com",
                            github: "",
                        },
                    },
                },
            ],
        },
    ],
];
const studentEvaluationsByYear = [
    {
        evaluation: [
            {
                evaluation_id: 0,
                motivation: "good eval 0",
                decision: decision_enum.YES,
                is_final: true,
                login_user: {
                    login_user_id: 0,
                    person_id: 0,
                    account_status: account_status_enum.ACTIVATED,
                    is_admin: true,
                    is_coach: true,
                    password: "Password",
                    person: {
                        person_id: 0,
                        name: "person0",
                        email: "person0@mail.com",
                        github: "",
                        github_id: "0",
                    },
                },
            },
        ],
    },

    {
        evaluation: [
            {
                evaluation_id: 0,
                motivation: "good eval 0",
                decision: decision_enum.YES,
                is_final: true,
                login_user: {
                    login_user_id: 0,
                    person_id: 0,
                    account_status: account_status_enum.ACTIVATED,
                    is_admin: true,
                    is_coach: true,
                    password: "Password",
                    person: {
                        person_id: 0,
                        name: "person0",
                        email: "person0@mail.com",
                        github: "",
                        github_id: "0",
                    },
                },
            },
        ],
    },

    {
        evaluation: [
            {
                evaluation_id: 0,
                motivation: "good eval 0",
                decision: decision_enum.YES,
                is_final: true,
                login_user: {
                    login_user_id: 0,
                    person_id: 0,
                    account_status: account_status_enum.ACTIVATED,
                    is_admin: true,
                    is_coach: true,
                    password: "Password",
                    person: {
                        person_id: 0,
                        name: "person0",
                        email: "person0@mail.com",
                        github: "",
                        github_id: "0",
                    },
                },
            },
        ],
    },
];
const language = [
    {
        language_id: 0,
        name: "language0",
    },
    {
        language_id: 1,
        name: "language1",
    },
    {
        language_id: 1,
        name: "language1",
    },
];

beforeEach(() => {
    reqMock.parseStudentAllRequest.mockImplementation((v) =>
        Promise.resolve(v.body)
    );
    reqMock.parseSingleStudentRequest.mockImplementation((v) =>
        Promise.resolve(v.body)
    );
    reqMock.parseDeleteStudentRequest.mockImplementation((v) =>
        Promise.resolve(v.body)
    );
    reqMock.parseSuggestStudentRequest.mockImplementation((v) =>
        Promise.resolve(v.body)
    );
    reqMock.parseGetSuggestionsStudentRequest.mockImplementation((v) =>
        Promise.resolve(v.body)
    );
    reqMock.parseFinalizeDecisionRequest.mockImplementation((v) =>
        Promise.resolve(v.body)
    );
    reqMock.parseFilterStudentsRequest.mockImplementation((v) =>
        Promise.resolve(v.body)
    );

    utilMock.checkSessionKey.mockImplementation((v) =>
        Promise.resolve({
            userId: 0,
            data: v,
            accountStatus: "ACTIVATED",
            is_admin: true,
            is_coach: false,
        })
    );
    utilMock.isAdmin.mockImplementation((v) =>
        v.sessionkey == "abcd"
            ? Promise.resolve(keyData(v).abcd)
            : Promise.reject(util.errors.cookInsufficientRights())
    );

    ormoMock.getAllStudents.mockResolvedValue(students);
    ormoMock.deleteStudent.mockImplementation((y) =>
        Promise.resolve(students[y])
    );
    ormoMock.filterStudents.mockImplementation(() =>
        Promise.resolve(filter_student)
    );
    ormoMockPerson.deletePersonById.mockImplementation((y) =>
        Promise.resolve(students[y].person)
    );
    ormoMock.getStudent.mockImplementation((y) => Promise.resolve(students[y]));
    ormoMockJob.getLatestJobApplicationOfStudent.mockImplementation((y) =>
        Promise.resolve(latestJobApplication[y])
    );
    ormoMockJob.getStudentEvaluationsTemp.mockImplementation((y) =>
        Promise.resolve(studentEvaluations[y])
    );
    ormoMockJob.getEvaluationsByYearForStudent.mockImplementation((id) =>
        Promise.resolve(studentEvaluationsByYear[id])
    );
    ormoMockRole.getRole.mockImplementation((y) => Promise.resolve(roles[y]));
    ormoMockJob.getStudentEvaluationsTotal.mockImplementation((y) =>
        Promise.resolve(studentEvaluations[y])
    );
    ormoMockLanguage.getLanguage.mockImplementation((y) =>
        Promise.resolve(language[y])
    );
    ormoMockOsoc.getLatestOsoc.mockImplementation(() =>
        Promise.resolve({ osoc_id: 0, year: 2022 })
    );
    ormoMockEval.createEvaluationForStudent.mockImplementation(() =>
        Promise.resolve({
            evaluation_id: 0,
            login_user_id: 0,
            job_application_id: 0,
            decision: Decision.NO,
            motivation: "You are not accepted for osoc",
            is_final: true,
        })
    );
    ormoMockEval.updateEvaluationForStudent.mockImplementation((y) =>
        Promise.resolve({
            evaluation_id: y.evaluation_id,
            login_user_id: y.loginUserId,
            job_application_id: 0,
            decision: y.decision || decision_enum.YES,
            motivation: y.motivation || null,
            is_final: false,
        })
    );

    ormoMockLogin.getLoginUserById.mockImplementation((id) =>
        Promise.resolve(studentEvaluationsByYear[id].evaluation[0].login_user)
    );
});

afterEach(() => {
    reqMock.parseStudentAllRequest.mockReset();
    reqMock.parseSingleStudentRequest.mockReset();
    reqMock.parseDeleteStudentRequest.mockReset();
    reqMock.parseSuggestStudentRequest.mockReset();
    reqMock.parseGetSuggestionsStudentRequest.mockReset();
    reqMock.parseFinalizeDecisionRequest.mockReset();
    reqMock.parseFilterStudentsRequest.mockReset();

    utilMock.checkSessionKey.mockReset();
    utilMock.isAdmin.mockReset();

    ormoMock.getAllStudents.mockReset();
    ormoMock.getStudent.mockReset();
    ormoMock.filterStudents.mockReset();
    ormoMockJob.getLatestJobApplicationOfStudent.mockReset();
    ormoMockJob.getEvaluationsByYearForStudent.mockReset();
    ormoMockRole.getRole.mockReset();
    ormoMockJob.getStudentEvaluationsTotal.mockReset();
    ormoMockLanguage.getLanguage.mockReset();
    ormoMockOsoc.getLatestOsoc.mockReset();
    ormoMockEval.updateEvaluationForStudent.mockReset();
    ormoMockEval.createEvaluationForStudent.mockReset();
    ormoMockLogin.getLoginUserById.mockReset();
});

test("Can get a student by id", async () => {
    const r = getMockReq();
    r.body = {
        sessionkey: "abcd",
        id: 0,
    };
    await expect(student.getStudent(r)).resolves.toStrictEqual({
        evaluation: {
            evaluations: [
                {
                    decision: "YES",
                    evaluation_id: 0,
                    is_final: true,
                    login_user: {
                        account_status: "ACTIVATED",
                        is_admin: true,
                        is_coach: true,
                        login_user_id: 0,
                        password: "Password",
                        person: {
                            email: "person0@mail.com",
                            github: "",
                            github_id: "0",
                            name: "person0",
                            person_id: 0,
                        },
                        person_id: 0,
                    },
                    motivation: "good eval 0",
                },
            ],
            osoc: {
                year: 2022,
            },
        },
        evaluations: undefined,
        jobApplication: {
            applied_role: [
                {
                    applied_role_id: 0,
                    job_application_id: 0,
                    role_id: 0,
                },
            ],
            attachment: [
                {
                    attachment_id: 0,
                    data: ["attachment0"],
                    job_application_id: 0,
                    type: ["MOTIVATION_STRING"],
                },
            ],
            created_at: new Date("2022-03-14T22:10:00.000Z"),
            edu_duration: 5,
            edu_institute: "UGent",
            edu_level: "Master",
            edu_year: "5",
            edus: ["Edu0"],
            email_status: "DRAFT",
            fun_fact: "Funfact0",
            job_application_id: 0,
            job_application_skill: [
                {
                    is_best: true,
                    is_preferred: true,
                    job_application_id: 0,
                    job_application_skill_id: 0,
                    language_id: 0,
                    level: 3,
                    skill: "language0",
                },
            ],
            language_id: 0,
            osoc_id: 0,
            responsibilities: "Responsibiliy0",
            student_coach: true,
            student_id: 0,
            student_volunteer_info: "Volunteer0",
        },
        roles: ["Role0"],
        student: {
            alumni: true,
            gender: "Male",
            nickname: "Wizard",
            person: {
                email: "person0@mail.com",
                github: "",
                github_id: "0",
                name: "person0",
                person_id: 0,
            },
            person_id: 0,
            phone_number: "0457441257",
            pronouns: "",
            student_id: 0,
        },
    });
    expectCall(reqMock.parseSingleStudentRequest, r);
    expectCall(utilMock.checkSessionKey, r.body);
    expectCall(ormoMock.getStudent, 0);
});

test("Fails if no student was found in getStudent", async () => {
    const r = getMockReq();
    const id = 1000;

    r.body = {
        sessionkey: "abcd",
        year: 2025,
    };

    r.params.id = id.toString();

    // override
    ormoMock.getStudent.mockResolvedValueOnce(null);

    await expect(student.getStudent(r)).rejects.toBe(errors.cookInvalidID());

    ormoMock.getStudent.mockReset();
});

test("Job application wasn't found in getStudent", async () => {
    const r = getMockReq();
    const id = 0;

    r.body = {
        sessionkey: "abcd",
    };

    r.params.id = id.toString();

    // override
    ormoMockJob.getLatestJobApplicationOfStudent.mockResolvedValue(null);
    ormoMock.getStudent.mockResolvedValueOnce({
        student_id: 1,
        person_id: 1,
        gender: "Male",
        pronouns: null,
        phone_number: "0923418389",
        nickname: null,
        alumni: true,
        person: {
            person_id: 1,
            email: "test@mail.com",
            github: null,
            name: "Name",
            github_id: null,
        },
    });

    await expect(student.getStudent(r)).rejects.toBe(errors.cookInvalidID());

    ormoMockJob.getLatestJobApplicationOfStudent.mockReset();
    ormoMock.getStudent.mockReset();
});

test("Role wasn't found in getStudent", async () => {
    const r = getMockReq();
    const id = 0;

    r.body = {
        sessionkey: "abcd",
    };

    r.params.id = id.toString();

    // override
    ormoMock.getStudent.mockResolvedValueOnce({
        student_id: 1,
        person_id: 1,
        gender: "Male",
        pronouns: null,
        phone_number: "0923418389",
        nickname: null,
        alumni: true,
        person: {
            person_id: 1,
            email: "test@mail.com",
            github: null,
            name: "Name",
            github_id: null,
        },
    });

    ormoMockJob.getLatestJobApplicationOfStudent.mockResolvedValue({
        applied_role: [
            {
                applied_role_id: 0,
                job_application_id: 0,
                role_id: 0,
            },
        ],
        attachment: [],
        created_at: new Date("2022-03-14T22:10:00.000Z"),
        edu_duration: 5,
        edu_institute: "UGent",
        edu_level: "Master",
        edu_year: "5",
        edus: ["Edu0"],
        email_status: "DRAFT",
        fun_fact: "Funfact0",
        job_application_id: 0,
        job_application_skill: [],
        osoc_id: 0,
        responsibilities: "Responsibiliy0",
        student_coach: true,
        student_id: 0,
        student_volunteer_info: "Volunteer0",
    });

    ormoMockRole.getRole.mockResolvedValue(null);

    await expect(student.getStudent(r)).rejects.toBe(errors.cookInvalidID());

    ormoMockJob.getLatestJobApplicationOfStudent.mockReset();
    ormoMockRole.getRole.mockReset();
    ormoMock.getStudent.mockReset();
});

test("Year is defined in the getStudent request and skill language is invalid", async () => {
    const r = getMockReq();
    const id = 0;

    r.body = {
        sessionkey: "abcd",
        year: 2022,
    };

    r.params.id = id.toString();

    // override
    ormoMock.getStudent.mockResolvedValueOnce({
        student_id: 1,
        person_id: 1,
        gender: "Male",
        pronouns: null,
        phone_number: "0923418389",
        nickname: null,
        alumni: true,
        person: {
            person_id: 1,
            email: "test@mail.com",
            github: null,
            name: "Name",
            github_id: null,
        },
    });

    ormoMockJob.getLatestJobApplicationOfStudent.mockResolvedValue({
        applied_role: [],
        attachment: [],
        created_at: new Date("2022-03-14T22:10:00.000Z"),
        edu_duration: 5,
        edu_institute: "UGent",
        edu_level: "Master",
        edu_year: "5",
        edus: ["Edu0"],
        email_status: "DRAFT",
        fun_fact: "Funfact0",
        job_application_id: 0,
        job_application_skill: [
            {
                is_best: true,
                is_preferred: true,
                job_application_id: 0,
                job_application_skill_id: 0,
                language_id: 0,
                level: 3,
                skill: "language0",
            },
        ],
        osoc_id: 0,
        responsibilities: "Responsibiliy0",
        student_coach: true,
        student_id: 0,
        student_volunteer_info: "Volunteer0",
    });

    ormoMockJob.getEvaluationsByYearForStudent.mockResolvedValue(null);

    ormoMockLanguage.getLanguage.mockResolvedValue(null);

    await expect(student.getStudent(r)).rejects.toBe(errors.cookInvalidID());

    ormoMockJob.getLatestJobApplicationOfStudent.mockReset();
    ormoMock.getStudent.mockReset();
    ormoMockJob.getEvaluationsByYearForStudent.mockReset();
    ormoMockLanguage.getLanguage.mockReset();
});

test("Can create a student confirmation", async () => {
    const r = getMockReq();
    r.body = {
        sessionkey: "abcd",
        id: 0,
        reply: Decision.NO,
        reason: "You are not accepted for osoc",
    };
    await expect(student.createStudentConfirmation(r)).resolves.toStrictEqual(
        {}
    );
    expectCall(reqMock.parseFinalizeDecisionRequest, r);
    expectCall(utilMock.checkSessionKey, r.body);
    expectCall(ormoMock.getStudent, 0);
    expectCall(ormoMockEval.createEvaluationForStudent, {
        loginUserId: 0,
        jobApplicationId: 0,
        decision: Decision.NO,
        motivation: "You are not accepted for osoc",
        isFinal: true,
    });
});

test("Can create a student evaluation", async () => {
    const r = getMockReq();

    // override
    ormoMockJob.getStudentEvaluationsTemp.mockReset();
    ormoMockJob.getStudentEvaluationsTemp.mockResolvedValue([]);

    r.body = {
        sessionkey: "abcd",
        id: 0,
        suggestion: "YES",
        reason: "You are not accepted for osoc",
    };
    await expect(student.createStudentSuggestion(r)).resolves.toStrictEqual({});
    expectCall(reqMock.parseSuggestStudentRequest, r);
    expectCall(utilMock.checkSessionKey, r.body);
    expectCall(ormoMock.getStudent, 0);
    expectCall(ormoMockEval.createEvaluationForStudent, {
        loginUserId: 0,
        jobApplicationId: 0,
        decision: "YES",
        motivation: "You are not accepted for osoc",
        isFinal: false,
    });
});

test("Fails if no student was found in createStudentSuggestion", async () => {
    const r = getMockReq();
    const id = 1000;

    r.body = {
        sessionkey: "abcd",
        suggestion: "YES",
    };

    r.params.id = id.toString();

    // override
    ormoMock.getStudent.mockResolvedValueOnce(null);

    await expect(student.createStudentSuggestion(r)).rejects.toBe(
        errors.cookInvalidID()
    );

    ormoMock.getStudent.mockReset();
});

test("No osoc year in the database for createStudentSuggestion", async () => {
    const r = getMockReq();
    const id = 0;

    r.body = {
        sessionkey: "abcd",
        suggestion: "YES",
    };

    r.params.id = id.toString();

    // override
    ormoMock.getStudent.mockResolvedValueOnce({
        student_id: 1,
        person_id: 1,
        gender: "Male",
        pronouns: null,
        phone_number: "0923418389",
        nickname: null,
        alumni: true,
        person: {
            person_id: 1,
            email: "test@mail.com",
            github: null,
            name: "Name",
            github_id: null,
        },
    });
    ormoMockOsoc.getLatestOsoc.mockResolvedValue(null);

    await expect(student.createStudentSuggestion(r)).rejects.toBe(
        errors.cookNoDataError()
    );

    ormoMockOsoc.getLatestOsoc.mockReset();
    ormoMock.getStudent.mockReset();
});

test("Can get student suggestions", async () => {
    const r = getMockReq();
    r.body = {
        sessionkey: "abcd",
        id: 0,
    };

    const result = {
        evaluation: {
            evaluations: [
                {
                    decision: "YES",
                    evaluation_id: 0,
                    is_final: true,
                    login_user: {
                        account_status: "ACTIVATED",
                        is_admin: true,
                        is_coach: true,
                        login_user_id: 0,
                        password: "Password",
                        person: {
                            email: "person0@mail.com",
                            github: "",
                            github_id: "0",
                            name: "person0",
                            person_id: 0,
                        },
                        person_id: 0,
                    },
                    motivation: "good eval 0",
                },
            ],
            osoc: {
                year: 2022,
            },
        },
    }; // please clean up?
    await expect(student.getStudentSuggestions(r)).resolves.toStrictEqual(
        result
    );
    expectCall(reqMock.parseGetSuggestionsStudentRequest, r);
    expectCall(utilMock.checkSessionKey, r.body);
    expectCall(ormoMock.getStudent, 0);
});

test("Can filter students", async () => {
    const r = getMockReq();
    r.body = {
        sessionkey: "abcd",
        emailFilter: "person0@mail.com",
    };
    await expect(student.filterStudents(r)).resolves.toStrictEqual({
        data: [
            {
                evaluation: {
                    evaluations: [
                        {
                            decision: "YES",
                            evaluation_id: 0,
                            is_final: true,
                            login_user: {
                                account_status: "ACTIVATED",
                                is_admin: true,
                                is_coach: true,
                                login_user_id: 0,
                                password: "Password",
                                person: {
                                    email: "person0@mail.com",
                                    github: "",
                                    github_id: "0",
                                    name: "person0",
                                    person_id: 0,
                                },
                                person_id: 0,
                            },
                            motivation: "good eval 0",
                        },
                    ],
                    osoc: {
                        year: 2022,
                    },
                },
                evaluations: undefined,
                jobApplication: {
                    applied_role: [
                        {
                            applied_role_id: 0,
                            job_application_id: 0,
                            role_id: 0,
                        },
                    ],
                    attachment: [
                        {
                            attachment_id: 0,
                            data: ["attachment0"],
                            job_application_id: 0,
                            type: ["MOTIVATION_STRING"],
                        },
                    ],
                    created_at: new Date("2022-03-14T22:10:00.000Z"),
                    edu_duration: 5,
                    edu_institute: "UGent",
                    edu_level: "Master",
                    edu_year: "5",
                    edus: ["Edu0"],
                    email_status: "DRAFT",
                    fun_fact: "Funfact0",
                    job_application_id: 0,
                    job_application_skill: [
                        {
                            is_best: true,
                            is_preferred: true,
                            job_application_id: 0,
                            job_application_skill_id: 0,
                            language_id: 0,
                            level: 3,
                            skill: "language0",
                        },
                    ],
                    language_id: 0,
                    osoc_id: 0,
                    responsibilities: "Responsibiliy0",
                    student_coach: true,
                    student_id: 0,
                    student_volunteer_info: "Volunteer0",
                },
                roles: ["Role0"],
                student: {
                    alumni: true,
                    gender: "Male",
                    job_application: [
                        {
                            applied_role: [
                                {
                                    applied_role_id: 0,
                                    job_application_id: 0,
                                    role: {
                                        name: "Role0",
                                        role_id: 0,
                                    },
                                    role_id: 0,
                                },
                            ],
                            attachment: [
                                {
                                    attachment_id: 0,
                                    data: ["attachment0"],
                                    job_application_id: 0,
                                    type: ["MOTIVATION_STRING"],
                                },
                            ],
                            created_at: new Date("2022-03-14T22:10:00.000Z"),
                            edu_duration: 5,
                            edu_institute: "UGent",
                            edu_level: "Master",
                            edu_year: "5",
                            edus: ["Edu0"],
                            email_status: "DRAFT",
                            evaluation: [
                                {
                                    decision: "YES",
                                    evaluation_id: 0,
                                    is_final: true,
                                    login_user: {
                                        login_user_id: 0,
                                        person: {
                                            email: "person0@mail.com",
                                            github: "",
                                            name: "person0",
                                            person_id: 0,
                                        },
                                    },
                                    motivation: "good eval 0",
                                },
                            ],
                            fun_fact: "Funfact0",
                            job_application_id: 0,
                            job_application_skill: [
                                {
                                    is_best: true,
                                    is_preferred: true,
                                    job_application_id: 0,
                                    job_application_skill_id: 0,
                                    language_id: 0,
                                    level: 3,
                                    skill: "skill0",
                                },
                            ],
                            language_id: 0,
                            osoc_id: 0,
                            responsibilities: "Responsibiliy0",
                            student_coach: true,
                            student_id: 0,
                            student_volunteer_info: "Volunteer0",
                        },
                    ],
                    nickname: "Wizard",
                    person: {
                        email: "person0@mail.com",
                        github: "",
                        github_id: "0",
                        name: "person0",
                        person_id: 0,
                    },
                    person_id: 0,
                    phone_number: "0457441257",
                    pronouns: "",
                    student_id: 0,
                },
            },
        ],
        pagination: {
            count: 3,
            page: 0,
        },
    });
    expectCall(reqMock.parseFilterStudentsRequest, r);
    expectCall(utilMock.checkSessionKey, r.body);
    expect(ormoMock.filterStudents).toHaveBeenCalledWith(
        { currentPage: undefined, pageSize: undefined },
        undefined,
        "person0@mail.com",
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined
    );
});

test("Can delete a student by id", async () => {
    const r = getMockReq();
    r.body = {
        sessionkey: "abcd",
        id: 0,
    };
    await expect(student.deleteStudent(r)).resolves.toStrictEqual({});
    expectCall(reqMock.parseDeleteStudentRequest, r);
    expectCall(utilMock.isAdmin, r.body);
    expectCall(ormoMock.deleteStudent, 0);
});

test("Job application is null for filterStudents", async () => {
    const r = getMockReq();

    r.body = {
        sessionkey: "abcd",
        osocYear: 2022,
    };

    // override
    ormoMock.filterStudents.mockResolvedValueOnce(filter_student);
    ormoMockJob.getLatestJobApplicationOfStudent.mockResolvedValue(null);

    await expect(student.filterStudents(r)).rejects.toBe(
        errors.cookInvalidID()
    );

    ormoMockJob.getLatestJobApplicationOfStudent.mockReset();
    ormoMock.filterStudents.mockReset();
});

test("Role wasn't found in filterStudents", async () => {
    const r = getMockReq();
    const id = 0;

    r.body = {
        sessionkey: "abcd",
    };

    r.params.id = id.toString();

    // override
    ormoMock.filterStudents.mockResolvedValueOnce(filter_student);

    ormoMockJob.getLatestJobApplicationOfStudent.mockResolvedValue({
        job_application_id: 0,
        student_id: 0,
        responsibilities: "Responsibiliy0",
        fun_fact: "Funfact0",
        student_volunteer_info: "Volunteer0",
        student_coach: true,
        osoc_id: 0,
        edus: ["Edu0"],
        edu_level: "Master",
        edu_duration: 5,
        edu_year: "5",
        edu_institute: "UGent",
        email_status: email_status_enum.DRAFT,
        created_at: new Date("2022-03-14 23:10:00+01"),
        attachment: [
            {
                attachment_id: 0,
                job_application_id: 0,
                data: ["attachment0"],
                type: [type_enum.MOTIVATION_STRING],
            },
        ],
        job_application_skill: [
            {
                job_application_skill_id: 0,
                job_application_id: 0,
                skill: "skill0",
                language_id: 0,
                level: 3,
                is_preferred: true,
                is_best: true,
            },
        ],
        applied_role: [
            {
                role_id: 0,
                applied_role_id: 0,
                job_application_id: 0,
            },
        ],
    });

    ormoMockRole.getRole.mockResolvedValue(null);

    await expect(student.filterStudents(r)).rejects.toBe(
        errors.cookInvalidID()
    );

    ormoMockJob.getLatestJobApplicationOfStudent.mockReset();
    ormoMockRole.getRole.mockReset();
    ormoMock.filterStudents.mockReset();
});

test("Skill language is invalid for filterStudents", async () => {
    const r = getMockReq();
    const id = 0;

    r.body = {
        sessionkey: "abcd",
        year: 2022,
    };

    r.params.id = id.toString();

    // override
    ormoMock.filterStudents.mockResolvedValueOnce(filter_student);

    ormoMockJob.getLatestJobApplicationOfStudent.mockResolvedValue({
        job_application_id: 0,
        student_id: 0,
        responsibilities: "Responsibiliy0",
        fun_fact: "Funfact0",
        student_volunteer_info: "Volunteer0",
        student_coach: true,
        osoc_id: 0,
        edus: ["Edu0"],
        edu_level: "Master",
        edu_duration: 5,
        edu_year: "5",
        edu_institute: "UGent",
        email_status: email_status_enum.DRAFT,
        created_at: new Date("2022-03-14 23:10:00+01"),
        attachment: [
            {
                attachment_id: 0,
                job_application_id: 0,
                data: ["attachment0"],
                type: [type_enum.MOTIVATION_STRING],
            },
        ],
        job_application_skill: [
            {
                job_application_skill_id: 0,
                job_application_id: 0,
                skill: "skill0",
                language_id: 0,
                level: 3,
                is_preferred: true,
                is_best: true,
            },
        ],
        applied_role: [
            {
                role_id: 0,
                applied_role_id: 0,
                job_application_id: 0,
            },
        ],
    });

    ormoMockJob.getEvaluationsByYearForStudent.mockResolvedValue(null);

    ormoMockLanguage.getLanguage.mockResolvedValue(null);

    await expect(student.filterStudents(r)).rejects.toBe(
        errors.cookInvalidID()
    );

    ormoMockJob.getLatestJobApplicationOfStudent.mockReset();
    ormoMock.filterStudents.mockReset();
    ormoMockJob.getEvaluationsByYearForStudent.mockReset();
    ormoMockLanguage.getLanguage.mockReset();
});

test("Suggestion not empty in createStudentSuggestion", async () => {
    const r = getMockReq();
    const id = 0;

    r.body = {
        sessionkey: "abcd",
        suggestion: "YES",
    };

    r.params.id = id.toString();

    // override
    ormoMock.getStudent.mockResolvedValueOnce({
        student_id: 1,
        person_id: 1,
        gender: "Male",
        pronouns: null,
        phone_number: "0923418386",
        nickname: null,
        alumni: true,
        person: {
            person_id: 1,
            email: "test@mail.com",
            github: null,
            name: "Name",
            github_id: null,
        },
    });
    ormoMockOsoc.getLatestOsoc.mockResolvedValue({
        year: 2022,
        osoc_id: 1,
    });

    ormoMockJob.getStudentEvaluationsTemp.mockResolvedValue([
        {
            osoc: { year: 2022 },
            evaluation: [
                {
                    decision: Decision.YES,
                    motivation: null,
                    evaluation_id: 1,
                    is_final: false,
                    login_user: {
                        login_user_id: 1,
                        person: {
                            person_id: 2,
                            name: "Login user",
                            email: "user@mail.com",
                            github: null,
                        },
                    },
                },
            ],
        },
    ]);

    ormoMockJob.getLatestJobApplicationOfStudent.mockResolvedValue(null);

    await expect(student.createStudentSuggestion(r)).rejects.toBe(
        errors.cookInvalidID()
    );

    ormoMockOsoc.getLatestOsoc.mockReset();
    ormoMock.getStudent.mockReset();
    ormoMockJob.getStudentEvaluationsTemp.mockReset();
    ormoMockJob.getLatestJobApplicationOfStudent.mockReset();
});

test("Update evaluation in createStudentSuggestion", async () => {
    const r = getMockReq();
    const id = 1;

    r.body = {
        sessionkey: "abcd",
        suggestion: "YES",
    };

    r.params.id = id.toString();

    // override
    ormoMock.getStudent.mockResolvedValueOnce({
        student_id: 1,
        person_id: 1,
        gender: "Female",
        pronouns: null,
        phone_number: "0923418387",
        nickname: null,
        alumni: true,
        person: {
            person_id: 1,
            email: "test@mail.com",
            github: null,
            name: "Name",
            github_id: null,
        },
    });
    ormoMockOsoc.getLatestOsoc.mockResolvedValue({
        year: 2022,
        osoc_id: 1,
    });

    ormoMockJob.getStudentEvaluationsTemp.mockResolvedValue([
        {
            osoc: { year: 2022 },
            evaluation: [
                {
                    decision: Decision.YES,
                    motivation: null,
                    evaluation_id: 1,
                    is_final: false,
                    login_user: {
                        login_user_id: 1,
                        person: {
                            person_id: 2,
                            name: "Login user",
                            email: "usermail@mail.com",
                            github: null,
                        },
                    },
                },
            ],
        },
    ]);

    ormoMockJob.getLatestJobApplicationOfStudent.mockResolvedValue({
        applied_role: [
            {
                applied_role_id: 0,
                job_application_id: 0,
                role_id: 0,
            },
        ],
        attachment: [],
        created_at: new Date("2022-03-14T22:10:00.000Z"),
        edu_duration: 4,
        edu_institute: "UGent",
        edu_level: "Master",
        edu_year: "4",
        edus: ["Edu0"],
        email_status: "DRAFT",
        fun_fact: "Funfact0",
        job_application_id: 0,
        job_application_skill: [],
        osoc_id: 1,
        responsibilities: "Responsibiliy0",
        student_coach: true,
        student_id: 0,
        student_volunteer_info: "Volunteer0",
    });

    utilMock.checkSessionKey.mockImplementation((v) =>
        Promise.resolve({
            userId: 1,
            data: v,
            accountStatus: "ACTIVATED",
            is_admin: true,
            is_coach: true,
        })
    );

    await expect(student.createStudentSuggestion(r)).resolves.toStrictEqual({});

    ormoMockOsoc.getLatestOsoc.mockReset();
    ormoMock.getStudent.mockReset();
    ormoMockJob.getStudentEvaluationsTemp.mockReset();
    ormoMockJob.getLatestJobApplicationOfStudent.mockReset();
    utilMock.checkSessionKey.mockReset();
});

test("New evaluation in createStudentSuggestion", async () => {
    const r = getMockReq();
    const id = 0;

    r.body = {
        sessionkey: "abcd",
        suggestion: "YES",
    };

    r.params.id = id.toString();

    // override
    ormoMock.getStudent.mockResolvedValueOnce({
        student_id: 1,
        person_id: 1,
        gender: "Male",
        pronouns: null,
        phone_number: "0923418387",
        nickname: null,
        alumni: true,
        person: {
            person_id: 1,
            email: "test@mail.com",
            github: null,
            name: "Name",
            github_id: null,
        },
    });
    ormoMockOsoc.getLatestOsoc.mockResolvedValue({
        year: 2022,
        osoc_id: 1,
    });

    ormoMockJob.getStudentEvaluationsTemp.mockResolvedValue([]);

    ormoMockJob.getLatestJobApplicationOfStudent.mockResolvedValue({
        applied_role: [
            {
                applied_role_id: 0,
                job_application_id: 0,
                role_id: 0,
            },
        ],
        attachment: [],
        created_at: new Date("2022-03-14T22:10:00.000Z"),
        edu_duration: 5,
        edu_institute: "UGent",
        edu_level: "Master",
        edu_year: "5",
        edus: ["Edu0"],
        email_status: "DRAFT",
        fun_fact: "Funfact0",
        job_application_id: 0,
        job_application_skill: [],
        osoc_id: 1,
        responsibilities: "Responsibiliy0",
        student_coach: true,
        student_id: 0,
        student_volunteer_info: "Volunteer0",
    });

    ormoMockEval.createEvaluationForStudent.mockResolvedValue({
        login_user_id: null,
        evaluation_id: 3,
        job_application_id: 0,
        decision: Decision.NO,
        motivation: null,
        is_final: false,
    });

    utilMock.checkSessionKey.mockImplementation((v) =>
        Promise.resolve({
            userId: 0,
            data: v,
            accountStatus: "ACTIVATED",
            is_admin: true,
            is_coach: true,
        })
    );

    await expect(student.createStudentSuggestion(r)).rejects.toBe(
        errors.cookInvalidID()
    );

    ormoMockOsoc.getLatestOsoc.mockReset();
    ormoMock.getStudent.mockReset();
    ormoMockJob.getStudentEvaluationsTemp.mockReset();
    ormoMockJob.getLatestJobApplicationOfStudent.mockReset();
    utilMock.checkSessionKey.mockReset();
    ormoMockEval.createEvaluationForStudent.mockReset();
});

test("Fails if no student was found in getStudentSuggestions", async () => {
    const r = getMockReq();
    const id = 1000;

    r.body = {
        sessionkey: "abcd",
    };

    r.params.id = id.toString();

    // override
    ormoMock.getStudent.mockResolvedValueOnce(null);

    await expect(student.getStudentSuggestions(r)).rejects.toBe(
        errors.cookInvalidID()
    );

    ormoMock.getStudent.mockReset();
});

test("Student was found in getStudentSuggestions", async () => {
    const r = getMockReq();
    const id = 0;

    r.body = {
        sessionkey: "abcd",
        year: 2023,
    };

    r.params.id = id.toString();

    // override
    ormoMock.getStudent.mockResolvedValueOnce({
        student_id: 2,
        person_id: 1,
        gender: "Male",
        pronouns: null,
        phone_number: "0923418389",
        nickname: null,
        alumni: true,
        person: {
            person_id: 1,
            email: "test@mail.com",
            github: null,
            name: "Name",
            github_id: null,
        },
    });

    ormoMockJob.getEvaluationsByYearForStudent.mockResolvedValue(null);

    await expect(student.getStudentSuggestions(r)).resolves.toStrictEqual({
        evaluation: {
            evaluations: [],
            osoc: {
                year: 2023,
            },
        },
    });

    ormoMock.getStudent.mockReset();
    ormoMockJob.getEvaluationsByYearForStudent.mockReset();
});
