import {account_status_enum} from "@prisma/client";
import {prismaMock} from "./singleton";
import {createLoginUser} from "../../orm_functions/login_user";
import {CreateLoginUser} from "../../orm_functions/orm_types";

const response = {
  session_id : "50",
  login_user_id : 1,
  person_id : 0,
  password : "password",
  is_admin : false,
  is_coach : false,
  session_keys : [ "key1", "key2" ],
  account_status : account_status_enum.DISABLED
}

test("should create a login_user", async () => {

    const loginUser: CreateLoginUser = {
        accountStatus: account_status_enum.ACTIVATED,
        isAdmin: false,
        isCoach: false,
        password: "password",
        personId: 0
    }

    prismaMock.login_user.create.mockResolvedValue(response);
    await expect(createLoginUser(loginUser)).resolves.toEqual(response);
});

// TODO: write all the other tests for this file