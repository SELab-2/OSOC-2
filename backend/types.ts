import express from 'express';

/* eslint-disable no-unused-vars */

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

/*eslint-disable no-unused-vars*/

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
  cookNonExistent: (_: string) => ApiError;
  /**
   *  Cooks up an Invalid HTTP-verb response
   *  @param req The request with the invalid verb.
   */
  cookInvalidVerb: (_: express.Request) => ApiError;
  /**
   *  Cooks up an Invalid MIME Response Type Requested response.
   *  @param mime The requested invalid MIME type.
   */
  cookNonJSON: (_: string) => ApiError;
  /**
   *  Cooks up an Internal Server Error response.
   */
  cookServerError: () => ApiError;
}

/*eslint-enable no-unused-vars*/
// we disabled the unused vars - the interface defines the fields and their
// types, but we don't use parameters here. ESlint is just too dumb to see this.

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
 *  Either yes, maybe or no. This is the enumeration type for student suggests.
 */
export type Suggestion = "YES"|"MAYBE"|"NO";

/**
 *  Represents a partial type response. Usually these will only contain a
 * suggestion type, the name and id of the sender and the reason why this
 * suggestion exists.
 */
export interface SuggestionInfo {
  /**
   *  The suggestion.
   */
  suggestion: Suggestion;
  /**
   *  The sender of the suggestion.
   */
  sender: IdName;
  /**
   *  The reason why this suggestion exists.
   */
  reason: string;
}

/**
 *  Represents a partial type response. Usually these will only contain a
 * suggestion type and a number of occurrences.
 */
export interface SuggestionCount {
  /**
   *  The suggestion.
   */
  suggestion: Suggestion;
  /**
   *  The number of occurrences for this kind of suggestion.
   */
  occurrences: number;
}

/**
 *  Represents a response that only contains an ID.
 */
export interface IdOnly {
  /**
   *  The ID.
   */
  id: string;
}

/**
 *  Represents a partial type response. Usually these will only contain a name
 * and an ID.
 */
export interface IdName extends IdOnly {
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

/**
 *  Represents a coach, with all associated data.
 */
export interface Coach {}

/**
 *  Represents a coach request response. Usually these will only contain an id,
 * name and email.
 */
export interface CoachRequest {
  /**
   *  The id.
   */
  id: string;
  /**
   *  The name of the coach.
   */
  name: string;
  /**
   *  The id.
   */
  email: string;
}

/**
 *  Represents an admin, with all associated data.
 */
export interface Admin {}

/**
 *  Represents a project, with all associated data.
 */
export interface Project {}

/**
 *  Represents the drafted students of a project. Usually these will only
 * contain an id, name and list of students.
 */
export interface ProjectDraftedStudents {
  /**
   *  The id of the project.
   */
  id: string;
  /**
   *  The name of the project.
   */
  name: string;
  /**
   *  The students.
   */
  students: Student[];
}

/**
 *  Represents the drafted students of a project. Usually these will only
 * contain an id, name and list of students.
 */
export interface ModProjectStudent {
  /**
   *  Was the student drafted or not.
   */
  drafted: boolean;
  /**
   *  The roles of the student.
   */
  roles: string[];
}

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
export interface IdNameList extends Keyed<InternalTypes.IdName[]> {}

/**
 *  A student response is the keyed version of the student and their associated
 * data.
 */
export interface Suggestion extends Keyed<InternalTypes.SuggestionCount[]> {}

/**
 *  A student response is the keyed version of the student and their associated
 * data.
 */
export interface SuggestionInfo extends Keyed<InternalTypes.SuggestionInfo[]> {}

/**
 *  An empty response. Doesn't hold a session key (logout only).
 */
export interface Empty {}

/**
 *  A coach response is the keyed version of the coach and their associated
 * data.
 */
export interface Coach extends Keyed<InternalTypes.Coach> {}

/**
 *  An admin response is the keyed version of the admin and their associated
 * data.
 */
export interface Admin extends Keyed<InternalTypes.Admin> {}

/**
 *  A project response is the keyed version of the project and their associated
 * data.
 */
export interface Project extends Keyed<InternalTypes.Project> {}

/**
 *  A project drafted students response is the keyed version of the students and
 * the associated data of the project.
 */
export interface ProjectDraftedStudents extends
    Keyed<InternalTypes.ProjectDraftedStudents> {}

/**
 *  A project drafted students response is the keyed version of the students and
 * the associated data of the project.
 */
export interface ModProjectStudent extends
    Keyed<InternalTypes.ModProjectStudent> {}

/**
 *  @deprecated Either an API Error or a data value. Is deprecated in favor of
 * rejecting with API error or resolving with data ({@link Promise}).
 */
export type OrError<T> = ApiError|T;

/**
 *  An API response is one of the previous response types.
 */
export type ApiResponse = Empty|Key|PartialStudent|IdNameList;
}

export namespace Requests {
export interface Login {
  name: string;
  pass: string;
}

export interface KeyRequest {
  sessionkey: InternalTypes.SessionKey;
}

export interface IdRequest extends KeyRequest {
  id: string;
}

export interface NewStudent extends KeyRequest {
  emailOrGithub: string;
  firstName: string;
  lastName: string;
  gender: string;
  pronouns: string[];
  phone: string;
  education:
      {level: string; duration : number; year : number; institute : string;};
}

export interface UpdateStudent extends IdRequest {
  emailOrGithub?: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  pronouns?: string[];
  phone?: string;
  education?:
      {level?: string; duration?: number; year?: number; institute?: string;};
}

export interface Suggest extends IdRequest {
  suggestion: InternalTypes.Suggestion;
  reason?: string;
}

export interface Confirm extends IdRequest {
  reply?: InternalTypes.Suggestion;
}

export interface UpdateLoginUser extends IdRequest {
  emailOrGithub?: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  pass?: string;
}

export interface CoachRequest {
  firstName: string;
  lastName: string;
  emailOrGithub: string;
  gender: string;
  pass?: string;
}

export interface Project extends KeyRequest {
  name: string;
  partner: string;
  start: Date;
  end: Date;
  positions: number;
}

export interface ModProject extends IdRequest {
  name?: string;
  partner?: string;
  start?: Date;
  end?: Date;
  positions?: number;
}

export interface Draft extends IdRequest {
  studentId: string;
  roles: string[];
}

export interface Followup extends IdRequest {
  type: FollowupType;
}

export interface Template extends KeyRequest {
  name: string;
  desc?: string;
  subect?: string;
  cc?: string[];
  content: string;
}

export interface ModTemplate extends IdRequest {
  name?: string;
  desc?: string;
  subect?: string;
  cc?: string[];
  content?: string;
}

export interface Form {
  eventId : string,
  eventType : string,
  createdAt : string,
  data : DataForm
}

export interface DataForm {
  fields : Array<object>
}

export interface IdLiveInBelgium {
  id : string
}

/*export interface Question {
  value : string
  options : Array<IdLiveInBelgium>
}*/
}

/**
 *  The only verbs used are `GET` (`"get"`), `POST` (`"post"`) and `DELETE`
 * (`"delete"`).
 */
export type Verb = "get"|"post"|"delete";

export type FollowupType = "hold-tight"|"confirmed"|"cancelled";

export type Table = "applied_role"|"attachment"|"contract"|"evaluation"|
    "job_application"|"job_application_skill"|"language"|"login_user"|"osoc"|
    "person"|"project_role"|"project_user"|"role"|"student";

/*eslint-disable no-unused-vars*/

/**
 *  A route callback is a function taking an Express js request and returning a
 * promise (resolving to an API response).
 */
export type RouteCallback<T extends Responses.ApiResponse> =
    (req: express.Request) => Promise<T>;

/*eslint-enable no-unused-vars*/
// again, we introduce a type alias, but ESLint is just too stupid.
