import {prismaMock} from "./singleton";
import {getProjectRoleWithRoleName} from "../../orm_functions/role";

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