import {prismaMock} from "./singleton";
import {CreateJobApplicationSkill, UpdateJobApplicationSkill} from "../../orm_functions/orm_types";
import {
    createJobApplicationSkill, deleteJobApplicationSkill,
    getAllJobApplicationSkill,
    getAllJobApplicationSkillByJobApplication, getJobApplicationSkill, updateJobApplicationSkill
} from "../../orm_functions/job_application_skill";

const returnValue = {
    job_application_skill_id: 0,
    job_application_id: 0,
    is_best: false,
    is_preferred: true,
    language_id: 1,
    level: 4,
    skill: "skill"
}

test ("should create a new job application and return the entry in the database", async () => {
    const jobApplicationSkill: CreateJobApplicationSkill = {
        jobApplicationId: 0,
        isBest: false,
        isPreferred: true,
        languageId: 1,
        level: 4,
        skill: "skill"
    }

    prismaMock.job_application_skill.create.mockResolvedValue(returnValue);
    await expect(createJobApplicationSkill(jobApplicationSkill)).resolves.toEqual(returnValue);
});

test("should return all job application skills", async () => {
    const returnValue = [{
        job_application_skill_id: 0,
        job_application_id: 0,
        is_best: false,
        is_preferred: true,
        language_id: 1,
        level: 4,
        skill: "skill"
    }];

    prismaMock.job_application_skill.findMany.mockResolvedValue(returnValue);
    await expect(getAllJobApplicationSkill()).resolves.toEqual(returnValue);
});

test("should return all skills for the given jobApplicationId", async () => {
    const returnValue = [{
        job_application_skill_id: 0,
        job_application_id: 0,
        is_best: false,
        is_preferred: true,
        language_id: 1,
        level: 4,
        skill: "skill"
    }];

    prismaMock.job_application_skill.findMany.mockResolvedValue(returnValue);
    await expect(getAllJobApplicationSkillByJobApplication(0)).resolves.toEqual(returnValue);
});

test("should return the job application skill with the given id", async () => {


    prismaMock.job_application_skill.findUnique.mockResolvedValue(returnValue);
    await expect(getJobApplicationSkill(0)).resolves.toEqual(returnValue);
});

test("should update the job application skill and return the updated record", async () => {
    const updatedJobSkill: UpdateJobApplicationSkill = {
        JobApplicationId: 0,
        JobApplicationSkillId: 2,
        isPreferred: true,
        is_best: false,
        languageId: 0,
        level: 4,
        skill: "newSkill"
    };

    prismaMock.job_application_skill.update.mockResolvedValue(returnValue);
    await expect(updateJobApplicationSkill(updatedJobSkill)).resolves.toEqual(returnValue);
});

test("should delete the jobApplication skill with the given ID and return the deleted record", async () => {

    prismaMock.job_application_skill.delete.mockResolvedValue(returnValue);
    await expect(deleteJobApplicationSkill(0)).resolves.toEqual(returnValue);
});