import {prismaMock} from "./singleton";
import {decision_enum} from "@prisma/client";
import {checkIfFinalEvaluationExists, createEvaluationForStudent, updateEvaluationForStudent} from "../../orm_functions/evaluation";
import {CreateEvaluationForStudent, UpdateEvaluationForStudent} from "../../orm_functions/orm_types";

test("should return a final evaluation if it exists", async () => {
    const jobApplicationId = 5;
    const result = {
        evaluation_id: 7,
        login_user_id: 0,
        job_application_id: 0,
        decision: decision_enum.MAYBE,
        motivation: null,
        is_final: true
    }
    prismaMock.evaluation.findFirst.mockResolvedValue(result);

    await expect(checkIfFinalEvaluationExists(jobApplicationId)).resolves.toEqual(result)
});

test("should create an evaluation for a student", async () => {
   const evaluation: CreateEvaluationForStudent = {
       decision: decision_enum.MAYBE,
       isFinal: false,
       jobApplicationId: 0,
       loginUserId: 0,
       motivation: undefined
   }

    const response = {
        evaluation_id: 0,
        login_user_id: evaluation.loginUserId,
        job_application_id: evaluation.jobApplicationId,
        decision: evaluation.decision,
        motivation: "test",
        is_final: evaluation.isFinal
    }

   prismaMock.evaluation.create.mockResolvedValue(response);
   await expect(createEvaluationForStudent(evaluation)).resolves.toEqual(response);
});

test("should update the evaluation", async () => {
    const evaluation: UpdateEvaluationForStudent = {
        decision: decision_enum.NO,
        evaluation_id: 0,
        loginUserId: 0,
        motivation: "undefined"
    }

    const response = {
        evaluation_id: 0,
        login_user_id: evaluation.loginUserId,
        job_application_id: 1,
        decision: decision_enum.NO,
        motivation: "test",
        is_final: true
    }

    prismaMock.evaluation.update.mockResolvedValue(response);

    await expect(updateEvaluationForStudent(evaluation)).resolves.toEqual(response);
})