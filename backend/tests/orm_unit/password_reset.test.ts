import { prismaMock } from "./singleton";
import {
    createOrUpdateReset,
    deleteResetWithLoginUser,
    deleteResetWithResetId,
} from "../../orm_functions/password_reset";

const response = {
    password_reset_id: 1,
    login_user_id: 1,
    reset_id: "reset_id",
    valid_until: new Date(),
};

test("should return the inserted/updated entry", async () => {
    prismaMock.password_reset.upsert.mockResolvedValue(response);
    await expect(
        createOrUpdateReset(
            response.login_user_id,
            response.reset_id,
            response.valid_until
        )
    ).resolves.toEqual(response);
});

test("should return the deleted entry", async () => {
    prismaMock.password_reset.delete.mockResolvedValue(response);
    await expect(deleteResetWithLoginUser(1)).resolves.toEqual(response);
});

test("should return the deleted entry", async () => {
    prismaMock.password_reset.delete.mockResolvedValue(response);
    await expect(deleteResetWithResetId("reset_id")).resolves.toEqual(response);
});
