import { readDataTestForms } from "./filter_question.test";
import * as config from "../../../routes/form_keys.json";
import * as form_router from "../../../routes/form";

describe.each([
    config.liveInBelgium,
    config.volunteerInfo,
    config.workInJuly,
    config.nickname,
    config.gender,
    config.addPronouns,
    config.preferredPronouns,
    config.mostFluentLanguage,
    config.englishLevel,
    config.edus,
    config.eduLevel,
    config.appliedRole,
    config.alumni,
    config.studentCoach,
])("Options present", (key) => {
    if (typeof key === "string") {
        readDataTestForms().forEach((form) => {
            it(`The options of the question with key ${key} are present`, () => {
                const question = form_router.filterQuestion(form, key);
                if (question.data !== null) {
                    const option = form_router.filterChosenOption(
                        question.data
                    );
                    if (question.data.value === null) {
                        expect(option.data).toBe(null);
                    } else {
                        if (option.data !== null) {
                            expect(option.data).toHaveProperty("id");
                            expect(option.data).toHaveProperty("text");
                        }
                    }
                }
            });
        });
    }
});
