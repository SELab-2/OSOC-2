import {prismaMock} from "./singleton";
import {addSessionKey, changeSessionKey, checkSessionKey, removeAllKeysForUser} from "../../orm_functions/session_key";

test("should create a new session key for the user", async () => {

    const response = {session_key_id: 1, login_user_id: 0, session_key: "key"}

    prismaMock.session_keys.create.mockResolvedValue(response);
    await expect(addSessionKey(0, "key")).resolves.toEqual(response);

});

test("should return the found record", async () => {
    const response = {session_key_id: 1, login_user_id: 0, session_key: "key"}

    prismaMock.session_keys.findUnique.mockResolvedValue(response);
    await expect(checkSessionKey("key")).resolves.toEqual(response);
});

test("should update to the new sesion key", async () => {
    const response = {session_key_id: 1, login_user_id: 0, session_key: "key"}

    prismaMock.session_keys.update.mockResolvedValue(response);
    await expect(changeSessionKey("oldkey", "newkey")).resolves.toEqual(response);

});

test("should remove all keys from the user with the given key", async () => {

    // needed for the check session key
    const valid = {session_key_id: 1, login_user_id: 0, session_key: "key"}
    prismaMock.session_keys.findUnique.mockResolvedValue(valid);

    // for the removal
    const count = {count: 2}
    prismaMock.session_keys.deleteMany.mockResolvedValue(count);
    await expect(removeAllKeysForUser("key")).resolves.toEqual(count);


});