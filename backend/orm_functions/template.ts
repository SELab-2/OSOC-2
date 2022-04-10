import prisma from '../prisma/prisma';

export async function getAllTemplates() {
  return prisma.template_email.findMany();
}
