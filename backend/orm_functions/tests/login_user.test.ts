import {prismaMock} from "./singleton";
import {checkValidSession, setSessionId} from "../login_user";

const response = {
    session_id: "50",
    login_user_id: 1,
    person_id: 0,
    password: "password",
    is_admin: false,
    is_coach: false
}

test("should return if the given session id is valid", async () => {
    prismaMock.login_user.findUnique.mockResolvedValue(response)
    await expect(checkValidSession("50")).resolves.toEqual(response);
});

test("should set the new session id", async () => {
    prismaMock.login_user.update.mockResolvedValue(response);
    await expect(setSessionId(0, "50")).resolves.toEqual(response);
})