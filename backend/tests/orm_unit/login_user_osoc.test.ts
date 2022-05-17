import { prismaMock } from "./singleton";
import {
    addOsocToUser,
    deleteOsocsForLoginuser,
    deleteOsocsLoginConnectionFromOsoc,
    getLoginUserOsocByIds,
    getOsocYearsForLoginUserById,
    removeOsocFromUser,
} from "../../orm_functions/login_user_osoc";

const entries = [
    {
        login_user_id: 0,
        login_user_osoc_id: 0,
        osoc_id: 0,
    },
];

test("should return the entry with given id's", async () => {
    prismaMock.login_user_osoc.findMany.mockResolvedValue(entries);

    await expect(getLoginUserOsocByIds(0, 0)).resolves.toEqual(entries[0]);
});

test("should return null because the entry does not exist", async () => {
    prismaMock.login_user_osoc.findMany.mockResolvedValue([]);
    await expect(getLoginUserOsocByIds(0, 0)).resolves.toEqual(null);
});

test("should connect a login user with an osoc edition", async () => {
    prismaMock.login_user_osoc.findMany.mockResolvedValue(entries);

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

test("should connect a login user with an osoc edition", async () => {
    prismaMock.login_user_osoc.findMany.mockResolvedValue(entries);

    const expected = { count: 0 };

    prismaMock.login_user_osoc.deleteMany.mockResolvedValue(expected);
    await expect(removeOsocFromUser(0, 0)).resolves.toEqual(expected);
});

test("should return a list of visible editions", async () => {
    prismaMock.login_user_osoc.findMany.mockResolvedValue(entries);
    await expect(getOsocYearsForLoginUserById(0)).resolves.toEqual(entries);
});
