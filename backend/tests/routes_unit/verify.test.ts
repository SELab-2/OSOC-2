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
jest.mock("../../utility");
const utilMock = util as jest.Mocked<typeof util>;

import * as verify from "../../routes/verify";

const okay = {
    valid: true,
    is_coach: true,
    is_admin: true,
    accountStatus: "ACTIVATED" as account_status_enum,
    userId: 0,
};

beforeEach(() => {
    utilMock.checkSessionKey.mockImplementation((v) => {
        if (v.sessionkey == "abcd")
            return Promise.resolve({ ...okay, data: v });
        return Promise.reject({});
    });

    reqMock.parseVerifyRequest.mockImplementation((v) => v.body);
});

afterEach(() => {
    utilMock.checkSessionKey.mockReset();
    reqMock.parseVerifyRequest.mockReset();
});

function expectCall<T, U>(func: T, val: U) {
    expect(func).toHaveBeenCalledTimes(1);
    expect(func).toHaveBeenCalledWith(val);
}

test("Can verify a valid key", async () => {
    const req = getMockReq();
    req.body = { sessionkey: "abcd" };

    await expect(verify.verifyKey(req)).resolves.toStrictEqual({
        valid: true,
        is_coach: true,
        is_admin: true,
        account_status: "ACTIVATED",
    });
    expect(utilMock.checkSessionKey).toHaveBeenCalledTimes(1);
    expect(utilMock.checkSessionKey).toHaveBeenCalledWith(req.body, false);
    expectCall(reqMock.parseVerifyRequest, req);
});

test("Can verify an invalid key", async () => {
    const req = getMockReq();
    req.body = { sessionkey: "abc" };

    await expect(verify.verifyKey(req)).resolves.toStrictEqual({
        valid: false,
    });
    expect(utilMock.checkSessionKey).toHaveBeenCalledTimes(1);
    expect(utilMock.checkSessionKey).toHaveBeenCalledWith(req.body, false);
    expectCall(reqMock.parseVerifyRequest, req);
});
