import prisma from "../../prisma/prisma";
import {addSessionKey, checkSessionKey} from "../../orm_functions/session_key";

it("should create a new session key for the given login user", async () =>{
    const loginUsers = await prisma.login_user.findMany();

    const newKey = "newKey";

    const created = await addSessionKey(loginUsers[0].login_user_id, newKey);

    expect(created).toHaveProperty("login_user_id", loginUsers[0].login_user_id);
    expect(created).toHaveProperty("session_key", newKey);
});

it("should return the loginUser associated with the key", async () => {
    const loginUsers = await prisma.login_user.findMany();

    const found_user = await checkSessionKey("key");
    expect(found_user).toHaveProperty("login_user_id", loginUsers[0].login_user_id);
});

it("should return an error because the key doesn't exist", async () => {
    try {
        await checkSessionKey("doesn't exist");
        // should not get executed because checkSessionKey should throw error because key doesn't exist
        expect(false).toBeTruthy()
    } catch (e) {
        expect(e).toBeInstanceOf(Error);
    }
});



