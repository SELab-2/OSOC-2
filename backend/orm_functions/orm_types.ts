import { contract_status_enum, decision_enum, email_status_enum } from "@prisma/client"


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
     * the person's gender
     */
    gender : string,
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
     * undefined if unchanged or the new gender
     */
    gender?: string,
    /**
     * undefined if unchanged or the new github
     */
    github?: string,
    /**
     * undefined if unchanged or the new email
     */
    email?: string,
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
    isAdmin: boolean
    /**
     * true if the login user is a coach in the osoc system, otherwise false
     */
    isCoach: boolean
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
     * the responsibilities the students wants to take
     */
    responsibilities?: string | null,
    /**
     * optional motivation from the student
     */
    motivation?: string | null,
    /**
     * a fun fact about the student
     */
    funFact?: string | null,
    /**
     * boolean that indicates if the student is a volunteer or not
     */
    isVolunteer: boolean, 
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
    edus?: string | null,
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



