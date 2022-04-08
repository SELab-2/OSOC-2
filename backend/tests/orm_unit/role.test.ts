import {prismaMock} from "./singleton";
import { UpdateRole } from "../../orm_functions/orm_types";
import {getProjectRoleWithRoleName, createRole, getAllRoles,
    getRole, getRolesByName, updateRole, deleteRole, deleteRoleByName} 
    from "../../orm_functions/role";

const returnValue = {
    role_id: 0,
    name: "Developer"
}

test("should create a role in the db with the given name, returns the new record", async () => {
     prismaMock.role.create.mockResolvedValue(returnValue)
     await expect(createRole("Developer")).resolves.toEqual(returnValue);
 });


 test("should return all roles in the db", async () => {
    prismaMock.role.findMany.mockResolvedValue([returnValue]);
    await expect(getAllRoles()).resolves.toEqual([returnValue]);
});

test("should return the role object for the given role id", async () => {
    prismaMock.role.findUnique.mockResolvedValue(returnValue);
    await expect(getRole(0)).resolves.toEqual(returnValue);
});

test("should return the role object for the given name", async () => {
    prismaMock.role.findUnique.mockResolvedValue(returnValue);
    await expect(getRolesByName("Developer")).resolves.toEqual(returnValue);
});

test("should update the role with the new data and return the updated record", async () => {
    const role : UpdateRole = {
        roleId: 0,
        name: "Data scientist"
    };

    prismaMock.role.update.mockResolvedValue(returnValue);
    await expect(updateRole(role)).resolves.toEqual(returnValue);
});

test("should delete the role with the given id and return the deleted record", async () => {
    prismaMock.role.delete.mockResolvedValue(returnValue);
    await expect(deleteRole(0)).resolves.toEqual(returnValue);
});

test("should delete the role with the given name and return the deleted record", async () => {
    prismaMock.role.delete.mockResolvedValue(returnValue);
    await expect(deleteRoleByName("Data scientist")).resolves.toEqual(returnValue);
});


test("should return the id of the project_role with the given role name", async () => {

    const roleRes = {
        role_id: 0,
        name: "name"
    }

    const projectRoleRes = {
        project_role_id: 0,
        information: "",
        project_id: 1,
        role_id: 0,
        positions: 5
    }
    // case when the role_id was found for given name
    prismaMock.role.findUnique.mockResolvedValue(roleRes);
    prismaMock.project_role.findFirst.mockResolvedValue(projectRoleRes);
    await expect(getProjectRoleWithRoleName("name", 1)).resolves.toEqual(projectRoleRes)

    // case when no role_id found for given name
    const idNotFound = null;
    prismaMock.role.findUnique.mockResolvedValue(idNotFound);
    prismaMock.project_role.findFirst.mockResolvedValue(projectRoleRes);
    await expect(getProjectRoleWithRoleName("name", 1)).resolves.toEqual(idNotFound)
});