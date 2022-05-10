// only test successes because
// 1: checkSessionKey/isAdmin has been tested
// 2: orm functions are fully tested
// 3: respOrError has been tested
// 4: all parsers have been tested
// -> failures use those stacks and aren't usually caught in the routes
// -> if those stacks work, all failures work as well (because Promises).

import { getMockReq } from "@jest-mock/express";
import { WithUserID } from "../../types";
import { CreateTemplate, UpdateTemplate } from "../../orm_functions/orm_types";

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
import * as ormo from "../../orm_functions/template";
jest.mock("../../orm_functions/template");
const ormoMock = ormo as jest.Mocked<typeof ormo>;

import * as template from "../../routes/template";

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

const templates = [
    {
        template_email_id: 1,
        owner_id: 0,
        name: "Osoc contract",
        content: "Please sign contract",
        cc: "me@osoc.com",
        subject: "Osoc Contract",
    },
    {
        template_email_id: 49,
        owner_id: 0,
        name: "Osoc denied",
        content: "You are not accepted for osoc",
        cc: "me@osoc.com",
        subject: "Osoc",
    },
    {
        template_email_id: 4,
        owner_id: 0,
        name: "Osoc password reset",
        content: "Hello, password reset",
        cc: "me@osoc.com",
        subject: "Password reset",
    },
];

beforeEach(() => {
    reqMock.parseNewTemplateRequest.mockImplementation((v) =>
        Promise.resolve(v.body)
    );
    reqMock.parseTemplateListRequest.mockImplementation((v) =>
        Promise.resolve(v.body)
    );
    reqMock.parseGetTemplateRequest.mockImplementation((v) =>
        Promise.resolve(v.body)
    );
    reqMock.parseUpdateTemplateRequest.mockImplementation((v) =>
        Promise.resolve(v.body)
    );
    reqMock.parseDeleteTemplateRequest.mockImplementation((v) =>
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

    ormoMock.createTemplate.mockImplementation((y: CreateTemplate) =>
        Promise.resolve({
            template_email_id: 0,
            owner_id: y.ownerId,
            name: y.name || "",
            content: y.content || "",
            cc: y.cc || "",
            subject: y.subject || "",
        })
    );
    ormoMock.getAllTemplates.mockResolvedValue(templates);
    ormoMock.getTemplateById.mockImplementation((y) =>
        Promise.resolve({
            template_email_id: y,
            owner_id: 0,
            name: "Osoc password reset",
            content: "Hello, password reset",
            cc: "me@osoc.com",
            subject: "Password reset",
        })
    );
    ormoMock.updateTemplate.mockImplementation((y: UpdateTemplate) =>
        Promise.resolve({
            template_email_id: y.templateId,
            owner_id: 0,
            name: y.name || "",
            content: y.content || "",
            cc: y.cc || "",
            subject: y.subject || "",
        })
    );
    ormoMock.deleteTemplate.mockImplementation((y) =>
        Promise.resolve({
            template_email_id: y,
            owner_id: 0,
            name: "Osoc contract",
            content: "Please sign contract",
            cc: "me@osoc.com",
            subject: "Osoc Contract",
        })
    );
});

afterEach(() => {
    reqMock.parseNewTemplateRequest.mockReset();
    reqMock.parseTemplateListRequest.mockReset();
    reqMock.parseGetTemplateRequest.mockReset();
    reqMock.parseUpdateTemplateRequest.mockReset();
    reqMock.parseDeleteTemplateRequest.mockReset();

    utilMock.checkSessionKey.mockReset();
    utilMock.isAdmin.mockReset();

    ormoMock.createTemplate.mockReset();
    ormoMock.getAllTemplates.mockReset();
    ormoMock.getTemplateById.mockReset();
    ormoMock.updateTemplate.mockReset();
    ormoMock.deleteTemplate.mockReset();
});

test("Can create a template", async () => {
    const r = getMockReq();
    r.body = {
        sessionkey: "abcd",
        owner_id: 0,
        name: "Osoc denied",
        content: "You are not accepted for osoc",
        cc: "me@osoc.com",
        subject: "Osoc",
    };
    await expect(template.createTemplate(r)).resolves.toStrictEqual({
        id: 0,
        owner: 0,
        name: "Osoc denied",
        content: "You are not accepted for osoc",
        cc: "me@osoc.com",
        subject: "Osoc",
    });
    expectCall(reqMock.parseNewTemplateRequest, r);
    expectCall(utilMock.isAdmin, r.body);
    expectCall(ormoMock.createTemplate, {
        ownerId: 0,
        name: "Osoc denied",
        content: "You are not accepted for osoc",
        cc: "me@osoc.com",
        subject: "Osoc",
    });
});

test("Can get all the templates", async () => {
    const r = getMockReq();
    r.body = {
        sessionkey: "abcd",
    };
    await expect(template.getAllTemplates(r)).resolves.toStrictEqual({
        data: templates.map((obj) => ({
            id: obj.template_email_id,
            owner: obj.owner_id,
            name: obj.name,
        })),
    });
    expectCall(reqMock.parseTemplateListRequest, r);
    expectCall(utilMock.isAdmin, r.body);
    expect(ormoMock.getAllTemplates).toHaveBeenCalledTimes(1);
});

test("Can get a template by id", async () => {
    const r = getMockReq();
    r.body = {
        sessionkey: "abcd",
        id: 4,
    };
    await expect(template.getSingleTemplate(r)).resolves.toStrictEqual({
        id: 4,
        owner: 0,
        name: "Osoc password reset",
        content: "Hello, password reset",
    });
    expectCall(reqMock.parseGetTemplateRequest, r);
    expectCall(utilMock.isAdmin, r.body);
    expectCall(ormoMock.getTemplateById, 4);
});

test("Can update a template", async () => {
    const r = getMockReq();
    r.body = {
        sessionkey: "abcd",
        id: 49,
        name: "Osoc denied",
        content: "You are not accepted for osoc",
        cc: "me@osoc.com",
        subject: "Osoc",
    };
    await expect(template.updateTemplate(r)).resolves.toStrictEqual({
        id: 49,
        owner: 0,
        name: "Osoc denied",
        content: "You are not accepted for osoc",
        cc: "me@osoc.com",
        subject: "Osoc",
    });
    expectCall(reqMock.parseUpdateTemplateRequest, r);
    expectCall(utilMock.isAdmin, r.body);
    expectCall(ormoMock.getTemplateById, 49);
    expectCall(ormoMock.updateTemplate, {
        templateId: 49,
        name: "Osoc denied",
        content: "You are not accepted for osoc",
        cc: "me@osoc.com",
        subject: "Osoc",
    });
});

test("Can delete a template by id", async () => {
    const r = getMockReq();
    r.body = {
        sessionkey: "abcd",
        id: 1,
    };
    await expect(template.deleteTemplate(r)).resolves.toStrictEqual({});
    expectCall(reqMock.parseDeleteTemplateRequest, r);
    expectCall(utilMock.isAdmin, r.body);
    expectCall(ormoMock.getTemplateById, 1);
    expectCall(ormoMock.deleteTemplate, 1);
});
