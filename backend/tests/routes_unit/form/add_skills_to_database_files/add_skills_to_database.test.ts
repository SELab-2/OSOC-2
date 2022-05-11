import { addSkillsToDatabase } from "../../../../routes/form";

import * as ormJoSk from "../../../../orm_functions/job_application_skill";
jest.mock("../../../../orm_functions/job_application_skill");
const ormJoSkMock = ormJoSk as jest.Mocked<typeof ormJoSk>;

import * as ormLa from "../../../../orm_functions/language";
jest.mock("../../../../orm_functions/language");
const ormLaMock = ormLa as jest.Mocked<typeof ormLa>;

test("Insert a job application in the database", async () => {
    ormLaMock.getLanguageByName.mockResolvedValueOnce({
        name: "Dutch",
        language_id: 1,
    });

    ormLaMock.getLanguageByName.mockResolvedValueOnce({
        name: "English",
        language_id: 2,
    });

    ormJoSkMock.createJobApplicationSkill.mockResolvedValueOnce({
        job_application_id: 1,
        skill: null,
        language_id: 1,
        job_application_skill_id: 1,
        level: null,
        is_preferred: true,
        is_best: false,
    });

    ormJoSkMock.createJobApplicationSkill.mockResolvedValueOnce({
        job_application_id: 1,
        skill: null,
        language_id: 2,
        job_application_skill_id: 2,
        level: 4,
        is_preferred: false,
        is_best: false,
    });

    ormJoSkMock.createJobApplicationSkill.mockResolvedValueOnce({
        job_application_id: 1,
        skill: "Basketball",
        language_id: null,
        job_application_skill_id: 3,
        level: null,
        is_preferred: false,
        is_best: true,
    });

    await expect(
        addSkillsToDatabase(
            {
                most_fluent_language: "Dutch",
                english_level: 4,
                best_skill: "Basketball",
            },
            { id: 1 }
        )
    ).resolves.toStrictEqual({});

    ormJoSkMock.createJobApplicationSkill.mockReset();
    ormLaMock.getLanguageByName.mockReset();
});

test("Insert a job application in the database", async () => {
    ormLaMock.getLanguageByName.mockResolvedValueOnce(null);

    ormLaMock.getLanguageByName.mockResolvedValueOnce(null);

    ormJoSkMock.createJobApplicationSkill.mockResolvedValueOnce({
        job_application_id: 1,
        skill: null,
        language_id: 1,
        job_application_skill_id: 1,
        level: null,
        is_preferred: true,
        is_best: false,
    });

    ormJoSkMock.createJobApplicationSkill.mockResolvedValueOnce({
        job_application_id: 1,
        skill: null,
        language_id: 2,
        job_application_skill_id: 2,
        level: 4,
        is_preferred: false,
        is_best: false,
    });

    ormJoSkMock.createJobApplicationSkill.mockResolvedValueOnce({
        job_application_id: 1,
        skill: "Basketball",
        language_id: null,
        job_application_skill_id: 3,
        level: null,
        is_preferred: false,
        is_best: true,
    });

    ormLaMock.createLanguage.mockResolvedValueOnce({
        language_id: 1,
        name: "Dutch",
    });

    ormLaMock.createLanguage.mockResolvedValueOnce({
        language_id: 2,
        name: "English",
    });

    await expect(
        addSkillsToDatabase(
            {
                most_fluent_language: "Dutch",
                english_level: 4,
                best_skill: "Basketball",
            },
            { id: 1 }
        )
    ).resolves.toStrictEqual({});

    ormJoSkMock.createJobApplicationSkill.mockReset();
    ormLaMock.getLanguageByName.mockReset();
    ormLaMock.createLanguage.mockReset();
});
