import {prismaMock} from "./singleton";
import { CreateProjectUser } from "../../orm_functions/orm_types";
import {createProjectUser } from "../../orm_functions/project_user";

const returnValue = {
    login_user_id: 0,
    project_id: 0
}

test("should create an project user in the db with the given object, returns the new record", async () => {
    const projectUser: CreateProjectUser = {
        loginUserId: 0,
        projectId: 0
    };
 
     prismaMock.project_user.create.mockResolvedValue(returnValue)
     await expect(createProjectUser(projectUser)).resolves.toEqual(returnValue);
 });
