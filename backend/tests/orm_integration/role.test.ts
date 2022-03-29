import {UpdateRole} from "../../orm_functions/orm_types";
import {createRole, getAllRoles, getRolesByName, getRole,
    getProjectRoleWithRoleName, updateRole, deleteRole, deleteRoleByName} from "../../orm_functions/role";
import prisma_project from "../../prisma/prisma";


const role1: UpdateRole = {
    roleId: 0,
    name: "Data Scientist"
}

const role2: UpdateRole = {
    roleId: 0,
    name: "Web Designer"
}

it('should create 1 new role where', async () => {
    const created__role = await createRole("Data Scientist");
    role1.roleId = created__role.role_id;
    role2.roleId = created__role.role_id;
    expect(created__role).toHaveProperty("role_id", role1.roleId);
    expect(created__role).toHaveProperty("name", role1.name);
});

it('should find all the roles in the db, 3 in total', async () => {
    const searched_roles = await getAllRoles();
    expect(searched_roles.length).toEqual(3);
    expect(searched_roles[2]).toHaveProperty("name", role1.name);
});


it('should return the role, by searching for its role id', async () => {
    const searched_role = await getRole(role1.roleId);
    expect(searched_role).toHaveProperty("name", role1.name);
});

it('should return the role, by searching for its role name', async () => {
    const searched_role = await getRolesByName(role1.name);
    expect(searched_role).toHaveProperty("name", role1.name);
});

it('should return the project role, by searching for its role name and project id', async () => {
    const project = await prisma_project.project.findFirst()
    const searched_role = await getProjectRoleWithRoleName("Developer", project!.project_id);
    expect(searched_role).toHaveProperty("positions", 3);
});

it('should update role based upon role id', async () => {
    const updated_role = await updateRole(role2);
    expect(updated_role).toHaveProperty("name", role2.name);
});

it('should delete the project based upon role id', async () => {
    const deleted_role = await deleteRole(role2.roleId);
    expect(deleted_role).toHaveProperty("name", role2.name);
});

it('should delete the project based upon role name', async () => {
    const deleted_role = await deleteRoleByName("Marketeer");
    expect(deleted_role).toHaveProperty("name", "Marketeer");
});
