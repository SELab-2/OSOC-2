import { getMockReq, getMockRes } from "@jest-mock/express";

import { Anything } from "../../types";

import axios from "axios";
jest.mock("axios");
const axiosMock = axios as jest.Mocked<typeof axios>;

import * as ormP from "../../orm_functions/person";
jest.mock("../../orm_functions/person");
const ormPMock = ormP as jest.Mocked<typeof ormP>;

import * as ormLU from "../../orm_functions/login_user";
jest.mock("../../orm_functions/login_user");
const ormLUMock = ormLU as jest.Mocked<typeof ormLU>;

import * as ormSK from "../../orm_functions/session_key";
jest.mock("../../orm_functions/session_key");
const ormSKMock = ormSK as jest.Mocked<typeof ormSK>;

import * as util from "../../utility";
jest.mock("../../utility");
const utilMock = util as jest.Mocked<typeof util>;

import * as session_key from "../../routes/session_key.json";
import * as config from "../../config.json";

import * as github from "../../routes/github";

const realDateNow = Date.now.bind(global.Date);

function orNull<T>(v: T | undefined | null): T | null {
    if (v == undefined) return null;
    else return v;
}

beforeEach(() => {
    global.Date.now = jest.fn(() => 9784651320);

    ormPMock.getPasswordPersonByGithub.mockImplementation((id) =>
        Promise.resolve(
            id == "69"
                ? {
                      github: "@my_github",
                      person_id: 69,
                      firstname: "my",
                      login_user: {
                          password: null,
                          login_user_id: 420,
                          account_status: "ACTIVATED",
                          is_admin: true,
                          is_coach: true,
                      },
                  }
                : null
        )
    );

    ormPMock.updatePerson.mockImplementation((u) =>
        Promise.resolve({
            person_id: u.personId,
            firstname: u.firstname != null ? u.firstname : "jeff",
            email: u.email != null ? u.email : null,
            github: u.github != null ? u.github : "@my_acct",
            github_id: "784",
            lastname: u.lastname != null ? u.lastname : "",
        })
    );
    ormPMock.createPerson.mockImplementation((p) =>
        Promise.resolve({
            person_id: 1234,
            firstname: p.firstname,
            lastname: p.lastname,
            github: orNull(p.github),
            github_id: orNull(p.github_id),
            email: orNull(p.email),
        })
    );

    ormLUMock.createLoginUser.mockImplementation((lu) =>
        Promise.resolve({
            login_user_id: 5678,
            person_id: lu.personId,
            is_admin: lu.isAdmin,
            is_coach: lu.isCoach,
            account_status: lu.accountStatus,
            password: orNull(lu.password),
        })
    );

    ormSKMock.addSessionKey.mockImplementation((id, key, date) =>
        Promise.resolve({
            session_key_id: 8465,
            session_key: key,
            login_user_id: id,
            valid_until: date,
        })
    );

    utilMock.generateKey.mockReturnValue("abcd");
    utilMock.getOrReject.mockImplementation((v) =>
        v == null || v == undefined ? Promise.reject({}) : Promise.resolve(v)
    );
});

afterEach(() => {
    ormPMock.getPasswordPersonByGithub.mockReset();
    ormPMock.updatePerson.mockReset();
    ormPMock.createPerson.mockReset();

    ormLUMock.createLoginUser.mockReset();

    ormSKMock.addSessionKey.mockReset();

    utilMock.generateKey.mockReset();

    global.Date.now = realDateNow;
});

function expectCall<T, U>(func: T, val: U) {
    expect(func).toHaveBeenCalledTimes(1);
    expect(func).toHaveBeenCalledWith(val);
}

function expectNoCall<T>(func: T) {
    expect(func).toHaveBeenCalledTimes(0);
}

test("Can generate and validate states", () => {
    expect(github.checkState(github.genState())).toBe(true);
});

test("A state is valid only once", () => {
    const state = github.genState();
    expect(github.checkState(state)).toBe(true);
    expect(github.checkState(state)).toBe(false);
});

test("ghIdentity correctly redirects", async () => {
    const exp: string =
        "https://github.com/login/oauth/authorize?" +
        "client_id=undefined&allow_signup=true&" +
        "redirect_uri=undefined%2Fapi-osoc%2Fgithub%2Fchallenge&" +
        "state=";
    utilMock.redirect.mockReset();
    utilMock.redirect.mockImplementation(async (_, url) => {
        await expect(url).toBe(exp + github.states[0]);
    });

    await github.ghIdentity(getMockRes().res);
});

test("Can parse GH login", async () => {
    const v1: Anything = { login: "jeffrey", name: "jan", id: 9845312 };
    const v2: Anything = { login: "jan", name: null, id: 98465132 };

    const i1: Anything = {};
    const i2: Anything = { id: 7984615320 };
    const i3: Anything = { login: "jan" };
    const i4: Anything = { name: "jeffrey" };
    const i5: Anything = { login: "jan", name: "jeffrey" };
    const i6: Anything = { name: "jeffrey", id: 98465132789 };
    const i7: Anything = { login: "jeffrey", id: 451320 };

    const valids = [v1, v2].map((v) => {
        const res: Anything = { ...v, id: (v.id as number).toString() };
        if (v.name == null) res.name = v.login;
        return expect(github.parseGHLogin(v)).resolves.toStrictEqual(res);
    });

    const invalids = [i1, i2, i3, i4, i5, i6, i7].map((v) => {
        return expect(github.parseGHLogin(v)).rejects.toStrictEqual({});
    });

    return Promise.all([valids, invalids].flat());
});

test("Can detect if name changes are required", () => {
    const base_login = { login: "", name: "", id: "78451320" };
    const base_person = {
        github: "",
        person_id: 78645312,
        firstname: "",
        login_user: null,
    };

    expect(
        github.githubNameChange(
            { ...base_login, login: "abcd" },
            { ...base_person, github: "cdef" }
        )
    ).toBeTruthy();
    expect(
        github.githubNameChange(
            { ...base_login, name: "abcd" },
            { ...base_person, firstname: "cdef" }
        )
    ).toBeTruthy();
    expect(
        github.githubNameChange(
            { ...base_login, login: "abcd", name: "cdef" },
            { ...base_person, github: "cdef", firstname: "cdef" }
        )
    ).toBeTruthy();
    expect(
        github.githubNameChange(
            { ...base_login, login: "cdef", name: "abcd" },
            { ...base_person, github: "cdef", firstname: "cdef" }
        )
    ).toBeTruthy();

    expect(
        github.githubNameChange(
            { ...base_login, login: "abcd", name: "cdef" },
            { ...base_person, github: "abcd", firstname: "cdef" }
        )
    ).toBeFalsy();
});

test("Can login if the account exists", async () => {
    const input = { login: "@my_github", name: "my", id: "69" };
    const output = { sessionkey: "abcd", is_admin: true, is_coach: true };
    const f = new Date(Date.now());
    f.setDate(f.getDate() + session_key.valid_period);

    await expect(github.ghSignupOrLogin(input)).resolves.toStrictEqual(output);
    expectCall(ormPMock.getPasswordPersonByGithub, "69");
    expect(util.generateKey).toHaveBeenCalledTimes(1);
    expect(ormSK.addSessionKey).toHaveBeenCalledTimes(1);
    expect(ormSK.addSessionKey).toHaveBeenCalledWith(420, "abcd", f);
    expectNoCall(ormP.updatePerson);
    expectNoCall(ormLU.createLoginUser);
    expectNoCall(ormP.createPerson);
});

test("Can login if the account exists and update username", async () => {
    const input = { login: "@my_github", name: "alo", id: "69" };
    const output = { sessionkey: "abcd", is_admin: true, is_coach: true };
    const f = new Date(Date.now());
    f.setDate(f.getDate() + session_key.valid_period);

    await expect(github.ghSignupOrLogin(input)).resolves.toStrictEqual(output);
    expectCall(ormPMock.getPasswordPersonByGithub, "69");
    expect(util.generateKey).toHaveBeenCalledTimes(1);
    expect(ormSK.addSessionKey).toHaveBeenCalledTimes(1);
    expect(ormSK.addSessionKey).toHaveBeenCalledWith(420, "abcd", f);
    expect(ormP.updatePerson).toHaveBeenCalledTimes(1);
    expect(ormP.updatePerson).toHaveBeenCalledWith({
        personId: 69,
        github: "@my_github",
        firstname: "alo",
    });
    expectNoCall(ormLU.createLoginUser);
    expectNoCall(ormP.createPerson);
});

test("Can login if the account exists and update github handle", async () => {
    const input = { login: "@jefke", name: "my", id: "69" };
    const output = { sessionkey: "abcd", is_admin: true, is_coach: true };
    const f = new Date(Date.now());
    f.setDate(f.getDate() + session_key.valid_period);

    await expect(github.ghSignupOrLogin(input)).resolves.toStrictEqual(output);
    expectCall(ormPMock.getPasswordPersonByGithub, "69");
    expect(util.generateKey).toHaveBeenCalledTimes(1);
    expect(ormSK.addSessionKey).toHaveBeenCalledTimes(1);
    expect(ormSK.addSessionKey).toHaveBeenCalledWith(420, "abcd", f);
    expect(ormP.updatePerson).toHaveBeenCalledTimes(1);
    expect(ormP.updatePerson).toHaveBeenCalledWith({
        personId: 69,
        github: "@jefke",
        firstname: "my",
    });
    expectNoCall(ormLU.createLoginUser);
    expectNoCall(ormP.createPerson);
});

test("Can register if account doesn't exist", async () => {
    const input = { login: "@jefke", name: "my", id: "-69" };
    const output = { sessionkey: "abcd", is_admin: false, is_coach: true };
    const f = new Date(Date.now());
    f.setDate(f.getDate() + session_key.valid_period);

    await expect(github.ghSignupOrLogin(input)).resolves.toStrictEqual(output);
    expectCall(ormPMock.getPasswordPersonByGithub, "-69");
    expectCall(ormP.createPerson, {
        github: "@jefke",
        firstname: "my",
        lastname: "",
        github_id: "-69",
    });
    expectCall(ormLU.createLoginUser, {
        personId: 1234,
        isAdmin: false,
        isCoach: true,
        accountStatus: "PENDING",
    });
    expect(util.generateKey).toHaveBeenCalledTimes(1);
    expect(ormSK.addSessionKey).toHaveBeenCalledTimes(1);
    expect(ormSK.addSessionKey).toHaveBeenCalledWith(5678, "abcd", f);
    expectNoCall(ormP.updatePerson);
});

test("Login/Register fails if the request is incorrect", async () => {
    const req = getMockReq();
    const res = getMockRes().res;

    req.query = { state: "8945" };
    await expect(github.ghExchangeAccessToken(req, res)).rejects.toBe(
        config.apiErrors.github.argumentMissing
    );

    req.query = { code: "78946512" };
    await expect(github.ghExchangeAccessToken(req, res)).rejects.toBe(
        config.apiErrors.github.argumentMissing
    );

    req.query = { code: "132465798", state: "45" };
    await expect(github.ghExchangeAccessToken(req, res)).rejects.toBe(
        config.apiErrors.github.illegalState
    );
});

test("Can exchange access token for session key", async () => {
    const code = "abcdefghijklmnopqrstuvwxyz";

    axiosMock.post.mockImplementation((url, body, conf) => {
        expect(url).toBe("https://github.com/login/oauth/access_token");
        expect(conf).toHaveProperty("headers.Accept", "application/json");
        expect(body).toStrictEqual({
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_SECRET,
            code: code as string,
            redirect_uri:
                github.getHome() + config.global.preferred + "/github/login",
        });

        return Promise.resolve({ data: { access_token: "some_token" } });
    });

    axiosMock.get.mockImplementation((url, conf) => {
        expect(url).toBe("https://api.github.com/user");
        expect(conf).toHaveProperty(
            "headers.Authorization",
            "token some_token"
        );

        return Promise.resolve({
            data: { login: "@my_github", name: "my", id: 69 },
        });
    });

    utilMock.redirect.mockImplementation(async (_, url) => {
        expect(url).toBe(process.env.FRONTEND + "/login/abcd");
        return Promise.resolve();
    });

    const req = getMockReq();
    const res = getMockRes().res;
    req.query = { code: code, state: github.genState() };
    return expect(
        github.ghExchangeAccessToken(req, res)
    ).resolves.not.toThrow();
});

test("Can handle internet issues", async () => {
    axiosMock.post.mockRejectedValue({ error: "can't connect to server" });

    utilMock.redirect.mockImplementation(async (_, url) => {
        expect(url).toBe(
            process.env.FRONTEND +
                "/login?loginError=" +
                config.apiErrors.github.other.reason
        );
        return Promise.resolve();
    });

    const req = getMockReq();
    const res = getMockRes().res;
    req.query = { code: "code", state: github.genState() };
    return expect(
        github.ghExchangeAccessToken(req, res)
    ).resolves.not.toThrow();
});
