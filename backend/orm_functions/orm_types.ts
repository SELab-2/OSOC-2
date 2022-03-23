import { contract_status_enum, decision_enum, email_status_enum, account_status_enum } from "@prisma/client"


/**
 * interface for the object needed to create a person
 */
 export interface CreatePerson {
    /**
     * the person's firstname
     */
    firstname : string,
    /**
     * the person's lastname
     */
    lastname : string,

    /**
     * the person's github account, only one of github/email can be used
     */
     github? : string,
     /**
     * the person's email, may not be null if github is null
     */
     email? : string
}

/**
 * interface for the object needed to update a person's data
 */
 export interface UpdatePerson {
    /**
     * the person who's info we are updating
     */
    personId: number,
    /**
     * undefined if unchanged or new firstname
     */
    firstname?: string,
    /**
     * undefined if unchanged or the new lastname
     */
    lastname?: string,
    /**
     * undefined if unchanged or the new github
     */
    github?: string | null,
    /**
     * undefined if unchanged or the new email
     */
    email?: string | null,
}

/**
 * interface for the object needed to create a login user
 */
 export interface CreateLoginUser {
    /**
     * the person_id of the person the login user will be associated with
     */
    personId?: number,
    /**
     * the password hash of the login user if email is used
     */
    password?: string | null,
    /**
     * true if the login user is an admin in the osoc system, otherwise false
     */
    isAdmin: boolean,
    /**
     * true if the login user is a coach in the osoc system, otherwise false
     */
    isCoach: boolean,
    /**
     * the status of the account we are trying to create
     */
    accountStatus: account_status_enum
}

/**
 * interface for the object needed to update a login user's data
 */
 export interface UpdateLoginUser {
    /**
     * the login user who's info we are updating
     */
    loginUserId: number,
    /**
     * undefined if unchanged or the new password
     */
    password?: string | null,
    /**
     * undefined if unchanged or the new boolean value that indicates if this login user is an admin 
     */
    isAdmin: boolean,
    /**
     * undefined if unchanged or the new boolean value that indicates if this login user is a coach
     */
    isCoach: boolean
}

/**
 * interface for the object needed to create a student
 */
export interface CreateStudent {
    /**
     * the person_id of the person the student will be associated with
     */
    personId?: number,
    /**
     * the person's gender
     */
    gender : string,
    /**
     * the pronouns the student wants to be addressed with
     */
    pronouns?: string[],
    /**
     * student's phone number
     */
    phoneNumber: string,
    /**
     * student's nickname
     */
    nickname?: string | null,
    /**
     * true if the student is an alumni in the osoc system, otherwise false
     */
    alumni: boolean
}

/**
 * interface for the object needed to update a student's data
 */
export interface UpdateStudent {
    /**
     * the student who's info we are updating
     */
    studentId: number,
    /**
     * undefined if unchanged or the new gender
     */
    gender?: string,
    /**
     * undefined if unchanged or new list of pronouns
     */
    pronouns?: string[],
    /**
     * undefined if unchanged or the new phone number
     */
    phoneNumber?: string,
    /**
     * undefined if unchanged or the new nickname
     */
    nickname?: string | null,
    /**
     * undefined if unchanged or the new boolean value that indicates if this student is an alumni 
     */
    alumni?: boolean
}

/**
 * interface for the object needed in createEvaluationForStudent
 */
export interface CreateEvaluationForStudent {
    /**
     * loginUserId of the loginUser that creates this evaluation
     */
    loginUserId: number,
    /**
     * the jobApplication about that the evaluation is about
     */
    jobApplicationId: number,
    /**
     * the decision that is made (yes, maybe, no)
     */
    decision: decision_enum,
    /**
     * motivation for the made decision
     */
    motivation?: string | null,
    /**
     * is this evaluation final, or not
     */
    isFinal: boolean
}

/**
 * interface for the object needed in updateEvaluationForStudent
 */
export interface UpdateEvaluationForStudent {
    /**
     * the evaluation that we are updating
     */
    evaluation_id: number,
    /**
     * loginUserId of the loginUser that creates this evaluation
     */
     loginUserId: number,
     /**
      * the decision that is made (yes, maybe, no)
      */
     decision?: decision_enum,
     /**
      * motivation for the made decision
      */
     motivation?: string | null,
}

/**
 * interface for the object needed in createContract
 */
export interface CreateContract {
    /**
     * the student that receives the contract
     */
    studentId: number,
    /**
     * the role for which the contract is
     */
    projectRoleId: number,
    /**
     * extra information
     */
    information?: string | null,
    /**
     * the loginUser that created this contract
     */
    loginUserId: number,
    /**
     * status of the contract (draft, approved, cancelled,...)
     */
    contractStatus: contract_status_enum
}

/**
 * interface for the object needed in updateContract
 */
export interface UpdateContract {
    /**
     * the contract we are changing
     */
    contractId: number,
    /**
     * id of the login user that is making these changes
     */
    loginUserId: number,
    /**
     * optional information
     */
    information?: string | null,
    /**
     * status of the contract (draft, approved, cancelled,...)
     */
    contractStatus?: contract_status_enum
}

/**
 * interface for the object needed in createJobApplication
 */
export interface CreateJobApplication {
    /**
     * the student who's application this is
     */
    studentId: number,
    /**
     * the responsibilities the students has during the summer that might keep him from working for osoc
     */
    responsibilities?: string | null,
    /**
     * a fun fact about the student
     */
    funFact?: string | null,
    /**
     * string that has info if the student is available to work, and if he wants to work as volunteer for free or not
     */
    studentVolunteerInfo: string,
    /**
     * boolean that indicates if the student is a student-coach or not
     */
    studentCoach: boolean,
    /**
     * id of the osoc edition this job application is for
     */
    osocId: number,
    /**
     * information about the educations of the student
     */
    edus?: string[] | null,
    /**
     * information about the education level of the student
     */
    eduLevel?: string | null,
    /**
     * how long this student has been studying for
     */
    eduDuration?: number | null,
    /**
     * expected graduation year
     */
    eduYear?: number | null,
    /**
     * institute the student is studying at
     */
    eduInstitute?: string | null,
    /**
     * information about a confirmation email for the evaluation
     */
    emailStatus: email_status_enum,
    /**
     * keeps track of when we received this application (used to pick the latest one)
     */
    created_at: string // this has to be a timezone formatted string: eg '2022-03-14 23:10:00+01'
}

/**
 * interface for the object needed in updateOsoc
 */
 export interface UpdateOsoc {
    /**
     * the osoc edition we are changing
     */
    osocId: number,
    /**
     * the year we want to set
     */
    year: number
}

/**
 * interface for the object needed to create a project
 */
export interface CreateProject {
    /**
     * the name of the project
     */
    name: string,
    /**
     * the id of the osoc edition this project belongs to
     */
    osocId: number,
    /**
     * the partner for who this project is made
     */
    partner: string,
    /**
     * the start date of the project
     */
    startDate: Date,
    /**
     * the end date of the project
     */
     endDate: Date,
    /**
     * the amount of people who need to assigned to the project
     */
    positions: number
}

/**
 * interface for the object needed to update a project's data
 */
export interface UpdateProject {
    /**
     * the project we are updating
     */
    projectId: number,
    /**
     * undefined if unchanged or new project name
     */
    name: string,
    /**
     * undefined if unchanged or the new osoc id
     */
    osocId: number,
    /**
     * undefined if unchanged or the new partner of the project
     */
    partner: string,
    /**
     * undefined if unchanged or the new start date of the project
     */
    startDate: Date
    /**
     * undefined if unchanged or the new end date of the project
     */
    endDate: Date,
    /**
     * undefined if unchanged or the new number of positions of the project
     */
    positions: number
}

/**
 * interface for the object needed to create a project
 */
 export interface CreateProjectRole {
    /**
     * the id of the project this role belongs to
     */
    projectId: number,
    /**
     * the id of the role this project role represents
     */
    roleId: number,
    /**
     * the number of positions that are needed for this role
     */
    positions: number
}

/**
 * interface for the object needed to update a project's data
 */
export interface UpdateProjectRole {
    /**
     * the project we are updating
     */
    projectRoleId: number,
    /**
     * undefined if unchanged or the new project id
     */
    projectId: number,
    /**
     * undefined if unchanged or the new role id
     */
    roleId: number,
    /**
     * undefined if unchanged or the new number of positions for this role in the project
     */
    positions: number
}

/**
 * interface for the object needed in updateRole
 */
 export interface UpdateRole {
    /**
     * the role object we are changing
     */
    roleId: number,
    /**
     * the name we want to set
     */
    name: string
}

/**
 * interface for the object needed in updateRole
 */
 export interface UpdateLanguage {
    /**
     * the language object we are changing
     */
    languageId: number,
    /**
     * the name we want to set
     */
    name: string
}

/**
 * interface for the object needed to create a project
 */
 export interface CreateJobApplicationSkill {
    /**
     * the jobapplicaton id to which the skill is linked
     */
    jobApplicationId: number,
    /**
     * the skill of this job application
     */
    skill: string,
    /**
     * the language id to which this skill is linked
     */
    languageId: number,
    /**
     * the level of the skill of the applicant
     */
    level: number,
    /**
     * true if this skill is the preffered skill of the applicant
     */
    isPreferred: boolean,
    /**
     * true if this skill is the best skill of the applicant
     */
    isBest: boolean
}

/**
 * interface for the object needed to update a job application skill's data
 */
export interface UpdateJobApplicationSkill {
    /**
     * the jobapplicaton we are updating
     */
    JobApplicationSkillId: number,
    /**
     * undefined if unchanged or new job application
     */
    JobApplicationId: number,
    /**
     * undefined if unchanged or the new skill
     */
    skill: string,
    /**
     * undefined if unchanged or the new language of the job application skill
     */
    languageId: number,
    /**
     * undefined if unchanged or the new level
     */
    level: number
    /**
     * undefined if unchanged or the new preffered status
     */
    isPreferred: boolean,
    /**
     * undefined if unchanged or the new is best status
     */
    is_best: boolean
}

export interface AddStudentToProject {
    /**
     * the id of the loginsuer that wants to add a student to the project
     */
    loginUserId: number,
    /**
     * the id of the student that will be added to the project
     */
    studentId: number,
    /**
     * the id of the project that the student will be added to
     */
    projectId: number,
    /**
     * the name of the role the student will be added for
     */
    roleName: string,
    /**
     * extra information
     */
    information?: string | null,

}

/**
 * interface for the object needed to create a project user
 */
 export interface CreateProjectUser {
    /**
     * the id of the project this user belongs to
     */
    projectId: number,
    /**
     * the id of the login user this user belongs to
     */
    loginUserId: number,
}

/**
 * interface for the object needed to create an applied role
 */
 export interface CreateAppliedRole {
    /**
     * the id of the job application this applied role belongs to
     */
    jobApplicationId: number,
    /**
     * the id of the role this applied role belongs to
     */
    roleId: number,
}
