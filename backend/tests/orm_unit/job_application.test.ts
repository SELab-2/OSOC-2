import {prismaMock} from "./singleton";
import {
    changeEmailStatusOfJobApplication,
    createJobApplication,
    deleteJobApplication,
    deleteJobApplicationsFromStudent,
    getJobApplication,
    getJobApplicationByYear,
    getLatestApplicationRolesForStudent,
    getLatestJobApplicationOfStudent,
    getStudentEvaluationsFinal,
    getStudentEvaluationsTemp,
    getStudentEvaluationsTotal
} from "../../orm_functions/job_application";
import {email_status_enum} from "@prisma/client";
import {CreateJobApplication} from "../../orm_functions/orm_types";

const response = {
    job_application_id: 0,
    student_id: 0,
    responsibilities: "",
    student_volunteer_info: "Yes, I can work with a student employment agreement in Belgium",
    motivation: "",
    fun_fact: "",
    is_volunteer: false,
    student_coach: false,
    osoc_id: 0,
    edus: ["test"],
    edu_level: "slecht",
    edu_duration : 5,
    edu_year: "2025",
    edu_institute: "ugent",
    email_status: email_status_enum.FAILED,
    created_at: new Date()
}

test("should return all student evaluations", async () => {
    prismaMock.job_application.findMany.mockResolvedValue([response]);
    await expect(getStudentEvaluationsTotal(5)).resolves.toEqual([response]);
});

test("should return all final evaluations", async () => {
    prismaMock.job_application.findMany.mockResolvedValue([response]);
    await expect(getStudentEvaluationsFinal(5)).resolves.toEqual([response]);
});

test("should return all temp evaluations", async () => {
    prismaMock.job_application.findMany.mockResolvedValue([response]);
    await expect(getStudentEvaluationsTemp(5)).resolves.toEqual([response]);
});

test("should delete job applications of student", async () => {
    const count = { count: 5};

    prismaMock.job_application.deleteMany.mockResolvedValue(count);
    await expect(deleteJobApplicationsFromStudent(0)).resolves.toEqual(count);
});

test("should change the email status", async () => {
    prismaMock.job_application.update.mockResolvedValue(response);
    await expect(changeEmailStatusOfJobApplication(0, email_status_enum.FAILED)).resolves.toEqual(response);
});

test("should delete job application", async () => {
    prismaMock.job_application.delete.mockResolvedValue(response);
    await expect(deleteJobApplication(0)).resolves.toEqual(response);
});

test("should create a job application", async () => {

    const jobApplicaton: CreateJobApplication = {
        createdAt: "",
        eduDuration: 5,
        eduInstitute: "ugent",
        eduLevel: "good",
        eduYear: "2025",
        edus: ["good"],
        emailStatus: email_status_enum.DRAFT,
        funFact: "cool",
        studentVolunteerInfo: "Yes, I can work with a student employment agreement in Belgium",
        osocId: 0,
        responsibilities: undefined,
        studentCoach: false,
        studentId: 0
    }

    prismaMock.job_application.create.mockResolvedValue(response);
    await expect(createJobApplication(jobApplicaton)).resolves.toEqual(response);
});

test("should return latest job application of a student", async () => {
    prismaMock.job_application.findFirst.mockResolvedValue(response);
    await expect(getLatestJobApplicationOfStudent(0)).resolves.toEqual(response);
});

test("should return a job application", async () => {
    prismaMock.job_application.findUnique.mockResolvedValue(response);
    await expect(getJobApplication(0)).resolves.toEqual(response);
});

test("should return all job applications of the given year", async () => {
    prismaMock.job_application.findMany.mockResolvedValue([response]);
    await expect(getJobApplicationByYear(2022)).resolves.toEqual([response]);
});

test("should return the latest roles this student has applied for", async () => {
    prismaMock.job_application.findFirst.mockResolvedValue(response);
    await expect(getLatestApplicationRolesForStudent(0)).resolves.toEqual(response);
})