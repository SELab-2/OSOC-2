import {
    getStudentEvaluationsFinal,
    getStudentEvaluationsTemp,
    getStudentEvaluationsTotal
} from "../../orm_functions/job_application";
import prisma from "../../prisma/prisma";
import {decision_enum} from "@prisma/client";

it("should return all student evaluations for the student with given id", async () => {
    const students = await prisma.student.findMany();
    const osocs = await prisma.osoc.findMany();

    const evaluations = [
        {
            decision: decision_enum.MAYBE,
            motivation: "low education level",
            is_final: false,
        },
        {
            decision: decision_enum.YES,
            motivation: "awesome job application",
            is_final: true
        }
    ]

    const foundApplications = await getStudentEvaluationsTotal(students[0].student_id);
    foundApplications.forEach((found_eval) => {
        expect(found_eval).toHaveProperty("osoc", {year: osocs[0].year});
        expect(found_eval).toHaveProperty("evaluation");
        for (let i = 0; i < found_eval.evaluation.length; i++) {
            const evals = evaluations[i];
            expect(found_eval.evaluation[i]).toHaveProperty("decision", evals.decision);
            expect(found_eval.evaluation[i]).toHaveProperty("motivation", evals.motivation);
            expect(found_eval.evaluation[i]).toHaveProperty("evaluation_id")
            expect(found_eval.evaluation[i]).toHaveProperty("is_final", evals.is_final)
        }
    });
});

it("should return all final student evaluations for the student with given id", async () => {
    const students = await prisma.student.findMany();
    const osocs = await prisma.osoc.findMany();

    const evaluations = [
        {
            decision: decision_enum.YES,
            motivation: "awesome job application",
        }
    ]

    const foundApplications = await getStudentEvaluationsFinal(students[0].student_id);
    foundApplications.forEach((found_eval) => {
        expect(found_eval).toHaveProperty("osoc", {year: osocs[0].year});
        expect(found_eval).toHaveProperty("evaluation");
        for (let i = 0; i < found_eval.evaluation.length; i++) {
            const evals = evaluations[i];
            expect(found_eval.evaluation[i]).toHaveProperty("decision", evals.decision);
            expect(found_eval.evaluation[i]).toHaveProperty("motivation", evals.motivation);
            expect(found_eval.evaluation[i]).toHaveProperty("evaluation_id");
        }

    });
});

it("should return all suggestion evaluations for the student with given id", async () => {
    const students = await prisma.student.findMany();
    const osocs = await prisma.osoc.findMany();

    const evaluations = [
        {
            decision: decision_enum.MAYBE,
            motivation: "low education level",
            is_final: false,
        }
    ]

    const foundApplications = await getStudentEvaluationsTemp(students[0].student_id);
    foundApplications.forEach((found_eval) => {
        expect(found_eval).toHaveProperty("osoc", {year: osocs[0].year});
        expect(found_eval).toHaveProperty("evaluation");
        for (let i = 0; i < found_eval.evaluation.length; i++) {
            const evals = evaluations[i];
            expect(found_eval.evaluation[i]).toHaveProperty("decision", evals.decision);
            expect(found_eval.evaluation[i]).toHaveProperty("motivation", evals.motivation);
            expect(found_eval.evaluation[i]).toHaveProperty("evaluation_id");
        }

    });
});