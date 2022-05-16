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
        checkYearPermissionOsoc: jest.fn(),
    }; // we want to only mock checkSessionKey, isAdmin and checkYearPermissionOsoc
});
const utilMock = util as jest.Mocked<typeof util>;

// setup mocks for orm
import * as ormo from "../../orm_functions/osoc";
jest.mock("../../orm_functions/osoc");
const ormoMock = ormo as jest.Mocked<typeof ormo>;

import * as osoc from "../../routes/osoc";

import * as ormlo from "../../orm_functions/login_user_osoc";
import { errors } from "../../utility";
jest.mock("../../orm_functions/login_user_osoc");
const ormloMock = ormlo as jest.Mocked<typeof ormlo>;

function expectCall<T, U>(func: T, val: U) {
    expect(func).toHaveBeenCalledTimes(1);
    expect(func).toHaveBeenCalledWith(val);
}

function expectNoCall<T>(func: T) {
    expect(func).toHaveBeenCalledTimes(0);
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

const osocs = [
    { osoc_id: 1, year: 2022, _count: { project: 5 } },
    { osoc_id: 49, year: 2054, _count: { project: 895 } },
    { osoc_id: 4, year: 2024, _count: { project: 7894512 } },
];

beforeEach(() => {
    reqMock.parseNewOsocEditionRequest.mockImplementation((v) =>
        Promise.resolve(v.body)
    );
    reqMock.parseOsocAllRequest.mockImplementation((v) =>
        Promise.resolve(v.body)
    );
    reqMock.parseFilterOsocsRequest.mockImplementation((v) =>
        Promise.resolve(v.body)
    );
    reqMock.parseDeleteOsocEditionRequest.mockImplementation((v) =>
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
    utilMock.checkYearPermissionOsoc.mockImplementation((v) =>
        Promise.resolve(v)
    );

    ormoMock.createOsoc.mockImplementation((y) =>
        Promise.resolve({ osoc_id: 0, year: y })
    );
    ormoMock.getAllOsoc.mockResolvedValue(osocs);
    ormoMock.filterOsocs.mockImplementation(
        (_, f: number | undefined, s: string | undefined) => {
            let data = osocs;
            if (f != undefined) data = data.filter((v) => v.year == f);
            if (s != undefined)
                data = data.sort(
                    (a, b) => (s == "desc" ? -1 : 1) * (a.year - b.year)
                );
            return Promise.resolve({
                pagination: { page: 0, count: 7 },
                data: data,
            });
        }
    );
    ormoMock.deleteOsocFromDB.mockImplementation(() => Promise.resolve());

    ormloMock.addOsocToUser.mockResolvedValue({
        login_user_osoc_id: 0,
        login_user_id: 0,
        osoc_id: 0,
    });
});

afterEach(() => {
    reqMock.parseNewOsocEditionRequest.mockReset();
    reqMock.parseOsocAllRequest.mockReset();
    reqMock.parseFilterOsocsRequest.mockReset();
    reqMock.parseDeleteOsocEditionRequest.mockReset();

    utilMock.checkSessionKey.mockReset();
    utilMock.isAdmin.mockReset();
    utilMock.checkYearPermissionOsoc.mockReset();

    ormoMock.createOsoc.mockReset();
    ormoMock.getAllOsoc.mockReset();
    ormoMock.filterOsocs.mockReset();
    ormoMock.deleteOsocFromDB.mockReset();

    ormloMock.addOsocToUser.mockReset();
});

test("Can create osoc edition", async () => {
    const r = getMockReq();
    r.body = { sessionkey: "abcd", year: 2059 };
    await expect(osoc.createOsocEdition(r)).resolves.toStrictEqual({
        data: { id: 0, year: 2059 },
    });
    expectCall(reqMock.parseNewOsocEditionRequest, r);
    expectCall(utilMock.isAdmin, r.body);
    expectCall(ormoMock.createOsoc, 2059);
    expectNoCall(utilMock.checkSessionKey);
});

test("osoc create fails because of database error when connecting loginUser to osoc", async () => {
    const r = getMockReq();
    ormloMock.addOsocToUser.mockReset(); // resetting this mock will trigger the fail
    r.body = { sessionkey: "abcd", year: 2059 };

    await expect(osoc.createOsocEdition(r)).rejects.toBe(
        errors.cookServerError()
    );

    expectCall(reqMock.parseNewOsocEditionRequest, r);
    expectCall(utilMock.isAdmin, r.body);
    expectCall(ormoMock.createOsoc, 2059);
    expectNoCall(utilMock.checkSessionKey);
});

test("Can get all the osoc editions", async () => {
    const r = getMockReq();
    r.body = { sessionkey: "abcd" };
    await expect(osoc.listOsocEditions(r)).resolves.toStrictEqual({
        data: osocs,
        pagination: { page: 0, count: 7 },
    });
    expectCall(reqMock.parseOsocAllRequest, r);
    expect(ormoMock.filterOsocs).toHaveBeenCalledTimes(1);
    expect(ormoMock.filterOsocs).toHaveBeenCalledTimes(1);
    expectCall(utilMock.checkSessionKey, r.body);
});

test("Can filter the osoc editions", async () => {
    const r = getMockReq();
    r.body = { sessionkey: "abcd", yearFilter: 2022 };
    await expect(osoc.filterYear(r)).resolves.toStrictEqual({
        data: [{ osoc_id: 1, year: 2022, _count: { project: 5 } }],
        pagination: { page: 0, count: 7 },
    });
    expectCall(reqMock.parseFilterOsocsRequest, r);
    expect(ormoMock.filterOsocs).toHaveBeenCalledTimes(1);
    expect(ormoMock.filterOsocs).toHaveBeenCalledWith(
        { currentPage: undefined, pageSize: undefined },
        2022,
        undefined,
        0
    );
    expectCall(utilMock.checkSessionKey, r.body);
});

test("Can delete an osoc edition by id", async () => {
    const r = getMockReq();
    r.body = { sessionkey: "abcd", id: 4 };
    await expect(osoc.deleteOsocEditionRequest(r)).resolves.toStrictEqual({});
    expectCall(reqMock.parseDeleteOsocEditionRequest, r);
    expectCall(ormoMock.deleteOsocFromDB, 4);
    expectCall(utilMock.isAdmin, r.body);
});
