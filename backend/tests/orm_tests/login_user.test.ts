import {prismaMock} from "./singleton";
import {account_status_enum} from "@prisma/client";
import { CreateLoginUser, UpdateLoginUser } from "../../orm_functions/orm_types";
import {checkValidSessionAndRemove, createLoginUser, getAllLoginUsers, 
    getSessionKeys, setSessionId, getPasswordLoginUserByPerson, 
    getPasswordLoginUser, searchLoginUserByPerson, searchAllAdminLoginUsers,
    searchAllCoachLoginUsers, searchAllAdminAndCoachLoginUsers, updateLoginUser, 
    deleteLoginUserById, deleteLoginUserByPersonId} 
    from "../../orm_functions/login_user";


const response = {
    session_id: "50",
    login_user_id: 1,
    person_id: 0,
    password: "password",
    is_admin: false,
    is_coach: false,
    session_keys: ["key1", "key2"],
    account_status: account_status_enum.DISABLED
}

const returnValue = {
    login_user_id: 0,
    person_id: 0,
    password: "Password",
    is_admin: true,
    is_coach: true,
    account_status: account_status_enum.ACTIVATED,
    session_keys: []
}

test("should create a login user in the db with the given object, returns the new record", async () => {
    const loginUser: CreateLoginUser = {
        personId: 0,
        password: "Password",
        isAdmin: true,
        isCoach: true,
        accountStatus: account_status_enum.ACTIVATED
    };
 
     prismaMock.login_user.create.mockResolvedValue(returnValue)
     await expect(createLoginUser(loginUser)).resolves.toEqual(returnValue);
 });

 test("should return all login users in the db", async () => {
    prismaMock.login_user.findMany.mockResolvedValue([returnValue]);
    await expect(getAllLoginUsers()).resolves.toEqual([returnValue]);
});

test("should return the HASHED password of the given person", async () => {
    prismaMock.login_user.findUnique.mockResolvedValue(returnValue);
    await expect(getPasswordLoginUserByPerson(0)).resolves.toEqual(returnValue);
});

test("should return the HASHED password of the given login user", async () => {
    prismaMock.login_user.findUnique.mockResolvedValue(returnValue);
    await expect(getPasswordLoginUser(0)).resolves.toEqual(returnValue);
});

test("should return the searched login user record with the given person id", async () => {
    prismaMock.login_user.findMany.mockResolvedValue([returnValue]);
    await expect(searchLoginUserByPerson(0)).resolves.toEqual([returnValue]);
});

test("should return all the login user records that are admin", async () => {
    prismaMock.login_user.findMany.mockResolvedValue([returnValue]);
    await expect(searchAllAdminLoginUsers(true)).resolves.toEqual([returnValue]);
});

test("should return all the login user records that are coach", async () => {
    prismaMock.login_user.findMany.mockResolvedValue([returnValue]);
    await expect(searchAllCoachLoginUsers(true)).resolves.toEqual([returnValue]);
});

test("should return all the login user records that are coach aswell as admin", async () => {
    prismaMock.login_user.findMany.mockResolvedValue([returnValue]);
    await expect(searchAllAdminAndCoachLoginUsers(true)).resolves.toEqual([returnValue]);
});

test("should update the login user with the new data and return the updated record", async () => {
    const loginUser : UpdateLoginUser = {
        loginUserId: 0,
        password: "New_pass",
        isAdmin: false,
        isCoach: false,
    };

    prismaMock.login_user.update.mockResolvedValue(returnValue);
    await expect(updateLoginUser(loginUser)).resolves.toEqual(returnValue);
});

test("should delete the login user with the given id and return the deleted record", async () => {
    prismaMock.login_user.delete.mockResolvedValue(returnValue);
    await expect(deleteLoginUserById(0)).resolves.toEqual(returnValue);
});

test("should delete the login user with the given person id and return the deleted record", async () => {
    prismaMock.login_user.delete.mockResolvedValue(returnValue);
    await expect(deleteLoginUserByPersonId(0)).resolves.toEqual(returnValue);
});

test("should return true if the given session id is valid", async () => {
    // for the return value of getSessionKeys
    prismaMock.login_user.findUnique.mockResolvedValue(response);

    prismaMock.login_user.update.mockResolvedValue(response);
    await expect(checkValidSessionAndRemove(1, "key2")).resolves.toEqual(true);
});

test("should return false if the given session id is invalid", async () => {
    // for the return value of getSessionKeys
    prismaMock.login_user.findUnique.mockResolvedValue(response);

    prismaMock.login_user.update.mockResolvedValue(response);
    await expect(checkValidSessionAndRemove(1, "key")).resolves.toEqual(false);
});

test("should return all the session keys of the specified loginUser", async () => {
    prismaMock.login_user.findUnique.mockResolvedValue(response);
    await expect(getSessionKeys(50)).resolves.toEqual(response);
});

test("should set the new sessionKeys", async () => {
    // for the return value of getSessionKeys
    prismaMock.login_user.findUnique.mockResolvedValue(response);
    const new_response = response;
    new_response.session_keys.push("key3");
    prismaMock.login_user.update.mockResolvedValue(new_response);
    await expect(setSessionId(0, "50")).resolves.toEqual(new_response);
});

test("should return a rejected promise", async () => {
    // for the return value of getSessionKeys
    await expect(setSessionId(0, "50")).rejects.toEqual(new Error("login user id does not exist in the database"))
});