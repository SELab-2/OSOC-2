import {account_status_enum, email_status_enum} from "@prisma/client";
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
  /**
   *  Cooks up a No Data Error response.
   */
  cookNoDataError: () => ApiError;
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
 *  Either yes, maybe or no. This is the enumeration type for student suggests.
 */
export type Suggestion = "YES"|"MAYBE"|"NO";

export interface SuggestionInfo {}

/**
 *  Represents a response that only contains an ID.
 */
export interface IdOnly {
  /**
   *  The ID.
   */
  id: number;
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
 *  Represents a person, with all associated data.
 */
export interface Person {
  /**
   *  The person id.
   */
  person_id: number;
  /**
   *  The firstname of this person.
   */
  firstname: string;
  /**
   *  The lastname of this person.
   */
  lastname: string;
  /**
   *  The email of this person.
   */
  email?: string;
}

/**
 *  Represents a student, with all associated data. Does not correspond to a
 * student in the database.
 */
export interface Student {}

/**
 *  Represents a user, with all associated data.
 */
export interface User {}

/**
 *  Represents a check of the key, holds the key aswell as boolean value.
 */
export interface CheckKey {}

/**
 *  Represents a coach, with all associated data.
 */
export interface Coach {
  person_data: {id: number, name: string};
  coach: boolean;
  admin: boolean;
  activated: string;
}

/**
 *  Represents a coach request response. Usually these will only contain an id,
 * name and email.
 */
export interface CoachRequest {
  /**
   *  The id.
   */
  id: number;
  /**
   *  The name of the coach.
   */
  name: string;
  /**
   *  The email.
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
export interface Project {
  id: number;
  name: string;
  partner: string;
  start_date: string;
  end_date: string;
  positions: number;
}

/**
 *  Represents the drafted students of a project. Usually these will only
 * contain an id, name and list of students.
 */
export interface ProjectDraftedStudents {
  /**
   *  The id of the project.
   */
  id: number;
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
  role: string;
}

/**
 *  Represents a conflict. These contain the student and a list of projects they
 * are in.
 */
export interface Conflict {
  /**
   *  The student's ID.
   */
  student: number;
  /**
   *  The projects the student is in.
   */
  projects: {
    /**
     * The project's ID.
     */
    id: number;
    /**
     * The project's name.
     */
    name : string
  }[];
}

export interface ShortTemplate {
  id: number;
  owner: number;
  name: string;
}

export interface Template extends ShortTemplate {
  content: string;
}

export interface FollowupStatus {
  student: number;
  status: email_status_enum;
  application: number;
}
}

export interface WithUserID<T> {
  userId: number;
  data: T;
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
 *  A login response contains of a key and a boolean determining whether a user
 * is an admin.
 */
export interface Login extends Key {
  is_admin: boolean;
  is_coach: boolean;
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
 *  A user response is the keyed version of the user and their associated
 * data.
 */
export interface User extends Keyed<InternalTypes.User> {}

/**
 *  A studentList response is the keyed version of a list of students and their
 * associated data.
 */
export interface StudentList extends Keyed<InternalTypes.Student[]> {}

/**
 *
 */
export interface UserList extends Keyed<InternalTypes.User[]> {}

/**
 *
 */
export interface VerifyKey extends Keyed<InternalTypes.CheckKey> {}

/**
 *  A student list response is the keyed version of an array of partial
 * students.
 */
export interface IdNameList extends Keyed<InternalTypes.IdName[]> {}

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
 *  A coach list response is the keyed version of a list of coaches
 */
export interface CoachList extends Keyed<InternalTypes.Coach[]> {}

/**
 *  A person response is the keyed version of the person and their associated
 * data.
 */
export interface Person extends InternalTypes.Person {}

/**
 *  An admin response is the keyed version of the admin and their associated
 * data.
 */
export interface Admin extends Keyed<InternalTypes.Admin> {}

/**
 *  An adminList response is the keyed version of a list of admins and their
 * associated data.
 */
export interface AdminList extends Keyed<InternalTypes.Admin[]> {}

/**
 *  A project response is the keyed version of the project and their associated
 * data.
 */
export interface Project extends Keyed<InternalTypes.Project> {}

/**
 *  A project list response is the keyed version of a list of projects
 */
export interface ProjectList extends Keyed<InternalTypes.Project[]> {}

/**
 *  An admin list response is the keyed version of the list of admins.
 */
export interface AdminList extends Keyed<InternalTypes.Admin[]> {}

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
 *  A studentList response is the keyed version of a list of students and their
 * associated data.
 */
export interface StudentList extends Keyed<InternalTypes.Student[]> {}
/**
 *  A conflictList response is the keyed version of a list of conflicts.
 */
export interface ConflictList extends Keyed<InternalTypes.Conflict[]> {}

export interface TemplateList extends Keyed<InternalTypes.ShortTemplate[]> {}
export interface Template extends Keyed<InternalTypes.Template> {}
export interface SingleFollowup extends Keyed<InternalTypes.FollowupStatus> {}
export interface FollowupList extends Keyed<InternalTypes.FollowupStatus[]> {}

/**
 *  @deprecated Either an API Error or a data value. Is deprecated in favor of
 * rejecting with API error or resolving with data ({@link Promise}).
 */
export type OrError<T> = ApiError|T;

/**
 *  An API response is one of the previous response types.
 */
export type ApiResponse = Empty|Key|PartialStudent|IdNameList|ConflictList;

/**
 *  Either an error while parsing the form or a data value.
 */
export interface FormResponse<T> {
  /**
   *  The data.
   */
  data: T|null;
}
}

export namespace Requests {
export interface Login {
  name: string;
  pass: string;
}

/**
 *  To log in with GitHub, we require your GitHub login and username/alias.
 */
export interface GHLogin {
  login: string;
  name: string;
}

export interface KeyRequest {
  sessionkey: InternalTypes.SessionKey;
}

export interface IdRequest extends KeyRequest {
  id: number;
}

export interface YearId extends IdRequest {
  year?: number;
}

export interface AccountAcceptance extends IdRequest {
  is_admin: boolean;
  is_coach: boolean;
}

export interface StudentFilter extends KeyRequest {}

export interface UpdateStudent extends IdRequest {
  emailOrGithub?: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  pronouns?: string[];
  nickname?: string;
  alumni?: boolean;
  phone?: string;
  education?:
      {level?: string; duration?: number; year?: number; institute?: string;};
}

export interface Suggest extends IdRequest {
  suggestion: InternalTypes.Suggestion;
  // senderId: number;
  reason?: string;
}

export interface Confirm extends IdRequest {
  reply?: InternalTypes.Suggestion;
}

export interface UpdateLoginUser extends IdRequest {
  isAdmin: boolean;
  isCoach: boolean;
  pass?: string;
  accountStatus: account_status_enum;
}

export interface UserRequest {
  firstName: string;
  lastName: string;
  email: string;
  pass: string;
}

export interface Project extends KeyRequest {
  osocId: number;
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
  osocId?: number;
}

export interface Draft extends IdRequest {
  studentId: number;
  role: string;
}

export interface Followup extends IdRequest {
  type: FollowupType;
}

export interface Template extends KeyRequest {
  name: string;
  subject?: string;
  cc?: string;
  content: string;
}

export interface ModTemplate extends IdRequest {
  name?: string;
  desc?: string;
  subject?: string;
  cc?: string;
  content?: string;
}

export interface Form {
  eventId: string, eventType: string, createdAt: string, data: DataForm
}

export interface Role extends KeyRequest {
  name: string
}

export interface DataForm {
  fields: Array<Question>
}

export interface Question {
  key: string, value: string, options?: Array<Option>
}

export interface Option {
  id: string, text: string
}

export interface ReqReset {
  email: string;
}

export interface ResetCheckCode {
  code: string;
}

export interface ResetPassword {
  code: string;
  password: string;
}

export interface RmDraftStudent extends IdRequest {
  studentId: number;
}
}

/**
 *  The only verbs used are `GET` (`"get"`), `POST` (`"post"`) and `DELETE`
 * (`"delete"`).
 */
export type Verb = "get"|"post"|"delete";

export type FollowupType = email_status_enum;

export type Table = "project"|"student";

/**
 *  A route callback is a function taking an Express js request and returning a
 * promise (resolving to an API response).
 */
export type RouteCallback<T extends Responses.ApiResponse> =
    (req: express.Request) => Promise<T>;

/**
 *  Helper type for unsafe type checks.
 */
export interface Anything {
  [key: string]: unknown;
}

export interface StringDict<T2> {
  [key: string]: T2;
}

export interface Email {
  to: string;
  subject: string;
  html: string;
}
