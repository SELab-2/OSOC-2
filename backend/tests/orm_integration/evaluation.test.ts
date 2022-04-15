import {CreateEvaluationForStudent, UpdateEvaluationForStudent} from "../../orm_functions/orm_types";
import {
    createEvaluationForStudent, checkIfFinalEvaluationExists,
    updateEvaluationForStudent, getLoginUserByEvaluationId, deleteEvaluationsByJobApplication
} from "../../orm_functions/evaluation";
import prisma from "../../prisma/prisma";
import {decision_enum} from "@prisma/client";

const evaluation1: UpdateEvaluationForStudent = {
    evaluation_id: 1,
    loginUserId: 1,
    decision: decision_enum.YES,
    motivation: "Definetly unicorn, all in for it"
}


let jobApplicationId = 0;
let createdEvaluation : CreateEvaluationForStudent;


it('should create 1 new evaluation', async () => {
    const login_user = await prisma.login_user.findFirst();
    const job_application_id = await prisma.job_application.findFirst();

    if (login_user && job_application_id){
        const evaluation: CreateEvaluationForStudent = {
            loginUserId: login_user.login_user_id,
            jobApplicationId: job_application_id.job_application_id,
            decision: decision_enum.MAYBE,
            motivation: "Looks good",
            isFinal: true
        }
        createdEvaluation = evaluation;
        evaluation1.loginUserId = evaluation.loginUserId;
        jobApplicationId = evaluation.jobApplicationId;
    
        const created_evaluation = await createEvaluationForStudent(evaluation);
        evaluation1.evaluation_id = created_evaluation.evaluation_id;
        expect(created_evaluation).toHaveProperty("login_user_id", created_evaluation.login_user_id);
        expect(created_evaluation).toHaveProperty("job_application_id", created_evaluation.job_application_id);
        expect(created_evaluation).toHaveProperty("decision", created_evaluation.decision);
        expect(created_evaluation).toHaveProperty("motivation", created_evaluation.motivation);
        expect(created_evaluation).toHaveProperty("is_final", created_evaluation.is_final);
    }
});

it('should return the evaluation, by searching for the job application id', async () => {
    const searched_evaluation = await checkIfFinalEvaluationExists(jobApplicationId);
    expect(searched_evaluation).toHaveProperty("evaluation_id", evaluation1.evaluation_id);
});

it('should return the evaluation, by searching for the evaluation id', async () => {
    const searched_evaluation = await getLoginUserByEvaluationId(evaluation1.evaluation_id);
    expect(searched_evaluation).toHaveProperty("login_user_id", createdEvaluation.loginUserId);
    expect(searched_evaluation).toHaveProperty("job_application_id", jobApplicationId);
    expect(searched_evaluation).toHaveProperty("decision", createdEvaluation.decision);
    expect(searched_evaluation).toHaveProperty("motivation", createdEvaluation.motivation);
    expect(searched_evaluation).toHaveProperty("is_final", createdEvaluation.isFinal);
});

it('should update evaluation based upon evaluation id', async () => {
    const updated_evaluation = await updateEvaluationForStudent(evaluation1);
    expect(updated_evaluation).toHaveProperty("login_user_id", evaluation1.loginUserId);
    expect(updated_evaluation).toHaveProperty("job_application_id", jobApplicationId);
    expect(updated_evaluation).toHaveProperty("decision", evaluation1.decision);
    expect(updated_evaluation).toHaveProperty("motivation", evaluation1.motivation);
    expect(updated_evaluation).toHaveProperty("is_final", createdEvaluation.isFinal);
});

it("should return the number of deleted records", async () => {
    const [login_users, job_applications] = await Promise.all([prisma.login_user.findMany(), prisma.job_application.findMany()])

    const deleted = await deleteEvaluationsByJobApplication(job_applications[0].job_application_id);
    expect(deleted).toHaveProperty("count", 2);

    await prisma.evaluation.createMany({
        data : [
            {
                login_user_id: login_users[0].login_user_id,
                job_application_id: job_applications[0].job_application_id,
                decision: decision_enum.MAYBE,
                motivation: "low education level",
                is_final: false,
            },
            {
                login_user_id: login_users[0].login_user_id,
                job_application_id: job_applications[0].job_application_id,
                decision: decision_enum.YES,
                motivation: "awesome job application",
                is_final: true
            }
        ]
    })
});
