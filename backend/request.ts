import { account_status_enum } from "@prisma/client";
import express from "express";
import * as validator from "validator";

import * as config from "./config.json";
import { FilterSort } from "./orm_functions/orm_types";
import {
    Anything,
    Decision,
    FollowupType,
    InternalTypes,
    Requests,
    EmailStatus,
    AccountStatus,
} from "./types";
import { errors, getSessionKey } from "./utility";

/**
 *  We use 3 types of requests: those requiring no special values, those
 * requiring a key, and those requiring both a key and an ID.
 */
type RequestType = "Neither" | "Key" | "Id";

/**
 *  Ease of access for the three request types. This type holds all three as
 * const fields.
 */
interface RequestTypes {
    neither: RequestType;
    key: RequestType;
    id: RequestType;
}

/**
 *  Implementation of the {@link RequestTypes} interface.
 */
const types: RequestTypes = {
    neither: "Neither",
    key: "Key",
    id: "Id",
};

/**
 *  Rejects a promise with an argument error.
 *  @template T The type the promise would resolve to.
 *  @returns A Promise rejecting with an Argument Error.
 */
function checkStringBoolean(value: string): boolean {
    return value === "true" || value === "false";
}

/**
 *  Rejects a promise with an argument error.
 *  @template T The type the promise would resolve to.
 *  @returns A Promise rejecting with an Argument Error.
 */
function rejector<T>(): Promise<T> {
    return Promise.reject(errors.cookArgumentError());
}

/**
 *  Checks if an object (of type any) has the required fields. Also logs which
 * fields are missing. Does only check whether or not the fields exist, not if
 * they have a value or if they have a certain type.
 *  @param obj The object to check.
 *  @param fields The fields the object should contain.
 *  @returns `true` if and only if the object contains all of the fields.
 */
function anyHasFields(obj: Anything, fields: string[]): boolean {
    for (const f of fields) {
        if (!(f in obj)) {
            return false;
        }
    }
    return true;
}

/**
 *  Checks if a request has the required fields. If the request is a Key request
 * or and ID request, the `Authorization` header is also checked for existence
 * and semantics; it has to start with the correct value (as defined in the
 * `config.json`). If the request is an ID request, the `req.params.id` field
 * is also checked for existence.
 *  @param req The request to check.
 *  @param fields The fields that should be present.
 *  @param reqType The type of request.
 *  @returns A Promise which will resolve to nothing if all of the fields are
 * present, or reject with an Argument Error if any of the fields is not
 * present. If the request is expected to be a key or ID request, but it doesn't
 * hold a `getSessionKey(req)`, a promise rejecting with an Unauthenticated
 * Error is returned instead.
 */
function hasFields(
    req: express.Request,
    fields: string[],
    reqType: RequestType
): Promise<void> {
    if (reqType == types.key || reqType == types.id) {
        const authHeader = req.headers.authorization;
        if (
            authHeader == undefined ||
            !authHeader.startsWith(config.global.authScheme)
        ) {
            return Promise.reject(errors.cookUnauthenticated());
        }
    }

    if (reqType == types.id && !("id" in req.params)) return rejector();
    return anyHasFields(req.body, fields) ? Promise.resolve() : rejector();
}

/**
 *  Checks whether the request holds one or more of the fields.
 *  @param req The request to check.
 *  @param fields The fields that should be present.
 *  @returns `true` if at least one field is present, otherwise `false`.
 */
function atLeastOneField(req: express.Request, fields: string[]): boolean {
    return fields.some((s) => s in req.body);
}

/**
 *  Returns the value if the object holds the key, otherwise undefined.
 *  @template T The type of the field you wish to recover.
 *  @param obj The object to check.
 *  @param key The key to find in the object.
 *  @returns `obj[key]` if the key is present, otherwise `undefined`.
 */
function maybe<T>(obj: Anything, key: string): T | undefined {
    return key in obj ? (obj[key] as T) : undefined;
}

/**
 *  Resolves with the given object if the `object.id` is a valid number
 * (not NaN), otherwise, returns the rejector.
 *  @template T The type of object to validate (should be an IdRequest).
 *  @param r The object to validate.
 *  @return A promise resolving with the object if it's valid, otherwise one
 * rejecting with an argument error.
 */
function idIsNumber<T extends Requests.IdRequest>(r: T): Promise<T> {
    return isNaN(r.id) ? rejector() : Promise.resolve(r);
}

/**
 *  Resolves with the given object if none of the keys is a NaN value (they can
 * be undefined) in the given object; otherwise, returns the rejector.
 *  @template T The type of object to validate.
 *  @param keys The keys to check.
 *  @param obj The object to validate.
 *  @return A promise resolving with the object if it's valid, otherwise one
 * rejecting with an argument error.
 */
function allNonNaN<T extends Anything>(keys: string[], obj: T): Promise<T> {
    return keys.every((v) => {
        return obj[v] == undefined || !isNaN(obj[v] as number);
    })
        ? Promise.resolve(obj)
        : rejector();
}

/**
 *  Parses a key-only request.
 *  @param req The request to check.
 *  @returns A Promise resolving to the parsed data or rejecting with an
 * Argument or Unauthenticated error.
 */
async function parseKeyRequest(
    req: express.Request
): Promise<Requests.KeyRequest> {
    return hasFields(req, [], types.key).then(() =>
        Promise.resolve({
            sessionkey: getSessionKey(req),
        })
    );
}

async function parsePaginationRequest(
    req: express.Request
): Promise<Requests.PaginableRequest> {
    return parseKeyRequest(req).then((parsed) => {
        let currentPage = 0;
        if ("currentPage" in req.body) {
            currentPage = Number(req.body.currentPage);
        }
        return {
            ...parsed,
            currentPage: currentPage,
            pageSize: config.global.pageSize,
        };
    });
}

/**
 *  Parses a request requiring both a key and an ID.
 *  @param req The request to check.
 *  @returns A Promise resolving to the parsed data or rejecting with an
 * Argument or Unauthenticated error.
 */
async function parseKeyIdRequest(
    req: express.Request
): Promise<Requests.IdRequest> {
    return hasFields(req, [], types.id).then(() =>
        Promise.resolve({
            sessionkey: getSessionKey(req),
            id: Number(req.params.id),
        }).then(idIsNumber)
    );
}

/**
 *  Parses a request to update a login user.
 *  @param req The request to check.
 *  @returns A Promise resolving to the parsed data or rejecting with an
 * Argument or Unauthenticated error.
 */
async function parseUpdateLoginUser(
    req: express.Request
): Promise<Requests.UpdateLoginUser> {
    return hasFields(req, [], types.id).then(async () => {
        return Promise.resolve({
            sessionkey: getSessionKey(req),
            id: Number(req.params.id),
            isAdmin: maybe(req.body, "isAdmin") as boolean,
            isCoach: maybe(req.body, "isCoach") as boolean,
            accountStatus: maybe(
                req.body,
                "accountStatus"
            ) as account_status_enum,
        }).then(idIsNumber);
    });
}

/**
 *  Parses a request to `POST /login/`.
 *  @param req The request to check.
 *  @returns A Promise resolving to the parsed data or rejecting with an
 * Argument or Unauthenticated error.
 */
export async function parseLoginRequest(
    req: express.Request
): Promise<Requests.Login> {
    return hasFields(req, ["name", "pass"], types.neither).then(() => {
        if (!validator.default.isEmail(req.body.name)) {
            return rejector();
        } else {
            const email = validator.default
                .normalizeEmail(req.body.name)
                .toString();
            return Promise.resolve({ name: email, pass: req.body.pass });
        }
    });
}

/**
 *  Parses a request to `POST /student/<id>`.
 *  @param req The request to check.
 *  @returns A Promise resolving to the parsed data or rejecting with an
 * Argument or Unauthenticated error.
 */
export async function parseUpdateStudentRequest(
    req: express.Request
): Promise<Requests.UpdateStudent> {
    const bodyF = [
        "emailOrGithub",
        "name",
        "gender",
        "pronouns",
        "phone",
        "nickname",
        "alumni",
        "education",
    ];

    return hasFields(req, [], types.id)
        .then(() => {
            if (!atLeastOneField(req, bodyF))
                return rejector<Requests.UpdateStudent>();

            return Promise.resolve({
                sessionkey: getSessionKey(req),
                id: Number(req.params.id),
                emailOrGithub: maybe<string>(req.body, "emailOrGithub"),
                name: maybe<string>(req.body, "name"),
                gender: maybe<string>(req.body, "gender"),
                pronouns: maybe<string>(req.body, "pronouns"),
                phone: maybe<string>(req.body, "phone"),
                education: maybe<Requests.UpdateStudent["education"]>(
                    req.body,
                    "education"
                ),
                alumni: maybe<boolean>(req.body, "alumni"),
                nickname: maybe<string>(req.body, "nickname"),
            });
        })
        .then(idIsNumber);
}

/**
 *  Parses a request to `POST /student/<id>/suggest`.
 *  @param req The request to check.
 *  @returns A Promise resolving to the parsed data or rejecting with an
 * Argument or Unauthenticated error.
 */
export async function parseSuggestStudentRequest(
    req: express.Request
): Promise<Requests.Suggest> {
    return hasFields(req, ["suggestion"], types.id).then(async () => {
        const sug: unknown = req.body.suggestion;
        if (sug != Decision.YES && sug != Decision.MAYBE && sug != Decision.NO)
            return rejector();

        return Promise.resolve({
            sessionkey: getSessionKey(req),
            id: Number(req.params.id),
            suggestion: sug as InternalTypes.Suggestion,
            reason: maybe<string>(req.body, "reason"),
        }).then(idIsNumber);
    });
}

/**
 *  Parses a request to `GET /student/<id>/suggest`.
 *  @param req The request to check.
 *  @returns A Promise resolving to the parsed data or rejecting with an
 * Argument or Unauthenticated error.
 */
export async function parseGetSuggestionsStudentRequest(
    req: express.Request
): Promise<Requests.YearId> {
    return hasFields(req, [], types.id).then(async () => {
        if ("year" in req.body) {
            return Promise.resolve({
                sessionkey: getSessionKey(req),
                id: Number(req.params.id),
                year: Number(req.body.year),
            }).then((o) => allNonNaN(["id", "year"], o));
        } else {
            return Promise.resolve({
                sessionkey: getSessionKey(req),
                id: Number(req.params.id),
            }).then(idIsNumber);
        }
    });
}

/**
 *  Parses a request to `GET /student/<id>`.
 *  @param req The request to check.
 *  @returns A Promise resolving to the parsed data or rejecting with an
 * Argument or Unauthenticated error.
 */
export async function parseSingleStudentRequest(
    req: express.Request
): Promise<Requests.YearId> {
    return hasFields(req, [], types.id).then(() => {
        if ("year" in req.body) {
            return Promise.resolve({
                sessionkey: getSessionKey(req),
                id: Number(req.params.id),
                year: Number(req.body.year),
            });
        } else {
            return Promise.resolve({
                sessionkey: getSessionKey(req),
                id: Number(req.params.id),
            });
        }
    });
}

/**
 *  Parses a request to `GET /osoc/filter`.
 *  @param req The request to check.
 *  @returns A Promise resolving to the parsed data or rejecting with an
 * Argument or Unauthenticated error.
 */
export async function parseFilterOsocsRequest(
    req: express.Request
): Promise<Requests.OsocFilter> {
    const authenticated = await parseKeyRequest(req); // enforce authentication
    let year = maybe<number>(req.body, "yearFilter");
    if ("yearFilter" in req.body) {
        year = Number(req.body.yearFilter);
        if (isNaN(year)) return rejector();
    }

    for (const filter of [maybe(req.body, "yearSort")]) {
        if (filter != undefined && filter !== "asc" && filter !== "desc") {
            return rejector();
        }
    }

    return Promise.resolve({
        ...authenticated,
        yearFilter: year,
        yearSort: maybe<FilterSort>(req.body, "yearSort"),
    });
}

/**
 *  Parses a request to `GET /student/filter`.
 *  @param req The request to check.
 *  @returns A Promise resolving to the parsed data or rejecting with an
 * Argument or Unauthenticated error.
 */
export async function parseFilterStudentsRequest(
    req: express.Request
): Promise<Requests.StudentFilter> {
    const paged = await parsePaginationRequest(req); // ensure authentication

    let mail = maybe<string>(req.body, "emailFilter");
    let roles: string[] | undefined = undefined; // = maybe(req.body, "roleFilter");
    if (
        ("statusFilter" in req.body &&
            !Object.values(Decision).includes(
                req.body.statusFilter as unknown as Decision
            )) ||
        ("emailStatusFilter" in req.body &&
            !Object.values(EmailStatus).includes(
                req.body.emailStatusFilter as unknown as EmailStatus
            )) ||
        ("alumniFilter" in req.body &&
            !checkStringBoolean(req.body.alumniFilter.toString())) ||
        ("coachFilter" in req.body &&
            !checkStringBoolean(req.body.coachFilter.toString()))
    ) {
        return rejector();
    } else {
        if (
            "emailFilter" in req.body &&
            validator.default.isEmail(req.body.emailFilter)
        ) {
            mail = validator.default
                .normalizeEmail(req.body.emailFilter)
                .toString();
        } else if ("emailFilter" in req.body) {
            mail = req.body.emailFilter as string;
        }
    }

    if ("roleFilter" in req.body) {
        if (typeof req.body.roleFilter === "string")
            roles = req.body.roleFilter.split(",");
        else roles = req.body.roleFilter as string[];
    }

    for (const filter of [
        maybe(req.body, "nameSort"),
        maybe(req.body, "emailSort"),
    ]) {
        if (filter != undefined && filter !== "asc" && filter !== "desc") {
            return rejector();
        }
    }

    let osoc_year = new Date().getFullYear();
    if ("osocYear" in req.body) {
        osoc_year = Number(req.body.osocYear);
        if (isNaN(osoc_year)) return rejector();
    }

    let alumniFilter: boolean | undefined = undefined;
    if ("alumniFilter" in req.body) {
        alumniFilter = req.body.alumniFilter.toString() === "true";
    }
    let coachFilter: boolean | undefined = undefined;
    if ("coachFilter" in req.body) {
        coachFilter = req.body.coachFilter.toString() === "true";
    }
    return Promise.resolve({
        ...paged,
        osocYear: osoc_year,
        nameFilter: maybe(req.body, "nameFilter"),
        emailFilter: mail,
        roleFilter: roles,
        alumniFilter: alumniFilter,
        coachFilter: coachFilter,
        statusFilter: maybe(req.body, "statusFilter"),
        emailStatusFilter: maybe(req.body, "emailStatusFilter"),
        nameSort: maybe(req.body, "nameSort"),
        emailSort: maybe(req.body, "emailSort"),
    });
}

/**
 *  Parses a request to `GET /user/filter`.
 *  @param req The request to check.
 *  @returns A Promise resolving to the parsed data or rejecting with an
 * Argument or Unauthenticated error.
 */
export async function parseFilterUsersRequest(
    req: express.Request
): Promise<Requests.UserFilter> {
    const paginated = await parsePaginationRequest(req); // enforce authentication
    let mail = undefined;

    if (
        ("statusFilter" in req.body &&
            !Object.values(AccountStatus).includes(
                req.body.statusFilter as unknown as AccountStatus
            )) ||
        ("isCoachFilter" in req.body &&
            !checkStringBoolean(req.body.isCoachFilter.toString())) ||
        ("isAdminFilter" in req.body &&
            !checkStringBoolean(req.body.isAdminFilter.toString()))
    ) {
        return rejector();
    } else {
        if (
            "emailFilter" in req.body &&
            validator.default.isEmail(req.body.emailFilter)
        ) {
            mail = validator.default
                .normalizeEmail(req.body.emailFilter)
                .toString();
        } else if ("emailFilter" in req.body) {
            mail = req.body.emailFilter as string;
        }
    }

    let isCoachFilter = undefined;
    if ("isCoachFilter" in req.body) {
        isCoachFilter = req.body.isCoachFilter.toString() === "true";
    }
    let isAdminFilter = undefined;
    if ("isAdminFilter" in req.body) {
        isAdminFilter = req.body.isAdminFilter.toString() === "true";
    }

    for (const filter of [
        maybe(req.body, "nameSort"),
        maybe(req.body, "emailSort"),
    ]) {
        if (filter != undefined && filter !== "asc" && filter !== "desc") {
            return rejector();
        }
    }

    return Promise.resolve({
        ...paginated,
        nameFilter: maybe(req.body, "nameFilter"),
        emailFilter: mail,
        statusFilter: maybe(req.body, "statusFilter"),
        nameSort: maybe(req.body, "nameSort"),
        emailSort: maybe(req.body, "emailSort"),
        isCoachFilter: isCoachFilter,
        isAdminFilter: isAdminFilter,
    });
}

/**
 *  Parses a request to `POST /student/<id>/confirm`.
 *  @param req The request to check.
 *  @returns A Promise resolving to the parsed data or rejecting with an
 * Argument or Unauthenticated error.
 */
export async function parseFinalizeDecisionRequest(
    req: express.Request
): Promise<Requests.Confirm> {
    return hasFields(req, [], types.id).then(async () => {
        if ("reply" in req.body) {
            if (
                req.body.reply != Decision.YES &&
                req.body.reply != Decision.MAYBE &&
                req.body.reply != Decision.NO
            )
                return rejector();
        }

        return Promise.resolve({
            sessionkey: getSessionKey(req),
            id: Number(req.params.id),
            reason: maybe<string>(req.body, "reason"),
            reply: maybe<InternalTypes.Suggestion>(req.body, "reply"),
        }).then(idIsNumber);
    });
}

/**
 *  Parses a request to `POST /coach/request/`.
 *  @param req The request to check.
 *  @returns A Promise resolving to the parsed data or rejecting with an
 * Argument or Unauthenticated error.
 */
export async function parseRequestUserRequest(
    req: express.Request
): Promise<Requests.UserRequest> {
    return hasFields(req, ["name", "email", "pass"], types.neither).then(() =>
        Promise.resolve({
            name: req.body.name,
            email: req.body.email,
            pass: req.body.pass,
        })
    );
}

/**
 *  Parses a request to `POST /project/`.
 *  @param req The request to check.
 *  @returns A Promise resolving to the parsed data or rejecting with an
 * Argument or Unauthenticated error.
 */
export async function parseNewProjectRequest(
    req: express.Request
): Promise<Requests.Project> {
    return hasFields(
        req,
        ["name", "partner", "start", "end", "positions", "osocId", "roles"],
        types.key
    ).then(() =>
        Promise.resolve({
            sessionkey: getSessionKey(req),
            name: req.body.name,
            partner: req.body.partner,
            start: req.body.start,
            end: req.body.end,
            osocId: Number(req.body.osocId),
            positions: Number(req.body.positions),
            roles: req.body.roles,
        }).then((o) => allNonNaN(["positions", "osocId"], o))
    );
}

/**
 *  Parses a request to `POST /project/<id>`.
 *  @param req The request to check.
 *  @returns A Promise resolving to the parsed data or rejecting with an
 * Argument or Unauthenticated error.
 */
export async function parseUpdateProjectRequest(
    req: express.Request
): Promise<Requests.ModProject> {
    const options = [
        "name",
        "partner",
        "start",
        "end",
        "positions",
        "modifyRoles",
        "deleteRoles",
    ];

    return hasFields(req, [], types.id).then(async () => {
        if (!atLeastOneField(req, options)) return rejector();

        return Promise.resolve({
            sessionkey: getSessionKey(req),
            id: Number(req.params.id),
            name: maybe<string>(req.body, "name"),
            partner: maybe<string>(req.body, "partner"),
            start: maybe<Date>(req.body, "start"),
            end: maybe<Date>(req.body, "end"),
            positions:
                maybe(req.body, "positions") == undefined
                    ? undefined
                    : Number(req.body.positions),
            modifyRoles: maybe<object>(req.body, "modifyRoles"),
            deleteRoles: maybe<object>(req.body, "deleteRoles"),
        }).then(idIsNumber);
    });
}

/**
 *  Parses a request to `GET /project/filter`.
 *  @param req The request to check.
 *  @returns A Promise resolving to the parsed data or rejecting with an
 * Argument or Unauthenticated error.
 */
export async function parseFilterProjectsRequest(
    req: express.Request
): Promise<Requests.ProjectFilter> {
    const paginated = await parsePaginationRequest(req); // enforce authentication
    for (const filter of [
        maybe(req.body, "projectNameSort"),
        maybe(req.body, "clientNameSort"),
        maybe(req.body, "fullyAssignedSort"),
    ]) {
        if (filter != undefined && filter !== "asc" && filter !== "desc") {
            return rejector();
        }
    }

    let assignedCoachesFilterArray = maybe<number[]>(
        req.body,
        "assignedCoachesFilterArray"
    );
    if ("assignedCoachesFilterArray" in req.body) {
        if (typeof req.body.assignedCoachesFilterArray === "string") {
            assignedCoachesFilterArray = req.body.assignedCoachesFilterArray
                .split(",")
                .map((num: string) => parseInt(num));
        }
    }

    let fullyAssignedFilter = maybe<boolean>(req.body, "fullyAssignedFilter");
    if ("fullyAssignedFilter" in req.body) {
        if (!checkStringBoolean(req.body.fullyAssignedFilter.toString())) {
            return rejector();
        }
        fullyAssignedFilter = req.body.fullyAssignedFilter === "true";
    }

    return Promise.resolve({
        ...paginated,
        projectNameFilter: maybe(req.body, "projectNameFilter"),
        clientNameFilter: maybe(req.body, "clientNameFilter"),
        assignedCoachesFilterArray: assignedCoachesFilterArray,
        fullyAssignedFilter: fullyAssignedFilter,
        projectNameSort: maybe(req.body, "projectNameSort"),
        clientNameSort: maybe(req.body, "clientNameSort"),
    });
}

/**
 *  Parses a request to `POST /project/<id>/draft`.
 *  @param req The request to check.
 *  @returns A Promise resolving to the parsed data or rejecting with an
 * Argument or Unauthenticated error.
 */
export async function parseDraftStudentRequest(
    req: express.Request
): Promise<Requests.Draft> {
    return hasFields(req, ["studentId", "role"], types.id).then(() =>
        Promise.resolve({
            sessionkey: getSessionKey(req),
            id: Number(req.params.id),
            studentId: Number(req.body.studentId),
            role: req.body.role,
        }).then((o) => allNonNaN(["id", "studentId"], o))
    );
}

/**
 *  Parses a request to `POST /followup/<id>`.
 *  @param req The request to check.
 *  @returns A Promise resolving to the parsed data or rejecting with an
 * Argument or Unauthenticated error.
 */
export async function parseSetFollowupStudentRequest(
    req: express.Request
): Promise<Requests.Followup> {
    return hasFields(req, ["type"], types.id).then(async () => {
        const type: string = req.body.type;
        if (
            type != "SCHEDULED" &&
            type != "SENT" &&
            type != "FAILED" &&
            type != "NONE" &&
            type != "DRAFT"
        )
            return rejector();

        return Promise.resolve({
            sessionkey: getSessionKey(req),
            id: Number(req.params.id),
            type: type as FollowupType,
        }).then(idIsNumber);
    });
}

/**
 *  Parses a request to `POST /followup/template/`.
 *  @param req The request to check.
 *  @returns A Promise resolving to the parsed data or rejecting with an
 * Argument or Unauthenticated error.
 */
export async function parseNewTemplateRequest(
    req: express.Request
): Promise<Requests.Template> {
    return hasFields(req, ["name", "content"], types.key).then(() =>
        Promise.resolve({
            sessionkey: getSessionKey(req),
            name: req.body.name,
            subject: maybe(req.body, "subject"),
            cc: maybe(req.body, "cc"),
            content: req.body.content,
        })
    );
}

/**
 *  Parses a request to `POST /followup/template/<id>`.
 *  @param req The request to check.
 *  @returns A Promise resolving to the parsed data or rejecting with an
 * Argument or Unauthenticated error.
 */
export async function parseUpdateTemplateRequest(
    req: express.Request
): Promise<Requests.ModTemplate> {
    return hasFields(req, [], types.id).then(async () => {
        if (!atLeastOneField(req, ["name", "subject", "cc", "content"]))
            return rejector();

        return Promise.resolve({
            sessionkey: getSessionKey(req),
            id: Number(req.params.id),
            name: maybe<string>(req.body, "name"),
            subject: maybe<string>(req.body, "subject"),
            cc: maybe<string>(req.body, "cc"),
            content: maybe<string>(req.body, "content"),
        }).then(idIsNumber);
    });
}

/**
 *  Parses a request to `POST /form`.
 *  @param req The request to check.
 *  @returns A Promise resolving to the parsed data or rejecting with an
 * Argument or Unauthenticated error.
 */
export async function parseFormRequest(
    req: express.Request
): Promise<Requests.Form> {
    return hasFields(req, ["data"], types.neither).then(() => {
        if (
            req.body.data.fields === undefined ||
            req.body.data.fields === null
        ) {
            return rejector();
        }
        for (const question of req.body.data.fields) {
            if (
                question.key === undefined ||
                question.key === null ||
                question.value === undefined
            ) {
                return rejector();
            }
        }
        return Promise.resolve({
            createdAt: maybe(req.body, "createdAt"),
            data: req.body.data,
        });
    });
}

export async function parseRequestResetRequest(
    req: express.Request
): Promise<Requests.ReqReset> {
    return hasFields(req, ["email"], types.neither).then(() => {
        if (validator.default.isEmail(req.body.email)) {
            return Promise.resolve({
                email: validator.default
                    .normalizeEmail(req.body.email)
                    .toString(),
            });
        }

        return Promise.reject(errors.cookArgumentError());
    });
}

export async function parseCheckResetCodeRequest(
    req: express.Request
): Promise<Requests.ResetCheckCode> {
    if (!("id" in req.params))
        return Promise.reject(errors.cookArgumentError());
    return Promise.resolve({ code: req.params.id });
}

export async function parseResetPasswordRequest(
    req: express.Request
): Promise<Requests.ResetPassword> {
    if (!("id" in req.params) || !("password" in req.body))
        return Promise.reject(errors.cookArgumentError());
    return Promise.resolve({
        code: req.params.id,
        password: req.body.password,
    });
}

/**
 *  Parses a request to `POST /student/role`.
 *  @param req The request to check.
 *  @returns A Promise resolving to the parsed data or rejecting with an
 * Argument or Unauthenticated error.
 */
export async function parseStudentRoleRequest(
    req: express.Request
): Promise<Requests.Role> {
    return hasFields(req, ["name"], types.key).then(() =>
        Promise.resolve({
            sessionkey: getSessionKey(req),
            name: req.body.name,
        })
    );
}

export async function parseRemoveAssigneeRequest(
    req: express.Request
): Promise<Requests.RmDraftStudent> {
    return hasFields(req, ["student"], types.id).then(() =>
        Promise.resolve({
            sessionkey: getSessionKey(req),
            studentId: req.body.student,
            id: Number(req.params.id),
        }).then(idIsNumber)
    );
}

export async function parseUserModSelfRequest(
    req: express.Request
): Promise<Requests.UserPwd> {
    return hasFields(req, [], types.key).then(() => {
        if ("pass" in req.body) {
            try {
                if (
                    !("oldpass" in req.body.pass) ||
                    !("newpass" in req.body.pass)
                ) {
                    return rejector();
                }
            } catch (e) {
                return rejector();
            }
        }
        return Promise.resolve({
            sessionkey: getSessionKey(req),
            pass: maybe(req.body, "pass") as {
                oldpass: string;
                newpass: string;
            },
            name: maybe(req.body, "name") as string,
        });
    });
}

/**
 *  Parses a request requiring both a key and an ID.
 *  @param req The request to check.
 *  @returns A Promise resolving to the parsed data or rejecting with an
 * Argument or Unauthenticated error.
 */
export async function parseAcceptNewUserRequest(
    req: express.Request
): Promise<Requests.AccountAcceptance> {
    return hasFields(req, ["is_admin", "is_coach"], types.id).then(() =>
        Promise.resolve({
            sessionkey: getSessionKey(req),
            id: Number(req.params.id),
            is_admin: req.body.is_admin,
            is_coach: req.body.is_coach,
        }).then(idIsNumber)
    );
}

export async function parseNewOsocEditionRequest(
    req: express.Request
): Promise<Requests.OsocEdition> {
    console.log(parseInt(req.body.year));
    return hasFields(req, ["year"], types.neither).then(() =>
        Promise.resolve({
            sessionkey: getSessionKey(req),
            year: parseInt(req.body.year),
        }).then((obj) => allNonNaN(["year"], obj))
    );
}

/**
 *  A request to `DELETE /login/` only requires a session key
 * {@link parseKeyRequest}.
 */
export const parseLogoutRequest = parseKeyRequest;
/**
 *  A request to `GET /roles/all` only requires a session key
 * {@link parseKeyRequest}.
 */
export const parseRolesAllRequest = parseKeyRequest;
/**
 *  A request to `GET /coach/all` only requires a session key
 * {@link parseKeyRequest}.
 */
export const parseCoachAllRequest = parseKeyRequest;
/**
 *  A request to `GET /coach/request` only requires a session key
 * {@link parseKeyRequest}.
 */
export const parseGetAllCoachRequestsRequest = parseKeyRequest;
/**
 *  A request to `GET /admin/all` only requires a session key
 * {@link parseKeyRequest}.
 */
export const parseAdminAllRequest = parseKeyRequest;
/**
 *  A request to `GET /project/conflicts` only requires a session key
 * {@link parseKeyRequest}.
 */
export const parseConflictAllRequest = parseKeyRequest;
/**
 *  A request to `GET /followup/all` only requires a session key
 * {@link parseKeyRequest}.
 */
export const parseFollowupAllRequest = parseKeyRequest;
/**
 *  A request to `GET /template/all` only requires a session key
 * {@link parseKeyRequest}.
 */
export const parseTemplateListRequest = parseKeyRequest;
/**
 *  A request to `GET /project/conflicts` only requires a session key
 *  {@link parseKeyRequest}
 */
export const parseProjectConflictsRequest = parseKeyRequest;
/**
 *  A request to `GET /user/current` only requires a session key
 * {@link parseKeyRequest}.
 */
export const parseCurrentUserRequest = parseKeyRequest;
/**
 *  A request to `GET /verify` only requires a session key
 * {@link parseKeyRequest}.
 */
export const parseVerifyRequest = parseKeyRequest;
/**
 *  A request to `DELETE /student/<id>` only requires a session key and an ID
 * {@link parseKeyIdRequest}.
 */
export const parseDeleteStudentRequest = parseKeyIdRequest;
/**
 *  A request to `GET /coach/<id>` only requires a session key and an ID
 * {@link parseKeyIdRequest}.
 */
export const parseSingleCoachRequest = parseKeyIdRequest;
/**
 *  A request to `DELETE /coach/<id>` only requires a session key and an ID
 * {@link parseKeyIdRequest}.
 */
export const parseDeleteCoachRequest = parseKeyIdRequest;
/**
 *  A request to `GET /coach/request/<id>` only requires a session key and an ID
 * {@link parseKeyIdRequest}.
 */
export const parseGetCoachRequestRequest = parseKeyIdRequest;
/**
 *  A request to `DELETE /coach/request/<id>` only requires a session key and an
 * ID
 * {@link parseKeyIdRequest}.
 */
export const parseDenyNewCoachRequest = parseKeyIdRequest;
/**
 *  A request to `GET /admin/<id>` only requires a session key and an ID
 * {@link parseKeyIdRequest}.
 */
export const parseSingleAdminRequest = parseKeyIdRequest;
/**
 *  A request to `DELETE /admin/<id>` only requires a session key and an ID
 * {@link parseKeyIdRequest}.
 */
export const parseDeleteAdminRequest = parseKeyIdRequest;
/**
 *  A request to `GET /project/<id>` only requires a session key and an ID
 * {@link parseKeyIdRequest}.
 */
export const parseSingleProjectRequest = parseKeyIdRequest;
/**
 *  A request to `DELETE /project/<id>` only requires a session key and an ID
 * {@link parseKeyIdRequest}.
 */
export const parseDeleteProjectRequest = parseKeyIdRequest;
/**
 *  A request to `GET /project/<id>/draft` only requires a session key and an ID
 * {@link parseKeyIdRequest}.
 */
export const parseGetDraftedStudentsRequest = parseKeyIdRequest;
/**
 *  A request to `GET /followup/<id>` only requires a session key and an ID
 * {@link parseKeyIdRequest}.
 */
export const parseGetFollowupStudentRequest = parseKeyIdRequest;
/**
 *  A request to `GET /template/<id>` only requires a session key and an ID
 * {@link parseKeyIdRequest}.
 */
export const parseGetTemplateRequest = parseKeyIdRequest;
/**
 *  A request to `DELETE /template/<id>` only requires a session key and an ID
 * {@link parseKeyIdRequest}.
 */
export const parseDeleteTemplateRequest = parseKeyIdRequest;

/**
 *  A request to `POST /coach/<id>` is a request to update a login user
 * {@link parseUpdateLoginUser}.
 */
export const parseUpdateCoachRequest = parseUpdateLoginUser;
/**
 *  A request to `POST /admin/<id>` is a request to update a login user
 * {@link parseUpdateLoginUser}.
 */
export const parseUpdateAdminRequest = parseUpdateLoginUser;
/**
 *  A request to `GET /osoc/all` only requires a session key
 * {@link parseKeyRequest}.
 */
export const parseOsocAllRequest = parseKeyRequest;
/**
 *  Parses a request to `POST /osoc/`.
 *  @param req The request to check.
 *  @returns A Promise resolving to the parsed data or rejecting with an
 * Argument or Unauthenticated error.
 */
/**
 *  A request to `DELETE /osoc/<id>` only requires a session key and an ID
 * {@link parseKeyIdRequest}.
 */
export const parseDeleteOsocEditionRequest = parseKeyIdRequest;

/**
 *  A request to `GET /user/all` only requires a session key and optionally the
 * current page numer
 * {@link parsePaginationRequest}.
 */
export const parseUserAllRequest = parsePaginationRequest;
/**
 *  A request to `GET /project/all` only requires a session key and optionally
 * the current page numer
 * {@link parsePaginationRequest}.
 */
export const parseProjectAllRequest = parsePaginationRequest;
/**
 *  A request to `GET /student/all` only requires a session key and optionally
 * the current page numer
 * {@link parsePaginationRequest}.
 */
export const parseStudentAllRequest = parsePaginationRequest;
