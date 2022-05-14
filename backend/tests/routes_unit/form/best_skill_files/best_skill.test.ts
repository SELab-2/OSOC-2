import { errors } from "../../../../utility";

import { getBestSkill, readFile } from "../../../../routes/form";
import { Requests } from "../../../../types";
import Form = Requests.Form;

test("Best skill question absent", async () => {
    const data = await readFile(
        "../tests/routes_unit/form/best_skill_files",
        "bestSkillQuestionAbsent.json"
    );
    expect(data).not.toBeNull();

    await expect(getBestSkill(data as Form)).rejects.toBe(
        errors.cookArgumentError()
    );
});
