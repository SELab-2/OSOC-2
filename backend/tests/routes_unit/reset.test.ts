const sendMailMock = jest.fn().mockImplementation(() => Promise.resolve());
const closeTranspMock = jest.fn().mockImplementation(() => {
    /* nothing happens here */
});
const createTranspMock = jest.fn().mockImplementation(() => ({
    sendMail: sendMailMock,
    close: closeTranspMock,
}));
// only test successes because
// 1: checkSessionKey/isAdmin has been tested
// 2: orm functions are fully tested
// 3: respOrError has been tested
// 4: all parsers have been tested
// -> failures use those stacks and aren't usually caught in the routes
// -> if those stacks work, all failures work as well (because Promises).

import { getMockReq } from "@jest-mock/express";
import { login_user, person } from "@prisma/client";
import * as config from "../../config.json";

// set up mocks for libraries
const nodemailer = require("nodemailer");
jest.mock("nodemailer", () => ({
    createTransport: createTranspMock,
}));
const mailMock = nodemailer as jest.Mocked<typeof nodemailer>;

import * as bcrypt from "bcrypt";
jest.mock("bcrypt");
const bcryptMock = bcrypt as jest.Mocked<typeof bcrypt>;

// set up mocks for our files
import * as rq from "../../request";
jest.mock("../../request");
const reqMock = rq as jest.Mocked<typeof rq>;

import * as util from "../../utility";
jest.mock("../../utility");
const utilMock = util as jest.Mocked<typeof util>;

import * as ormPR from "../../orm_functions/password_reset";
jest.mock("../../orm_functions/password_reset");
const ormPRMock = ormPR as jest.Mocked<typeof ormPR>;

import * as ormP from "../../orm_functions/person";
jest.mock("../../orm_functions/person");
const ormPMock = ormP as jest.Mocked<typeof ormP>;

import * as ormLU from "../../orm_functions/login_user";
jest.mock("../../orm_functions/login_user");
const ormLUMock = ormLU as jest.Mocked<typeof ormLU>;

import * as ormSK from "../../orm_functions/session_key";
jest.mock("../../orm_functions/session_key");
const ormSKMock = ormSK as jest.Mocked<typeof ormSK>;

// to test
import * as reset from "../../routes/reset";

const user: login_user & { person: person } = {
    login_user_id: 0,
    person_id: 1231,
    password: "old_pass",
    is_admin: false,
    is_coach: true,
    account_status: "ACTIVATED",
    person: {
        person_id: 1231,
        email: "imperson0@mail.com",
        github: null,
        name: "Person #0",
        github_id: null,
    },
};

beforeEach(() => {
    bcryptMock.hash.mockImplementation((v) => Promise.resolve(v));

    utilMock.generateKey.mockReturnValue("key");

    sendMailMock.mockImplementation(() => Promise.resolve());
    closeTranspMock.mockImplementation(() => {
        /* nothing happens here */
    });
    createTranspMock.mockImplementation(() => ({
        sendMail: sendMailMock,
        close: closeTranspMock,
    }));

    reqMock.parseRequestResetRequest.mockResolvedValue({
        email: "jeffrey@jan.com",
    });
    reqMock.parseCheckResetCodeRequest.mockImplementation((v) =>
        Promise.resolve(v.body)
    );
    reqMock.parseResetPasswordRequest.mockImplementation((v) =>
        Promise.resolve(v.body)
    );

    ormPMock.getPasswordPersonByEmail.mockResolvedValue({
        login_user: {
            login_user_id: 0,
            password: "null",
            account_status: "PENDING",
            is_admin: true,
            is_coach: true,
        },
    });

    ormPRMock.createOrUpdateReset.mockImplementation((i, r, v) =>
        Promise.resolve({
            password_reset_id: 0,
            login_user_id: i,
            reset_id: r,
            valid_until: v,
        })
    );
    ormPRMock.findResetByCode.mockImplementation((code) => {
        if (code === "valid_code_believe_me_okay?")
            return Promise.resolve({
                password_reset_id: 0,
                login_user_id: 0,
                reset_id: code,
                valid_until: new Date(Date.now() + 10000),
            });
        return Promise.resolve(null);
    });
    ormPRMock.deleteResetWithResetId.mockImplementation((id) =>
        Promise.resolve({
            password_reset_id: 0,
            login_user_id: 0,
            reset_id: id,
            valid_until: new Date(Date.now() + 1000),
        })
    );

    ormLUMock.getLoginUserById.mockResolvedValue(user);
    ormLUMock.updateLoginUser.mockResolvedValue(user);

    ormSKMock.addSessionKey.mockImplementation((i, k, d) =>
        Promise.resolve({
            session_key: k,
            session_key_id: 0,
            valid_until: d,
            login_user_id: i,
        })
    );
});

afterEach(() => {
    utilMock.generateKey.mockReset();

    sendMailMock.mockReset();
    closeTranspMock.mockReset();
    createTranspMock.mockReset();

    reqMock.parseRequestResetRequest.mockReset();
    reqMock.parseCheckResetCodeRequest.mockReset();

    ormPMock.getPasswordPersonByEmail.mockReset();

    ormPRMock.createOrUpdateReset.mockReset();
    ormPRMock.findResetByCode.mockReset();
    ormPRMock.deleteResetWithResetId.mockReset();

    ormLUMock.getLoginUserById.mockReset();
    ormLUMock.updateLoginUser.mockReset();

    ormSKMock.addSessionKey.mockReset();
});

function expectSentMail() {
    expect(mailMock.createTransport).toHaveBeenCalledTimes(1);
    expect(sendMailMock).toHaveBeenCalledTimes(1);
    expect(closeTranspMock).toHaveBeenCalledTimes(1);
}

function expectCall<T, U>(func: T, val: U) {
    expect(func).toHaveBeenCalledTimes(1);
    expect(func).toHaveBeenCalledWith(val);
}

test("Can send emails (vague)", async () => {
    await expect(
        reset.sendMail({
            to: "jeff@hotmail.com",
            subject: "nothing",
            html: "empty",
        })
    ).resolves.toBe(undefined);
    expectSentMail();
});

test("Can create email strings (vague)", () => {
    expect(reset.createEmail("myresetcode")).toBeTruthy();
});

test("Can request reset", async () => {
    const req = getMockReq();

    await expect(reset.requestReset(req)).resolves.toStrictEqual({});
    expectSentMail();
    expectCall(reqMock.parseRequestResetRequest, req);
    expectCall(ormPMock.getPasswordPersonByEmail, "jeffrey@jan.com");
});

test("Can check code", async () => {
    const req = getMockReq();
    req.body = { code: "valid_code_believe_me_okay?" };

    await expect(reset.checkCode(req)).resolves.toStrictEqual({});
    expectCall(reqMock.parseCheckResetCodeRequest, req);
    expectCall(ormPRMock.findResetByCode, req.body.code);
});

test("Can reset password", async () => {
    const req = getMockReq();
    const old = req.headers;
    req.body = { code: "valid_code_believe_me_okay?", password: "new_pass" };

    await expect(reset.resetPassword(req)).resolves.toStrictEqual({
        sessionkey: "key",
    });
    expect(req.headers.authorization).toBe(config.global.authScheme + " key");
    req.headers = old;
    expectCall(reqMock.parseResetPasswordRequest, req);
    expectCall(ormPRMock.findResetByCode, req.body.code);
    expect(bcryptMock.hash).toHaveBeenCalledTimes(1);
    expectCall(ormLUMock.getLoginUserById, 0);
    expectCall(ormLUMock.updateLoginUser, {
        loginUserId: 0,
        isAdmin: false,
        isCoach: true,
        accountStatus: "ACTIVATED",
        password: "new_pass",
    });
    expect(ormSK.addSessionKey).toHaveBeenCalledTimes(1);
    expectCall(ormPRMock.deleteResetWithResetId, req.body.code);
});
