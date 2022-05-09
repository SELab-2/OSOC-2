import "@testing-library/jest-dom";
import fetchMock from "jest-fetch-mock";
import { act, render, screen } from "@testing-library/react";
import fireEvent from "@testing-library/user-event";
import { StudentFilter } from "../components/Filter/StudentFilter/StudentFilter";
import { Display } from "../types";

jest.mock("next/router", () => require("next-router-mock"));

fetchMock.enableMocks();
jest.mock("next/router");
let setFilteredStudents: jest.Mock;
const roles = [
    { role_id: 1, name: "Developer" },
    { role_id: 2, name: "AAA" },
];

describe("student filter tests", () => {
    beforeEach(async () => {
        setFilteredStudents = jest.fn();
        fetchMock.resetMocks();

        await act(async () => {
            fetchMock.mockOnce(
                JSON.stringify({
                    success: true,
                    data: roles,
                })
            );
            fetchMock.mockOnce(
                JSON.stringify({
                    success: true,
                })
            );
            render(
                <StudentFilter
                    setFilteredStudents={setFilteredStudents}
                    display={Display.FULL}
                />
            );
        });
    });
    afterEach(() => {
        fetchMock.resetMocks();
    });
    test("test student filter component render", () => {
        expect(screen.getByTestId("firstNameSort")).toBeInTheDocument();
        expect(screen.getByTestId("firstNameInput")).toBeInTheDocument();
        expect(screen.getByTestId("lastNameSort")).toBeInTheDocument();
        expect(screen.getByTestId("lastNameInput")).toBeInTheDocument();
        expect(screen.getByTestId("emailSort")).toBeInTheDocument();
        expect(screen.getByTestId("emailInput")).toBeInTheDocument();
        expect(screen.getByTestId("osocYearInput")).toBeInTheDocument();
        expect(screen.getByTestId("alumniFilter")).toBeInTheDocument();
        expect(screen.getByTestId("coachFilter")).toBeInTheDocument();
        expect(
            screen.getByTestId("rolesSelectedFilterDisplay")
        ).toBeInTheDocument();
        expect(screen.getByTestId("emailFilterDisplay")).toBeInTheDocument();
        expect(screen.getByTestId("emailFilterNone")).toBeInTheDocument();
        expect(screen.getByTestId("emailFilterDraft")).toBeInTheDocument();
        expect(screen.getByTestId("emailFilterSent")).toBeInTheDocument();
        expect(screen.getByTestId("emailFilterFailed")).toBeInTheDocument();
        expect(screen.getByTestId("emailFilterScheduled")).toBeInTheDocument();
        expect(screen.getByTestId("emailFilterYes")).toBeInTheDocument();
        expect(screen.getByTestId("emailFilterMaybe")).toBeInTheDocument();
        expect(screen.getByTestId("emailFilterNo")).toBeInTheDocument();
        expect(screen.getByTestId("searchButton")).toBeInTheDocument();
    });

    test("test firstname filters", async () => {
        await act(async () => {
            fetchMock.mockOnce(
                JSON.stringify({
                    success: true,
                })
            );
            fetchMock.mockOnce(
                JSON.stringify({
                    success: true,
                })
            );
            await fireEvent.click(screen.getByTestId("firstNameSort"));
        });
        let lastLength = fetchMock.mock.calls.length - 1;
        expect(fetchMock.mock.calls[lastLength][0]).toBe(
            "undefined/student/filter?firstNameSort=asc"
        );
        await act(async () => {
            fetchMock.mockOnce(
                JSON.stringify({
                    success: true,
                })
            );
            await fireEvent.click(screen.getByTestId("firstNameSort"));
        });
        lastLength = fetchMock.mock.calls.length - 1;
        expect(fetchMock.mock.calls[lastLength][0]).toBe(
            "undefined/student/filter?firstNameSort=desc"
        );
        await act(async () => {
            fetchMock.mockOnce(
                JSON.stringify({
                    success: true,
                })
            );
            await fireEvent.click(screen.getByTestId("firstNameSort"));
        });
        lastLength = fetchMock.mock.calls.length - 1;
        expect(fetchMock.mock.calls[lastLength][0]).toBe(
            "undefined/student/filter"
        );
        const name_text = "first name";
        await act(async () => {
            await fireEvent.type(
                screen.getByTestId("firstNameInput"),
                name_text
            );
            fetchMock.mockOnce(
                JSON.stringify({
                    success: true,
                })
            );
            screen.getByTestId("searchButton").click();
        });
        lastLength = fetchMock.mock.calls.length - 1;
        expect(fetchMock.mock.calls[lastLength][0]).toBe(
            `undefined/student/filter?firstNameFilter=${name_text}`
        );
        await act(async () => {
            await fireEvent.clear(screen.getByTestId("firstNameInput"));
            fetchMock.mockOnce(
                JSON.stringify({
                    success: true,
                })
            );
            screen.getByTestId("searchButton").click();
        });
        lastLength = fetchMock.mock.calls.length - 1;
        expect(fetchMock.mock.calls[lastLength][0]).toBe(
            `undefined/student/filter`
        );
    });

    test("test lastname filters", async () => {
        await act(async () => {
            fetchMock.mockOnce(
                JSON.stringify({
                    success: true,
                })
            );
            fetchMock.mockOnce(
                JSON.stringify({
                    success: true,
                })
            );
            await fireEvent.click(screen.getByTestId("lastNameSort"));
        });
        let lastLength = fetchMock.mock.calls.length - 1;
        expect(fetchMock.mock.calls[lastLength][0]).toBe(
            "undefined/student/filter?lastNameSort=asc"
        );
        await act(async () => {
            fetchMock.mockOnce(
                JSON.stringify({
                    success: true,
                })
            );
            await fireEvent.click(screen.getByTestId("lastNameSort"));
        });
        lastLength = fetchMock.mock.calls.length - 1;
        expect(fetchMock.mock.calls[lastLength][0]).toBe(
            "undefined/student/filter?lastNameSort=desc"
        );
        await act(async () => {
            fetchMock.mockOnce(
                JSON.stringify({
                    success: true,
                })
            );
            await fireEvent.click(screen.getByTestId("lastNameSort"));
        });
        lastLength = fetchMock.mock.calls.length - 1;
        expect(fetchMock.mock.calls[lastLength][0]).toBe(
            "undefined/student/filter"
        );
        const name_text = "last name";
        await act(async () => {
            await fireEvent.type(
                screen.getByTestId("lastNameInput"),
                name_text
            );
            fetchMock.mockOnce(
                JSON.stringify({
                    success: true,
                })
            );
            screen.getByTestId("searchButton").click();
        });
        lastLength = fetchMock.mock.calls.length - 1;
        expect(fetchMock.mock.calls[lastLength][0]).toBe(
            `undefined/student/filter?lastNameFilter=${name_text}`
        );
        await act(async () => {
            await fireEvent.clear(screen.getByTestId("lastNameInput"));
            fetchMock.mockOnce(
                JSON.stringify({
                    success: true,
                })
            );
            screen.getByTestId("searchButton").click();
        });
        lastLength = fetchMock.mock.calls.length - 1;
        expect(fetchMock.mock.calls[lastLength][0]).toBe(
            `undefined/student/filter`
        );
    });

    test("test email filters", async () => {
        await act(async () => {
            fetchMock.mockOnce(
                JSON.stringify({
                    success: true,
                })
            );
            fetchMock.mockOnce(
                JSON.stringify({
                    success: true,
                })
            );
            await fireEvent.click(screen.getByTestId("emailSort"));
        });
        let lastLength = fetchMock.mock.calls.length - 1;
        expect(fetchMock.mock.calls[lastLength][0]).toBe(
            "undefined/student/filter?emailSort=asc"
        );
        await act(async () => {
            fetchMock.mockOnce(
                JSON.stringify({
                    success: true,
                })
            );
            await fireEvent.click(screen.getByTestId("emailSort"));
        });
        lastLength = fetchMock.mock.calls.length - 1;
        expect(fetchMock.mock.calls[lastLength][0]).toBe(
            "undefined/student/filter?emailSort=desc"
        );
        await act(async () => {
            fetchMock.mockOnce(
                JSON.stringify({
                    success: true,
                })
            );
            await fireEvent.click(screen.getByTestId("emailSort"));
        });
        lastLength = fetchMock.mock.calls.length - 1;
        expect(fetchMock.mock.calls[lastLength][0]).toBe(
            "undefined/student/filter"
        );
        const name_text = "email";
        await act(async () => {
            await fireEvent.type(screen.getByTestId("emailInput"), name_text);
            fetchMock.mockOnce(
                JSON.stringify({
                    success: true,
                })
            );
            screen.getByTestId("searchButton").click();
        });
        lastLength = fetchMock.mock.calls.length - 1;
        expect(fetchMock.mock.calls[lastLength][0]).toBe(
            `undefined/student/filter?emailFilter=${name_text}`
        );
        await act(async () => {
            await fireEvent.clear(screen.getByTestId("emailInput"));
            fetchMock.mockOnce(
                JSON.stringify({
                    success: true,
                })
            );
            screen.getByTestId("searchButton").click();
        });
        lastLength = fetchMock.mock.calls.length - 1;
        expect(fetchMock.mock.calls[lastLength][0]).toBe(
            `undefined/student/filter`
        );
    });

    test("osoc edition filter", async () => {
        const edition = "200";
        await act(async () => {
            await fireEvent.type(screen.getByTestId("osocYearInput"), edition);
            fetchMock.mockOnce(
                JSON.stringify({
                    success: true,
                })
            );
            screen.getByTestId("searchButton").click();
        });
        let lastLength = fetchMock.mock.calls.length - 1;
        expect(fetchMock.mock.calls[lastLength][0]).toBe(
            `undefined/student/filter?osocYear=${edition}`
        );
        await act(async () => {
            await fireEvent.clear(screen.getByTestId("osocYearInput"));
            fetchMock.mockOnce(
                JSON.stringify({
                    success: true,
                })
            );
            screen.getByTestId("searchButton").click();
        });
        lastLength = fetchMock.mock.calls.length - 1;
        expect(fetchMock.mock.calls[lastLength][0]).toBe(
            `undefined/student/filter`
        );
        //TODO there needs to be some sort of number validation.
    });

    const testButtonHelperFunction1 = async (
        button: string,
        valueFilter: string
    ) => {
        await act(async () => {
            fetchMock.mockOnce(
                JSON.stringify({
                    success: true,
                })
            );
            screen.getByTestId(button).click();
        });
        const lastLength = fetchMock.mock.calls.length - 1;
        expect(fetchMock.mock.calls[lastLength][0]).toBe(
            `undefined/student/filter?${valueFilter}`
        );
    };

    const testButtonHelperFunction2 = async (button: string) => {
        await act(async () => {
            fetchMock.mockOnce(
                JSON.stringify({
                    success: true,
                })
            );
            screen.getByTestId(button).click();
        });
        const lastLength = fetchMock.mock.calls.length - 1;
        expect(fetchMock.mock.calls[lastLength][0]).toBe(
            `undefined/student/filter`
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
        expect(screen.getByTestId("emailFilterDisplay").textContent).toBe(
            valueDisplay
        );
        await testButtonHelperFunction2(button);
        expect(screen.getByTestId("emailFilterDisplay").textContent).toBe(
            "No email selected"
        );
    };

    test("test email filters", async () => {
        await testEmailFilters(
            "emailFilterNone",
            "emailStatusFilter=NONE",
            "NONE"
        );
        await testEmailFilters(
            "emailFilterDraft",
            "emailStatusFilter=DRAFT",
            "DRAFT"
        );
        await testEmailFilters(
            "emailFilterSent",
            "emailStatusFilter=SENT",
            "SENT"
        );
        await testEmailFilters(
            "emailFilterFailed",
            "emailStatusFilter=FAILED",
            "FAILED"
        );
        await testEmailFilters(
            "emailFilterScheduled",
            "emailStatusFilter=SCHEDULED",
            "SCHEDULED"
        );
    });

    test("test filtering on roles", async () => {
        expect(
            screen.getByTestId("rolesSelectedFilterDisplay").textContent
        ).toBe(`No role selected`);
        await act(async () => {
            screen.getByTestId(`testRoleItem=${roles[0].name}`).click();
            fetchMock.mockOnce(
                JSON.stringify({
                    success: true,
                })
            );
            screen.getByTestId("searchButton").click();
        });
        expect(
            screen.getByTestId("rolesSelectedFilterDisplay").textContent
        ).toBe(`1 role selected`);
        let lastLength = fetchMock.mock.calls.length - 1;
        expect(fetchMock.mock.calls[lastLength][0]).toBe(
            `undefined/student/filter?roleFilter=${roles[0].name}`
        );
        await act(async () => {
            screen.getByTestId(`testRoleItem=${roles[1].name}`).click();
            fetchMock.mockOnce(
                JSON.stringify({
                    success: true,
                })
            );
            screen.getByTestId("searchButton").click();
        });
        expect(
            screen.getByTestId("rolesSelectedFilterDisplay").textContent
        ).toBe(`2 roles selected`);
        lastLength = fetchMock.mock.calls.length - 1;
        expect(fetchMock.mock.calls[lastLength][0]).toBe(
            `undefined/student/filter?roleFilter=${roles[0].name},${roles[1].name}`
        );
    });
});
