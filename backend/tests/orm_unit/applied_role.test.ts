import {prismaMock} from "./singleton";
import { CreateAppliedRole } from "../../orm_functions/orm_types";
import {createAppliedRole, getAppliedRolesByJobApplication } from "../../orm_functions/applied_role";

const returnValue = {
    applied_role_id: 0,
    role_id: 0,
    job_application_id: 0
}

test("should create an applied role in the db with the given object, returns the new record", async () => {
    const appliedRole: CreateAppliedRole = {
        jobApplicationId: 0,
        roleId: 0
    };
 
     prismaMock.applied_role.create.mockResolvedValue(returnValue)
     await expect(createAppliedRole(appliedRole)).resolves.toEqual(returnValue);
 });

test("should return all the appliedroles given the application in the db", async () => {
    prismaMock.applied_role.findMany.mockResolvedValue([returnValue]);
    await expect(getAppliedRolesByJobApplication(0)).resolves.toEqual([returnValue]);
});
