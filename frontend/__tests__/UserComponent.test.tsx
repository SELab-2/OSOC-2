import ReactDOM from "react-dom";
import { User } from "../components/User/User";
import { AccountStatus, LoginUser } from "../types";

const removeUser = (user: LoginUser) => {
    console.log(user);
};

describe("User component tests", () => {
    let container: HTMLDivElement;
    let user: LoginUser;
    beforeEach(() => {
        container = document.createElement("div");
        document.body.append(container);
        user = {
            person: {
                person_id: 1,
                email: "test",
                firstname: "aa",
                lastname: "aga",
                github: "",
            },
            login_user_id: 1,
            person_id: 1,
            is_admin: true,
            is_coach: true,
            password: "pass",
            account_status: AccountStatus.ACTIVATED,
        };
        ReactDOM.render(
            <User user={user} removeUser={removeUser} />,
            container
        );
    });
    afterEach(() => {
        document.body.removeChild(container);
        container.remove();
    });

    test("renders the user component correctly", () => {
        expect(
            container.querySelector("[data-test='buttonStatus']")
        ).toBeInTheDocument();
    });
});
