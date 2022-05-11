// only test successes because
// 1: checkSessionKey/isAdmin has been tested
// 2: orm functions are fully tested
// 3: respOrError has been tested
// 4: all parsers have been tested
// -> failures use those stacks and aren't usually caught in the routes
// -> if those stacks work, all failures work as well (because Promises).

import { getMockReq } from "@jest-mock/express";
import { WithUserID } from "../../types";
import { email_status_enum, type_enum, decision_enum } from "@prisma/client";

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

import * as ormoJob from "../../orm_functions/job_application";
jest.mock("../../orm_functions/job_application");
const ormoMockJob = ormoJob as jest.Mocked<typeof ormoJob>;

import * as ormoRole from "../../orm_functions/role";
jest.mock("../../orm_functions/role");
const ormoMockRole = ormoRole as jest.Mocked<typeof ormoRole>;

import * as ormoLanguage from "../../orm_functions/language";
jest.mock("../../orm_functions/language");
const ormoMockLanguage = ormoLanguage as jest.Mocked<typeof ormoLanguage>;

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
    ormoMockJob.getLatestJobApplicationOfStudent.mockImplementation((y) =>
        Promise.resolve(latestJobApplication[y])
    );
    ormoMockRole.getRole.mockImplementation((y) => Promise.resolve(roles[y]));
    ormoMockJob.getStudentEvaluationsTotal.mockImplementation((y) =>
        Promise.resolve(studentEvaluations[y])
    );
    ormoMockLanguage.getLanguage.mockImplementation((y) =>
        Promise.resolve(language[y])
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
    ormoMockJob.getLatestJobApplicationOfStudent.mockReset();
    ormoMockRole.getRole.mockReset();
    ormoMockJob.getStudentEvaluationsTotal.mockReset();
    ormoMockLanguage.getLanguage.mockReset();
});

test("Can get all the students", async () => {
    const r = getMockReq();
    r.body = {
        sessionkey: "abcd",
    };
    await expect(student.listStudents(r)).resolves.toStrictEqual({
        data: [
            {
                evaluation: undefined,
                evaluations: [
                    {
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
                        osoc: {
                            osocid: 0,
                            year: 2022,
                        },
                    },
                ],
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
            },
            {
                evaluation: undefined,
                evaluations: [
                    {
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
                        osoc: {
                            osocid: 0,
                            year: 2022,
                        },
                    },
                ],
                jobApplication: {
                    applied_role: [
                        {
                            applied_role_id: 1,
                            job_application_id: 1,
                            role_id: 1,
                        },
                    ],
                    attachment: [
                        {
                            attachment_id: 1,
                            data: ["attachment1"],
                            job_application_id: 1,
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
                    fun_fact: "Funfact1",
                    job_application_id: 1,
                    job_application_skill: [
                        {
                            is_best: true,
                            is_preferred: true,
                            job_application_id: 1,
                            job_application_skill_id: 1,
                            language_id: 1,
                            level: 3,
                            skill: "language1",
                        },
                    ],
                    language_id: 1,
                    osoc_id: 0,
                    responsibilities: "Responsibiliy1",
                    student_coach: true,
                    student_id: 1,
                    student_volunteer_info: "Volunteer1",
                },
                roles: ["Role1"],
                student: {
                    alumni: true,
                    gender: "Female",
                    nickname: "Unicorn",
                    person: {
                        email: "person1@mail.com",
                        github: "",
                        github_id: "1",
                        name: "person1",
                        person_id: 1,
                    },
                    person_id: 1,
                    phone_number: "0489653214",
                    pronouns: "",
                    student_id: 1,
                },
            },
            {
                evaluation: undefined,
                evaluations: [
                    {
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
                        osoc: {
                            osocid: 0,
                            year: 2022,
                        },
                    },
                ],
                jobApplication: {
                    applied_role: [
                        {
                            applied_role_id: 2,
                            job_application_id: 2,
                            role_id: 2,
                        },
                    ],
                    attachment: [
                        {
                            attachment_id: 2,
                            data: ["attachment2"],
                            job_application_id: 2,
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
                    fun_fact: "Funfact2",
                    job_application_id: 2,
                    job_application_skill: [
                        {
                            is_best: true,
                            is_preferred: true,
                            job_application_id: 2,
                            job_application_skill_id: 2,
                            language_id: 2,
                            level: 3,
                            skill: "language1",
                        },
                    ],
                    language_id: 2,
                    osoc_id: 0,
                    responsibilities: "Responsibiliy2",
                    student_coach: true,
                    student_id: 2,
                    student_volunteer_info: "Volunteer2",
                },
                roles: ["Role2"],
                student: {
                    alumni: false,
                    gender: "Male",
                    nickname: "Legend",
                    person: {
                        email: "person2@mail.com",
                        github: "",
                        github_id: "2",
                        name: "person2",
                        person_id: 2,
                    },
                    person_id: 2,
                    phone_number: "0484623584",
                    pronouns: "",
                    student_id: 2,
                },
            },
        ],
    });
    expectCall(reqMock.parseStudentAllRequest, r);
    expectCall(utilMock.checkSessionKey, r.body);
    expect(ormoMock.getAllStudents).toHaveBeenCalledTimes(1);
});
