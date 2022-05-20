import "@testing-library/jest-dom";
import fetchMock from "jest-fetch-mock";
import { act, render, screen } from "@testing-library/react";
import fireEvent from "@testing-library/user-event";
import Osocs from "../pages/osocs";

jest.mock("next/router", () => require("next-router-mock"));

fetchMock.enableMocks();
jest.mock("next/router");

const response = JSON.stringify({
    success: true,
    data: [],
    pagination: { count: 0 },
});
describe("Osoc filter tests", () => {
    beforeEach(async () => {
        fetchMock.resetMocks();
        fetchMock.mockOnce(response);
        fetchMock.mockOnce(response);
        await act(async () => {
            await render(<Osocs />);
        });
    });
    afterEach(() => {
        fetchMock.resetMocks();
    });
    test("test rendering osoc filter", () => {
        expect(screen.getByTestId("yearSorter")).toBeInTheDocument();
        expect(screen.getByTestId("yearFilter")).toBeInTheDocument();
        expect(screen.getByTestId("searchButton")).toBeInTheDocument();
    });

    test("filtering osoc edition", async () => {
        await act(async () => {
            fetchMock.mockOnce(response);
            await fireEvent.click(screen.getByTestId("yearSorter"));
        });
        let lastLength = fetchMock.mock.calls.length - 1;
        expect(fetchMock.mock.calls[lastLength][0]).toBe(
            "undefined/osoc/filter?yearSort=asc&currentPage=0&pageSize=20"
        );
        await act(async () => {
            fetchMock.mockOnce(response);
            await fireEvent.click(screen.getByTestId("yearSorter"));
        });
        lastLength = fetchMock.mock.calls.length - 1;
        expect(fetchMock.mock.calls[lastLength][0]).toBe(
            "undefined/osoc/filter?yearSort=desc&currentPage=0&pageSize=20"
        );
        await act(async () => {
            fetchMock.mockOnce(response);
            await fireEvent.click(screen.getByTestId("yearSorter"));
        });
        lastLength = fetchMock.mock.calls.length - 1;
        expect(fetchMock.mock.calls[lastLength][0]).toBe(
            "undefined/osoc/filter?currentPage=0&pageSize=20"
        );
    });

    test("test osoc filter", async () => {
        await act(async () => {
            fetchMock.mockOnce(response);
            await fireEvent.type(screen.getByTestId("yearFilter"), "2020");
            screen.getByTestId("searchButton").click();
        });
        const lastLength = fetchMock.mock.calls.length - 1;
        expect(fetchMock.mock.calls[lastLength][0]).toBe(
            "undefined/osoc/filter?yearFilter=2020&currentPage=0&pageSize=20"
        );
    });
});
