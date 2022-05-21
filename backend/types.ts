import {
    account_status_enum,
    contract_status_enum,
    decision_enum,
    email_status_enum,
    type_enum,
    person,
    project_user,
} from "@prisma/client";
import express from "express";
import { FilterSort } from "./orm_functions/orm_types";

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
     * Cooks up a locked request response.
     */
    cookLockedRequest: () => ApiError;
    /**
     * Cooks up a wrong suggestion request response.
     */
    cookWrongSuggestionYear: () => ApiError;
    /**
     * Cooks up a wrong osoc request response.
     */
    cookWrongOsocYear: () => ApiError;
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
    /**
     *  Cooks up a Pending Account Error response.
     */
    cookPendingAccount: () => ApiError;
}

/**
 *  Namespace for internal response types. For actual response types, see
 * {@link Responses}.
 */
export namespace InternalTypes {
    import FormAttachmentResponse = Responses.FormAttachmentResponse;
    /**
     *  A session key is a string.
     */
    export type SessionKey = string;

    /**
     *  Either yes, maybe or no. This is the enumeration type for student suggests.
     */
    export type Suggestion = "YES" | "MAYBE" | "NO";

    export interface SuggestionInfo {
        /**
         *  The evaluation id.
         */
        evaluation_id: number;
        /**
         *  The name of the login user.
         */
        senderName: string | undefined;
        /**
         *  The reason why the decision was made.
         */
        reason: string | null;
        /**
         *  The ID.
         */
        decision: decision_enum;
        /**
         *  The ID.
         */
        isFinal: boolean;
    }

    /**
     *  Represents a response that only contains an ID.
     */
    export interface IdOnly {
        /**
         *  The ID.
         */
        id: number;
    }

    export interface Role {
        role_id: number;
        name: string;
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
         *  The name of this person.
         */
        name: string;
        /**
         *  The email of this person.
         */
        email?: string;
    }

    /**
     *  Represents a form-person, with all associated data.
     */
    export interface FormPerson {
        /**
         *  The name of this person.
         */
        name: string;
        /**
         *  The email of this person.
         */
        email: string;
    }

    /**
     *  Represents a student, with all associated data. Does not correspond to a
     * student in the database.
     */
    export interface Student {
        student: StudentField | null;
        jobApplication: StudentJobApplication | undefined;
        evaluation: StudentEvaluation | undefined;
        evaluations: StudentsAllEvaluations[] | undefined;
        roles: string[] | undefined;
    }

    /**
     *  The person entity for a student
     */
    interface StudentPerson {
        /**
         *  The name of this student.
         */
        name: string;
        /**
         *  The person id of this student.
         */
        person_id: number;
        /**
         *  The email of this student.
         */
        email: string | null;
        /**
         *  The GitHub of this student.
         */
        github: string | null;
        /**
         *  The GitHub id of this student.
         */
        github_id: string | null;
    }

    /**
     *  The student entity for a student
     */
    interface StudentField {
        /**
         *  The student id of this student.
         */
        student_id: number;
        /**
         *  The person id of this student.
         */
        person_id: number | undefined;
        /**
         *  The person fields.
         */
        person: StudentPerson;
        /**
         *  The alumni status of this student.
         */
        alumni: boolean;
        /**
         *  The nickname of this student.
         */
        nickname: string | null;
        /**
         *  The gender of this student.
         */
        gender: string;
        /**
         *  The pronouns of this student.
         */
        pronouns: string | null;
        /**
         *  The phone number of this student.
         */
        phone_number: string;
    }

    /**
     *  A student job application.
     */
    interface StudentJobApplication {
        /**
         *  The job application id
         */
        job_application_id: number;
        /**
         *  The id of this student
         */
        student_id: number | null;
        /**
         *  The id of the osoc edition
         */
        osoc_id: number;
        /**
         *  The responsibilities
         */
        responsibilities: string | null;
        /**
         *  The date
         */
        created_at: Date;
        /**
         *  The duration
         */
        edu_duration: number | null;
        /**
         *  The institute of the student
         */
        edu_institute: string | null;
        /**
         *  The level of the education of this student
         */
        edu_level: string;
        /**
         *  The education year
         */
        edu_year: string | null;
        /**
         *  The educations of the student
         */
        edus: string[];
        /**
         *  The email status of the student
         */
        email_status: email_status_enum;
        /**
         *  The fun fact
         */
        fun_fact: string;
        /**
         *  True if this student wants to be a student-coach, else false
         */
        student_coach: boolean;
        /**
         *  The volunteer info
         */
        student_volunteer_info: string;
        /**
         *  The job application skills
         */
        job_application_skill: StudentJobApplicationSkill[];
        /**
         *  The job application applied roles
         */
        applied_role: StudentAppliedRole[];
        /**
         *  The job application attachments
         */
        attachment: StudentAttachment[];
    }

    /**
     *  The job application skill.
     */
    interface StudentJobApplicationSkill {
        /**
         *  The skill
         */
        skill: string | null;
        /**
         *  The id of the job application
         */
        job_application_id: number;
        /**
         *  The id of the skill
         */
        job_application_skill_id: number;
        /**
         *  The id of the language
         */
        language_id: number | null;
        /**
         *  True if this skill is the best skill, else false
         */
        is_best: boolean;
        /**
         *  True if this skill is the preferred skill, else false
         */
        is_preferred: boolean;
        /**
         *  The level of the skill
         */
        level: number | null;
    }

    /**
     *  An applied role.
     */
    interface StudentAppliedRole {
        /**
         *  The id of the job application
         */
        job_application_id: number;
        /**
         *  The id of the role
         */
        role_id: number;
        /**
         *  The id of the applied role
         */
        applied_role_id: number;
    }

    /**
     *  A job application attachment.
     */
    interface StudentAttachment {
        /**
         *  The id of the job application
         */
        job_application_id: number;
        /**
         *  The id of the attachment
         */
        attachment_id: number;
        /**
         *  The data of the attachment
         */
        data: string[];
        /**
         *  The data types
         */
        type: type_enum[];
    }

    /**
     *  The evaluation
     */
    interface StudentEvaluation {
        /**
         *  The id of the evaluation
         */
        evaluations: StudentEvaluationsField[];
        osoc: StudentOsocYear;
    }

    /**
     *  The osoc year.
     */
    interface StudentOsocYear {
        /**
         *  The osoc year
         */
        year: number;
    }

    /**
     *  The evaluation field for /student/all.
     */
    interface StudentsAllEvaluations {
        /**
         *  The evaluation
         */
        evaluation: StudentsAllEvaluationField[];
        /**
         *  The osoc year
         */
        osoc: StudentOsocYear;
    }

    /**
     *  The evaluation field for /student/all.
     */
    interface StudentsAllEvaluationField extends StudentEvaluationsField {
        /**
         *  The id of the evaluation
         */
        login_user: StudentEvaluationsLoginUser | null;
    }

    /**
     *  The login user that belongs to an evaluation.
     */
    interface StudentEvaluationsLoginUser {
        /**
         *  The id of the login_user
         */
        login_user_id: number;
        /**
         *  The person
         */
        person: StudentEvaluationsLoginUserPerson;
    }

    /**
     *  The login user (person) that belongs to an evaluation.
     */
    interface StudentEvaluationsLoginUserPerson {
        /**
         *  The name of the login user
         */
        name: string;
        /**
         *  The person id
         */
        person_id: number;
        /**
         *  The email of this login user
         */
        email: string | null;
        /**
         *  The GitHub of this login user
         */
        github: string | null;
    }

    /**
     *  All student evaluations
     */
    export interface AllStudentsEvaluations {
        /**
         *  The evaluations
         */
        evaluation: AllStudentsEvaluationsField;
    }

    /**
     *  All student evaluations field
     */
    interface AllStudentsEvaluationsField {
        /**
         *  The evaluations
         */
        evaluations: StudentsAllEvaluationField[];
        /**
         *  The osoc year
         */
        osoc: StudentOsocYear;
    }

    /**
     *  The evaluations field.
     */
    interface StudentEvaluationsField {
        /**
         *  The id of the evaluation
         */
        evaluation_id: number;
        /**
         *  The decision
         */
        decision: decision_enum;
        /**
         *  The reason of the decision
         */
        motivation: string | null;
        /**
         *  True if the decision is final, else false
         */
        is_final: boolean;
    }

    /**
     *  Represents a form-student, with all associated data.
     */
    export interface FormStudent {
        /**
         *  The pronouns of this person.
         */
        pronouns: string | null;
        /**
         *  The gender of this person.
         */
        gender: string;
        /**
         *  The email of this person.
         */
        phoneNumber: string;
        /**
         *  The email of this person.
         */
        nickname: string | null;
        /**
         *  The email of this person.
         */
        alumni: boolean;
    }

    /**
     *  Represents a form-jobApplication, with all associated data.
     */
    export interface FormJobApplication {
        /**
         *  The responsibilities of this person.
         */
        responsibilities: string | null;
        /**
         *  The fun fact of this person.
         */
        funFact: string;
        /**
         *  The volunteer info of this person.
         */
        volunteerInfo: string;
        /**
         *  The check if this person wants to be a studentCoach
         */
        studentCoach: boolean | null;
        /**
         *  The email of this person.
         */
        osocId: number;
        /**
         *  The email of this person.
         */
        educations: string[];
        /**
         *  The email of this person.
         */
        educationLevel: string;
        /**
         *  The email of this person.
         */
        educationDuration: number | null;
        /**
         *  The email of this person.
         */
        educationYear: string | null;
        /**
         *  The email of this person.
         */
        educationInstitute: string | null;
        /**
         *  The email of this person.
         */
        emailStatus: email_status_enum;
        /**
         *  The email of this person.
         */
        createdAt: string;
    }

    /**
     *  Represents a form-attachment, with all associated data.
     */
    export interface FormAttachment {
        /**
         *  The responsibilities of this person.
         */
        cv_links: FormAttachmentResponse;
        /**
         *  The fun fact of this person.
         */
        portfolio_links: FormAttachmentResponse;
        /**
         *  The volunteer info of this person.
         */
        motivations: FormAttachmentResponse;
    }

    /**
     *  Represents a form-jobApplicationSkill, with all associated data.
     */
    export interface FormJobApplicationSkill {
        /**
         *  The responsibilities of this person.
         */
        most_fluent_language: string;
        /**
         *  The fun fact of this person.
         */
        english_level: number;
        /**
         *  The volunteer info of this person.
         */
        best_skill: string;
    }

    /**
     *  Represents form-roles, with all associated data.
     */
    export interface FormRoles {
        /**
         *  The roles of this person.
         */
        roles: string[];
    }

    /**
     *  Represents a user, with all associated data.
     */
    export interface User {
        person: {
            person_id: number;
            email: string;
            name: string;
            github: string;
        };
        login_user_id: number;
        is_coach: boolean;
        is_admin: boolean;
        account_status: AccountStatus;
    }

    /**
     *  Represents an osoc edition, with all associated data.
     */
    export interface OsocEdition {}

    /**
     *  Represents a check of the key, holds the key aswell as boolean value.
     */
    export interface CheckKey {}

    /**
     *  Represents a coach, with all associated data.
     */
    export interface Coach {
        person_data: { id: number; name: string };
        coach: boolean;
        admin: boolean;
        activated: string;
        login_user_id: number;
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
        roles: { name: string; positions: number }[];
        description: string | null;
        coaches: {
            login_user: {
                person: person;
                login_user_id: number;
                is_admin: boolean;
                is_coach: boolean;
            };
            project_user_id: number;
        }[];
    }

    /**
     *  Represents a project, with all associated data.
     */
    export interface ProjectAndContracts {
        id: number;
        name: string;
        partner: string;
        start_date: string;
        end_date: string;
        roles: object;
        contracts: Contract[];
        coaches: object;
    }

    /**
     *  Represents a contract, with all associated data.
     */
    export interface Contract {
        project_role: {
            project_role_id: number;
            project_id: number;
            role_id: number;
            positions: number;
            role: { name: string };
        };
        contract_id: number;
        contract_status: contract_status_enum;
        login_user: {
            person: person;
            login_user_id: number;
            is_admin: boolean;
            is_coach: boolean;
        } | null;
        student: Student;
    }

    /**
     *  Represents a person, with all associated data.
     */
    export interface StudentRole {
        /**
         *  The role id.
         */
        role_id: number;
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
        students: ProjectStudent[];
    }

    /**
     *  Represents a student of a project.
     */
    interface ProjectStudent {
        /**
         *  The contract status
         */
        status: contract_status_enum;
        /**
         *  The student info
         */
        student: ProjectStudentField | null;
    }

    /**
     *  The student entity field for a project
     */
    interface ProjectStudentField {
        /**
         *  The student id of this student.
         */
        student_id: number;
        /**
         *  The person fields.
         */
        person: StudentPerson;
        /**
         *  The alumni status of this student.
         */
        alumni: boolean;
        /**
         *  The nickname of this student.
         */
        nickname: string | null;
        /**
         *  The gender of this student.
         */
        gender: string;
        /**
         *  The pronouns of this student.
         */
        pronouns: string | null;
        /**
         *  The phone number of this student.
         */
        phone_number: string;
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
            name: string;
        }[];
    }

    export interface ShortTemplate {
        id: number;
        owner: number | null;
        name: string;
    }

    export interface Template extends ShortTemplate {
        content: string;
    }

    export interface FollowupStatus {
        student: number | null;
        status: email_status_enum;
        application: number;
    }
}

export interface WithUserID<T> {
    userId: number;
    data: T;
    accountStatus: account_status_enum;
    is_admin: boolean;
    is_coach: boolean;
}

/**
 *  Namespace for response types. Most of the data types come from the namespace
 * {@link InternalTypes}. The success boolean is added when sending.
 */
export namespace Responses {
    /**
     *  A paginable response holds, besides a data array, also the current page
     * number and the total number of objects in the database
     */
    export interface Paginable<T> {
        pagination: { page: number; count: number };
        data: T[];
    }

    /**
     *  A response consisting of only a session key.
     */
    export interface Key {
        sessionkey: InternalTypes.SessionKey;
    }

    /**
     *  A response consisting of only an id.
     */
    export interface Id {
        id: number;
    }

    /**
     *  A response consisting of and id and boolean.
     */
    export interface Id_alumni extends Id {
        hasAlreadyTakenPart: boolean;
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
     *  A GitHub login response differs from a normal login response by the added
     * is_signup field, which should tell the client that this user was newly created.
     */
    export interface GithubLogin extends Login {
        is_signup: boolean;
    }

    /**
     *  A partial student response is the keyed combination of their id and name.
     */
    export interface PartialStudent extends InternalTypes.IdName {}

    /**
     *  A partial user response is the combination of their id and name.
     */
    export interface PartialUser extends InternalTypes.IdName {}

    /**
     *  A partial user response is the combination of their id and name.
     */
    export interface PartialCoach extends PartialUser {}

    /**
     *  A student response is the keyed version of the student and their associated
     * data.
     */
    export interface Student extends InternalTypes.Student {}

    /**
     *  Represents a contract, with all associated data.
     */
    export interface Contract extends InternalTypes.Contract {}

    /**
     *  A form-student.
     */
    export interface FormStudent extends InternalTypes.FormStudent {}

    /**
     *  A form-jobApplication.
     */
    export interface FormJobApplication
        extends InternalTypes.FormJobApplication {}

    /**
     *  A form-attachment.
     */
    export interface FormAttachment extends InternalTypes.FormAttachment {}

    /**
     *  A user response is the keyed version of the user and their associated
     * data.
     */
    export interface User extends InternalTypes.User {}

    export interface AllStudentEvaluationsResponse
        extends InternalTypes.AllStudentsEvaluations {}

    /**
     *  A studentList response is the keyed version of a list of students and their
     * associated data.
     */
    export interface StudentList extends Paginable<InternalTypes.Student> {}

    /**
     *  StudentRoles are a list of roles.
     */
    export interface StudentRoles {
        data: InternalTypes.StudentRole[];
    }

    /**
     *
     */
    export interface UserList extends Paginable<InternalTypes.User> {}

    export interface RoleList {
        data: InternalTypes.Role[];
    }

    export interface ProjectUser extends project_user {}

    /**
     *
     */
    export interface OsocEditionList {
        data: OsocEdition[];
    }

    /**
     *  A osoc edition response is the keyed version of the osoc edition and their associated
     * data.
     */
    export interface OsocEdition extends InternalTypes.OsocEdition {}

    /**
     *
     */
    export interface FormAttachmentResponse {
        data: string[];
        types: type_enum[];
    }

    /**
     *
     */
    export interface VerifyKey extends InternalTypes.CheckKey {}

    /**
     *  A student list response is the keyed version of an array of partial
     * students.
     */
    export interface IdNameList {
        data: InternalTypes.IdName[];
    }

    /**
     *  The suggestion info
     * data.
     */
    export interface SuggestionInfo {
        data: InternalTypes.SuggestionInfo;
    }

    /**
     *  An empty response. Doesn't hold a session key.
     */
    export interface Empty {}

    /**
     *  A coach response is the keyed version of the coach and their associated
     * data.
     */
    export interface Coach extends InternalTypes.Coach {}

    /**
     *  A coach list response is the keyed version of a list of coaches
     */
    export interface CoachList {
        data: InternalTypes.Coach[];
    }

    /**
     *  A person response is the keyed version of the person and their associated
     * data.
     */
    export interface Person extends InternalTypes.Person {}

    /**
     *  A form-person.
     */
    export interface FormPerson extends InternalTypes.FormPerson {}

    /**
     *  A form-jobApplicationSkill.
     */
    export interface FormJobApplicationSkill
        extends InternalTypes.FormJobApplicationSkill {}

    /**
     *  form roles.
     */
    export interface FormRoles extends InternalTypes.FormRoles {}

    /**
     *  An admin response is the keyed version of the admin and their associated
     * data.
     */
    export interface Admin extends InternalTypes.Admin {}

    /**
     *  An adminList response is the keyed version of a list of admins and their
     * associated data.
     */
    export interface AdminList {
        data: InternalTypes.Admin[];
    }

    /**
     *  A project response is the keyed version of the project and their associated
     * data.
     */
    export interface Project extends InternalTypes.Project {}

    /**
     *  A user permission response
     * data.
     */
    export interface UserYearsPermissions {
        osoc_id: number;
        year: number;
    }

    /**
     *  A project list response with contracts in it
     */
    export interface ProjectAndContracts
        extends InternalTypes.ProjectAndContracts {}

    /**
     *  A project list response is the keyed version of a list of projects
     */
    export interface ProjectListAndContracts {
        data: InternalTypes.ProjectAndContracts[];
    }
    export interface ProjectList extends Paginable<InternalTypes.Project> {}

    /**
     *  An admin list response is the keyed version of the list of admins.
     */
    export interface AdminList {
        data: InternalTypes.Admin[];
    }

    /**
     *  A project drafted students response is the keyed version of the students and
     * the associated data of the project.
     */
    export interface ProjectDraftedStudents
        extends InternalTypes.ProjectDraftedStudents {}

    /**
     *  A project drafted students response is the keyed version of the students and
     * the associated data of the project.
     */
    export interface ModProjectStudent
        extends InternalTypes.ModProjectStudent {}

    /**
     *  A studentList response is the keyed version of a list of students and their
     * associated data.
     */
    export interface StudentList {
        data: InternalTypes.Student[];
    }

    /**
     *  A conflictList response is the keyed version of a list of conflicts.
     */
    export interface ConflictList {
        data: InternalTypes.Conflict[];
    }

    export interface TemplateList {
        data: InternalTypes.ShortTemplate[];
    }

    export interface Template extends InternalTypes.Template {}

    export interface SingleFollowup extends InternalTypes.FollowupStatus {}

    export interface FollowupList {
        data: InternalTypes.FollowupStatus[];
    }

    /**
     *  @deprecated Either an API Error or a data value. Is deprecated in favor of
     * rejecting with API error or resolving with data ({@link Promise}).
     */
    export type OrError<T> = ApiError | T;

    /**
     *  Either an error while parsing the form or a data value.
     */
    export interface FormResponse<T> {
        /**
         *  The data.
         */
        data: T | null;
    }
}

export namespace Requests {
    export interface PaginableRequest extends KeyRequest {
        currentPage: number;
        pageSize: number; // will be filled in by the parser using the config
    }

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
        id: string;
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

    export interface UserPwd extends KeyRequest {
        pass?: { newpass: string; oldpass: string };
        name?: string;
    }

    export interface StudentFilterParameters {
        osocYear?: number;
        nameFilter?: string;
        emailFilter?: string;
        roleFilter?: string[] | string;
        alumniFilter?: boolean | string;
        coachFilter?: boolean | string;
        statusFilter?: decision_enum;
        emailStatusFilter?: email_status_enum;
        nameSort?: string;
        emailSort?: string;
        alumniSort?: string;
    }

    export interface StudentFilter extends PaginableRequest {
        osocYear?: number;
        nameFilter?: string;
        emailFilter?: string;
        roleFilter?: string[];
        alumniFilter?: boolean;
        coachFilter?: boolean;
        statusFilter?: decision_enum;
        emailStatusFilter?: email_status_enum;
        nameSort?: FilterSort;
        emailSort?: FilterSort;
        alumniSort?: FilterSort;
    }

    export interface UserFilter extends PaginableRequest {
        sessionkey: string;
        nameFilter?: string;
        emailFilter?: string;
        statusFilter?: account_status_enum;
        nameSort?: FilterSort;
        emailSort?: FilterSort;
        isCoachFilter?: boolean;
        isAdminFilter?: boolean;
    }

    export interface OsocFilter extends PaginableRequest {
        yearFilter?: number;
        yearSort?: FilterSort;
    }

    export interface OsocEdition extends KeyRequest {
        year: number;
    }

    export interface UpdateStudent extends IdRequest {
        emailOrGithub?: string;
        name?: string;
        gender?: string;
        pronouns?: string;
        nickname?: string;
        alumni?: boolean;
        phone?: string;
        education?: {
            level?: string;
            duration?: number;
            year?: number;
            institute?: string;
        };
    }

    export interface Suggest extends IdRequest {
        suggestion: InternalTypes.Suggestion;
        job_application_id: number;
        reason?: string;
    }

    export interface Confirm extends IdRequest {
        reply: InternalTypes.Suggestion;
        job_application_id: number;
        reason?: string;
    }

    export interface UpdateLoginUser extends IdRequest {
        isAdmin: boolean;
        isCoach: boolean;
        pass?: string;
        accountStatus: account_status_enum;
    }

    export interface UserRequest {
        name: string;
        email: string;
        pass: string;
    }

    export interface Project extends KeyRequest {
        osocId: number;
        name: string;
        partner: string;
        start: Date;
        end: Date;
        roles: { roles: { name: string; positions: number }[] };
        description: string;
        coaches: { coaches: number[] };
    }

    export interface ModProject extends IdRequest {
        name?: string;
        partner?: string;
        start?: Date;
        end?: Date;
        osocId?: number;
        roles?: { roles: { name: string; positions: number }[] };
        description?: string;
        addCoaches?: { coaches: number[] };
        removeCoaches?: { coaches: number[] };
    }

    export interface ProjectFilter extends PaginableRequest {
        projectNameFilter?: string;
        clientNameFilter?: string;
        fullyAssignedFilter?: boolean;
        osocYear?: number;
        projectNameSort?: FilterSort;
        clientNameSort?: FilterSort;
    }

    export interface Draft extends IdRequest {
        studentId: number;
        role: string;
        jobApplicationId: number;
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
        createdAt?: string;
        data: DataForm;
    }

    export interface Role extends KeyRequest {
        name: string;
    }

    export interface DataForm {
        fields: Array<Question>;
    }

    export interface Question {
        key: string;
        value: string | string[] | boolean | number | FormValues[] | null;
        options?: Array<Option>;
    }

    export interface FormValues {
        url: string;
    }

    export interface Option {
        id: string;
        text: string;
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

    export interface Coach extends IdRequest {
        loginUserId: number;
    }

    export interface UserYearPermissions extends IdRequest {
        login_user_id: number;
        osoc_id: number;
    }
}

/**
 *  The only verbs used are `GET` (`"get"`), `POST` (`"post"`) and `DELETE`
 * (`"delete"`).
 */
export type Verb = "get" | "post" | "delete";

export type FollowupType = email_status_enum;

export type Table = "project" | "student";

/**
 *  A route callback is a function taking an Express js request and returning a
 * promise (resolving to an API response).
 */
export type RouteCallback<T> = (req: express.Request) => Promise<T>;

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

/**
 * types for socket.io when sending something from the server to the client
 */
export interface ServerToClientEvents {
    loginUserUpdated: () => void;
    loginUserActivated: () => void;
    loginUserDisabled: () => void;
    registrationReceived: () => void;
    studentSuggestionCreated: (studentId: number) => void;
    studentWasDeleted: (studentId: number) => void;
    projectWasCreatedOrDeleted: () => void;
    projectWasModified: (projectId: number) => void;
    osocWasCreatedOrDeleted: () => void;
}

/**
 * types for socket.io when sending something from the client to the server
 */
export interface ClientToServerEvents {
    updateRoleUser: () => void;
    activateUser: () => void;
    disableUser: () => void;
    submitRegistration: () => void;
    studentSuggestionSent: (studentId: number) => void;
    studentDecisionSent: (studentId: number) => void;
    studentDelete: (studentId: number) => void;
    projectCreated: () => void;
    projectModified: (projectId: number) => void;
    coachAssignedToProjectChange: (projectId: number) => void;
    studentAssignedToProjectChange: (projectId: number) => void;
    projectDeleted: () => void;
    osocDeleted: () => void;
    osocCreated: () => void;
}

/**
 * types for communication between multiple socket.io servers.
 * This is empty because we don't need (we have only 1 server)
 */
export interface InterServerEvents {}

/**
 * information about the socket.io socket
 */
export interface SocketData {
    name: string;
    age: number;
}

export enum Decision {
    YES = "YES",
    MAYBE = "MAYBE",
    NO = "NO",
}

export enum AccountStatus {
    ACTIVATED = "ACTIVATED",
    PENDING = "PENDING",
    DISABLED = "DISABLED",
}

export enum EmailStatus {
    APPLIED = "APPLIED",
    APPROVED = "APPROVED",
    AWAITING_PROJECT = "AWAITING_PROJECT",
    CONTRACT_CONFIRMED = "CONTRACT_CONFIRMED",
    CONTRACT_DECLINED = "CONTRACT_DECLINED",
    REJECTED = "REJECTED",
}
