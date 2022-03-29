import prisma from "../../prisma/prisma";

it("should do nothing", async () => {
    await prisma.job_application.findMany();
    expect(true).toBeTruthy();
});