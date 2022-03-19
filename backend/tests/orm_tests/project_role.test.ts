import {prismaMock} from "./singleton";
import {getNumberOfFreePositions} from "../../orm_functions/project_role";

test("should return the number of free positions", async () => {
    const projectRoleRes = {
        project_role_id: 0,
        information: "",
        project_id: 1,
        role_id: 0,
        positions: 5,
        contract: ['', '']
    }

    prismaMock.project_role.findUnique.mockResolvedValue(projectRoleRes);
    // expected length is 3, because positions == 5 and contract == ["", ""] (array with length 2)
    await expect(getNumberOfFreePositions(0)).resolves.toEqual(3)
});