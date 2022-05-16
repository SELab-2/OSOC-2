import { AccountStatus, LoginUser } from "../types";
import "@testing-library/jest-dom";
import fetchMock from "jest-fetch-mock";
import { act, render, screen } from "@testing-library/react";
import { Settings } from "../components/Settings/Settings";
import fireEvent from "@testing-library/user-event";

fetchMock.enableMocks();

describe("User component tests", () => {
    let userAdminCoach: LoginUser;
    let fetchUser: jest.Mock;

    beforeEach(() => {
        fetchUser = jest.fn();

        userAdminCoach = {
            person: {
                person_id: -1,
                email: "test",
                name: "aa",
                github: "",
            },
            login_user_id: -1,
            is_coach: true,
            is_admin: true,
            account_status: AccountStatus.ACTIVATED,
        };
        fetchMock.resetMocks();
    });
    afterEach(() => {
        fetchMock.resetMocks();
    });

    test("test render settings", () => {
        render(<Settings person={userAdminCoach} fetchUser={fetchUser} />);
        expect(screen.getByTestId("personName")).toBeInTheDocument();

        expect(screen.getByTestId("personName").textContent).toBe(
            "Current Name: " + userAdminCoach.person.name
        );
        expect(screen.getByTestId("labelNewName")).toBeInTheDocument();
        expect(screen.getByTestId("labelNewName").textContent).toBe("New Name");

        expect(screen.getByTestId("inputNewName")).toBeInTheDocument();
        expect(screen.getByTestId("labelCurrentPassword")).toBeInTheDocument();

        expect(screen.getByTestId("inputCurrentPassword")).toBeInTheDocument();
        expect(screen.getByTestId("errorCurrPass")).toBeInTheDocument();
        expect(screen.getByTestId("labelNewPassword")).toBeInTheDocument();
        expect(screen.getByTestId("inputNewPassword")).toBeInTheDocument();

        expect(
            screen.getByTestId("labelRetypeNewPassword")
        ).toBeInTheDocument();
        expect(screen.getByTestId("labelRetypeNewPassword").textContent).toBe(
            "Retype New Password"
        );
        expect(
            screen.getByTestId("inputRetypeNewPassword")
        ).toBeInTheDocument();
        expect(screen.getByTestId("confirmButton")).toBeInTheDocument();
        expect(screen.getByTestId("pErrorPassword")).toBeInTheDocument();
    });

    test("test user input username", async () => {
        render(<Settings person={userAdminCoach} fetchUser={fetchUser} />);
        await act(async () => {
            screen.getByTestId("confirmButton").click();
        });
        expect(screen.getByTestId("pErrorPassword").textContent !== "").toBe(
            true
        );
        await act(async () => {
            fetchMock.mockOnce(JSON.stringify({ success: true }));
            await fireEvent.type(
                screen.getByTestId("inputNewName"),
                "nieuweNaam"
            );
            screen.getByTestId("confirmButton").click();
        });
        expect(fetchMock).toHaveBeenCalledTimes(1);
        fetchMock.mockClear();
        await fireEvent.clear(screen.getByTestId("inputNewName"));
    });

    test("test user current pass", async () => {
        render(<Settings person={userAdminCoach} fetchUser={fetchUser} />);
        await act(async () => {
            await fireEvent.type(
                screen.getByTestId("inputCurrentPassword"),
                "huidigpass"
            );
            screen.getByTestId("confirmButton").click();
        });
        expect(screen.getByTestId("newPassError").textContent !== "").toBe(
            true
        );
    });

    test("test user new pass", async () => {
        render(<Settings person={userAdminCoach} fetchUser={fetchUser} />);
        await act(async () => {
            await fireEvent.type(
                screen.getByTestId("inputNewPassword"),
                "huidignew"
            );
            screen.getByTestId("confirmButton").click();
        });
        expect(screen.getByTestId("newPassError").textContent !== "").toBe(
            true
        );
    });

    test("test user retype pass", async () => {
        render(<Settings person={userAdminCoach} fetchUser={fetchUser} />);
        await act(async () => {
            await fireEvent.type(
                screen.getByTestId("inputRetypeNewPassword"),
                "huidignew"
            );
            screen.getByTestId("confirmButton").click();
        });
        expect(screen.getByTestId("newPassError").textContent !== "").toBe(
            true
        );
    });

    test("test user new not equal retype pass", async () => {
        render(<Settings person={userAdminCoach} fetchUser={fetchUser} />);
        await act(async () => {
            await fireEvent.type(
                screen.getByTestId("inputNewPassword"),
                "huidignew1"
            );
            await fireEvent.type(
                screen.getByTestId("inputRetypeNewPassword"),
                "huidignew2"
            );
            screen.getByTestId("confirmButton").click();
        });
        expect(screen.getByTestId("errorCurrPass").textContent !== "").toBe(
            true
        );
        expect(screen.getByTestId("newPassError").textContent !== "").toBe(
            true
        );
        await act(async () => {
            await fireEvent.type(
                screen.getByTestId("inputCurrentPassword"),
                "huidigpass"
            );
            screen.getByTestId("confirmButton").click();
        });
        expect(screen.getByTestId("errorCurrPass").textContent === "").toBe(
            true
        );
        expect(screen.getByTestId("newPassError").textContent !== "").toBe(
            true
        );
    });

    test("test user all fields filled correctly", async () => {
        render(<Settings person={userAdminCoach} fetchUser={fetchUser} />);
        await act(async () => {
            fetchMock.mockOnce(JSON.stringify({ success: true }));
            await fireEvent.type(
                screen.getByTestId("inputCurrentPassword"),
                "huidigpass"
            );
            await fireEvent.type(
                screen.getByTestId("inputNewPassword"),
                "huidignew1"
            );
            await fireEvent.type(
                screen.getByTestId("inputRetypeNewPassword"),
                "huidignew1"
            );
            screen.getByTestId("confirmButton").click();
        });
        expect(screen.getByTestId("errorCurrPass").textContent === "").toBe(
            true
        );
        expect(screen.queryByTestId("newPassError")).not.toBeInTheDocument();
    });
});
