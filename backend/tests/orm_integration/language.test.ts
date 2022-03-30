import {UpdateLanguage} from "../../orm_functions/orm_types";
import {createLanguage, getAllLanguages, getLanguage,
    getLanguageByName, updateLanguage} from "../../orm_functions/language";

const language1: UpdateLanguage = {
    languageId: 0,
    name: "English"
}

const language2: UpdateLanguage = {
    languageId: 0,
    name: "German"
}

it('should create 1 new language with', async () => {
    const created_language = await createLanguage("English");
    language1.languageId = created_language.language_id;
    language2.languageId = created_language.language_id;
    expect(created_language).toHaveProperty("name", language1.name);
});

it('should find all the languages in the db, 3 in total', async () => {
    const searched_languages = await getAllLanguages();
    expect(searched_languages.length).toEqual(3);
    expect(searched_languages[2]).toHaveProperty("name", language1.name);
});

it('should return the language, by searching for its language id', async () => {
    const searched_language = await getLanguage(language1.languageId);
    expect(searched_language).toHaveProperty("name", language1.name);
});

it('should return the language, by searching for its name', async () => {
    const searched_language = await getLanguageByName(language1.name);
    expect(searched_language).toHaveProperty("name", language1.name);
});

it('should update language based upon language id', async () => {
    const updated_language = await updateLanguage(language2);
    expect(updated_language).toHaveProperty("name", language2.name);
});

//TODO: you can only remove languages that are NOT used in jobApplicationSkill otherwise everything will go wrong :/

// it('should delete the language based upon language id', async () => {
//     const deleted_language = await deleteLanguage(language2.languageId);
//     expect(deleted_language).toHaveProperty("name", language2.name);
// });
//
// it('should delete the language based upon language name', async () => {
//     const deleted_language = await deleteLanguageByName("French");
//     expect(deleted_language).toHaveProperty("name", "French");
// });