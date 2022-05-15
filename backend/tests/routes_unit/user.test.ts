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
import * as ormSK from "../../orm_functions/session_key";
jest.mock("../../orm_functions/session_key");
const ormSKMock = ormSK as jest.Mocked<typeof ormSK>;

import * as user from "../../routes/user";

const users: (login_user & { person: person })[] = [
    {
        login_user_id: 0,
        password: "oldpass",
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
        account_status: "PENDING",
        person: {
            person_id: 2,
            email: null,
            name: "Person 2",
            github: "@person___2",
            github_id: "9874531208745",
        },
    },
];

beforeEach(() => {
    valMock.normalizeEmail.mockImplementation((v) => v);
    bcryptMock.hash.mockImplementation((v) => Promise.resolve(v));
    bcryptMock.compare.mockImplementation((x, y) => Promise.resolve(x === y));

    reqMock.parseUserAllRequest.mockResolvedValue({
        currentPage: 0,
        pageSize: 25,
        sessionkey: "key",
    });
    reqMock.parseRequestUserRequest.mockImplementation((v) =>
        Promise.resolve(v.body)
    );
    reqMock.parseAcceptNewUserRequest.mockImplementation((v) =>
        Promise.resolve(v.body)
    );
    reqMock.parseFilterUsersRequest.mockImplementation((v) =>
        Promise.resolve(v.body)
    );
    reqMock.parseUserModSelfRequest.mockImplementation((v) =>
        Promise.resolve(v.body)
    );
    reqMock.parseCurrentUserRequest.mockResolvedValue({ sessionkey: "valid" });

    utilMock.isAdmin.mockImplementation((v) => {
        return Promise.resolve({
            data: v,
            userId: 7,
            accountStatus: "ACTIVATED",
            is_admin: true,
            is_coach: true,
        });
    });
    utilMock.generateKey.mockImplementation(() => "abcdefghijklmnopqrstuvwxyz");
    utilMock.mutable.mockImplementation((v) => Promise.resolve(v));
    utilMock.checkSessionKey.mockImplementation((v) =>
        Promise.resolve({
            data: v,
            userId: 0,
            is_coach: true,
            is_admin: true,
            accountStatus: "ACTIVATED",
        })
    );
    utilMock.getOrReject.mockImplementation((v) =>
        v == undefined || v == null
            ? Promise.reject({ reason: "getorreject" })
            : Promise.resolve(v)
    );

    ormLUMock.getAllLoginUsers.mockResolvedValue(users);
    ormLUMock.filterLoginUsers.mockResolvedValue({
        data: users,
        pagination: { page: 0, count: users.length },
    });
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
    ormLUMock.updateLoginUser.mockResolvedValue(users[0]);
    ormLUMock.getLoginUserById.mockResolvedValue(users[0]);

    ormSKMock.addSessionKey.mockImplementation((id, key, dat) =>
        Promise.resolve({
            session_key_id: 0,
            login_user_id: id,
            valid_until: dat,
            session_key: key,
        })
    );

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

    ormSKMock.removeAllKeysForUser.mockResolvedValue({ count: 1 });
});

afterEach(() => {
    valMock.normalizeEmail.mockReset();
    bcryptMock.hash.mockReset();
    bcryptMock.compare.mockReset();

    reqMock.parseUserAllRequest.mockReset();
    reqMock.parseRequestUserRequest.mockReset();
    reqMock.parseAcceptNewUserRequest.mockReset();
    reqMock.parseFilterUsersRequest.mockReset();
    reqMock.parseUserModSelfRequest.mockReset();

    utilMock.isAdmin.mockReset();
    utilMock.generateKey.mockReset();
    utilMock.mutable.mockReset();
    utilMock.checkSessionKey.mockReset();
    utilMock.getOrReject.mockReset();

    ormLUMock.getAllLoginUsers.mockReset();
    ormLUMock.filterLoginUsers.mockReset();
    ormLUMock.searchLoginUserByPerson.mockReset();
    ormLUMock.createLoginUser.mockReset();
    ormLUMock.updateLoginUser.mockReset();
    ormLUMock.getLoginUserById.mockReset();
    ormPMock.searchPersonByLogin.mockReset();
    ormPMock.updatePerson.mockReset();
    ormPMock.createPerson.mockReset();
    ormSKMock.addSessionKey.mockReset();
    ormSKMock.removeAllKeysForUser.mockReset();
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
        login_user_id: x.login_user_id,
    }));

    await expect(user.listUsers(rq)).resolves.toStrictEqual({
        data: res,
        pagination: { page: 0, count: res.length },
    });
    expectCall(reqMock.parseUserAllRequest, rq);
    expectCall(utilMock.isAdmin, { ...rq.body, currentPage: 0, pageSize: 25 });
    expect(ormLUMock.filterLoginUsers).toHaveBeenCalledTimes(1);
});

test("Can't create new users (already in system)", async () => {
    ormPMock.searchPersonByLogin.mockResolvedValue([users[0].person]);
    ormLUMock.searchLoginUserByPerson.mockResolvedValue(users[0]);

    const req = getMockReq();
    req.body = {
        name: users[0].person.name,
        email: "person1@one.com",
        pass: "nevergonnagiveyouupnevergonnaletyoudown",
    };

    await expect(user.createUserRequest(req)).rejects.toStrictEqual({
        http: 400,
        reason: "Can't register the same email address twice.",
    });

    expectCall(reqMock.parseRequestUserRequest, req);
    expect(utilMock.checkSessionKey).toHaveBeenCalledTimes(0);
    expect(utilMock.isAdmin).toHaveBeenCalledTimes(0);
    expectCall(ormPMock.searchPersonByLogin, req.body.email);
    expectCall(ormLUMock.searchLoginUserByPerson, users[0].person_id);
    expect(ormPMock.updatePerson).toHaveBeenCalledTimes(0);
    expect(ormPMock.createPerson).toHaveBeenCalledTimes(0);
    expect(bcryptMock.hash).toHaveBeenCalledTimes(0);
    expect(ormLUMock.createLoginUser).toHaveBeenCalledTimes(0);
    expect(util.generateKey).toHaveBeenCalledTimes(0);
    expect(ormSKMock.addSessionKey).toHaveBeenCalledTimes(0);
});

test("Can create new users (person already in system)", async () => {
    ormPMock.searchPersonByLogin.mockResolvedValue([users[0].person]);
    ormLUMock.searchLoginUserByPerson.mockResolvedValue(null);

    const req = getMockReq();
    req.body = {
        name: users[0].person.name,
        email: "person1@one.com",
        pass: "nevergonnagiveyouupnevergonnaletyoudown",
    };

    await expect(user.createUserRequest(req)).resolves.toStrictEqual({
        id: 255,
        sessionkey: "abcdefghijklmnopqrstuvwxyz",
    });

    expectCall(reqMock.parseRequestUserRequest, req);
    expect(utilMock.checkSessionKey).toHaveBeenCalledTimes(0);
    expect(utilMock.isAdmin).toHaveBeenCalledTimes(0);
    expectCall(ormPMock.searchPersonByLogin, req.body.email);
    expectCall(ormLUMock.searchLoginUserByPerson, users[0].person_id);
    expectCall(ormPMock.updatePerson, {
        personId: users[0].person_id,
        name: users[0].person.name,
    });
    expect(ormPMock.createPerson).toHaveBeenCalledTimes(0);
    expect(bcryptMock.hash).toHaveBeenCalledTimes(1);
    expectCall(ormLUMock.createLoginUser, {
        personId: users[0].person.person_id,
        password: req.body.pass,
        isAdmin: false,
        isCoach: true,
        accountStatus: "PENDING",
    });
    expect(util.generateKey).toHaveBeenCalledTimes(1);
    expect(ormSKMock.addSessionKey).toHaveBeenCalledTimes(1);
});

test("Can create new users (unknown person)", async () => {
    ormPMock.searchPersonByLogin.mockResolvedValue([]);
    ormLUMock.searchLoginUserByPerson.mockResolvedValue(null);

    const req = getMockReq();
    req.body = {
        name: users[0].person.name,
        email: "person1@one.com",
        pass: "nevergonnagiveyouupnevergonnaletyoudown",
    };

    await expect(user.createUserRequest(req)).resolves.toStrictEqual({
        id: 255,
        sessionkey: "abcdefghijklmnopqrstuvwxyz",
    });

    expectCall(reqMock.parseRequestUserRequest, req);
    expect(utilMock.checkSessionKey).toHaveBeenCalledTimes(0);
    expect(utilMock.isAdmin).toHaveBeenCalledTimes(0);
    expectCall(ormPMock.searchPersonByLogin, req.body.email);
    expect(ormLUMock.searchLoginUserByPerson).toHaveBeenCalledTimes(0);
    expectCall(ormPMock.createPerson, {
        email: req.body.email,
        name: users[0].person.name,
    });
    expect(ormPMock.updatePerson).toHaveBeenCalledTimes(0);
    expect(bcryptMock.hash).toHaveBeenCalledTimes(1);
    expectCall(ormLUMock.createLoginUser, {
        personId: 69,
        password: req.body.pass,
        isAdmin: false,
        isCoach: true,
        accountStatus: "PENDING",
    });
    expect(util.generateKey).toHaveBeenCalledTimes(1);
    expect(ormSKMock.addSessionKey).toHaveBeenCalledTimes(1);
});

test("Can set account status", async () => {
    ormLUMock.searchLoginUserByPerson.mockResolvedValue(users[0]);

    await expect(
        user.setAccountStatus(0, "PENDING", false, true)
    ).resolves.toStrictEqual({
        id: users[0].person_id,
        name: users[0].person.name,
    });
    expectCall(ormLUMock.searchLoginUserByPerson, 0);
    expectCall(ormLUMock.updateLoginUser, {
        loginUserId: users[0].login_user_id,
        isAdmin: false,
        isCoach: true,
        accountStatus: "PENDING",
    });
});

test("Can accept new users", async () => {
    ormLUMock.searchLoginUserByPerson.mockReset();
    ormLUMock.searchLoginUserByPerson.mockResolvedValue(users[2]);

    const req = getMockReq();
    req.body = { sessionkey: "key", id: 1, is_admin: false, is_coach: false };

    await expect(user.createUserAcceptance(req)).resolves.toStrictEqual({
        id: 0,
        name: "Person 1",
    });
    expectCall(reqMock.parseAcceptNewUserRequest, req);
    expectCall(utilMock.isAdmin, req.body);
    expect(utilMock.mutable).toHaveBeenCalledTimes(1);
    expect(ormLU.searchLoginUserByPerson).toHaveBeenCalledTimes(2);
});

test("Can reject new users", async () => {
    ormLUMock.searchLoginUserByPerson.mockReset();
    ormLUMock.searchLoginUserByPerson.mockResolvedValue(users[2]);

    const req = getMockReq();
    req.body = { sessionkey: "key", id: 1, is_admin: false, is_coach: false };

    await expect(user.deleteUserRequest(req)).resolves.toStrictEqual({
        id: 0,
        name: "Person 1",
    });
    expectCall(reqMock.parseAcceptNewUserRequest, req);
    expectCall(utilMock.isAdmin, req.body);
    expect(utilMock.mutable).toHaveBeenCalledTimes(1);
    expect(ormLU.searchLoginUserByPerson).toHaveBeenCalledTimes(2);
});

test("Can filter users", async () => {
    const req = getMockReq();
    req.body = { sessionkey: "key" };

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
        login_user_id: x.login_user_id,
    }));

    await expect(user.filterUsers(req)).resolves.toStrictEqual({
        pagination: { page: 0, count: res.length },
        data: res,
    });
    expectCall(reqMock.parseFilterUsersRequest, req);
    expectCall(utilMock.isAdmin, req.body);
    expect(ormLUMock.filterLoginUsers).toHaveBeenCalledTimes(1);
});

test("Can modify self", async () => {
    const req = getMockReq();
    req.body = {
        sessionkey: "abcd",
        pass: { oldpass: users[0].password, newpass: "abcde" },
        name: "myname",
    };

    await expect(user.userModSelf(req)).resolves.toStrictEqual({
        sessionkey: "abcdefghijklmnopqrstuvwxyz",
    });
    expectCall(reqMock.parseUserModSelfRequest, req);
    expect(utilMock.checkSessionKey).toHaveBeenCalledTimes(1);
    expectCall(ormLUMock.getLoginUserById, 0);
    expectCall(utilMock.getOrReject, users[0]);
    expect(bcryptMock.compare).toHaveBeenCalledTimes(1);
    expectCall(ormLUMock.updateLoginUser, {
        loginUserId: 0,
        accountStatus: users[0].account_status,
        password: "abcde",
    });
    expectCall(ormPMock.updatePerson, {
        personId: users[0].person_id,
        name: "myname",
    });
});

test("Can't modify self (invalid old password)", async () => {
    const req = getMockReq();
    req.body = {
        sessionkey: "abcd",
        pass: { oldpass: users[0].password + "__old", newpass: "abcde" },
        name: "myname",
    };

    await expect(user.userModSelf(req)).rejects.toStrictEqual({
        http: 409,
        reason: "Old password is incorrect. Didn't update password.",
    });
    expectCall(reqMock.parseUserModSelfRequest, req);
    expect(utilMock.checkSessionKey).toHaveBeenCalledTimes(1);
    expectCall(ormLUMock.getLoginUserById, 0);
    expectCall(utilMock.getOrReject, users[0]);
    expect(bcryptMock.compare).toHaveBeenCalledTimes(1);
    expect(ormLUMock.updateLoginUser).not.toHaveBeenCalled();
    expect(ormPMock.updatePerson).not.toHaveBeenCalled();
});

test("Can get current user", async () => {
    const req = getMockReq();

    await expect(user.getCurrentUser(req)).resolves.toStrictEqual({
        data: {
            login_user: {
                ...users[0],
                password: null,
            },
        },
        sessionkey: "valid",
    });
    expectCall(reqMock.parseCurrentUserRequest, req);
    expectCall(utilMock.checkSessionKey, { sessionkey: "valid" });
    expectCall(ormLUMock.getLoginUserById, 0);
});
