import { AccountStatus, LoginUser } from "./types";

export const defaultLoginUser: LoginUser = {
    person: {
        person_id: -1,
        email: "",
        name: "DELETED",
        github: "",
    },
    login_user_id: -1,
    is_coach: false,
    is_admin: false,
    account_status: AccountStatus.DISABLED,
};
