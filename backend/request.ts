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
  if (!hasFields(req, bodyF, types.id) ||
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
    sessionkey : req.params.sessionkey
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

export const parseLogoutRequest = parseKeyRequest;
export const parseStudentAllRequest = parseKeyRequest;

export const parseSingleStudentRequest = parseKeyIdRequest;
