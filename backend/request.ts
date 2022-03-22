import express from 'express';

import {Requests} from './types';
import {errors} from './utility';

/**
 *  We use 3 types of requests: those requiring no special values, those
 * requiring a key, and those requiring both a key and an ID.
 */
type RequestType = "Neither"|"Key"|"Id";

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
  neither : "Neither",
  key : "Key",
  id : "Id"
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
function anyHasFields(obj: any, fields: string[]): boolean {
  for (var f of fields) {
    if (!(f in obj)) {
      console.log("!!! Missing argument " + f + " in `" + JSON.stringify(obj) +
                  "`!!!");
      return false;
    }
  }
  return true;
}

/**
 *  Checks if a request has the required fields. If the request is a Key request
 * or and ID request, the `req.body.sessionkey` field is also checked for
 * existence. If the request is an ID request, the `req.params.id` field is also
 * checked for existence.
 *  @param req The request to check.
 *  @param fields The fields that should be present.
 *  @param reqType The type of request.
 *  @returns A Promise which will resolve to nothing if all of the fields are
 * present, or reject with an Argument Error if any of the fields is not
 * present. If the request is expected to be a key or ID request, but it doesn't
 * hold a `req.body.sessionkey`, a promise rejecting with an Unauthenticated
 * Error is returned instead.
 */
function hasFields(req: express.Request, fields: string[],
                   reqType: RequestType): Promise<void> {
  if ((reqType == types.key || reqType == types.id) &&
      (!("sessionkey" in req.body) || req.body.sessionkey == undefined))
    return Promise.reject(errors.cookUnauthenticated());
  if (reqType == types.id && !("id" in req.params))
    return rejector();
  return anyHasFields(req.body, fields) ? Promise.resolve() : rejector();
}

/**
 *  Checks whether the request holds one or more of the fields.
 *  @param req The request to check.
 *  @param fields The fields that should be present.
 *  @returns `true` if at least one field is present, otherwise `false`.
 */
function atLeastOneField(req: express.Request, fields: string[]): boolean {
  return fields.some(s => (s in req.body));
}

/**
 *  Returns the value if the object holds the key, otherwise undefined.
 *  @template T The type of the field you wish to recover.
 *  @param obj The object to check.
 *  @param key The key to find in the object.
 *  @returns `obj[key]` if the key is present, otherwise `undefined`.
 */
function maybe<T>(obj: any, key: string): T {
  return (key in obj) ? obj[key] : undefined;
}

/**
 *  Parses a key-only request.
 *  @param req The request to check.
 *  @returns A Promise resolving to the parsed data or rejecting with an
 * Argument or Unauthenticated error.
 */
async function parseKeyRequest(req: express.Request):
    Promise<Requests.KeyRequest> {
  return hasFields(req, [], types.key).then(() => Promise.resolve({
    sessionkey : req.body.sessionkey
  }));
}

/**
 *  Parses a request requiring both a key and an ID.
 *  @param req The request to check.
 *  @returns A Promise resolving to the parsed data or rejecting with an
 * Argument or Unauthenticated error.
 */
async function parseKeyIdRequest(req: express.Request):
    Promise<Requests.IdRequest> {
  return hasFields(req, [], types.id).then(() => Promise.resolve({
    sessionkey : req.body.sessionkey,
    id : req.params.id
  }));
}

/**
 *  Parses a request to update a login user.
 *  @param req The request to check.
 *  @returns A Promise resolving to the parsed data or rejecting with an
 * Argument or Unauthenticated error.
 */
async function parseUpdateLoginUser(req: express.Request):
    Promise<Requests.UpdateLoginUser> {
  return hasFields(req, [], types.id).then(() => {
    const optional =
        [ "emailOrGithub", "firstName", "lastName", "gender", "pass" ];
    if (!atLeastOneField(req, optional))
      return rejector();

    return Promise.resolve({
      sessionkey : req.body.sessionkey,
      id : req.params.id,
      emailOrGithub : maybe(req.body, "emailOrGithub"),
      firstName : maybe(req.body, "firstName"),
      lastName : maybe(req.body, "lastName"),
      gender : maybe(req.body, "gender"),
      pass : maybe(req.body, "pass")
    });
  });
}

/**
 *  Parses a request to `POST /login/`.
 *  @param req The request to check.
 *  @returns A Promise resolving to the parsed data or rejecting with an
 * Argument or Unauthenticated error.
 */
export async function parseLoginRequest(req: express.Request):
    Promise<Requests.Login> {
  return hasFields(req, [ "name", "pass" ], types.neither)
      .then(() =>
                Promise.resolve({name : req.body.name, pass : req.body.pass}));
}

/**
 *  @deprecated ! use the form endpoint instead !
 *  Parses a request to `POST /student/`.
 *  @param req The request to check.
 *  @returns A Promise resolving to the parsed data or rejecting with an
 * Argument or Unauthenticated error.
 */
export async function parseNewStudentRequest(req: express.Request):
    Promise<Requests.NewStudent> {
  const bodyF = [
    "emailOrGithub", "firstName", "lastName", "gender", "pronouns", "phone",
    "education"
  ];
  const edF = [ "level", "duration", "year", "institute" ];

  return hasFields(req, bodyF, types.key).then(() => {
    if (!anyHasFields(req.body.education, edF))
      return rejector();

    return Promise.resolve({
      emailOrGithub : req.body.emailOrGithub,
      firstName : req.body.firstName,
      lastName : req.body.lastName,
      gender : req.body.gender,
      pronouns : req.body.pronouns,
      phone : req.body.phone,
      education : {
        level : req.body.education.level,
        duration : req.body.education.duration,
        year : req.body.education.year,
        institute : req.body.education.institute
      },
      sessionkey : req.body.sessionkey
    });
  });
}

/**
 *  Parses a request to `POST /student/<id>`.
 *  @param req The request to check.
 *  @returns A Promise resolving to the parsed data or rejecting with an
 * Argument or Unauthenticated error.
 */
export async function parseUpdateStudentRequest(req: express.Request):
    Promise<Requests.UpdateStudent> {
  const bodyF = [
    "emailOrGithub", "firstName", "lastName", "gender", "pronouns", "phone",
    "education"
  ];

  return hasFields(req, [], types.id).then(() => {
    if (!atLeastOneField(req, bodyF))
      return rejector();

    return Promise.resolve({
      sessionkey : req.body.sessionkey,
      id : req.params.id,
      emailOrGithub : maybe(req.body, "emailOrGithub"),
      firstName : maybe(req.body, "firstName"),
      lastName : maybe(req.body, "lastName"),
      gender : maybe(req.body, "gender"),
      pronouns : maybe(req.body, "pronouns"),
      phone : maybe(req.body, "phone"),
      education : maybe(req.body, "education")
    });
  });
}

/**
 *  Parses a request to `POST /student/<id>/sugest`.
 *  @param req The request to check.
 *  @returns A Promise resolving to the parsed data or rejecting with an
 * Argument or Unauthenticated error.
 */
export async function parseSuggestStudentRequest(req: express.Request):
    Promise<Requests.Suggest> {
  return hasFields(req, [ "suggestion" ], types.id).then(() => {
    const sug: any = req.body.suggestion;
    if (sug != "YES" && sug != "MAYBE" && sug != "NO")
      return rejector();

    return Promise.resolve({
      sessionkey : req.body.sessionkey,
      id : req.params.id,
      suggestion : sug,
      reason : maybe(req.body, "reason")
    });
  });
}

/**
 *  Parses a request to `POST /student/<id>/confirm`.
 *  @param req The request to check.
 *  @returns A Promise resolving to the parsed data or rejecting with an
 * Argument or Unauthenticated error.
 */
export async function parseFinalizeDecisionRequest(req: express.Request):
    Promise<Requests.Confirm> {
  return hasFields(req, [], types.id).then(() => {
    if ("reply" in req.body) {
      if (req.body.reply != "YES" && req.body.reply != "MAYBE" &&
          req.body.reply != "NO")
        return rejector();
    }

    return Promise.resolve({
      sessionkey : req.body.sessionkey,
      id : req.params.id,
      reply : maybe(req.body, "reply")
    });
  });
}

/**
 *  Parses a request to `POST /coach/request/`.
 *  @param req The request to check.
 *  @returns A Promise resolving to the parsed data or rejecting with an
 * Argument or Unauthenticated error.
 */
export async function parseRequestCoachRequest(req: express.Request):
    Promise<Requests.CoachRequest> {
  return hasFields(req, [ "firstName", "lastName", "emailOrGithub" ],
                   types.neither)
      .then(() => Promise.resolve({
        firstName : req.body.firstName,
        lastName : req.body.lastName,
        emailOrGithub : req.body.emailOrGithub,
        pass : maybe(req.body, "pass")
      }));
}

/**
 *  Parses a request to `POST /project/`.
 *  @param req The request to check.
 *  @returns A Promise resolving to the parsed data or rejecting with an
 * Argument or Unauthenticated error.
 */
export async function parseNewProjectRequest(req: express.Request):
    Promise<Requests.Project> {
  return hasFields(req, [ "name", "partner", "start", "end", "positions" ],
                   types.key)
      .then(() => Promise.resolve({
        sessionkey : req.body.sessionkey,
        name : req.body.name,
        partner : req.body.partner,
        start : req.body.start,
        end : req.body.end,
        positions : req.body.positions
      }));
}

/**
 *  Parses a request to `POST /project/<id>`.
 *  @param req The request to check.
 *  @returns A Promise resolving to the parsed data or rejecting with an
 * Argument or Unauthenticated error.
 */
export async function parseUpdateProjectRequest(req: express.Request):
    Promise<Requests.ModProject> {
  const options = [ "name", "partner", "start", "end", "positions" ];

  return hasFields(req, [], types.id).then(() => {
    if (!atLeastOneField(req, options))
      return rejector();

    return Promise.resolve({
      sessionkey : req.body.sessionkey,
      id : req.params.id,
      name : maybe(req.body, "name"),
      partner : maybe(req.body, "partner"),
      start : maybe(req.body, "start"),
      end : maybe(req.body, "end"),
      positions : maybe(req.body, "positions")
    });
  });
}

/**
 *  Parses a request to `POST /project/<id>/draft`.
 *  @param req The request to check.
 *  @returns A Promise resolving to the parsed data or rejecting with an
 * Argument or Unauthenticated error.
 */
export async function parseDraftStudentRequest(req: express.Request):
    Promise<Requests.Draft> {
  return hasFields(req, [ "studentId", "roles" ], types.id)
      .then(() => Promise.resolve({
        sessionkey : req.body.sessionkey,
        id : req.params.id,
        studentId : req.body.studentId,
        roles : req.body.roles
      }));
}

/**
 *  Parses a request to `POST /followup/<id>`.
 *  @param req The request to check.
 *  @returns A Promise resolving to the parsed data or rejecting with an
 * Argument or Unauthenticated error.
 */
export async function parseSetFollowupStudentRequest(req: express.Request):
    Promise<Requests.Followup> {
  return hasFields(req, [ "type" ], types.id).then(() => {
    const type = req.body.type;
    if (type != "hold-tight" && type != "confirmed" && type != "cancelled")
      return rejector();

    return Promise.resolve(
        {sessionkey : req.body.sessionkey, id : req.params.id, type : type});
  });
}

/**
 *  Parses a request to `POST /followup/template/`.
 *  @param req The request to check.
 *  @returns A Promise resolving to the parsed data or rejecting with an
 * Argument or Unauthenticated error.
 */
export async function parseNewTemplateRequest(req: express.Request):
    Promise<Requests.Template> {
  return hasFields(req, [ "name", "content" ], types.key)
      .then(() => Promise.resolve({
        sessionkey : req.body.sessionkey,
        name : req.body.name,
        subject : maybe(req.body, "subject"),
        desc : maybe(req.body, "desc"),
        cc : maybe(req.body, "cc"),
        content : req.body.content
      }));
}

/**
 *  Parses a request to `POST /followup/template/<id>`.
 *  @param req The request to check.
 *  @returns A Promise resolving to the parsed data or rejecting with an
 * Argument or Unauthenticated error.
 */
export async function parseUpdateTemplateRequest(req: express.Request):
    Promise<Requests.ModTemplate> {
  return hasFields(req, [], types.id).then(() => {
    if (!atLeastOneField(req, [ "name", "desc", "subject", "cc", "content" ]))
      return rejector();

    return Promise.resolve({
      sessionkey : req.body.sessionkey,
      id : req.params.id,
      name : maybe(req.body, "name"),
      desc : maybe(req.body, "desc"),
      subject : maybe(req.body, "subject"),
      cc : maybe(req.body, "cc"),
      content : maybe(req.body, "content")
    });
  });
}

/**
 *  Parses a request to `POST /form`.
 *  @param req The request to check.
 *  @returns A Promise resolving to the parsed data or rejecting with an
 * Argument or Unauthenticated error.
 */
export async function parseFormRequest(req: express.Request):
    Promise<Requests.Form> {
  return hasFields(req, ["eventId", "eventType", "createdAt", "data"], types.neither).then(() => {
    return Promise.resolve({
      eventId : req.body.eventId,
      eventType : req.body.eventType,
      createdAt : req.body.createdAt,
      data : req.body.data
    });
  });
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
 *  A request to `GET /student/<id>/suggest` only requires a session key and an
 * ID
 * {@link parseKeyIdRequest}.
 */
export const parseStudentGetSuggestsRequest = parseKeyIdRequest;
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
 *  A request to `POST /coach/request/<id>` only requires a session key and an
 * ID {@link parseKeyIdRequest}.
 */
export const parseAcceptNewCoachRequest = parseKeyIdRequest;
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
