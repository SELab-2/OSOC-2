import express from 'express';

export interface ApiError {
  http: number;
  reason: string;
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

export namespace InternalTypes {
export type SessionKey = string;

export interface IdName {
  id: string;
  name: string;
}

export interface Student {}
}

export namespace Responses {
export interface Keyed<T> {
  sessionkey: InternalTypes.SessionKey;
  data: T;
}

export interface Key {
  sessionkey: InternalTypes.SessionKey;
}

export interface PartialStudent extends Keyed<InternalTypes.IdName> {}

export interface Student extends Keyed<InternalTypes.Student> {}

export interface StudentList extends Keyed<InternalTypes.IdName[]> {}

export interface Empty {}

export type OrError<T> = ApiError|T;
export type BaseApiResponse = Empty|Key|PartialStudent|StudentList;

export type ApiResponse = ApiError|BaseApiResponse;
}
