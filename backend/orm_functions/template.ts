import prisma from "../prisma/prisma";

import { CreateTemplate, UpdateTemplate } from "./orm_types";

export async function getAllTemplates() {
    return prisma.template_email.findMany();
}

export async function getTemplateById(templateId: number) {
    return prisma.template_email.findUnique({
        where: { template_email_id: templateId },
    });
}

export async function getTemplatesByName(name: string) {
    return prisma.template_email.findMany({
        where: { name: name },
        include: { login_user: true },
    });
}

export async function createTemplate(data: CreateTemplate) {
    return prisma.template_email.create({
        data: {
            owner_id: data.ownerId,
            name: data.name,
            content: data.content,
            cc: data.cc,
            subject: data.subject,
        },
    });
}

export async function updateTemplate(data: UpdateTemplate) {
    return prisma.template_email.update({
        where: { template_email_id: data.templateId },
        data: {
            content: data.content,
            name: data.name,
            owner_id: data.ownerId,
            cc: data.cc,
            subject: data.subject,
        },
    });
}

export async function deleteTemplate(id: number) {
    return prisma.template_email.delete({ where: { template_email_id: id } });
}
