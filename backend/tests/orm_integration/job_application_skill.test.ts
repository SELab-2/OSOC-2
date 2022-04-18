import prisma from "../../prisma/prisma";
import {
  createJobApplicationSkill,
  getAllJobApplicationSkill,
  getAllJobApplicationSkillByJobApplication,
  getJobApplicationSkill,
  updateJobApplicationSkill,
  deleteJobApplicationSkill,
} from "../../orm_functions/job_application_skill";
import {
  CreateJobApplicationSkill,
  UpdateJobApplicationSkill,
} from "../../orm_functions/orm_types";

const jobApplicationSkill1: UpdateJobApplicationSkill = {
  JobApplicationSkillId: 1,
  JobApplicationId: 0,
  skill: "C++",
  languageId: 0,
  level: 2,
  isPreferred: true,
  is_best: true,
};

const jobApplicationSkill2: UpdateJobApplicationSkill = {
  JobApplicationSkillId: 1,
  JobApplicationId: 0,
  skill: "C++",
  languageId: 0,
  level: 2,
  isPreferred: true,
  is_best: true,
};

it("should create 1 new job application skill", async () => {
  const job_application = await prisma.job_application.findFirst();
  const language = await prisma.language.findFirst();

  if (job_application && language) {
    const jobApplicationSkill: CreateJobApplicationSkill = {
      jobApplicationId: job_application.job_application_id,
      skill: "C++",
      languageId: language.language_id,
      level: 2,
      isPreferred: true,
      isBest: true,
    };
    jobApplicationSkill1.JobApplicationId = job_application.job_application_id;
    jobApplicationSkill2.JobApplicationId = job_application.job_application_id;
    jobApplicationSkill1.languageId = language.language_id;
    jobApplicationSkill2.languageId = language.language_id;

    const created_job_application_skill = await createJobApplicationSkill(
      jobApplicationSkill
    );
    jobApplicationSkill1.JobApplicationSkillId =
      created_job_application_skill.job_application_skill_id;
    jobApplicationSkill2.JobApplicationSkillId =
      created_job_application_skill.job_application_skill_id;
    expect(created_job_application_skill).toHaveProperty(
      "job_application_id",
      jobApplicationSkill1.JobApplicationId
    );
    expect(created_job_application_skill).toHaveProperty(
      "skill",
      jobApplicationSkill1.skill
    );
    expect(created_job_application_skill).toHaveProperty(
      "language_id",
      jobApplicationSkill1.languageId
    );
    expect(created_job_application_skill).toHaveProperty(
      "level",
      jobApplicationSkill1.level
    );
    expect(created_job_application_skill).toHaveProperty(
      "is_preferred",
      jobApplicationSkill1.isPreferred
    );
    expect(created_job_application_skill).toHaveProperty(
      "is_best",
      jobApplicationSkill1.is_best
    );
  }
});

it("should find all the job_applications skills in the db, 3 in total", async () => {
  const searched_job_application_skills = await getAllJobApplicationSkill();
  expect(searched_job_application_skills.length).toEqual(3);
  expect(searched_job_application_skills[2]).toHaveProperty(
    "job_application_id",
    jobApplicationSkill1.JobApplicationId
  );
  expect(searched_job_application_skills[2]).toHaveProperty(
    "skill",
    jobApplicationSkill1.skill
  );
  expect(searched_job_application_skills[2]).toHaveProperty(
    "language_id",
    jobApplicationSkill1.languageId
  );
  expect(searched_job_application_skills[2]).toHaveProperty(
    "level",
    jobApplicationSkill1.level
  );
  expect(searched_job_application_skills[2]).toHaveProperty(
    "is_preferred",
    jobApplicationSkill1.isPreferred
  );
  expect(searched_job_application_skills[2]).toHaveProperty(
    "is_best",
    jobApplicationSkill1.is_best
  );
});

it("should find all the job_applications skills linked to the job application", async () => {
  const searched_job_application_skills =
    await getAllJobApplicationSkillByJobApplication(
      jobApplicationSkill1.JobApplicationId
    );
  expect(searched_job_application_skills[1]).toHaveProperty(
    "job_application_id",
    jobApplicationSkill1.JobApplicationId
  );
  expect(searched_job_application_skills[1]).toHaveProperty(
    "skill",
    jobApplicationSkill1.skill
  );
  expect(searched_job_application_skills[1]).toHaveProperty(
    "language_id",
    jobApplicationSkill1.languageId
  );
  expect(searched_job_application_skills[1]).toHaveProperty(
    "level",
    jobApplicationSkill1.level
  );
  expect(searched_job_application_skills[1]).toHaveProperty(
    "is_preferred",
    jobApplicationSkill1.isPreferred
  );
  expect(searched_job_application_skills[1]).toHaveProperty(
    "is_best",
    jobApplicationSkill1.is_best
  );
});

it("should find the job_applications skill by its id", async () => {
  const searched_job_application_skill = await getJobApplicationSkill(
    jobApplicationSkill1.JobApplicationSkillId
  );
  expect(searched_job_application_skill).toHaveProperty(
    "job_application_id",
    jobApplicationSkill1.JobApplicationId
  );
  expect(searched_job_application_skill).toHaveProperty(
    "skill",
    jobApplicationSkill1.skill
  );
  expect(searched_job_application_skill).toHaveProperty(
    "language_id",
    jobApplicationSkill1.languageId
  );
  expect(searched_job_application_skill).toHaveProperty(
    "level",
    jobApplicationSkill1.level
  );
  expect(searched_job_application_skill).toHaveProperty(
    "is_preferred",
    jobApplicationSkill1.isPreferred
  );
  expect(searched_job_application_skill).toHaveProperty(
    "is_best",
    jobApplicationSkill1.is_best
  );
});

it("should update job application skill based upon id", async () => {
  const updated_job_application_skill = await updateJobApplicationSkill(
    jobApplicationSkill2
  );
  expect(updated_job_application_skill).toHaveProperty(
    "job_application_id",
    jobApplicationSkill2.JobApplicationId
  );
  expect(updated_job_application_skill).toHaveProperty(
    "skill",
    jobApplicationSkill2.skill
  );
  expect(updated_job_application_skill).toHaveProperty(
    "language_id",
    jobApplicationSkill2.languageId
  );
  expect(updated_job_application_skill).toHaveProperty(
    "level",
    jobApplicationSkill2.level
  );
  expect(updated_job_application_skill).toHaveProperty(
    "is_preferred",
    jobApplicationSkill2.isPreferred
  );
  expect(updated_job_application_skill).toHaveProperty(
    "is_best",
    jobApplicationSkill2.is_best
  );
});

it("should delete the job application skill based upon id", async () => {
  const deleted_job_application_skill = await deleteJobApplicationSkill(
    jobApplicationSkill2.JobApplicationSkillId
  );
  expect(deleted_job_application_skill).toHaveProperty(
    "job_application_id",
    jobApplicationSkill2.JobApplicationId
  );
  expect(deleted_job_application_skill).toHaveProperty(
    "skill",
    jobApplicationSkill2.skill
  );
  expect(deleted_job_application_skill).toHaveProperty(
    "language_id",
    jobApplicationSkill2.languageId
  );
  expect(deleted_job_application_skill).toHaveProperty(
    "level",
    jobApplicationSkill2.level
  );
  expect(deleted_job_application_skill).toHaveProperty(
    "is_preferred",
    jobApplicationSkill2.isPreferred
  );
  expect(deleted_job_application_skill).toHaveProperty(
    "is_best",
    jobApplicationSkill2.is_best
  );
});
