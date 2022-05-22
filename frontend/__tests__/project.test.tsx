import "@testing-library/jest-dom";
import fetchMock from "jest-fetch-mock";
import { act, render, screen } from "@testing-library/react";
import fireEvent from "@testing-library/user-event";
import Projects from "../pages/projects";
import { defaultUser } from "../defaultUser";
import { Project } from "../types";
import { wrapWithTestBackend } from "react-dnd-test-utils";

jest.mock("next/router", () => require("next-router-mock"));

fetchMock.enableMocks();
jest.mock("next/router");
const student = defaultUser;
const defaultProject: Project = {
    coaches: [],
    end_date: "",
    id: -1,
    name: "",
    osoc_id: -1,
    partner: "",
    positions: -1,
    start_date: "",
    description: "",
    contracts: [],
    roles: [
        {
            name: "DEV",
            positions: 1,
        },
    ],
};

const responseStudents = JSON.stringify({
    success: true,
    data: [student],
    pagination: { count: 0 },
});

const responseProject = JSON.stringify({
    success: true,
    data: [defaultProject],
    pagination: { count: 0 },
});

const response = JSON.stringify({
    success: true,
    data: [],
    pagination: { count: 0 },
});

const pageSize = 5;
describe("project filter tests", () => {
    beforeEach(async () => {
        fetchMock.resetMocks();
        fetchMock.mockOnce(responseStudents);
        fetchMock.mockOnce(response);
        fetchMock.mockOnce(responseProject);
        const [BoxContext] = wrapWithTestBackend(Projects);

        await act(() => {
            render(<BoxContext />);
        });
    });

    test("test filter inputs presents", async () => {
        expect(screen.getByTestId("nameSort")).toBeInTheDocument();
        expect(screen.getByTestId("nameInput")).toBeInTheDocument();
        expect(screen.getByTestId("clientSort")).toBeInTheDocument();
        expect(screen.getByTestId("clientInput")).toBeInTheDocument();
        expect(screen.getByTestId("osocInput")).toBeInTheDocument();
        expect(screen.getByTestId("assignedButton")).toBeInTheDocument();
        expect(
            screen.getByTestId("searchButtonProjectFilter")
        ).toBeInTheDocument();
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
            `undefined/project/filter?${sortReqVal}=asc&currentPage=0&pageSize=${pageSize}`
        );
        await act(async () => {
            fetchMock.mockOnce(response);
            screen.getByTestId(sort).click();
        });
        lastLength = fetchMock.mock.calls.length - 1;
        expect(fetchMock.mock.calls[lastLength][0]).toBe(
            `undefined/project/filter?${sortReqVal}=desc&currentPage=0&pageSize=${pageSize}`
        );
        await act(async () => {
            fetchMock.mockOnce(response);
            screen.getByTestId(sort).click();
        });
        lastLength = fetchMock.mock.calls.length - 1;
        expect(fetchMock.mock.calls[lastLength][0]).toBe(
            `undefined/project/filter?currentPage=0&pageSize=${pageSize}`
        );
        await testInput(input, inputReqVal);
    };
    const testInput = async (input: string, inputReqVal: string) => {
        let lastLength: number;

        const test_val = "testvalue";
        fetchMock.resetMocks();
        await act(async () => {
            await fireEvent.type(screen.getByTestId(input), test_val);
            fetchMock.mockOnce(response);
            screen.getByTestId("searchButtonProjectFilter").click();
        });
        lastLength = fetchMock.mock.calls.length - 1;
        expect(fetchMock.mock.calls[lastLength][0]).toBe(
            `undefined/project/filter?${inputReqVal}=${test_val}&currentPage=0&pageSize=${pageSize}`
        );
        await act(async () => {
            await fireEvent.clear(screen.getByTestId(input));
            fetchMock.mockOnce(response);
            screen.getByTestId("searchButtonProjectFilter").click();
        });
        lastLength = fetchMock.mock.calls.length - 1;
        console.log(fetchMock.mock.calls);
        expect(fetchMock.mock.calls[lastLength][0]).toBe(
            `undefined/project/filter?currentPage=0&pageSize=${pageSize}`
        );
    };
    test("test filters functionality", async () => {
        await testSortAndInput(
            "nameSort",
            "nameInput",
            "projectNameSort",
            "projectNameFilter"
        );
        await testSortAndInput(
            "clientSort",
            "clientInput",
            "clientNameSort",
            "clientNameFilter"
        );
        await testInput("osocInput", "osocYear");
        await act(async () => {
            await fireEvent.click(screen.getByTestId("assignedButton"));
            fetchMock.mockOnce(response);
        });
        let lastLength = fetchMock.mock.calls.length - 1;
        expect(fetchMock.mock.calls[lastLength][0]).toBe(
            `undefined/project/filter?fullyAssignedFilter=true&currentPage=0&pageSize=${pageSize}`
        );
        await act(async () => {
            await fireEvent.click(screen.getByTestId("assignedButton"));
            fetchMock.mockOnce(response);
        });
        lastLength = fetchMock.mock.calls.length - 1;
        expect(fetchMock.mock.calls[lastLength][0]).toBe(
            `undefined/project/filter?currentPage=0&pageSize=${pageSize}`
        );
    });
});
