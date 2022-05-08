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
            owner_id: y.ownerId || null,
            name: y.name || "",
            content: y.content || "",
            cc: y.cc || "",
            subject: y.subject || "",
        })
    );
    ormoMock.getAllTemplates.mockResolvedValue(templates);
    ormoMock.getTemplatesByName.mockImplementation((y: string) =>
        Promise.resolve([
            {
                template_email_id: 0,
                owner_id: 0,
                name: y,
                content: "Hello, password reset",
                cc: "me@osoc.com",
                subject: "Password reset",
                login_user: null,
            },
        ])
    );
    ormoMock.updateTemplate.mockImplementation((y: UpdateTemplate) =>
        Promise.resolve({
            template_email_id: y.templateId,
            owner_id: y.ownerId || null,
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
    ormoMock.getTemplatesByName.mockReset();
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
        template_id: 0,
        owner_id: 0,
        name: "Osoc denied",
        content: "You are not accepted for osoc",
        cc: "me@osoc.com",
        subject: "Osoc",
    });
    expectCall(reqMock.parseNewTemplateRequest, r);
    // TODO: should this be admin only?
    expectCall(utilMock.isAdmin, r.body);
    expectCall(ormoMock.createTemplate, {
        owner_id: 0,
        name: "Osoc denied",
        content: "You are not accepted for osoc",
        cc: "me@osoc.com",
        subject: "Osoc",
    });
    expectCall(utilMock.checkSessionKey, {
        sessionkey: "abcd",
        owner_id: 0,
        name: "Osoc denied",
        content: "You are not accepted for osoc",
        cc: "me@osoc.com",
        subject: "Osoc",
    });
});
