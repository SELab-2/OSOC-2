import { prismaMock } from "./singleton";
import { CreateProjectUser } from "../../orm_functions/orm_types";
import {
    createProjectUser,
    deleteProjectUser,
    getUsersFor,
} from "../../orm_functions/project_user";

const returnValue = {
    project_user_id: 0,
    login_user_id: 0,
    project_id: 0,
};

test("should create an project user in the db with the given object, returns the new record", async () => {
    const projectUser: CreateProjectUser = {
        loginUserId: 0,
        projectId: 0,
    };

    prismaMock.project_user.create.mockResolvedValue(returnValue);
    await expect(createProjectUser(projectUser)).resolves.toEqual(returnValue);
});

test("should return the loginusers associated with the project", async () => {
    prismaMock.project_user.findMany.mockResolvedValue([returnValue]);
    await expect(getUsersFor(0)).resolves.toEqual([returnValue]);
});

test("should delete the project user with the given id and return the deleted record", async () => {
    prismaMock.project_user.delete.mockResolvedValue(returnValue);
    await expect(deleteProjectUser(0)).resolves.toEqual(returnValue);
});
