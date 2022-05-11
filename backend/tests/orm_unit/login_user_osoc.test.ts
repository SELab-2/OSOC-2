import { prismaMock } from "./singleton";
import {
    addOsocToUser,
    deleteOsocsForLoginuser,
    deleteOsocsLoginConnectionFromOsoc,
} from "../../orm_functions/login_user_osoc";

test("should connect a login user with an osoc edition", async () => {
    const expected = {
        login_user_osoc_id: 0,
        login_user_id: 0,
        osoc_id: 0,
    };

    prismaMock.login_user_osoc.create.mockResolvedValue(expected);
    await expect(addOsocToUser(0, 0)).resolves.toEqual(expected);
});

test("should delete the instances related to the userId", async () => {
    const expected = { count: 0 };
    prismaMock.login_user_osoc.deleteMany.mockResolvedValue(expected);
    await expect(deleteOsocsForLoginuser(0)).resolves.toEqual(expected);
});

test("should delete the instances related to the osocId", async () => {
    const expected = { count: 0 };
    prismaMock.login_user_osoc.deleteMany.mockResolvedValue(expected);
    await expect(deleteOsocsLoginConnectionFromOsoc(0)).resolves.toEqual(
        expected
    );
});
