import prisma from "../../prisma/prisma";
import {
    addSessionKey,
    refreshKey,
    checkSessionKey,
    removeAllKeysForUser,
} from "../../orm_functions/session_key";

import "../integration_setup";

it("should create a new session key for the given login user", async () => {
    const loginUsers = await prisma.login_user.findMany();

    const newKey = "newKey";
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10);

    const created = await addSessionKey(
        loginUsers[0].login_user_id,
        newKey,
        futureDate
    );

    expect(created).toHaveProperty(
        "login_user_id",
        loginUsers[0].login_user_id
    );
    expect(created).toHaveProperty("session_key", newKey);
    expect(created).toHaveProperty("valid_until", futureDate);
});

it("should return the loginUser associated with the key", async () => {
    const loginUsers = await prisma.login_user.findMany();
    const found_users = await checkSessionKey("newKey");
    expect(found_users).toHaveProperty(
        "login_user_id",
        loginUsers[0].login_user_id
    );
});

it("should return an error because the key doesn't exist", async () => {
    try {
        await checkSessionKey("doesn't exist");
        // should not get executed because checkSessionKey should throw error because key doesn't exist
        expect(false).toBeTruthy();
    } catch (e) {
        expect(e).toBeInstanceOf(Error);
    }
});

it("should overwrite the old key with the new key", async () => {
    const existing_keys = await prisma.session_keys.findMany();

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 20);
    const updated = await refreshKey(existing_keys[0].session_key, futureDate);
    expect(updated).toHaveProperty(
        "login_user_id",
        existing_keys[0].login_user_id
    );
    expect(updated).toHaveProperty("session_key", existing_keys[0].session_key);
    expect(updated).toHaveProperty("valid_until", futureDate);

    const updated_keys = await prisma.session_keys.findMany({
        where: {
            login_user_id: existing_keys[0].login_user_id,
        },
    });

    let updated_found = false;
    updated_keys.forEach((record) => {
        if (record.session_key === existing_keys[0].session_key) {
            updated_found = true;
        }
    });
    if (!updated_found) {
        // should never get executed if the updated succeeded!
        expect(false).toBeTruthy();
    }
});

it("should delete all session keys of the user with given key", async () => {
    const login_users = await prisma.login_user.findMany();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 15);

    await prisma.session_keys.create({
        data: {
            login_user_id: login_users[1].login_user_id,
            session_key: "key_user1",
            valid_until: futureDate,
        },
    });

    const deleted = await removeAllKeysForUser("key");
    expect(deleted).toHaveProperty("count", 3);
    const remaining_keys = await prisma.session_keys.findMany();
    expect(remaining_keys.length).toEqual(1);
    expect(remaining_keys[0]).toHaveProperty(
        "login_user_id",
        login_users[1].login_user_id
    );

    await removeAllKeysForUser("key_user1");
});
