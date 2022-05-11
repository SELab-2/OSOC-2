// only test successes because
// 1: checkSessionKey/isAdmin has been tested
// 2: orm functions are fully tested
// 3: respOrError has been tested
// 4: all parsers have been tested
// -> failures use those stacks and aren't usually caught in the routes
// -> if those stacks work, all failures work as well (because Promises).

import { getMockReq } from "@jest-mock/express";
import { login_user, person } from "@prisma/client";

// setup mock for request
import * as req from "../../request";
jest.mock("../../request");
const reqMock = req as jest.Mocked<typeof req>;

// setup mock for utility
import * as util from "../../utility";
jest.mock("../../utility");
const utilMock = util as jest.Mocked<typeof util>;

// setup mock for libs
import * as val from "validator";
jest.mock("validator");
const valMock = val.default as jest.Mocked<typeof val.default>;
import * as bcrypt from "bcrypt";
jest.mock("bcrypt");
const bcryptMock = bcrypt as jest.Mocked<typeof bcrypt>;

// setup ORM mocks
import * as ormLU from "../../orm_functions/login_user";
jest.mock("../../orm_functions/login_user");
const ormLUMock = ormLU as jest.Mocked<typeof ormLU>;
import * as ormP from "../../orm_functions/person";
jest.mock("../../orm_functions/person");
const ormPMock = ormP as jest.Mocked<typeof ormP>;
// import * as ormSK from '../../orm_functions/session_key';
// jest.mock('../../orm_functions/session_key');
// const ormSKMock = ormSK as jest.Mocked<typeof ormSK>;

import * as user from "../../routes/user";

const users: (login_user & { person: person })[] = [
    {
        login_user_id: 0,
        password: "",
        person_id: 0,
        is_admin: false,
        is_coach: true,
        account_status: "ACTIVATED",
        person: {
            person_id: 0,
            email: "person@one.com",
            name: "Person 1",
            github: null,
            github_id: null,
        },
    },
    {
        login_user_id: 1,
        password: "",
        person_id: 1,
        is_admin: true,
        is_coach: false,
        account_status: "ACTIVATED",
        person: {
            person_id: 1,
            email: "person@two.com",
            name: "Person 2",
            github: null,
            github_id: null,
        },
    },
    {
        login_user_id: 2,
        password: "",
        person_id: 2,
        is_admin: true,
        is_coach: true,
        account_status: "ACTIVATED",
        person: {
            person_id: 2,
            email: null,
            name: "Person 2",
            github: "@person___2",
            github_id: "9874531208745",
        },
    },
];

beforeAll(() => {
    valMock.normalizeEmail.mockImplementation((v) => v);
    bcryptMock.hash.mockImplementation((v) => v);

    reqMock.parseUserAllRequest.mockResolvedValue({ sessionkey: "key" });
    reqMock.parseRequestUserRequest.mockImplementation((v) =>
        Promise.resolve(v.body)
    );

    utilMock.isAdmin.mockImplementation((v) =>
        Promise.resolve({
            data: v,
            userId: 7,
            accountStatus: "ACTIVATED",
            is_admin: true,
            is_coach: true,
        })
    );
    utilMock.generateKey.mockImplementation(() => "abcdefghijklmnopqrstuvwxyz");

    ormLUMock.getAllLoginUsers.mockResolvedValue(users);
    ormLUMock.searchLoginUserByPerson.mockImplementation((id) => {
        const tmp = users.filter((x) => x.person_id == id);
        if (tmp.length > 0) return Promise.resolve(tmp[0]);
        return Promise.resolve(null);
    });
    ormLUMock.createLoginUser.mockImplementation((cr) => {
        return Promise.resolve({
            login_user_id: 255,
            person_id: cr.personId,
            account_status: "PENDING",
            password: cr.password === undefined ? null : cr.password,
            is_admin: cr.isAdmin,
            is_coach: cr.isCoach,
        });
    });

    ormPMock.searchPersonByLogin.mockImplementation((email) =>
        Promise.resolve(
            users.filter((x) => x.person.email == email).map((x) => x.person)
        )
    );

    ormPMock.updatePerson.mockImplementation((upd) => {
        const tmp = users.filter((x) => x.person_id == upd.personId);
        if (tmp.length == 0) return Promise.reject();
        return Promise.resolve(tmp[0].person);
    });

    ormPMock.createPerson.mockImplementation((cr) => {
        return Promise.resolve({
            person_id: 69,
            github: null,
            github_id: null,
            name: cr.name,
            email: cr.email === undefined ? null : cr.email,
        });
    });
});

afterAll(() => {
    reqMock.parseUserAllRequest.mockReset();

    utilMock.isAdmin.mockReset();

    ormLUMock.getAllLoginUsers.mockReset();
});

function expectCall<T, U>(func: T, val: U) {
    expect(func).toHaveBeenCalledTimes(1);
    expect(func).toHaveBeenCalledWith(val);
}

test("Can request all users", async () => {
    const rq = getMockReq();
    rq.body = { sessionkey: "key" };

    const res = users.map((x) => ({
        person_data: {
            id: x.person.person_id,
            name: x.person.name,
            email: x.person.email,
            github: x.person.github,
        },
        coach: x.is_coach,
        admin: x.is_admin,
        activated: x.account_status as string,
    }));

    await expect(user.listUsers(rq)).resolves.toStrictEqual({ data: res });
    expectCall(reqMock.parseUserAllRequest, rq);
    expectCall(utilMock.isAdmin, rq.body);
    expect(ormLUMock.getAllLoginUsers).toHaveBeenCalledTimes(1);
});

// test("Can create new users", async () => {});
