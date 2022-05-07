import prisma from "../../prisma/prisma";
import {
    createOrUpdateReset,
    findResetByCode,
    deleteResetWithLoginUser,
    deleteResetWithResetId,
} from "../../orm_functions/password_reset";

const newReset = "5444024619724212170969914212450321";
const date = new Date("2022-07-13");

import "../integration_setup";

it("should create a new password resety for the given login user", async () => {
    const loginUser = await prisma.login_user.findFirst();

    if (loginUser) {
        const created_password_reset = await createOrUpdateReset(
            loginUser.login_user_id,
            newReset,
            date
        );

        expect(created_password_reset).toHaveProperty(
            "login_user_id",
            loginUser.login_user_id
        );
        expect(created_password_reset).toHaveProperty("reset_id", newReset);
        expect(created_password_reset).toHaveProperty("valid_until", date);
    }
});

it("should return the password reset by searching for its the key", async () => {
    const found_password_reset = await findResetByCode(newReset);
    expect(found_password_reset).toHaveProperty("reset_id", newReset);
    expect(found_password_reset).toHaveProperty("valid_until", date);
});

it("should delete the password reset based upon its id", async () => {
    const deleted_password_reset = await deleteResetWithResetId(newReset);
    expect(deleted_password_reset).toHaveProperty("reset_id", newReset);
    expect(deleted_password_reset).toHaveProperty("valid_until", date);
});

it("should delete the password reset based upon login user id", async () => {
    const loginUsers = await prisma.login_user.findMany();
    const password_reset = await prisma.password_reset.findFirst();

    if (loginUsers[2] && password_reset) {
        const deleted_password_reset = await deleteResetWithLoginUser(
            loginUsers[2].login_user_id
        );
        expect(deleted_password_reset).toHaveProperty(
            "reset_id",
            password_reset.reset_id
        );
        expect(deleted_password_reset).toHaveProperty(
            "valid_until",
            password_reset.valid_until
        );
    }
});
