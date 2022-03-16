import {prismaMock} from "./singleton";
import {checkValidSessionAndRemove, getSessionKeys, setSessionId} from "../login_user";

const response = {
    session_id: "50",
    login_user_id: 1,
    person_id: 0,
    password: "password",
    is_admin: false,
    is_coach: false,
    session_keys: ["key1", "key2"]
}

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