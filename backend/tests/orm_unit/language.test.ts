import { prismaMock } from "./singleton";
import {
  createLanguage,
  deleteLanguage,
  deleteLanguageByName,
  getAllLanguages,
  getLanguage,
  getLanguageByName,
  updateLanguage,
} from "../../orm_functions/language";

const returnValue = {
  language_id: 0,
  name: "languageName",
};

test("should create a new language record and return it", async () => {
  prismaMock.language.create.mockResolvedValue(returnValue);
  await expect(createLanguage("languageName")).resolves.toEqual(returnValue);
});

test("should return a list of all languages registered", async () => {
  const returnValue = [
    {
      language_id: 0,
      name: "languageName",
    },
  ];

  prismaMock.language.findMany.mockResolvedValue(returnValue);
  await expect(getAllLanguages()).resolves.toEqual(returnValue);
});

test("should return the language with the given id", async () => {
  prismaMock.language.findUnique.mockResolvedValue(returnValue);
  await expect(getLanguage(0)).resolves.toEqual(returnValue);
});

test("should return the asked language by name", async () => {
  prismaMock.language.findUnique.mockResolvedValue(returnValue);
  await expect(getLanguageByName("languageName")).resolves.toEqual(returnValue);
});

test("should update the given language", async () => {
  prismaMock.language.update.mockResolvedValue(returnValue);
  await expect(
    updateLanguage({ languageId: 0, name: "updated" })
  ).resolves.toEqual(returnValue);
});

test("should delete the language with the given id and return the deleted record", async () => {
  prismaMock.language.delete.mockResolvedValue(returnValue);
  await expect(deleteLanguage(0)).resolves.toEqual(returnValue);
});

test("should delete the given language name and its record and return the record", async () => {
  prismaMock.language.delete.mockResolvedValue(returnValue);
  await expect(deleteLanguageByName("languageName")).resolves.toEqual(
    returnValue
  );
});
