// only test successes because
// 1: checkSessionKey/isAdmin has been tested
// 2: orm functions are fully tested
// 3: respOrError has been tested
// 4: all parsers have been tested
// -> failures use those stacks and aren't usually caught in the routes
// -> if those stacks work, all failures work as well (because Promises).

import { getMockReq } from "@jest-mock/express";
import { account_status_enum } from "@prisma/client";

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
        generateKey: jest.fn(),
    }; // we want to only mock checkSessionKey and isAdmin
});
const utilMock = util as jest.Mocked<typeof util>;

// setup mocks for orm
import * as session_key from "../../orm_functions/session_key";
jest.mock("../../orm_functions/session_key");
const session_keyMock = session_key as jest.Mocked<typeof session_key>;

import * as person from "../../orm_functions/person";
jest.mock("../../orm_functions/person");
const personMock = person as jest.Mocked<typeof person>;

import * as login from "../../routes/login";
import * as skconf from "../../routes/session_key.json";

function expectCall<T, U>(func: T, val: U) {
    expect(func).toHaveBeenCalledTimes(1);
    expect(func).toHaveBeenCalledWith(val);
}

function expectNoCall<T>(func: T) {
    expect(func).toHaveBeenCalledTimes(0);
}

type Temp = {
    email: string;
    user: {
        password: string;
        login_user_id: number;
        account_status: account_status_enum;
        is_admin: boolean;
        is_coach: boolean;
    };
};

const users: Temp[] = [
    {
        email: "mail1@mail.com",
        user: {
            password: "pass1",
            login_user_id: 0,
            account_status: "ACTIVATED",
            is_admin: false,
            is_coach: false,
        },
    },
    {
        email: "mail2@mail.com",
        user: {
            password: "pass2",
            login_user_id: 2,
            account_status: "DISABLED",
            is_admin: false,
            is_coach: false,
        },
    },
    {
        email: "mail3@mail.com",
        user: {
            password: "pass3",
            login_user_id: 4,
            account_status: "PENDING",
            is_admin: false,
            is_coach: false,
        },
    },
];

const passErr = {
    http: 409,
    reason: "Invalid e-mail or password.",
};

const disableErr = {
    http: 409,
    reason: "Account is disabled.",
};

const realDateNow = Date.now.bind(global.Date);
const dateNowStub = jest.fn(() => 9846531);

beforeEach(() => {
    reqMock.parseLoginRequest.mockImplementation((v) =>
        Promise.resolve(v.body)
    );
    reqMock.parseLogoutRequest.mockImplementation((v) =>
        Promise.resolve(v.body)
    );

    personMock.getPasswordPersonByEmail.mockImplementation((mail) => {
        if (mail == users[0].email)
            return Promise.resolve({ login_user: users[0].user });
        if (mail == users[1].email)
            return Promise.resolve({ login_user: users[1].user });
        if (mail == users[2].email)
            return Promise.resolve({ login_user: users[2].user });
        return Promise.resolve(null);
    });

    session_keyMock.addSessionKey.mockImplementation((id, k, d) =>
        Promise.resolve({
            session_key_id: 0,
            session_key: k,
            login_user_id: id,
            valid_until: d,
        })
    );
    session_keyMock.removeAllKeysForUser.mockImplementation(() =>
        Promise.resolve({ count: 5 })
    );

    utilMock.checkSessionKey.mockImplementation((v) =>
        Promise.resolve({
            userId: 0,
            data: v,
            accountStatus: "ACTIVATED",
            is_admin: true,
            is_coach: true,
        })
    );
    utilMock.generateKey.mockReturnValue("abcd");
    global.Date.now = dateNowStub;
});

afterEach(() => {
    reqMock.parseLoginRequest.mockReset();
    reqMock.parseLogoutRequest.mockReset();

    personMock.getPasswordPersonByEmail.mockReset();

    session_keyMock.addSessionKey.mockReset();
    session_keyMock.removeAllKeysForUser.mockReset();

    utilMock.checkSessionKey.mockReset();
    utilMock.generateKey.mockReset();
    global.Date.now = realDateNow;
});

test("Can login with valid credentials", async () => {
    const rq = getMockReq();
    rq.body = { name: users[0].email, pass: users[0].user.password };
    const fdate = new Date(Date.now());
    fdate.setDate(fdate.getDate() + skconf.valid_period);

    await expect(login.login(rq)).resolves.toStrictEqual({
        sessionkey: "abcd",
        is_admin: false,
        is_coach: false,
        account_status: "ACTIVATED",
    });
    expectCall(reqMock.parseLoginRequest, rq);
    expectCall(personMock.getPasswordPersonByEmail, users[0].email);
    expect(utilMock.generateKey).toHaveBeenCalledTimes(1);
    expect(session_keyMock.addSessionKey).toHaveBeenCalledTimes(1);
    expect(session_keyMock.addSessionKey).toHaveBeenCalledWith(
        users[0].user.login_user_id,
        "abcd",
        fdate
    );
});

test("Can login with valid credentials (PENDING)", async () => {
    const rq = getMockReq();
    rq.body = { name: users[2].email, pass: users[2].user.password };
    const fdate = new Date(Date.now());
    fdate.setDate(fdate.getDate() + skconf.valid_period);

    await expect(login.login(rq)).resolves.toStrictEqual({
        sessionkey: "abcd",
        is_admin: false,
        is_coach: false,
        account_status: "PENDING",
    });
    expectCall(reqMock.parseLoginRequest, rq);
    expectCall(personMock.getPasswordPersonByEmail, users[2].email);
    expect(utilMock.generateKey).toHaveBeenCalledTimes(1);
    expect(session_keyMock.addSessionKey).toHaveBeenCalledTimes(1);
    expect(session_keyMock.addSessionKey).toHaveBeenCalledWith(
        users[2].user.login_user_id,
        "abcd",
        fdate
    );
});

test("Can handle invalid password", async () => {
    const rq = getMockReq();
    rq.body = { name: users[2].email, pass: users[1].user.password };

    await expect(login.login(rq)).rejects.toStrictEqual(passErr);
    expectCall(reqMock.parseLoginRequest, rq);
    expectCall(personMock.getPasswordPersonByEmail, users[2].email);
    expectNoCall(utilMock.generateKey);
    expectNoCall(session_keyMock.addSessionKey);
});

test("Can handle invalid email", async () => {
    const rq = getMockReq();
    rq.body = { name: "mail000@mail.com", pass: users[2].user.password };

    await expect(login.login(rq)).rejects.toStrictEqual(passErr);
    expectCall(reqMock.parseLoginRequest, rq);
    expectCall(personMock.getPasswordPersonByEmail, "mail000@mail.com");
    expectNoCall(utilMock.generateKey);
    expectNoCall(session_keyMock.addSessionKey);
});

test("Can handle disabled accounts", async () => {
    const rq = getMockReq();
    rq.body = { name: users[1].email, pass: users[1].user.password };

    await expect(login.login(rq)).rejects.toStrictEqual(disableErr);
    expectCall(reqMock.parseLoginRequest, rq);
    expectCall(personMock.getPasswordPersonByEmail, users[1].email);
    expectNoCall(utilMock.generateKey);
    expectNoCall(session_keyMock.addSessionKey);
});

test("Can logout", async () => {
    const rq = getMockReq();
    rq.body = { sessionkey: "abcd" };
    await expect(login.logout(rq)).resolves.toStrictEqual({});
    expectCall(reqMock.parseLogoutRequest, rq);
    expect(util.checkSessionKey).toHaveBeenCalledTimes(1);
    expect(util.checkSessionKey).toHaveBeenCalledWith(
        { sessionkey: "abcd" },
        false
    );
    expectCall(session_keyMock.removeAllKeysForUser, "abcd");
});
