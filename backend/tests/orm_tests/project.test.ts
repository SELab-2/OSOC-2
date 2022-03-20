import {prismaMock} from "./singleton";
import { CreateProject, UpdateProject } from "../../orm_functions/orm_types";
import {createProject, getProjectByName, getAllProjects,
    getProjectsByOsocEdition, getProjectsByPartner, getProjectsStartedAfterDate,
    getProjectsByStartDate, getProjectsStartedBeforeDate, getProjectsByEndDate,
    getProjectsEndedBeforeDate, getProjectsEndedAfterDate, getProjectsByNumberPositions,
    getProjectsLessPositions, getProjectsMorePositions, deleteProject, updateProject,
    deleteProjectByOsocEdition, deleteProjectByPartner}
    from "../../orm_functions/project";

const returnValue = {
    project_id: 0,
    name: "Test project",
    osocId: 0,
    partner: "Best partner",
    startDate: new Date("2022-07-13"),
    endDate: new Date("2022-08-31"),
    positions: 10
}

test("should create a project in the db with the given object, returns the new record", async () => {
    const project: CreateProject = {
        name: "Test project",
        osocId: 0,
        partner: "Best partner",
        startDate: new Date("2022-07-13"),
        endDate: new Date("2022-08-31"),
        positions: 10
    };
 
     prismaMock.project.create.mockResolvedValue(returnValue)
     await expect(createProject(project)).resolves.toEqual(returnValue);
});

test("should return all projects in the db", async () => {
    prismaMock.project.findMany.mockResolvedValue([returnValue]);
    await expect(getAllProjects()).resolves.toEqual([returnValue]);
});

test("should return all the projects with the given name", async () => {
    prismaMock.project.findMany.mockResolvedValue(returnValue);
    await expect(getProjectByName("Test project")).resolves.toEqual(returnValue);
});

test("should return all the projects with the given osoc edition", async () => {
    prismaMock.project.findMany.mockResolvedValue(returnValue);
    await expect(getProjectsByOsocEdition(0)).resolves.toEqual(returnValue);
});

test("should return all the project with the given partner name", async () => {
    prismaMock.project.findMany.mockResolvedValue(returnValue);
    await expect(getProjectsByPartner("Best partner")).resolves.toEqual(returnValue);
});

test("should return all the project with the given start date", async () => {
    prismaMock.project.findMany.mockResolvedValue(returnValue);
    await expect(getProjectsByStartDate(new Date("2022-07-13"))).resolves.toEqual(returnValue);
});

test("should return all the project that started after the given start date", async () => {
    prismaMock.project.findMany.mockResolvedValue(returnValue);
    await expect(getProjectsStartedAfterDate(new Date("2022-01-01"))).resolves.toEqual(returnValue);
});

test("should return all the project that started before the given start date", async () => {
    prismaMock.project.findMany.mockResolvedValue(returnValue);
    await expect(getProjectsStartedBeforeDate(new Date("2023-01-01"))).resolves.toEqual(returnValue);
});

test("should return all the project with the given end date", async () => {
    prismaMock.project.findMany.mockResolvedValue(returnValue);
    await expect(getProjectsByEndDate(new Date("2022-08-31"))).resolves.toEqual(returnValue);
});

test("should return all the project that ended after the given end date", async () => {
    prismaMock.project.findMany.mockResolvedValue(returnValue);
    await expect(getProjectsEndedAfterDate(new Date("2022-01-01"))).resolves.toEqual(returnValue);
});

test("should return all the project that ended before the given end date", async () => {
    prismaMock.project.findMany.mockResolvedValue(returnValue);
    await expect(getProjectsEndedBeforeDate(new Date("2023-01-01"))).resolves.toEqual(returnValue);
});

test("should return all the projects with the given number of positions", async () => {
    prismaMock.project.findMany.mockResolvedValue(returnValue);
    await expect(getProjectsByNumberPositions(10)).resolves.toEqual(returnValue);
});

test("should return all the projects with less positions", async () => {
    prismaMock.project.findMany.mockResolvedValue(returnValue);
    await expect(getProjectsLessPositions(20)).resolves.toEqual(returnValue);
});

test("should return all the projects with more positions", async () => {
    prismaMock.project.findMany.mockResolvedValue(returnValue);
    await expect(getProjectsMorePositions(5)).resolves.toEqual(returnValue);
});

test("should update the project with the new data and return the updated record", async () => {
    const project : UpdateProject = {
        projectId: 0,
        name: "Different project",
        osocId: 0,
        partner: "UGent",
        startDate: new Date("2022-06-05"),
        endDate: new Date("2022-09-16"),
        positions: 7
    };

    prismaMock.project.update.mockResolvedValue(returnValue);
    await expect(updateProject(project)).resolves.toEqual(returnValue);
});

test("should delete the project with the given id and return the deleted record", async () => {
    prismaMock.project.delete.mockResolvedValue(returnValue);
    await expect(deleteProject(0)).resolves.toEqual(returnValue);
});

test("should delete all the projects with the given osoc id and return the deleted record", async () => {
    prismaMock.project.deleteMany.mockResolvedValue(returnValue);
    await expect(deleteProjectByOsocEdition(0)).resolves.toEqual(returnValue);
});

test("should delete all the projects with the given partner name and return the deleted record", async () => {
    prismaMock.project.deleteMany.mockResolvedValue(returnValue);
    await expect(deleteProjectByPartner("UGent")).resolves.toEqual(returnValue);
});
