import express from 'express';

export class ApiError {
  http: number;
  reason: string;

  constructor(http: number, reason: string) {
    this.http = http;
    this.reason = reason;
  }
}

export interface Errors {
  cookInvalidID: () => ApiError;
  cookArgumentError: () => ApiError;
  cookUnauthenticated: () => ApiError;
  cookInsufficientRights: () => ApiError;
  cookNonExistent: (url: string) => ApiError;
  cookInvalidVerb: (req: express.Request) => ApiError;
  cookNonJSON: (mime: string) => ApiError;
  cookServerError: () => ApiError;
}

export type SessionKey = string;
export interface Keyed {
  sessionkey: SessionKey;
}

export interface UnkeyedStudentResponse {
  id: string;
  name: string;
}

export interface PartialStudentResponse extends Keyed, UnkeyedStudentResponse {}

export interface StudentResponse extends Keyed {
  student: {
    id: string; name : string; email : string; labels : string[];
    sollicitation?: string;
    project?: {
      id : string; contract : {id : string; info : string;}; roles : string[];
    }
  }
}

export interface StudentList extends Keyed {
  students: UnkeyedStudentResponse[];
}

export interface EmptyResponse {}

export type orError<T> = ApiError|T;
export type BaseApiResponse = EmptyResponse|PartialStudentResponse|StudentList;

export type ApiResponse = ApiError|BaseApiResponse;
