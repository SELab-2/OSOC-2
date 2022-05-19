import "@testing-library/jest-dom";
import fetchMock from "jest-fetch-mock";
import { act, render, screen } from "@testing-library/react";
import { StudentOverview } from "../components/StudentOverview/StudentOverview";
import { AttachmentType, EmailStatus, Student } from "../types";
import fireEvent from "@testing-library/user-event";

jest.mock("next/router", () => require("next-router-mock"));

fetchMock.enableMocks();
jest.mock("next/router");

let student: Student;
describe("student filter tests", () => {
    beforeEach(async () => {
        fetchMock.resetMocks();
        const attatchment = {
            job_application_id: -1,
            attachment_id: -1,
            data: [""],
            type: [AttachmentType.MOTIVATION_STRING],
        };
        const jobApplicationSkill = {
            is_best: false,
            is_preferred: false,
            job_application_id: -1,
            job_application_skill_id: -1,
            language_id: -1,
            level: -1,
            skill: "",
        };
        student = {
            evaluation: {
                evaluations: [],
                osoc: {
                    year: 2022,
                },
            },

            jobApplication: {
                applied_role: [
                    {
                        job_application_id: 1,
                        applied_role_id: 1,
                        role_id: 1,
                    },
                ],
                attachment: [attatchment],
                created_at: new Date(),
                edu_duration: "",
                edu_institute: "",
                edu_level: "",
                edu_year: "",
                edus: [""],
                email_status: EmailStatus.NONE,
                fun_fact: "",
                job_application_id: -1,
                job_application_skill: [jobApplicationSkill],
                osoc_id: -1,
                responsibilities: "",
                student_coach: false,
                student_id: -1,
                student_volunteer_info: "",
            },
            roles: [""],
            student: {
                alumni: false,
                gender: "",
                nickname: "",
                person: {
                    person_id: -1,
                    email: "",
                    name: "",
                    github: "",
                    github_id: "",
                },
                person_id: -1,
                phone_number: "",
                pronouns: "",
                student_id: -1,
            },
        };
        await act(async () => {
            fetchMock.mockOnce(
                JSON.stringify({
                    success: true,
                    evaluation: { evaluations: [] },
                })
            );
            fetchMock.mockOnce(
                JSON.stringify({
                    success: true,
                    evaluation: { evaluations: [] },
                })
            );
            await render(<StudentOverview student={student} />);
        });
    });
    afterEach(() => {
        fetchMock.resetMocks();
    });

    test("test rendering osoc filter", () => {
        expect(screen.getByTestId("motivationInput")).toBeInTheDocument();
        expect(screen.getByTestId("motivationConfirm")).toBeInTheDocument();
        expect(screen.getByTestId("permanentYes")).toBeInTheDocument();
        expect(screen.getByTestId("permanentNo")).toBeInTheDocument();
        expect(screen.getByTestId("permanentMaybe")).toBeInTheDocument();
        expect(screen.getByTestId("suggestYes")).toBeInTheDocument();
        expect(screen.getByTestId("suggestMaybe")).toBeInTheDocument();
        expect(screen.getByTestId("suggestNo")).toBeInTheDocument();
    });

    const testButton = async (
        button: string,
        query: string,
        decision: string,
        mode: string
    ) => {
        const message = "hmmmmmmmmmm...";
        await act(async () => {
            fetchMock.mockOnce(
                JSON.stringify({
                    success: true,
                    evaluation: { evaluations: [] },
                })
            );
            fetchMock.mockOnce(
                JSON.stringify({
                    success: true,
                    evaluation: { evaluations: [] },
                })
            );
            fetchMock.mockOnce(
                JSON.stringify({
                    success: true,
                    evaluation: { evaluations: [] },
                })
            );
            screen.getByTestId(button).click();
            await fireEvent.type(
                screen.getByTestId("motivationInput"),
                message
            );
            screen.getByTestId("motivationConfirm").click();
        });
        const lastLength = fetchMock.mock.calls.length - 2;
        expect(fetchMock.mock.calls[lastLength][0]).toBe(
            `undefined/student/${student.student.student_id}/${query}`
        );
        expect(fetchMock.mock.calls[lastLength][1]?.body).toBe(
            `{"id":${student.student.student_id},"${mode}":"${decision}","reason":"${message}","job_application_id":-1}`
        );
        fetchMock.mockClear();
    };
    test("test button calls", async () => {
        await testButton("permanentYes", "confirm", "YES", "reply");
        await testButton("permanentMaybe", "confirm", "MAYBE", "reply");
        await testButton("permanentNo", "confirm", "NO", "reply");
        await testButton("suggestYes", "suggest", "YES", "suggestion");
        await testButton("suggestMaybe", "suggest", "MAYBE", "suggestion");
        await testButton("suggestNo", "suggest", "NO", "suggestion");
    });
});
