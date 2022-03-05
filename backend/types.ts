import express from 'express';

/**
 *  Interface for API errors. Specifies an HTTP status code and error reason.
 */
export interface ApiError {
  /**
   *  The HTTP status code.
   */
  http: number;
  /**
   *  The error reason.
   */
  reason: string;
}

/**
 *  Interface for error cooking functions. Each function corresponds to an
 * endpoint-independent error response. This is instantiated in the utility.ts
 * file.
 */
export interface Errors {
  /**
   *  Cooks up an Invalid ID response.
   */
  cookInvalidID: () => ApiError;
  /**
   *  Cooks up an Argument Error response.
   */
  cookArgumentError: () => ApiError;
  /**
   *  Cooks up an Unauthenticated Request response.
   */
  cookUnauthenticated: () => ApiError;
  /**
   *  Cooks up an Insufficient Rights response.
   */
  cookInsufficientRights: () => ApiError;
  /**
   *  Cooks up a Non-existent Endpoint response.
   *  @param url The requested endpoint URL.
   */
  cookNonExistent: (url: string) => ApiError;
  /**
   *  Cooks up an Invalid HTTP-verb response
   *  @param req The request with the invalid verb.
   */
  cookInvalidVerb: (req: express.Request) => ApiError;
  /**
   *  Cooks up an Invalid MIME Response Type Requested response.
   *  @param mime The requested invalid MIME type.
   */
  cookNonJSON: (mime: string) => ApiError;
  /**
   *  Cooks up an Internal Server Error response.
   */
  cookServerError: () => ApiError;
}

/**
 *  Namespace for internal response types. For actual response types, see
 * {@link Responses}.
 */
export namespace InternalTypes {
/**
 *  A session key is a string.
 */
export type SessionKey = string;

/**
 *  Represents a partial type response. Usually these will only contain a name
 * and an ID.
 */
export interface IdName {
  /**
   *  The ID.
   */
  id: string;
  /**
   *  The name.
   */
  name: string;
}

/**
 *  Represents a student, with all associated data. Does not correspond to a
 * student in the database.
 */
export interface Student {}
}

/**
 *  Namespace for response types. Most of the data types come from the namespace
 * {@link InternalTypes}. The success boolean is added when sending.
 */
export namespace Responses {
/**
 *  A keyed type is a type holding a session key and a data field holding the
 * template type.
 *
 * @template T The type to key.
 */
export interface Keyed<T> {
  /**
   *  The session key.
   */
  sessionkey: InternalTypes.SessionKey;
  /**
   *  The actual data.
   */
  data: T;
}

/**
 *  A response consisting of only a session key.
 */
export interface Key {
  sessionkey: InternalTypes.SessionKey;
}

/**
 *  A partial student response is the keyed combination of their id and name.
 */
export interface PartialStudent extends Keyed<InternalTypes.IdName> {}

/**
 *  A student response is the keyed version of the student and their associated
 * data.
 */
export interface Student extends Keyed<InternalTypes.Student> {}

/**
 *  A student list response is the keyed version of an array of partial
 * students.
 */
export interface StudentList extends Keyed<InternalTypes.IdName[]> {}

/**
 *  An empty response. Doesn't hold a session key (logout only).
 */
export interface Empty {}

/**
 *  @deprecated Either an API Error or a data value. Is deprecated in favor of
 * rejecting with API error or resolving with data ({@link Promise}).
 */
export type OrError<T> = ApiError|T;

/**
 *  An API response is one of the previous response types.
 */
export type ApiResponse = Empty|Key|PartialStudent|StudentList;
}
