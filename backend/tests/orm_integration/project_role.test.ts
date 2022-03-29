import {CreateProjectRole, UpdateProjectRole} from "../../orm_functions/orm_types";
import {createProjectRole, getProjectRolesByProject, getNumberOfRolesByProjectAndRole,
    getProjectRoleNamesByProject, updateProjectRole, deleteProjectRole, getNumberOfFreePositions} from "../../orm_functions/project_role";
import {getAllProjects} from "../../orm_functions/project";
import {getRolesByName} from "../../orm_functions/role";

const projectRole1: UpdateProjectRole = {
    projectRoleId: 0,
    projectId: 1,
    roleId: 1,
    positions: 2
}

const projectRole2: UpdateProjectRole = {
    projectRoleId: 0,
    projectId: 1,
    roleId: 1,
    positions: 3
}

it('should create 1 new project where osoc is 2022', async () => {
    const projects = await getAllProjects();
    const role = await getRolesByName("Developer");
    const projectRole: CreateProjectRole = {
        projectId: projects[0].project_id,
        roleId: role!.role_id,
        positions: 2
    }
    projectRole1.projectId = projects[0].project_id;
    projectRole1.roleId = role!.role_id;
    projectRole2.projectId = projects[0].project_id;
    projectRole2.roleId = role!.role_id;

    const created_project_role = await createProjectRole(projectRole);
    projectRole1.projectRoleId = created_project_role.project_role_id;
    projectRole2.projectRoleId = created_project_role.project_role_id;
    expect(created_project_role).toHaveProperty("project_id", projectRole1.projectId);
    expect(created_project_role).toHaveProperty("role_id", projectRole1.roleId);
    expect(created_project_role).toHaveProperty("positions", projectRole1.positions);
});

it('should return the project role, by searching for its project', async () => {
    const searched_project_role = await getProjectRolesByProject(projectRole1.projectId);
    expect(searched_project_role[0]).toHaveProperty("project_id", projectRole1.projectId);
    expect(searched_project_role[0]).toHaveProperty("role_id", projectRole1.roleId);
    expect(searched_project_role[0]).toHaveProperty("positions", projectRole1.positions);
});

it('should return the project role, by searching for its project and projectrole', async () => {
    const searched_project_role = await getNumberOfRolesByProjectAndRole(projectRole1.projectId, projectRole1.projectRoleId);
    expect(searched_project_role[0]).toHaveProperty("project_id", projectRole1.projectId);
    expect(searched_project_role[0]).toHaveProperty("role_id", projectRole1.roleId);
    expect(searched_project_role[0]).toHaveProperty("positions", projectRole1.positions);
});

it('should return the project role and role, by searching for its project role id', async () => {
    const searched_project_role = await getProjectRoleNamesByProject(projectRole1.projectId);
    expect(searched_project_role[0]).toHaveProperty("project_id", projectRole1.projectId);
    expect(searched_project_role[0]).toHaveProperty("role_id", projectRole1.roleId);
    expect(searched_project_role[0]).toHaveProperty("positions", projectRole1.positions);
});

it('should return the the number of free positions, by searching for its project role id', async () => {
    const number_of_positions = await getNumberOfFreePositions(projectRole1.projectRoleId);
    expect(number_of_positions).toEqual(2);
});

it('should update projectrole based upon project role id', async () => {
    const updated_project = await updateProjectRole(projectRole2);
    expect(updated_project).toHaveProperty("project_id", projectRole2.projectId);
    expect(updated_project).toHaveProperty("role_id", projectRole2.roleId);
    expect(updated_project).toHaveProperty("positions", projectRole2.positions);
});

it('should delete the project role based upon project role id', async () => {
    const deleted_project = await deleteProjectRole(projectRole2.projectRoleId);
    expect(deleted_project).toHaveProperty("project_id", projectRole2.projectId);
    expect(deleted_project).toHaveProperty("role_id", projectRole2.roleId);
    expect(deleted_project).toHaveProperty("positions", projectRole2.positions);
});
