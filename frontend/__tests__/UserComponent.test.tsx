import { User } from "../components/User/User";
import { AccountStatus, LoginUser } from "../types";
import "@testing-library/jest-dom";
import fetchMock from "jest-fetch-mock";
import { act, render, screen } from "@testing-library/react";

fetchMock.enableMocks();

const removeUser = jest.fn();

describe("User component tests", () => {
    let userAdminCoach: LoginUser;
    let userInvalid: LoginUser;
    let userDisabled: LoginUser;

    beforeEach(() => {
        userAdminCoach = {
            person: {
                person_id: 1,
                email: "test",
                name: "aga",
                github: "",
            },
            login_user_id: 1,
            is_admin: true,
            is_coach: true,
            account_status: AccountStatus.ACTIVATED,
        };
        userInvalid = {
            person: {
                person_id: 1,
                email: "test",
                name: "aa",
                github: "",
            },
            login_user_id: 1,
            is_admin: false,
            is_coach: true,
            account_status: AccountStatus.PENDING,
        };
        userDisabled = {
            person: {
                person_id: 1,
                email: "test",
                name: "aa",
                github: "",
            },
            login_user_id: 1,
            is_admin: false,
            is_coach: false,
            account_status: AccountStatus.DISABLED,
        };
        fetchMock.resetMocks();
    });
    afterEach(() => {
        fetchMock.resetMocks();
    });

    test("Test for valid login person", async () => {
        render(
            <User user={userAdminCoach} removeUser={removeUser} editions={[]} />
        );
        expect(screen.getByTestId("userName")).toBeInTheDocument();

        expect(screen.getByTestId("userName").firstChild?.nodeValue).toBe(
            userAdminCoach.person.name
        );

        expect(screen.queryByTestId("pendingButton")).toBeNull();

        expect(screen.getByTestId("userEmail")).toBeInTheDocument();
        expect(screen.getByTestId("userEmail").firstChild?.nodeValue).toBe(
            userAdminCoach.person.email
        );
    });

    test("test valid login person admin button", async () => {
        fetchMock.mockOnce(JSON.stringify({ success: true }));
        render(
            <User user={userAdminCoach} removeUser={removeUser} editions={[]} />
        );
        expect(screen.getByTestId("buttonIsAdmin")).toBeInTheDocument();
        expect(screen.getByTestId("imageIsAdmin")).toBeInTheDocument();
        expect(screen.getByAltText("Person is an admin")).toBeInTheDocument();
        await act(async () => {
            fetchMock.mockOnce(
                JSON.stringify({ id: -1, name: "testTest", success: true })
            );
            screen.getByTestId("buttonIsAdmin").click();
        });
        expect(fetchMock).toHaveBeenCalledTimes(2);
        expect(
            screen.getByAltText("Person is not an admin")
        ).toBeInTheDocument();

        await act(async () => {
            fetchMock.mockOnce(JSON.stringify({ success: false }));
            screen.getByTestId("buttonIsAdmin").click();
        });
        expect(fetchMock).toHaveBeenCalledTimes(3);
        expect(
            screen.getByAltText("Person is not an admin")
        ).toBeInTheDocument();
    });

    test("Test is coach for valid person", async () => {
        fetchMock.mockOnce(JSON.stringify({ success: true }));
        render(
            <User user={userAdminCoach} removeUser={removeUser} editions={[]} />
        );
        expect(screen.getByTestId("buttonIsCoach")).toBeInTheDocument();
        expect(screen.getByTestId("imageIsCoach")).toBeInTheDocument();
        expect(screen.getByAltText("Person is a coach")).toBeInTheDocument();
        await act(async () => {
            fetchMock.mockOnce(
                JSON.stringify({ id: -1, name: "testTest", success: true })
            );
            screen.getByTestId("buttonIsCoach").click();
        });
        expect(fetchMock).toHaveBeenCalledTimes(2);
        expect(
            screen.getByAltText("Person is not a coach")
        ).toBeInTheDocument();

        await act(async () => {
            fetchMock.mockOnce(JSON.stringify({ success: false }));
            screen.getByTestId("buttonIsCoach").click();
        });
        expect(fetchMock).toHaveBeenCalledTimes(3);
        expect(
            screen.getByAltText("Person is not a coach")
        ).toBeInTheDocument();
    });

    test("Test disable valid person", async () => {
        fetchMock.mockOnce(JSON.stringify({ success: true }));
        render(
            <User user={userAdminCoach} removeUser={removeUser} editions={[]} />
        );
        expect(screen.getByTestId("buttonStatus")).toBeInTheDocument();
        expect(screen.getByTestId("imageStatus")).toBeInTheDocument();
        expect(
            screen.getByAltText("Person is not disabled")
        ).toBeInTheDocument();

        await act(async () => {
            fetchMock.mockOnce(
                JSON.stringify({ id: -1, name: "testTest", success: true })
            );
            screen.getByTestId("buttonStatus").click();
        });
        expect(fetchMock).toHaveBeenCalledTimes(2);
        expect(screen.getByAltText("Person is disabled")).toBeInTheDocument();
        expect(
            screen.getByAltText("Person is not a coach")
        ).toBeInTheDocument();
        expect(
            screen.getByAltText("Person is not an admin")
        ).toBeInTheDocument();

        await act(async () => {
            fetchMock.mockOnce(JSON.stringify({ success: false }));
            screen.getByTestId("buttonStatus").click();
        });
        expect(fetchMock).toHaveBeenCalledTimes(3);
        expect(screen.getByAltText("Person is disabled")).toBeInTheDocument();
    });

    test("Test delete person", async () => {
        fetchMock.mockOnce(JSON.stringify({ success: true }));
        render(
            <User user={userAdminCoach} removeUser={removeUser} editions={[]} />
        );
        expect(screen.getByTestId("buttonDelete")).toBeInTheDocument();
        await act(async () => {
            fetchMock.mockOnce(JSON.stringify({ success: true }));
            screen.getByTestId("buttonDelete").click();
            screen.getByTestId("confirmDelete").click();
        });
        expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    test("Test for invalid person", async () => {
        fetchMock.mockOnce(JSON.stringify({ success: true }));
        render(
            <User user={userInvalid} removeUser={removeUser} editions={[]} />
        );
        expect(screen.getByTestId("pendingButton")).not.toBeNull();
        await act(async () => {
            fetchMock.mockOnce(
                JSON.stringify({ id: -1, name: "testTest", success: true })
            );
            screen.getByTestId("pendingButton").click();
        });
        expect(fetchMock).toHaveBeenCalledTimes(2);
        expect(screen.queryByTestId("pendingButton")).not.toBeInTheDocument();
    });

    test("Test for disabled person admin", async () => {
        fetchMock.mockOnce(JSON.stringify({ success: true }));
        render(
            <User user={userDisabled} removeUser={removeUser} editions={[]} />
        );

        await act(async () => {
            fetchMock.mockOnce(
                JSON.stringify({ id: -1, name: "testTest", success: true })
            );
            screen.getByTestId("buttonIsAdmin").click();
        });
        expect(fetchMock).toHaveBeenCalledTimes(2);
        expect(screen.getByAltText("Person is an admin")).toBeInTheDocument();
        expect(
            screen.getByAltText("Person is not disabled")
        ).toBeInTheDocument();
    });

    test("Test for disabled person coach", async () => {
        fetchMock.mockOnce(JSON.stringify({ success: true }));
        render(
            <User user={userDisabled} removeUser={removeUser} editions={[]} />
        );

        await act(async () => {
            fetchMock.mockOnce(
                JSON.stringify({ id: -1, name: "testTest", success: true })
            );
            screen.getByTestId("buttonIsCoach").click();
        });
        expect(fetchMock).toHaveBeenCalledTimes(2);
        expect(screen.getByAltText("Person is a coach")).toBeInTheDocument();
        expect(
            screen.getByAltText("Person is not disabled")
        ).toBeInTheDocument();
    });
});
