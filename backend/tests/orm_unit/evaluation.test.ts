import { prismaMock } from "./singleton";
import { decision_enum } from "@prisma/client";
import {
    checkIfFinalEvaluationExists,
    createEvaluationForStudent,
    getLoginUserByEvaluationId,
    updateEvaluationForStudent,
} from "../../orm_functions/evaluation";
import {
    CreateEvaluationForStudent,
    UpdateEvaluationForStudent,
} from "../../orm_functions/orm_types";

test("should return a final evaluation if it exists", async () => {
    const jobApplicationId = 5;
    const result = {
        evaluation_id: 7,
        login_user_id: 0,
        job_application_id: 0,
        decision: decision_enum.MAYBE,
        motivation: null,
        is_final: true,
    };
    prismaMock.evaluation.findFirst.mockResolvedValue(result);

    await expect(
        checkIfFinalEvaluationExists(jobApplicationId)
    ).resolves.toEqual(result);
});

test("should create an evaluation for a student", async () => {
    const evaluation: CreateEvaluationForStudent = {
        decision: decision_enum.MAYBE,
        isFinal: false,
        jobApplicationId: 0,
        loginUserId: 0,
        motivation: undefined,
    };

    const response = {
        evaluation_id: 0,
        login_user_id: evaluation.loginUserId,
        job_application_id: evaluation.jobApplicationId,
        decision: evaluation.decision,
        motivation: "test",
        is_final: evaluation.isFinal,
    };

    prismaMock.evaluation.create.mockResolvedValue(response);
    await expect(createEvaluationForStudent(evaluation)).resolves.toEqual(
        response
    );
});

test("should update the final evaluation that already exists", async () => {
    const evaluationFinal: CreateEvaluationForStudent = {
        decision: decision_enum.MAYBE,
        isFinal: true,
        jobApplicationId: 0,
        loginUserId: 0,
        motivation: undefined,
    };

    const response = {
        evaluation_id: 0,
        login_user_id: evaluationFinal.loginUserId,
        job_application_id: evaluationFinal.jobApplicationId,
        decision: evaluationFinal.decision,
        motivation: "test",
        is_final: evaluationFinal.isFinal,
    };

    const existingEvaluation = {
        evaluation_id: 0,
        login_user_id: 1,
        job_application_id: 1,
        decision: decision_enum.NO,
        motivation: "test",
        is_final: true,
    };
    prismaMock.evaluation.findFirst.mockResolvedValue(existingEvaluation);
    prismaMock.evaluation.create.mockResolvedValue(response);
    prismaMock.evaluation.update.mockResolvedValue(response);
    await expect(createEvaluationForStudent(evaluationFinal)).resolves.toEqual(
        response
    );
});

test("should update the evaluation", async () => {
    const evaluation: UpdateEvaluationForStudent = {
        decision: decision_enum.NO,
        evaluation_id: 0,
        loginUserId: 0,
        motivation: "undefined",
    };

    const response = {
        evaluation_id: 0,
        login_user_id: evaluation.loginUserId,
        job_application_id: 1,
        decision: decision_enum.NO,
        motivation: "test",
        is_final: true,
    };

    prismaMock.evaluation.update.mockResolvedValue(response);

    await expect(updateEvaluationForStudent(evaluation)).resolves.toEqual(
        response
    );
});

test("should return the loginUser with his info that made this evaluation", async () => {
    const result = {
        evaluation_id: 7,
        login_user_id: 0,
        job_application_id: 0,
        decision: decision_enum.MAYBE,
        motivation: null,
        is_final: true,
    };
    prismaMock.evaluation.findUnique.mockResolvedValue(result);
    await expect(getLoginUserByEvaluationId(7)).resolves.toEqual(result);
});
