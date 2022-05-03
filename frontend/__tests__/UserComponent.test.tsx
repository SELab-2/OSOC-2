import { User } from "../components/User/User";
import { AccountStatus, LoginUser } from "../types";
import "@testing-library/jest-dom";
import fetchMock from "jest-fetch-mock";
import { fireEvent, render, screen } from "@testing-library/react";

fetchMock.enableMocks();

const removeUser = (user: LoginUser) => {
    console.log(user);
};

describe("User component tests", () => {
    let userAdminCoach: LoginUser;
    let userInvalid: LoginUser;

    beforeEach(() => {
        userAdminCoach = {
            person: {
                person_id: 1,
                email: "test",
                firstname: "aa",
                lastname: "aga",
                github: "",
                github_id: 0,
            },
            login_user_id: 1,
            person_id: 1,
            is_admin: true,
            is_coach: true,
            account_status: AccountStatus.ACTIVATED,
        };
        userInvalid = {
            person: {
                person_id: 1,
                email: "test",
                firstname: "aa",
                lastname: "aga",
                github: "",
                github_id: -1,
            },
            login_user_id: 1,
            person_id: 1,
            is_admin: false,
            is_coach: false,
            account_status: AccountStatus.PENDING,
        };
        fetchMock.resetMocks();
    });
    afterEach(() => {
        fetchMock.resetMocks();
    });

    test("Test for valid login person", () => {
        render(<User user={userAdminCoach} removeUser={removeUser} />);
        expect(screen.getByTestId("userName")).toBeInTheDocument();

        expect(screen.getByTestId("userName")!.firstChild!.nodeValue).toBe(
            userAdminCoach.person.firstname
        );

        expect(screen.queryByTestId("pendingButton")).toBeNull();

        expect(screen.getByTestId("userEmail")).toBeInTheDocument();
        expect(screen.getByTestId("userEmail")!.firstChild!.nodeValue).toBe(
            userAdminCoach.person.email
        );
        fetchMock.mockOnce(
            JSON.stringify({ id: -1, name: "testTest", success: true })
        );

        expect(screen.getByTestId("buttonIsAdmin")).toBeInTheDocument();
        expect(screen.getByTestId("imageIsAdmin")).toBeInTheDocument();
        fireEvent.click(screen.getByTestId("buttonIsAdmin"));
        expect(screen.getByTestId("buttonIsAdmin").onclick).toBeCalledTimes(1);

        expect(screen.getByTestId("buttonStatus")).toBeInTheDocument();
        expect(screen.getByTestId("imageStatus")).toBeInTheDocument();
        expect(
            screen.getByAltText("Person is not disabled")
        ).toBeInTheDocument();

        const mockedStatusbuttonClick = jest.fn();
        fireEvent.click(screen.getByTestId("buttonStatus"));
        expect(mockedStatusbuttonClick).toBeCalledTimes(1);

        //TODO
        expect(screen.queryByAltText("Person is disabled")).toBeNull();
        expect(
            screen.getByAltText("Person is not disabled")
        ).not.toBeInTheDocument();
    });

    test("Test for invalid person", () => {
        render(<User user={userInvalid} removeUser={removeUser} />);
        expect(screen.getByTestId("pendingButton")).toBeNull();
    });
});
