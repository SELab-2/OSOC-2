import { account_status_enum } from "@prisma/client";
import express from "express";
import * as validator from "validator";

import * as config from "./config.json";
import {
    Anything,
    Decision,
    FollowupType,
    InternalTypes,
    Requests,
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
            console.log(
                "!!! Missing argument " +
                    f +
                    " in `" +
                    JSON.stringify(obj) +
                    "`!!!"
            );
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
    // if ((reqType == types.key || reqType == types.id) &&
    //     (!("sessionkey" in req.body) || req.body.sessionkey == undefined))
    //   return Promise.reject(errors.cookUnauthenticated());
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
        })
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
    return hasFields(
        req,
        ["isAdmin", "isCoach", "accountStatus"],
        types.id
    ).then(() => {
        return Promise.resolve({
            sessionkey: getSessionKey(req),
            id: Number(req.params.id),
            isAdmin: maybe(req.body, "isAdmin") as boolean,
            isCoach: maybe(req.body, "isCoach") as boolean,
            accountStatus: maybe(
                req.body,
                "accountStatus"
            ) as account_status_enum,
        });
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
        "firstName",
        "lastName",
        "gender",
        "pronouns",
        "phone",
        "nickname",
        "alumni",
        "education",
    ];

    return hasFields(req, [], types.id).then(() => {
        if (!atLeastOneField(req, bodyF)) return rejector();

        return Promise.resolve({
            sessionkey: getSessionKey(req),
            id: Number(req.params.id),
            emailOrGithub: maybe(req.body, "emailOrGithub"),
            firstName: maybe(req.body, "firstName"),
            lastName: maybe(req.body, "lastName"),
            gender: maybe(req.body, "gender"),
            pronouns: maybe(req.body, "pronouns"),
            phone: maybe(req.body, "phone"),
            education: maybe(req.body, "education"),
            alumni: maybe(req.body, "alumni"),
            nickname: maybe(req.body, "nickname"),
        });
    });
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
    return hasFields(req, ["suggestion", "senderId"], types.id).then(() => {
        const sug: unknown = req.body.suggestion;
        if (
            sug != Decision.YES &&
            sug != Decision.MAYBE &&
            sug != Decision.NO &&
            req.body.senderId != null
        )
            return rejector();

        return Promise.resolve({
            sessionkey: getSessionKey(req),
            id: Number(req.params.id),
            suggestion: sug as InternalTypes.Suggestion,
            reason: maybe(req.body, "reason"),
            senderId: Number(req.body.senderId),
        });
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
    let year = undefined;
    if ("yearFilter" in req.body && !parseInt(req.body.yearFilter)) {
        return rejector();
    } else {
        if ("yearFilter" in req.body) {
            year = parseInt(req.body.yearFilter);
        }
    }

    for (const filter of [maybe(req.body, "yearSort")]) {
        if (filter != undefined && filter !== "asc" && filter !== "desc") {
            return rejector();
        }
    }

    return Promise.resolve({
        sessionkey: getSessionKey(req),
        yearFilter: year,
        yearSort: maybe(req.body, "yearSort"),
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
    let mail = undefined;
    if (
        ("emailFilter" in req.body &&
            !validator.default.isEmail(req.body.emailFilter)) ||
        ("statusFilter" in req.body &&
            req.body.statusFilter !== Decision.YES &&
            req.body.statusFilter !== Decision.MAYBE &&
            req.body.statusFilter !== Decision.NO)
    ) {
        return rejector();
    } else {
        if ("emailFilter" in req.body) {
            mail = validator.default
                .normalizeEmail(req.body.emailFilter)
                .toString();
        }
    }

    console.log(mail);

    for (const filter of [
        maybe(req.body, "firstNameSort"),
        maybe(req.body, "lastNameSort"),
        maybe(req.body, "emailSort"),
        maybe(req.body, "roleSort"),
        maybe(req.body, "alumniSort"),
    ]) {
        if (filter != undefined && filter !== "asc" && filter !== "desc") {
            return rejector();
        }
    }

    return Promise.resolve({
        sessionkey: getSessionKey(req),
        firstNameFilter: maybe(req.body, "firstNameFilter"),
        lastNameFilter: maybe(req.body, "lastNameFilter"),
        emailFilter: mail,
        roleFilter: maybe(req.body, "roleFilter"),
        alumniFilter: maybe(req.body, "alumniFilter"),
        coachFilter: maybe(req.body, "coachFilter"),
        statusFilter: maybe(req.body, "statusFilter"),
        firstNameSort: maybe(req.body, "firstNameSort"),
        lastNameSort: maybe(req.body, "lastNameSort"),
        emailSort: maybe(req.body, "emailSort"),
        roleSort: maybe(req.body, "roleSort"),
        alumniSort: maybe(req.body, "alumniSort"),
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
    let mail = undefined;
    let isCoachFilter = maybe(req.body, "isCoachFilter");
    if ("isCoachFilter" in req.body) {
        isCoachFilter = Boolean(req.body.isCoachFilter);
    }
    let isAdminFilter = maybe(req.body, "isAdminFilter");
    if ("isAdminFilter" in req.body) {
        isAdminFilter = Boolean(req.body.isAdminFilter);
    }
    if (
        "statusFilter" in req.body &&
        req.body.statusFilter !== "ACTIVATED" &&
        req.body.statusFilter !== "PENDING" &&
        req.body.statusFilter !== "DISABLED"
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
        } else {
            mail = req.body.emailFilter;
        }
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
        sessionkey: getSessionKey(req),
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
    return hasFields(req, [], types.id).then(() => {
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
            reason: maybe(req.body, "reason"),
            reply: maybe(req.body, "reply"),
        });
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
    return hasFields(
        req,
        ["firstName", "lastName", "email", "pass"],
        types.neither
    ).then(() =>
        Promise.resolve({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
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
        ["name", "partner", "start", "end", "positions", "osocId"],
        types.key
    ).then(() =>
        Promise.resolve({
            sessionkey: getSessionKey(req),
            name: req.body.name,
            partner: req.body.partner,
            start: req.body.start,
            end: req.body.end,
            osocId: req.body.osocId,
            positions: req.body.positions,
        })
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
    const options = ["name", "partner", "start", "end", "positions"];

    return hasFields(req, [], types.id).then(() => {
        if (!atLeastOneField(req, options)) return rejector();

        return Promise.resolve({
            sessionkey: getSessionKey(req),
            id: Number(req.params.id),
            name: maybe(req.body, "name"),
            partner: maybe(req.body, "partner"),
            start: maybe(req.body, "start"),
            end: maybe(req.body, "end"),
            positions: maybe(req.body, "positions"),
        });
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
            studentId: req.body.studentId,
            role: req.body.role,
        })
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
    return hasFields(req, ["type"], types.id).then(() => {
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
        });
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
    return hasFields(req, [], types.id).then(() => {
        if (!atLeastOneField(req, ["name", "desc", "subject", "cc", "content"]))
            return rejector();

        return Promise.resolve({
            sessionkey: getSessionKey(req),
            id: Number(req.params.id),
            name: maybe(req.body, "name"),
            desc: maybe(req.body, "desc"),
            subject: maybe(req.body, "subject"),
            cc: maybe(req.body, "cc"),
            content: maybe(req.body, "content"),
        });
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
    return hasFields(req, ["eventId", "createdAt", "data"], types.neither).then(
        () => {
            return Promise.resolve({
                eventId: req.body.eventId,
                createdAt: req.body.createdAt,
                data: req.body.data,
            });
        }
    );
}

export async function parseRequestResetRequest(
    req: express.Request
): Promise<Requests.ReqReset> {
    return hasFields(req, ["email"], types.neither).then(() =>
        Promise.resolve({
            email: req.body.email,
        })
    );
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
    return hasFields(req, ["name"], types.neither).then(() =>
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
        })
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
        })
    );
}

/**
 *  A request to `DELETE /login/` only requires a session key
 * {@link parseKeyRequest}.
 */
export const parseLogoutRequest = parseKeyRequest;
/**
 *  A request to `GET /student/all` only requires a session key
 * {@link parseKeyRequest}.
 */
export const parseStudentAllRequest = parseKeyRequest;
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
 *  A request to `GET /user/all` only requires a session key
 * {@link parseKeyRequest}.
 */
export const parseUserAllRequest = parseKeyRequest;
/**
 *  A request to `GET /project/all` only requires a session key
 * {@link parseKeyRequest}.
 */
export const parseProjectAllRequest = parseKeyRequest;
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
 *  A request to `GET /student/<id>` only requires a session key and an ID
 * {@link parseKeyIdRequest}.
 */
export const parseSingleStudentRequest = parseKeyIdRequest;
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
