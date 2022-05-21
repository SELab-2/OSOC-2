// only test successes because
// 1: checkSessionKey/isAdmin has been tested
// 2: orm functions are fully tested
// 3: respOrError has been tested
// 4: all parsers have been tested
// -> failures use those stacks and aren't usually caught in the routes
// -> if those stacks work, all failures work as well (because Promises).

import { getMockReq } from "@jest-mock/express";
import { WithUserID } from "../../types";

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
import * as ormo from "../../orm_functions/role";
jest.mock("../../orm_functions/role");
const ormoMock = ormo as jest.Mocked<typeof ormo>;

import * as role from "../../routes/role";

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

const roles = [
    { role_id: 1, name: "Data scientist" },
    { role_id: 49, name: "Software Dev" },
    { role_id: 4, name: "Frontend Dev" },
];

beforeEach(() => {
    reqMock.parseStudentRoleRequest.mockImplementation((v) =>
        Promise.resolve(v.body)
    );
    reqMock.parseRolesAllRequest.mockImplementation((v) =>
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

    ormoMock.createRole.mockImplementation((y) =>
        Promise.resolve({ role_id: 0, name: y })
    );
    ormoMock.getAllRoles.mockResolvedValue(roles);
});

afterEach(() => {
    reqMock.parseStudentRoleRequest.mockReset();
    reqMock.parseRolesAllRequest.mockReset();

    utilMock.checkSessionKey.mockReset();
    utilMock.isAdmin.mockReset();

    ormoMock.createRole.mockReset();
    ormoMock.getAllRoles.mockReset();
});

test("Can create a new role", async () => {
    const r = getMockReq();
    r.body = { sessionkey: "abcd", name: "New role" };
    ormoMock.getRolesByName.mockResolvedValue(null);
    await expect(role.createStudentRole(r)).resolves.toStrictEqual({
        name: "New role",
        id: 0,
    });
    expectCall(reqMock.parseStudentRoleRequest, r);
    expectCall(ormoMock.createRole, "New role");
    expectCall(utilMock.checkSessionKey, {
        name: "New role",
        sessionkey: "abcd",
    });

    ormoMock.getRolesByName.mockReset();
});

test("Can get all the roles", async () => {
    const r = getMockReq();
    r.body = { sessionkey: "abcd" };
    await expect(role.listStudentRoles(r)).resolves.toStrictEqual({
        data: roles,
    });
    expectCall(reqMock.parseRolesAllRequest, r);
    expect(ormoMock.getAllRoles).toHaveBeenCalledTimes(1);
    expectCall(utilMock.checkSessionKey, {
        sessionkey: "abcd",
    });
});
