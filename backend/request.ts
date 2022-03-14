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
                   reqType: RequestType): Promise<void> {
  if ((reqType == types.key || reqType == types.id) &&
      (!("sessionkey" in req.body) || req.body.sessionkey == undefined))
    return Promise.reject(errors.cookUnauthenticated());
  if (reqType == types.id && !("id" in req.params))
    return rejector();
  return anyHasFields(req.body, fields) ? Promise.resolve() : rejector();
}

function atLeastOneField(req: express.Request, fields: string[]): boolean {
  return fields.some(s => (s in req.body));
}

function maybe<T>(obj: any, key: string): T {
  return (key in obj) ? obj[key] : undefined;
}

async function parseKeyRequest(req: express.Request):
    Promise<Requests.KeyRequest> {
  return hasFields(req, [], types.key).then(() => Promise.resolve({
    sessionkey : req.body.sessionkey
  }));
}

async function parseKeyIdRequest(req: express.Request):
    Promise<Requests.IdRequest> {
  return hasFields(req, [], types.id).then(() => Promise.resolve({
    sessionkey : req.body.sessionkey,
    id : req.params.id
  }));
}

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

export async function parseLoginRequest(req: express.Request):
    Promise<Requests.Login> {
  return hasFields(req, [ "name", "pass" ], types.neither)
      .then(() =>
                Promise.resolve({name : req.body.name, pass : req.body.pass}));
}

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

export async function parseRequestCoachRequest(req: express.Request):
    Promise<Requests.CoachRequest> {
  return hasFields(req, [ "firstName", "lastName", "emailOrGithub", "gender" ],
                   types.neither)
      .then(() => Promise.resolve({
        firstName : req.body.firstName,
        lastName : req.body.lastName,
        emailOrGithub : req.body.emailOrGithub,
        gender : req.body.gender,
        pass : maybe(req.body, "pass")
      }));
}

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

export const parseUpdateCoachRequest = parseUpdateLoginUser;
export const parseUpdateAdminRequest = parseUpdateLoginUser;
