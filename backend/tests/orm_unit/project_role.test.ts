import { prismaMock } from "./singleton";
import {
  CreateProjectRole,
  UpdateProjectRole,
} from "../../orm_functions/orm_types";
import {
  getNumberOfFreePositions,
  createProjectRole,
  getProjectRolesByProject,
  getNumberOfRolesByProjectAndRole,
  getProjectRoleNamesByProject,
  updateProjectRole,
  deleteProjectRole,
} from "../../orm_functions/project_role";

const returnValue = {
  project_role_id: 0,
  project_id: 0,
  role_id: 0,
  positions: 3,
};

test("should create a project role in the db with the given object, returns the new record", async () => {
  const projectRole: CreateProjectRole = {
    projectId: 0,
    roleId: 0,
    positions: 3,
  };

  prismaMock.project_role.create.mockResolvedValue(returnValue);
  await expect(createProjectRole(projectRole)).resolves.toEqual(returnValue);
});

test("should return all project roles assigned to given project", async () => {
  prismaMock.project_role.findMany.mockResolvedValue([returnValue]);
  await expect(getProjectRolesByProject(0)).resolves.toEqual([returnValue]);
});

test("should return the number of roles for the given project and project role", async () => {
  prismaMock.project_role.findMany.mockResolvedValue([returnValue]);
  await expect(getNumberOfRolesByProjectAndRole(0, 0)).resolves.toEqual([
    returnValue,
  ]);
});

test("should return all the names of the project roles for the given project", async () => {
  prismaMock.project_role.findMany.mockResolvedValue([returnValue]);
  await expect(getProjectRoleNamesByProject(0)).resolves.toEqual([returnValue]);
});

test("should update the project role with the new data and return the updated record", async () => {
  const projectRole: UpdateProjectRole = {
    projectRoleId: 0,
    positions: 5,
    projectId: 0,
    roleId: 1,
  };

  prismaMock.project_role.update.mockResolvedValue(returnValue);
  await expect(updateProjectRole(projectRole)).resolves.toEqual(returnValue);
});

test("should delete the project roler with the given id and return the deleted record", async () => {
  prismaMock.project_role.delete.mockResolvedValue(returnValue);
  await expect(deleteProjectRole(0)).resolves.toEqual(returnValue);
});

test("should return the number of free positions", async () => {
  const projectRoleRes = {
    project_role_id: 0,
    information: "",
    project_id: 1,
    role_id: 0,
    positions: 5,
    contract: ["", ""],
  };

  prismaMock.project_role.findUnique.mockResolvedValue(projectRoleRes);
  // expected length is 3, because positions == 5 and contract == ["", ""] (array with length 2)
  await expect(getNumberOfFreePositions(0)).resolves.toEqual(3);
});

test("should return null because the project_role with given ID was not found", async () => {
  prismaMock.project_role.findUnique.mockResolvedValue(null);
  await expect(getNumberOfFreePositions(0)).resolves.toEqual(null);
});
