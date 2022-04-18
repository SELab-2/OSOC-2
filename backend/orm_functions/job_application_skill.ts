import prisma from "../prisma/prisma";
import {
  CreateJobApplicationSkill,
  UpdateJobApplicationSkill,
} from "./orm_types";

/**
 *
 * @param jobApplicationSkill: job application skill object with the needed information
 */
export async function createJobApplicationSkill(
  jobApplicationSkill: CreateJobApplicationSkill
) {
  return prisma.job_application_skill.create({
    data: {
      job_application_id: jobApplicationSkill.jobApplicationId,
      skill: jobApplicationSkill.skill,
      language_id: jobApplicationSkill.languageId,
      level: jobApplicationSkill.level,
      is_preferred: jobApplicationSkill.isPreferred,
      is_best: jobApplicationSkill.isBest,
    },
  });
}

/**
 *
 * @returns a list of all the jobapplicationskill objects in the database
 */
export async function getAllJobApplicationSkill() {
  return await prisma.job_application_skill.findMany();
}

/**
 *
 * @param jobApplicationId: this is the id of the job we are looking up in the database
 * @returns: object with all the info about this job_application_skill
 */
export async function getAllJobApplicationSkillByJobApplication(
  jobApplicationId: number
) {
  return await prisma.job_application_skill.findMany({
    where: {
      job_application_id: jobApplicationId,
    },
  });
}

/**
 *
 * @param jobApplicationSkillId: this is the id of the job application skill we are looking up in the database
 * @returns: object with all the info about this job_application_skill
 */
export async function getJobApplicationSkill(jobApplicationSkillId: number) {
  return await prisma.job_application_skill.findUnique({
    where: {
      job_application_skill_id: jobApplicationSkillId,
    },
  });
}

/**
 *
 * @param jobApplicationSkill: UpdateJobapplicationSkill object with the values that need to be updated
 * @returns the updated entry in the database
 */
export async function updateJobApplicationSkill(
  jobApplicationSkill: UpdateJobApplicationSkill
) {
  return await prisma.job_application_skill.update({
    where: {
      job_application_skill_id: jobApplicationSkill.JobApplicationSkillId,
    },
    data: {
      job_application_id: jobApplicationSkill.JobApplicationId,
      skill: jobApplicationSkill.skill,
      language_id: jobApplicationSkill.languageId,
      level: jobApplicationSkill.level,
      is_preferred: jobApplicationSkill.isPreferred,
      is_best: jobApplicationSkill.is_best,
    },
  });
}

/**
 *
 * @param jobApplicationSkillId the job application skill we are deleting from the table
 * @returns the job application, this info can be used to further remove the job application
 */
export async function deleteJobApplicationSkill(jobApplicationSkillId: number) {
  return await prisma.job_application_skill.delete({
    where: {
      job_application_skill_id: jobApplicationSkillId,
    },
    include: {
      // returns the job application, this info can be used to further remove the job application
      job_application: true,
    },
  });
}
