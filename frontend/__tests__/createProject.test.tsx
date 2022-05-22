import fetchMock from "jest-fetch-mock";
import { act, render, screen } from "@testing-library/react";
import Create from "../pages/projects/create";
import fireEvent from "@testing-library/user-event";

jest.mock("next/router", () => require("next-router-mock"));

fetchMock.enableMocks();
jest.mock("next/router");

const response = JSON.stringify({
    success: true,
    data: [],
    pagination: { count: 0 },
});

describe("project create test", () => {
    beforeEach(async () => {
        fetchMock.resetMocks();
        fetchMock.mockOnce(response);
        fetchMock.mockOnce(response);
        fetchMock.mockOnce(response);
        await act(() => {
            render(<Create />);
        });
    });

    const testInput = async (inputName: string, inputVal: string) => {
        await act(async () => {
            await fireEvent.type(screen.getByTestId(inputName), inputVal);
        });
    };
    const formatDate = () => {
        const date = new Date();
        return [
            date.getFullYear(),
            padTo2Digits(date.getMonth() + 1),
            padTo2Digits(date.getDate()),
        ].join("-");
    };
    const padTo2Digits = (num: number) => {
        return num.toString().padStart(2, "0");
    };
    test("test inputs", async () => {
        const input = "aaa";
        const date1 = formatDate();
        await testInput("nameInput", input);
        await testInput("partnerInput", input);
        await testInput("descriptionInput", input);
        await act(async () => {
            fetchMock.mockOnce(response);
            await screen.getByTestId("confirmButton").click();
        });
        const lastLength = fetchMock.mock.calls.length - 1;
        expect(fetchMock.mock.calls[lastLength][0]).toBe(`undefined/project`);
        expect(fetchMock.mock.calls[lastLength][1]?.body).toBe(
            `{"name":"${input}","partner":"${input}","start":"${date1}","end":"${date1}","osocId":0,"positions":0,"roles":{"roles":[]},"description":"${input}","coaches":{"coaches":[]}}`
        );
    });
});
