import {
    CreateEvaluationForStudent,
    UpdateEvaluationForStudent,
} from "../../orm_functions/orm_types";
import {
    createEvaluationForStudent,
    checkIfFinalEvaluationExists,
    updateEvaluationForStudent,
    getLoginUserByEvaluationId,
    getEvaluationByPartiesFor,
    deleteEvaluationsByJobApplication,
} from "../../orm_functions/evaluation";
import prisma from "../../prisma/prisma";
import { decision_enum } from "@prisma/client";

import "../integration_setup";

const evaluation1: UpdateEvaluationForStudent = {
    evaluation_id: 1,
    loginUserId: 1,
    decision: decision_enum.YES,
    motivation: "Definitely unicorn, all in for it",
};

let jobApplicationId = 0;
let createdEvaluation: CreateEvaluationForStudent;

it("should create 1 new evaluation", async () => {
    const login_user = await prisma.login_user.findFirst();
    const job_application_id = await prisma.job_application.findFirst();

    if (login_user && job_application_id) {
        const evaluation: CreateEvaluationForStudent = {
            loginUserId: login_user.login_user_id,
            jobApplicationId: job_application_id.job_application_id,
            decision: decision_enum.MAYBE,
            motivation: "Looks good",
            isFinal: true,
        };
        createdEvaluation = evaluation;
        evaluation1.loginUserId = evaluation.loginUserId;
        jobApplicationId = evaluation.jobApplicationId;

        const created_evaluation = await createEvaluationForStudent(evaluation);
        evaluation1.evaluation_id = created_evaluation.evaluation_id;
        expect(created_evaluation).toHaveProperty(
            "login_user_id",
            created_evaluation.login_user_id
        );
        expect(created_evaluation).toHaveProperty(
            "job_application_id",
            created_evaluation.job_application_id
        );
        expect(created_evaluation).toHaveProperty(
            "decision",
            created_evaluation.decision
        );
        expect(created_evaluation).toHaveProperty(
            "motivation",
            created_evaluation.motivation
        );
        expect(created_evaluation).toHaveProperty(
            "is_final",
            created_evaluation.is_final
        );
    }
});

it("should return the evaluation, by searching for the job application id", async () => {
    const searched_evaluation = await checkIfFinalEvaluationExists(
        jobApplicationId
    );
    expect(searched_evaluation).toHaveProperty(
        "evaluation_id",
        evaluation1.evaluation_id
    );
});

it("should return the evaluation, by searching for the evaluation id", async () => {
    const searched_evaluation = await getLoginUserByEvaluationId(
        evaluation1.evaluation_id
    );
    expect(searched_evaluation).toHaveProperty(
        "login_user_id",
        createdEvaluation.loginUserId
    );
    expect(searched_evaluation).toHaveProperty(
        "job_application_id",
        jobApplicationId
    );
    expect(searched_evaluation).toHaveProperty(
        "decision",
        createdEvaluation.decision
    );
    expect(searched_evaluation).toHaveProperty(
        "motivation",
        createdEvaluation.motivation
    );
    expect(searched_evaluation).toHaveProperty(
        "is_final",
        createdEvaluation.isFinal
    );
});

it("should update evaluation based upon evaluation id", async () => {
    const updated_evaluation = await updateEvaluationForStudent(evaluation1);
    expect(updated_evaluation).toHaveProperty(
        "login_user_id",
        evaluation1.loginUserId
    );
    expect(updated_evaluation).toHaveProperty(
        "job_application_id",
        jobApplicationId
    );
    expect(updated_evaluation).toHaveProperty("decision", evaluation1.decision);
    expect(updated_evaluation).toHaveProperty(
        "motivation",
        evaluation1.motivation
    );
    expect(updated_evaluation).toHaveProperty(
        "is_final",
        createdEvaluation.isFinal
    );
});

it("should return all evaluations created by a user for a student in an osoc edition", async () => {
    const evaluations = await getEvaluationByPartiesFor(1, 1, 1);
    for (const evaluation of evaluations) {
        expect(evaluation).toHaveProperty("decision", evaluation.decision);
        expect(evaluation).toHaveProperty("motivation", evaluation.motivation);
        expect(evaluation).toHaveProperty("is_final", evaluation.is_final);
        expect(evaluation).toHaveProperty(
            "evaluation_id",
            evaluation.evaluation_id
        );
        expect(evaluation).toHaveProperty(
            "job_application_id",
            evaluation.job_application_id
        );
        expect(evaluation).toHaveProperty(
            "login_user_id",
            evaluation.login_user_id
        );
    }
});

it("should delete evaluations by a job application", async () => {
    const numberOfDeletions = await deleteEvaluationsByJobApplication(1);
    expect(numberOfDeletions).toHaveProperty("count", numberOfDeletions.count);
});
