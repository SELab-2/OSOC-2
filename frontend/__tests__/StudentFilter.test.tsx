import "@testing-library/jest-dom";
import fetchMock from "jest-fetch-mock";
import { act, render, screen } from "@testing-library/react";
import fireEvent from "@testing-library/user-event";
import Students from "../pages/students";

jest.mock("next/router", () => require("next-router-mock"));

fetchMock.enableMocks();
jest.mock("next/router");
const roles = [
    { role_id: 1, name: "Developer" },
    { role_id: 2, name: "AAA" },
];

const response = JSON.stringify({
    success: true,
    data: [],
    pagination: { count: 0 },
});

describe("student filter tests", () => {
    beforeEach(async () => {
        fetchMock.resetMocks();

        await act(async () => {
            fetchMock.mockOnce(
                JSON.stringify({
                    success: true,
                    data: roles,
                })
            );
            fetchMock.mockOnce(response);
            render(<Students />);
        });
    });
    afterEach(() => {
        fetchMock.resetMocks();
    });
    test("test student filter component render", () => {
        expect(screen.getByTestId("firstNameSort")).toBeInTheDocument();
        expect(screen.getByTestId("firstNameInput")).toBeInTheDocument();
        expect(screen.getByTestId("emailSort")).toBeInTheDocument();
        expect(screen.getByTestId("emailInput")).toBeInTheDocument();
        expect(screen.getByTestId("osocYearInput")).toBeInTheDocument();
        expect(screen.getByTestId("alumniFilter")).toBeInTheDocument();
        expect(screen.getByTestId("coachFilter")).toBeInTheDocument();
        expect(
            screen.getByTestId("rolesSelectedFilterDisplay")
        ).toBeInTheDocument();
        expect(screen.getByTestId("statusFilterDisplay")).toBeInTheDocument();
        expect(screen.getByTestId("statusApplied")).toBeInTheDocument();
        expect(screen.getByTestId("statusApproved")).toBeInTheDocument();
        expect(screen.getByTestId("statusAwaiting")).toBeInTheDocument();
        expect(screen.getByTestId("statusConfirmed")).toBeInTheDocument();
        expect(screen.getByTestId("statusDeclined")).toBeInTheDocument();
        expect(screen.getByTestId("statusRejected")).toBeInTheDocument();
        expect(screen.getByTestId("emailFilterYes")).toBeInTheDocument();
        expect(screen.getByTestId("emailFilterMaybe")).toBeInTheDocument();
        expect(screen.getByTestId("emailFilterNo")).toBeInTheDocument();
        expect(screen.getByTestId("searchButton")).toBeInTheDocument();
    });

    test("test name sort filters", async () => {
        await act(async () => {
            fetchMock.mockOnce(response);
            fetchMock.mockOnce(response);
            await fireEvent.click(screen.getByTestId("firstNameSort"));
        });
        let lastLength = fetchMock.mock.calls.length - 1;
        expect(fetchMock.mock.calls[lastLength][0]).toBe(
            "undefined/student/filter?nameSort=asc&currentPage=0"
        );
        await act(async () => {
            fetchMock.mockOnce(response);
            await fireEvent.click(screen.getByTestId("firstNameSort"));
        });
        lastLength = fetchMock.mock.calls.length - 1;
        expect(fetchMock.mock.calls[lastLength][0]).toBe(
            "undefined/student/filter?nameSort=desc&currentPage=0"
        );
        await act(async () => {
            fetchMock.mockOnce(response);
            await fireEvent.click(screen.getByTestId("firstNameSort"));
        });
        lastLength = fetchMock.mock.calls.length - 1;
        expect(fetchMock.mock.calls[lastLength][0]).toBe(
            "undefined/student/filter?currentPage=0"
        );
        const name_text = "first name";
        await act(async () => {
            await fireEvent.type(
                screen.getByTestId("firstNameInput"),
                name_text
            );
            fetchMock.mockOnce(response);
            screen.getByTestId("searchButton").click();
        });
        lastLength = fetchMock.mock.calls.length - 1;
        expect(fetchMock.mock.calls[lastLength][0]).toBe(
            `undefined/student/filter?nameFilter=${name_text}&currentPage=0`
        );
        await act(async () => {
            await fireEvent.clear(screen.getByTestId("firstNameInput"));
            fetchMock.mockOnce(response);
            screen.getByTestId("searchButton").click();
        });
        lastLength = fetchMock.mock.calls.length - 1;
        expect(fetchMock.mock.calls[lastLength][0]).toBe(
            `undefined/student/filter?currentPage=0`
        );
    });

    test("test email filters", async () => {
        await act(async () => {
            fetchMock.mockOnce(response);
            fetchMock.mockOnce(response);
            await fireEvent.click(screen.getByTestId("emailSort"));
        });
        let lastLength = fetchMock.mock.calls.length - 1;
        expect(fetchMock.mock.calls[lastLength][0]).toBe(
            "undefined/student/filter?emailSort=asc&currentPage=0"
        );
        await act(async () => {
            fetchMock.mockOnce(response);
            await fireEvent.click(screen.getByTestId("emailSort"));
        });
        lastLength = fetchMock.mock.calls.length - 1;
        expect(fetchMock.mock.calls[lastLength][0]).toBe(
            "undefined/student/filter?emailSort=desc&currentPage=0"
        );
        await act(async () => {
            fetchMock.mockOnce(response);
            await fireEvent.click(screen.getByTestId("emailSort"));
        });
        lastLength = fetchMock.mock.calls.length - 1;
        expect(fetchMock.mock.calls[lastLength][0]).toBe(
            "undefined/student/filter?currentPage=0"
        );
        const name_text = "email";
        await act(async () => {
            await fireEvent.type(screen.getByTestId("emailInput"), name_text);
            fetchMock.mockOnce(response);
            screen.getByTestId("searchButton").click();
        });
        lastLength = fetchMock.mock.calls.length - 1;
        expect(fetchMock.mock.calls[lastLength][0]).toBe(
            `undefined/student/filter?emailFilter=${name_text}&currentPage=0`
        );
        await act(async () => {
            await fireEvent.clear(screen.getByTestId("emailInput"));
            fetchMock.mockOnce(response);
            screen.getByTestId("searchButton").click();
        });
        lastLength = fetchMock.mock.calls.length - 1;
        expect(fetchMock.mock.calls[lastLength][0]).toBe(
            `undefined/student/filter?currentPage=0`
        );
    });

    test("osoc edition filter", async () => {
        const edition = "200";
        await act(async () => {
            await fireEvent.type(screen.getByTestId("osocYearInput"), edition);
            fetchMock.mockOnce(response);
            screen.getByTestId("searchButton").click();
        });
        let lastLength = fetchMock.mock.calls.length - 1;
        expect(fetchMock.mock.calls[lastLength][0]).toBe(
            `undefined/student/filter?osocYear=${edition}&currentPage=0`
        );
        await act(async () => {
            await fireEvent.clear(screen.getByTestId("osocYearInput"));
            fetchMock.mockOnce(response);
            screen.getByTestId("searchButton").click();
        });
        lastLength = fetchMock.mock.calls.length - 1;
        expect(fetchMock.mock.calls[lastLength][0]).toBe(
            `undefined/student/filter?currentPage=0`
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
        const lastLength = fetchMock.mock.calls.length - 1;
        expect(fetchMock.mock.calls[lastLength][0]).toBe(
            `undefined/student/filter?${valueFilter}&currentPage=0`
        );
    };

    const testButtonHelperFunction2 = async (button: string) => {
        await act(async () => {
            fetchMock.mockOnce(response);
            screen.getByTestId(button).click();
        });
        const lastLength = fetchMock.mock.calls.length - 1;
        expect(fetchMock.mock.calls[lastLength][0]).toBe(
            `undefined/student/filter?currentPage=0`
        );
    };
    const testButtonsFunction = async (button: string, valueFilter: string) => {
        await testButtonHelperFunction1(button, valueFilter);
        await testButtonHelperFunction2(button);
    };
    test("test button filters", async () => {
        await testButtonsFunction("alumniFilter", "alumniFilter=true");
        await testButtonsFunction("coachFilter", "coachFilter=true");
        await testButtonsFunction("emailFilterYes", "statusFilter=YES");
        await testButtonsFunction("emailFilterMaybe", "statusFilter=MAYBE");
        await testButtonsFunction("emailFilterNo", "statusFilter=NO");
    });

    const testEmailFilters = async (
        button: string,
        valueFilter: string,
        valueDisplay: string
    ) => {
        await testButtonHelperFunction1(button, valueFilter);
        expect(screen.getByTestId("statusFilterDisplay").textContent).toBe(
            valueDisplay
        );
        await testButtonHelperFunction2(button);
        expect(screen.getByTestId("statusFilterDisplay").textContent).toBe(
            "No status selected"
        );
    };

    test("test status filters", async () => {
        await testEmailFilters(
            "statusApplied",
            "emailStatusFilter=APPLIED",
            "APPLIED"
        );
        await testEmailFilters(
            "statusApproved",
            "emailStatusFilter=APPROVED",
            "APPROVED"
        );
        await testEmailFilters(
            "statusAwaiting",
            "emailStatusFilter=AWAITING_PROJECT",
            "AWAITING_PROJECT"
        );
        await testEmailFilters(
            "statusConfirmed",
            "emailStatusFilter=CONTRACT_CONFIRMED",
            "CONTRACT_CONFIRMED"
        );
    });

    test("test filtering on roles", async () => {
        expect(
            screen.getByTestId("rolesSelectedFilterDisplay").textContent
        ).toBe(`No role selected`);
        await act(async () => {
            screen.getByTestId(`testRoleItem=${roles[0].name}`).click();
            fetchMock.mockOnce(response);
            screen.getByTestId("searchButton").click();
        });
        expect(
            screen.getByTestId("rolesSelectedFilterDisplay").textContent
        ).toBe(`1 role selected`);
        let lastLength = fetchMock.mock.calls.length - 1;
        expect(fetchMock.mock.calls[lastLength][0]).toBe(
            `undefined/student/filter?roleFilter=${roles[0].name}&currentPage=0`
        );
        await act(async () => {
            screen.getByTestId(`testRoleItem=${roles[1].name}`).click();
            fetchMock.mockOnce(response);
            screen.getByTestId("searchButton").click();
        });
        expect(
            screen.getByTestId("rolesSelectedFilterDisplay").textContent
        ).toBe(`2 roles selected`);
        lastLength = fetchMock.mock.calls.length - 1;
        expect(fetchMock.mock.calls[lastLength][0]).toBe(
            `undefined/student/filter?roleFilter=${roles[0].name},${roles[1].name}&currentPage=0`
        );
    });
});
