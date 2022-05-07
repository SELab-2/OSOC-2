import "@testing-library/jest-dom";
import fetchMock from "jest-fetch-mock";
import { act, render, screen } from "@testing-library/react";
import fireEvent from "@testing-library/user-event";
import { OsocCreateFilter } from "../components/Filter/OsocFilter/OsocFilter";

jest.mock("next/router", () => require("next-router-mock"));

fetchMock.enableMocks();
jest.mock("next/router");
let updateOsoc: jest.Mock;

describe("User component tests", () => {
    beforeEach(() => {
        updateOsoc = jest.fn();
        fetchMock.resetMocks();
        fetchMock.mockOnce(
            JSON.stringify({ success: true, data: { test: [] } })
        );
        render(<OsocCreateFilter updateOsoc={updateOsoc} />);
    });
    afterEach(() => {
        fetchMock.resetMocks();
    });
    test("test rendering osoc filter", () => {
        expect(screen.getByTestId("yearSorter")).toBeInTheDocument();
        expect(screen.getByTestId("yearFilter")).toBeInTheDocument();
        expect(screen.getByTestId("searchButton")).toBeInTheDocument();
        expect(screen.getByTestId("yearInput")).toBeInTheDocument();
        expect(screen.getByTestId("createButton")).toBeInTheDocument();
    });

    test("filtering osoc edition", async () => {
        await act(async () => {
            fetchMock.mockOnce(
                JSON.stringify({ success: true, data: { test: [] } })
            );
            await fireEvent.click(screen.getByTestId("yearSorter"));
        });
        let lastLength = fetchMock.mock.calls.length - 1;
        expect(fetchMock.mock.calls[lastLength][0]).toBe(
            "undefined/osoc/filter?yearSort=asc"
        );
        await act(async () => {
            fetchMock.mockOnce(
                JSON.stringify({ success: true, data: { test: [] } })
            );
            await fireEvent.click(screen.getByTestId("yearSorter"));
        });
        lastLength = fetchMock.mock.calls.length - 1;
        expect(fetchMock.mock.calls[lastLength][0]).toBe(
            "undefined/osoc/filter?yearSort=desc"
        );
        await act(async () => {
            fetchMock.mockOnce(
                JSON.stringify({ success: true, data: { test: [] } })
            );
            await fireEvent.click(screen.getByTestId("yearSorter"));
        });
        lastLength = fetchMock.mock.calls.length - 1;
        expect(fetchMock.mock.calls[lastLength][0]).toBe(
            "undefined/osoc/filter"
        );
    });

    test("test osoc filter", async () => {
        await act(async () => {
            fetchMock.mockOnce(
                JSON.stringify({ success: true, data: { test: [] } })
            );
            await fireEvent.type(screen.getByTestId("yearFilter"), "2020");
            screen.getByTestId("searchButton").click();
        });
        const lastLength = fetchMock.mock.calls.length - 1;
        expect(fetchMock.mock.calls[lastLength][0]).toBe(
            "undefined/osoc/filter?yearFilter=2020"
        );
    });

    test("test create osoc year", async () => {
        await act(async () => {
            fetchMock.mockOnce(
                JSON.stringify({ success: true, data: { test: [] } })
            );
            fetchMock.mockOnce(
                JSON.stringify({ success: true, data: { test: [] } })
            );
            await fireEvent.type(screen.getByTestId("yearInput"), "2020");
            screen.getByTestId("createButton").click();
        });
        const lastLength = fetchMock.mock.calls.length - 2;
        expect(fetchMock.mock.calls[lastLength][0]).toBe(
            "undefined/osoc/create"
        );
        expect(fetchMock.mock.calls[lastLength][1]?.body).toBe(
            '{"year":"2020"}'
        );
    });
});
