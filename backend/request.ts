import express from 'express';

import {Requests} from './types';
import {errors} from './utility';

type RequestType = "Neither"|"Key"|"Id";

interface RequestTypes {
  neither: RequestType;
  key: RequestType;
  id: RequestType;
}

const types: RequestTypes = {
  neither : "Neither",
  key : "Key",
  id : "Id"
};

function rejector<T>(): Promise<T> {
  return Promise.reject(errors.cookArgumentError());
}

function anyHasFields(obj: any, fields: string[]): boolean {
  return fields.every(s => (s in obj));
}

function hasFields(req: express.Request, fields: string[],
                   reqType: RequestType): boolean {
  if ((reqType == types.key || reqType == types.id) &&
      !("sessionkey" in req.body))
    return false;
  if (reqType == types.id && !("id" in req.params))
    return false;
  return anyHasFields(req.body, fields);
}

function atLeastOneField(req: express.Request, fields: string[]): boolean {
  return fields.some(s => (s in req.body));
}

function maybe<T>(obj: any, key: string): T {
  return (key in obj) ? obj[key] : undefined;
}

function parseKeyRequest(req: express.Request): Promise<Requests.KeyRequest> {
  if (!hasFields(req, [], types.key))
    return rejector();

  return Promise.resolve({sessionkey : req.body.sessionkey});
}

function parseKeyIdRequest(req: express.Request): Promise<Requests.IdRequest> {
  if (!hasFields(req, [], types.id))
    return rejector();
  return Promise.resolve(
      {sessionkey : req.body.sessionkey, id : req.params.id});
}

function parseUpdateLUser(req: express.Request):
    Promise<Requests.UpdateLoginUser> {
  if (!hasFields(req, [], types.id))
    return rejector();

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
}

export function parseLoginRequest(req: express.Request):
    Promise<Requests.Login> {
  if (!hasFields(req, [ "name", "pass" ], types.neither))
    return rejector();
  return Promise.resolve({name : req.body.name, pass : req.body.pass});
}

export function parseNewStudentRequest(req: express.Request):
    Promise<Requests.NewStudent> {
  const bodyF = [
    "emailOrGithub", "firstName", "lastName", "gender", "pronouns", "phone",
    "education"
  ];
  const edF = [ "level", "duration", "year", "institute" ];
  if (!hasFields(req, bodyF, types.key) ||
      !anyHasFields(req.body.education, edF))
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
}

export function parseUpdateStudentRequest(req: express.Request):
    Promise<Requests.UpdateStudent> {
  const bodyF = [
    "emailOrGithub", "firstName", "lastName", "gender", "pronouns", "phone",
    "education"
  ];

  if (!hasFields(req, [], types.id) || !atLeastOneField(req, bodyF))
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
}

export function parseSuggestStudentRequest(req: express.Request):
    Promise<Requests.Suggest> {
  if (!hasFields(req, [ "suggestion" ], types.id))
    return rejector();

  const sug: any = req.body.suggestion;
  if (sug != "YES" && sug != "MAYBE" && sug != "NO")
    return rejector();

  return Promise.resolve({
    sessionkey : req.body.sessionkey,
    id : req.params.id,
    suggestion : sug,
    reason : maybe(req.body, "reason")
  });
}

export function parseFinalizeDecisionRequest(req: express.Request):
    Promise<Requests.Confirm> {
  if (!hasFields(req, [], types.id))
    return rejector();

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
}

export function parseRequestCoachRequest(req: express.Request):
    Promise<Requests.CoachRequest> {
  if (!hasFields(req, [ "firstName", "lastName", "emailOrGithub", "gender" ],
                 types.neither))
    return rejector();

  return Promise.resolve({
    firstName : req.body.firstName,
    lastName : req.body.lastName,
    emailOrGithub : req.body.emailOrGithub,
    gender : req.body.gender,
    pass : maybe(req.body, "pass")
  });
}

export function parseNewProjectRequest(req: express.Request):
    Promise<Requests.Project> {
  if (!hasFields(req, [ "name", "partner", "start", "end", "positions" ],
                 types.key))
    return rejector();

  return Promise.resolve({
    sessionkey : req.body.sessionkey,
    name : req.body.name,
    partner : req.body.partner,
    start : req.body.start,
    end : req.body.end,
    positions : req.body.positions
  });
}

export function parseUpdateProjectRequest(req: express.Request):
    Promise<Requests.ModProject> {
  const options = [ "name", "partner", "start", "end", "positions" ];

  if (!hasFields(req, [], types.id) || !atLeastOneField(req, options))
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
}

export function parseDraftStudentRequest(req: express.Request):
    Promise<Requests.Draft> {
  if (!hasFields(req, [ "studentId", "roles" ], types.id))
    return rejector();

  return Promise.resolve({
    sessionkey : req.body.sessionkey,
    id : req.params.id,
    studentId : req.body.studentId,
    roles : req.body.roles
  });
}

export function parseSetFollowupStudentRequest(req: express.Request):
    Promise<Requests.Followup> {
  if (!hasFields(req, [ "type" ], types.id))
    return rejector();
  const type = req.body.type;
  if (type != "hold-tight" && type != "confirmed" && type != "cancelled")
    return rejector();

  return Promise.resolve(
      {sessionkey : req.body.sessionkey, id : req.params.id, type : type});
}

export function parseNewTemplateRequest(req: express.Request):
    Promise<Requests.Template> {
  if (!hasFields(req, [ "name", "content" ], types.key))
    return rejector();

  return Promise.resolve({
    sessionkey : req.body.sessionkey,
    name : maybe(req.body, "name"),
    desc : maybe(req.body, "desc"),
    cc : maybe(req.body, "cc"),
    content : req.body.content
  });
}

export function parseUpdateTemplateRequest(req: express.Request):
    Promise<Requests.ModTemplate> {
  if (!hasFields(req, [], types.id) ||
      !atLeastOneField(req, [ "name", "desc", "subject", "cc", "content" ]))
    return rejector();

  return Promise.resolve({
    sessionkey : req.body.sessionkey,
    id : req.params.id,
    name : maybe(req.body, "name"),
    desc : maybe(req.body, "desc"),
    subject : maybe(req.body, "subject"),
    cc : maybe(req.body, "cc"),
    content : maybe(req.body, "content")
  })
}

export const parseLogoutRequest = parseKeyRequest;
export const parseStudentAllRequest = parseKeyRequest;
export const parseCoachAllRequest = parseKeyRequest;
export const parseGetAllCoachRequestsRequest = parseKeyRequest;
export const parseAdminAllRequest = parseKeyRequest;
export const parseProjectAllRequest = parseKeyRequest;
export const parseConflictAllRequest = parseKeyRequest;
export const parseFollowupAllRequest = parseKeyRequest;
export const parseTemplateListRequest = parseKeyRequest;

export const parseSingleStudentRequest = parseKeyIdRequest;
export const parseDeleteStudentRequest = parseKeyIdRequest;
export const parseStudentGetSuggestsRequest = parseKeyIdRequest;
export const parseSingleCoachRequest = parseKeyIdRequest;
export const parseDeleteCoachRequest = parseKeyIdRequest;
export const parseGetCoachRequestRequest = parseKeyIdRequest;
export const parseAcceptNewCoachRequest = parseKeyIdRequest;
export const parseDenyNewCoachRequest = parseKeyIdRequest;
export const parseSingleAdminRequest = parseKeyIdRequest;
export const parseDeleteAdminRequest = parseKeyIdRequest;
export const parseSingleProjectRequest = parseKeyIdRequest;
export const parseDeleteProjectRequest = parseKeyIdRequest;
export const parseGetDraftedStudentsRequest = parseKeyIdRequest;
export const parseGetFollowupStudentRequest = parseKeyIdRequest;
export const parseGetTemplateRequest = parseKeyIdRequest;
export const parseDeleteTemplateRequest = parseKeyIdRequest;

export const parseUpdateCoachRequest = parseUpdateLUser;
export const parseUpdateAdminRequest = parseUpdateLUser;
