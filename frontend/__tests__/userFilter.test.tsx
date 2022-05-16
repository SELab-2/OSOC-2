import "@testing-library/jest-dom";
import fetchMock from "jest-fetch-mock";
import { act, render, screen } from "@testing-library/react";
import fireEvent from "@testing-library/user-event";
import Users from "../pages/users";

jest.mock("next/router", () => require("next-router-mock"));

fetchMock.enableMocks();
jest.mock("next/router");

const response = JSON.stringify({
    success: true,
    data: [],
    pagination: { count: 0 },
});

describe("user filter tests", () => {
    beforeEach(async () => {
        fetchMock.resetMocks();
        await act(async () => {
            fetchMock.mockOnce(response);
            render(<Users />);
        });
    });
    afterEach(() => {
        fetchMock.resetMocks();
    });

    test("test user filter component render", () => {
        expect(screen.getByTestId("nameSort")).toBeInTheDocument();
        expect(screen.getByTestId("nameInput")).toBeInTheDocument();
        expect(screen.getByTestId("pendingButton")).toBeInTheDocument();
        expect(screen.getByTestId("emailSort")).toBeInTheDocument();
        expect(screen.getByTestId("emailInput")).toBeInTheDocument();
        expect(screen.getByTestId("searchButton")).toBeInTheDocument();
        expect(screen.getByTestId("adminButton")).toBeInTheDocument();
        expect(screen.getByTestId("coachButton")).toBeInTheDocument();
        expect(screen.getByTestId("disabledButton")).toBeInTheDocument();
    });
    const testSortAndInput = async (
        sort: string,
        input: string,
        sortReqVal: string,
        inputReqVal: string
    ) => {
        await act(async () => {
            fetchMock.mockOnce(response);
            screen.getByTestId(sort).click();
        });
        let lastLength = fetchMock.mock.calls.length - 1;
        expect(fetchMock.mock.calls[lastLength][0]).toBe(
            `undefined/user/filter?${sortReqVal}=asc&currentPage=0`
        );
        await act(async () => {
            fetchMock.mockOnce(response);
            screen.getByTestId(sort).click();
        });
        lastLength = fetchMock.mock.calls.length - 1;
        expect(fetchMock.mock.calls[lastLength][0]).toBe(
            `undefined/user/filter?${sortReqVal}=desc&currentPage=0`
        );
        await act(async () => {
            fetchMock.mockOnce(response);
            screen.getByTestId(sort).click();
        });
        lastLength = fetchMock.mock.calls.length - 1;
        expect(fetchMock.mock.calls[lastLength][0]).toBe(
            `undefined/user/filter?currentPage=0`
        );

        const test_val = "testvalue";
        await act(async () => {
            await fireEvent.type(screen.getByTestId(input), test_val);
            fetchMock.mockOnce(response);
            screen.getByTestId("searchButton").click();
        });
        lastLength = fetchMock.mock.calls.length - 1;
        expect(fetchMock.mock.calls[lastLength][0]).toBe(
            `undefined/user/filter?${inputReqVal}=${test_val}&currentPage=0`
        );
        await act(async () => {
            await fireEvent.clear(screen.getByTestId(input));
            fetchMock.mockOnce(response);
            screen.getByTestId("searchButton").click();
        });
        lastLength = fetchMock.mock.calls.length - 1;
        expect(fetchMock.mock.calls[lastLength][0]).toBe(
            `undefined/user/filter?currentPage=0`
        );
    };

    test("test inputs and sorts filters", async () => {
        await testSortAndInput(
            "nameSort",
            "nameInput",
            "nameSort",
            "nameFilter"
        );
        await testSortAndInput(
            "emailSort",
            "emailInput",
            "emailSort",
            "emailFilter"
        );
    });

    const testButtonHelperFunction1 = async (
        button: string,
        valueFilter: string
    ) => {
        await act(async () => {
            fetchMock.mockOnce(response);
            screen.getByTestId(button).click();
        });
        let lastLength = fetchMock.mock.calls.length - 1;
        expect(fetchMock.mock.calls[lastLength][0]).toBe(
            `undefined/user/filter?${valueFilter}&currentPage=0`
        );
        await act(async () => {
            fetchMock.mockOnce(response);
            screen.getByTestId(button).click();
        });
        lastLength = fetchMock.mock.calls.length - 1;
        expect(fetchMock.mock.calls[lastLength][0]).toBe(
            `undefined/user/filter?currentPage=0`
        );
    };
    test("test buttons presses", async () => {
        await testButtonHelperFunction1(
            "pendingButton",
            "statusFilter=PENDING"
        );
        await testButtonHelperFunction1("adminButton", "isAdminFilter=true");
        await testButtonHelperFunction1("coachButton", "isCoachFilter=true");
        await testButtonHelperFunction1(
            "disabledButton",
            "statusFilter=DISABLED"
        );
    });
});
