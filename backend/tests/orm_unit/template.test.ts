import { prismaMock } from "./singleton";
import {
    createTemplate,
    deleteTemplate,
    getAllTemplates,
    getTemplateById,
    getTemplatesByName,
    updateTemplate,
} from "../../orm_functions/template";

const template = {
    template_email_id: 0,
    owner_id: 0,
    name: "",
    content: "",
    subject: "",
    cc: "",
};

test("should return a list of all templates", async () => {
    const expected = [template];
    prismaMock.template_email.findMany.mockResolvedValue(expected);
    await expect(getAllTemplates()).resolves.toEqual(expected);
});

test("should return the template with the given id", async () => {
    prismaMock.template_email.findUnique.mockResolvedValue(template);
    await expect(getTemplateById(0)).resolves.toEqual(template);
});

test("should return the templates with the given name", async () => {
    const expected = [template];
    prismaMock.template_email.findMany.mockResolvedValue(expected);
    await expect(getTemplatesByName("name")).resolves.toEqual(expected);
});

test("should return the created template", async () => {
    prismaMock.template_email.create.mockResolvedValue(template);
    await expect(
        createTemplate({
            ownerId: 0,
            name: "",
            content: "",
            cc: "",
            subject: "",
        })
    ).resolves.toEqual(template);
});

test("should return the updated template", async () => {
    prismaMock.template_email.update.mockResolvedValue(template);
    await expect(
        updateTemplate({
            templateId: 0,
            ownerId: 0,
            name: "",
            content: "",
            cc: "",
            subject: "",
        })
    ).resolves.toEqual(template);
});

test("should delete the template with the given id", async () => {
    prismaMock.template_email.delete.mockResolvedValue(template);
    await expect(deleteTemplate(0)).resolves.toEqual(template);
});
