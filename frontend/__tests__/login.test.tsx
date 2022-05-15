import "@testing-library/jest-dom";
import fetchMock from "jest-fetch-mock";
import { act, render, screen } from "@testing-library/react";
import fireEvent from "@testing-library/user-event";
import Index from "../pages/login";

jest.mock("next/router", () => require("next-router-mock"));

fetchMock.enableMocks();
jest.mock("next/router");

describe("Osoc filter tests", () => {
    beforeEach(async () => {
        fetchMock.resetMocks();
        fetchMock.mockOnce(
            JSON.stringify({ success: true, data: { test: [] } })
        );
        await act(async () => {
            render(<Index />);
        });
    });
    afterEach(() => {
        fetchMock.resetMocks();
    });

    test("test rendering page", async () => {
        expect(screen.getByTestId("inputEmailLogin")).toBeInTheDocument();
        expect(screen.getByTestId("loginEmailError")).toBeInTheDocument();
        expect(screen.getByTestId("inputPassLogin")).toBeInTheDocument();
        expect(screen.getByTestId("loginPasswordError")).toBeInTheDocument();
        expect(screen.getByTestId("forgotPassInput")).toBeInTheDocument();
        expect(screen.getByTestId("forgotPassError")).toBeInTheDocument();
        expect(screen.getByTestId("forgotPassConfirm")).toBeInTheDocument();
        expect(screen.getByTestId("loginButton")).toBeInTheDocument();
        expect(screen.getByTestId("backendErrorLogin")).toBeInTheDocument();
        expect(screen.getByTestId("githubLogin")).toBeInTheDocument();
        expect(screen.getByTestId("nameRegister")).toBeInTheDocument();
        expect(screen.getByTestId("errorNameRegister")).toBeInTheDocument();
        expect(screen.getByTestId("emailRegister")).toBeInTheDocument();
        expect(screen.getByTestId("errorEmailRegister")).toBeInTheDocument();
        expect(screen.getByTestId("passwordRegister")).toBeInTheDocument();
        expect(screen.queryByTestId("passStrength")).not.toBeInTheDocument();
        expect(screen.getByTestId("passRegisterError")).toBeInTheDocument();
        expect(screen.getByTestId("rePasswordRegister")).toBeInTheDocument();
        expect(
            screen.getByTestId("errorRePasswordRegister")
        ).toBeInTheDocument();
        expect(screen.getByTestId("registerButton")).toBeInTheDocument();
        expect(screen.getByTestId("errorBackendRegister")).toBeInTheDocument();
    });

    const testInputsError = async (
        input: string,
        errorField: string,
        button: string
    ) => {
        await act(async () => {
            await fireEvent.type(screen.getByTestId(input), "aaaaa@mail.com");
            await screen.getByTestId(button).click();
        });
        expect(screen.getByTestId(errorField).textContent).toBe("");
        await act(async () => {
            await fireEvent.clear(screen.getByTestId(input));
            await screen.getByTestId(button).click();
        });
        expect(screen.getByTestId(errorField).textContent !== "").toBe(true);
    };
    test("test all inputs", async () => {
        await testInputsError(
            "inputEmailLogin",
            "loginEmailError",
            "loginButton"
        );
        await testInputsError(
            "inputPassLogin",
            "loginPasswordError",
            "loginButton"
        );
        await testInputsError(
            "forgotPassInput",
            "forgotPassError",
            "forgotPassConfirm"
        );
        await testInputsError(
            "nameRegister",
            "errorNameRegister",
            "registerButton"
        );
        await testInputsError(
            "emailRegister",
            "errorEmailRegister",
            "registerButton"
        );
    });
    test("test pass inputs", async () => {
        await act(async () => {
            await fireEvent.type(
                screen.getByTestId("passwordRegister"),
                "aaaaa@mail.com"
            );
            await screen.getByTestId("registerButton").click();
        });
        expect(screen.getByTestId("passStrength").textContent !== "").toBe(
            true
        );
        await act(async () => {
            await fireEvent.clear(screen.getByTestId("passwordRegister"));
            await screen.getByTestId("registerButton").click();
        });
        expect(screen.getByTestId("passRegisterError").textContent !== "").toBe(
            true
        );

        await act(async () => {
            await fireEvent.type(
                screen.getByTestId("rePasswordRegister"),
                "aaaaa@mail.com"
            );
            await screen.getByTestId("registerButton").click();
        });
        expect(
            screen.getByTestId("errorRePasswordRegister").textContent !== ""
        ).toBe(true);
        const pass = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
        await act(async () => {
            await fireEvent.type(screen.getByTestId("passwordRegister"), pass);
            await fireEvent.clear(screen.getByTestId("rePasswordRegister"));
            await fireEvent.type(
                screen.getByTestId("rePasswordRegister"),
                pass
            );
            await screen.getByTestId("registerButton").click();
        });
        expect(screen.getByTestId("errorRePasswordRegister").textContent).toBe(
            ""
        );
    });
    test("test login all correct", async () => {
        await act(async () => {
            const email = "mail@mail.com";
            const pass = "pass";
            fetchMock.mockOnce(JSON.stringify({ success: true }));
            await fireEvent.type(screen.getByTestId("inputEmailLogin"), email);
            await fireEvent.type(screen.getByTestId("inputPassLogin"), pass);
            screen.getByTestId("loginButton").click();
        });
        const lastLength = fetchMock.mock.calls.length - 1;
        expect(fetchMock.mock.calls[lastLength][0]).toBe("undefined/login");
        expect(fetchMock.mock.calls[lastLength][1]?.body).toBe(
            '{"pass":"pass","name":"mail@mail.com"}'
        );
    });

    test("register person", async () => {
        const email = "mail@mail.com";
        const pass = "ThisIsAStrongPass!";
        const name = "name";
        await act(async () => {
            fetchMock.mockOnce(JSON.stringify({ success: true }));
            await fireEvent.type(screen.getByTestId("nameRegister"), name);
            await fireEvent.type(screen.getByTestId("emailRegister"), email);
            await fireEvent.type(screen.getByTestId("passwordRegister"), pass);
            await fireEvent.type(
                screen.getByTestId("rePasswordRegister"),
                pass
            );
            screen.getByTestId("registerButton").click();
        });
        const lastLength = fetchMock.mock.calls.length - 1;
        expect(fetchMock.mock.calls[lastLength][0]).toBe(
            "undefined/user/request"
        );
        expect(fetchMock.mock.calls[lastLength][1]?.body).toBe(
            `{"name":"${name}","email":"${email}","pass":"${pass}"}`
        );
    });

    test("test send pass reset", async () => {
        const email = "mail@mail.com";
        await act(async () => {
            fetchMock.mockOnce(JSON.stringify({ success: true }));
            await fireEvent.type(screen.getByTestId("forgotPassInput"), email);
            screen.getByTestId("forgotPassConfirm").click();
        });
        const lastLength = fetchMock.mock.calls.length - 1;
        expect(fetchMock.mock.calls[lastLength][0]).toBe("undefined/reset");
        expect(fetchMock.mock.calls[lastLength][1]?.body).toBe(
            `{"email":"${email}"}`
        );
    });
});
