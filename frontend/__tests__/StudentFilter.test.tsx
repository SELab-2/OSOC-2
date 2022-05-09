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

describe("student filter tests", () => {
    beforeEach(async () => {
        setFilteredStudents = jest.fn();
        fetchMock.resetMocks();

        await act(async () => {
            fetchMock.mockOnce(
                JSON.stringify({
                    success: true,
                    data: [{ role_id: 1, name: "Developer" }],
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
        expect(
            screen.getByTestId("rolesSelectedFilterMenu")
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
        await act(async () => {
            await fireEvent.type(
                screen.getByTestId("firstNameInput"),
                "first name"
            );
        });
    });
});
