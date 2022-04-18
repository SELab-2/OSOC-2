import {
  CreateLoginUser,
  UpdateLoginUser,
  CreatePerson,
} from "../../orm_functions/orm_types";
import { createPerson } from "../../orm_functions/person";
import {
  createLoginUser,
  getAllLoginUsers,
  getPasswordLoginUserByPerson,
  getPasswordLoginUser,
  searchLoginUserByPerson,
  searchAllAdminLoginUsers,
  searchAllCoachLoginUsers,
  searchAllAdminAndCoachLoginUsers,
  updateLoginUser,
  deleteLoginUserById,
  deleteLoginUserByPersonId,
  setCoach,
  setAdmin,
} from "../../orm_functions/login_user";
import prisma from "../../prisma/prisma";

const login_user: CreateLoginUser = {
  personId: 0,
  password: "easy_password",
  isAdmin: true,
  isCoach: true,
  accountStatus: "ACTIVATED",
};

let login_user_update: UpdateLoginUser = {
  loginUserId: 0,
  password: "easy_password",
  isAdmin: true,
  isCoach: true,
  accountStatus: "ACTIVATED",
};

it("should create 1 new login user", async () => {
  const person0: CreatePerson = {
    email: "login_user@email.be",
    firstname: "login_firstname",
    lastname: "login_lastname",
  };

  const created_person = await createPerson(person0);
  if (created_person) {
    login_user.personId = created_person.person_id;

    const created_login_user = await createLoginUser(login_user);
    login_user_update.loginUserId = created_login_user.login_user_id;
    expect(created_login_user).toHaveProperty("password", login_user.password);
    expect(created_login_user).toHaveProperty("is_admin", login_user.isAdmin);
    expect(created_login_user).toHaveProperty("is_coach", login_user.isCoach);
    expect(created_login_user).toHaveProperty(
      "account_status",
      login_user.accountStatus
    );
  }
});

it("should find all the login users in the db, 4 in total", async () => {
  const searched_login_users = await getAllLoginUsers();
  expect(searched_login_users.length).toEqual(4);
  expect(searched_login_users[3]).toHaveProperty(
    "password",
    login_user.password
  );
  expect(searched_login_users[3]).toHaveProperty(
    "is_admin",
    login_user.isAdmin
  );
  expect(searched_login_users[3]).toHaveProperty(
    "is_coach",
    login_user.isCoach
  );
  expect(searched_login_users[3]).toHaveProperty(
    "account_status",
    login_user.accountStatus
  );
});

it("should return the password, by searching for its person id", async () => {
  const searched_password = await getPasswordLoginUserByPerson(
    login_user.personId
  );
  expect(searched_password).toHaveProperty("password", login_user.password);
});

it("should return the password, by searching for its login user id", async () => {
  const searched_password = await getPasswordLoginUser(
    login_user_update.loginUserId
  );
  expect(searched_password).toHaveProperty("password", login_user.password);
});

it("should return the login user, by searching for its person id", async () => {
  const searched_login_user = await searchLoginUserByPerson(
    login_user.personId
  );
  expect(searched_login_user).toHaveProperty("password", login_user.password);
  expect(searched_login_user).toHaveProperty("is_admin", login_user.isAdmin);
  expect(searched_login_user).toHaveProperty("is_coach", login_user.isCoach);
  expect(searched_login_user).toHaveProperty(
    "account_status",
    login_user.accountStatus
  );
});

it("should find all the login users in the db that are admin, 4 in total", async () => {
  const searched_login_users = await searchAllAdminLoginUsers(true);
  expect(searched_login_users.length).toEqual(4);
  expect(searched_login_users[3]).toHaveProperty(
    "password",
    login_user.password
  );
  expect(searched_login_users[3]).toHaveProperty(
    "is_admin",
    login_user.isAdmin
  );
  expect(searched_login_users[3]).toHaveProperty(
    "is_coach",
    login_user.isCoach
  );
  expect(searched_login_users[3]).toHaveProperty(
    "account_status",
    login_user.accountStatus
  );
});

it("should find all the login users in the db that are coach, 3 in total", async () => {
  const searched_login_users = await searchAllCoachLoginUsers(true);
  expect(searched_login_users.length).toEqual(3);
  expect(searched_login_users[2]).toHaveProperty(
    "password",
    login_user.password
  );
  expect(searched_login_users[2]).toHaveProperty(
    "is_admin",
    login_user.isAdmin
  );
  expect(searched_login_users[2]).toHaveProperty(
    "is_coach",
    login_user.isCoach
  );
  expect(searched_login_users[2]).toHaveProperty(
    "account_status",
    login_user.accountStatus
  );
});

it("should find all the login users in the db that are admin or coach, 3 in total", async () => {
  const searched_login_users = await searchAllAdminAndCoachLoginUsers(true);
  expect(searched_login_users.length).toEqual(3);
  expect(searched_login_users[2]).toHaveProperty(
    "password",
    login_user.password
  );
  expect(searched_login_users[2]).toHaveProperty(
    "is_admin",
    login_user.isAdmin
  );
  expect(searched_login_users[2]).toHaveProperty(
    "is_coach",
    login_user.isCoach
  );
  expect(searched_login_users[2]).toHaveProperty(
    "account_status",
    login_user.accountStatus
  );
});

it("should update the isCoach field and return the updated entry", async () => {
  const login_users = await prisma.login_user.findMany({
    include: {
      person: true,
    },
  });
  const user = login_users[0];
  const updated = await setCoach(user.login_user_id, !user.is_coach);
  expect(updated).toHaveProperty("login_user_id", user.login_user_id);
  expect(updated).toHaveProperty("is_coach", !user.is_coach);
  expect(updated).toHaveProperty("is_admin", user.is_admin);
  expect(updated).toHaveProperty("account_status", user.account_status);
  expect(updated).toHaveProperty("person", user.person);
  // undo the operation (for further tests)
  await setCoach(user.login_user_id, user.is_coach);
});

it("should update the isAdmin field and return the updated entry", async () => {
  const login_users = await prisma.login_user.findMany({
    include: {
      person: true,
    },
  });
  const user = login_users[0];
  const updated = await setAdmin(user.login_user_id, !user.is_admin);
  expect(updated).toHaveProperty("login_user_id", user.login_user_id);
  expect(updated).toHaveProperty("is_coach", user.is_coach);
  expect(updated).toHaveProperty("is_admin", !user.is_admin);
  expect(updated).toHaveProperty("account_status", user.account_status);
  expect(updated).toHaveProperty("person", user.person);
  // undo the operation (for further tests)
  await setAdmin(user.login_user_id, user.is_admin);
});

it("should update login user based upon login user id", async () => {
  const searched_login_user = await searchLoginUserByPerson(
    login_user.personId
  );
  if (searched_login_user) {
    const loginUserUpdate: UpdateLoginUser = {
      loginUserId: searched_login_user.login_user_id,
      password: "last_pass",
      isAdmin: false,
      isCoach: false,
      accountStatus: "DISABLED",
    };
    login_user_update = loginUserUpdate;
    const updated_login_user = await updateLoginUser(loginUserUpdate);
    expect(updated_login_user).toHaveProperty(
      "password",
      loginUserUpdate.password
    );
    expect(updated_login_user).toHaveProperty(
      "is_admin",
      loginUserUpdate.isAdmin
    );
    expect(updated_login_user).toHaveProperty(
      "is_coach",
      loginUserUpdate.isCoach
    );
    expect(updated_login_user).toHaveProperty(
      "account_status",
      loginUserUpdate.accountStatus
    );
  }
});

it("should delete the login user based upon login user id", async () => {
  const searched_login_users = await searchAllCoachLoginUsers(false);
  const deleted_login_user = await deleteLoginUserById(
    searched_login_users[0].login_user_id
  );
  expect(deleted_login_user).toHaveProperty(
    "password",
    searched_login_users[0].password
  );
  expect(deleted_login_user).toHaveProperty(
    "is_admin",
    searched_login_users[0].is_admin
  );
  expect(deleted_login_user).toHaveProperty(
    "is_coach",
    searched_login_users[0].is_coach
  );
  expect(deleted_login_user).toHaveProperty(
    "account_status",
    searched_login_users[0].account_status
  );
});

it("should delete the login user based upon person id", async () => {
  const deleted_login_user = await deleteLoginUserByPersonId(
    login_user.personId
  );
  expect(deleted_login_user).toHaveProperty(
    "password",
    login_user_update.password
  );
  expect(deleted_login_user).toHaveProperty(
    "is_admin",
    login_user_update.isAdmin
  );
  expect(deleted_login_user).toHaveProperty(
    "is_coach",
    login_user_update.isCoach
  );
  expect(deleted_login_user).toHaveProperty(
    "account_status",
    login_user_update.accountStatus
  );
});
