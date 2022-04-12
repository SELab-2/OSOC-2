import prisma from "../../prisma/prisma";
import {
    addSessionKey,
    changeSessionKey,
    checkSessionKey,
    removeAllKeysForLoginUserId,
    removeAllKeysForUser
} from "../../orm_functions/session_key";

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

it("should overwrite the old key with the new key", async () => {
    const existing_keys = await prisma.session_keys.findMany();

    const newkey = "newkey"
    const updated = await changeSessionKey(existing_keys[0].session_key, newkey);
    expect(updated).toHaveProperty("login_user_id", existing_keys[0].login_user_id);
    expect(updated).toHaveProperty("session_key", newkey);

    const updated_keys = await prisma.session_keys.findMany({
        where: {
            login_user_id: existing_keys[0].login_user_id
        }
    });

    let updated_found = false;
    updated_keys.forEach((record) => {
        if (record.session_key === existing_keys[0].session_key) {
            // should never get executed because old key should be overwritten
            expect(false).toBeTruthy();
        }
        if (record.session_key === updated.session_key) {
            updated_found = true;
        }
    });
    if (!updated_found) {
        // should never get executed if the updated succeeded!
        expect(false).toBeTruthy()
    }
});

it("should delete all session keys of the user with given key", async () => {
    const login_users = await prisma.login_user.findMany()

    await prisma.session_keys.create({
        data : {
            login_user_id: login_users[1].login_user_id,
            session_key: "key_user1"
        }
    });

    const deleted = await removeAllKeysForUser("newkey");
    expect(deleted).toHaveProperty("count", 3);

    const remaining_keys = await prisma.session_keys.findMany();
    expect(remaining_keys.length).toEqual(1);
    expect(remaining_keys[0]).toHaveProperty("login_user_id", login_users[1].login_user_id);

    await removeAllKeysForUser("key_user1");
});


it("should delete all session keys of the user with given key", async () => {
    const login_users = await prisma.login_user.findMany()
    console.log(await prisma.session_keys.findMany());
    await prisma.session_keys.createMany({
        data : [
            {
            login_user_id: login_users[1].login_user_id,
            session_key: "key_user1"
            },
            {
                login_user_id: login_users[1].login_user_id,
                session_key: "key_user2"
            },
        ]
    });

    const deleted = await removeAllKeysForLoginUserId(login_users[1].login_user_id);
    expect(deleted).toHaveProperty("count", 2);

    const remaining_keys = await prisma.session_keys.findMany();
    expect(remaining_keys.length).toEqual(0);
});


