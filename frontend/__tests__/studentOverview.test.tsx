import "@testing-library/jest-dom";
import fetchMock from "jest-fetch-mock";

jest.mock("next/router", () => require("next-router-mock"));

fetchMock.enableMocks();
jest.mock("next/router");

describe("student filter tests", () => {
    beforeEach(async () => {
        fetchMock.resetMocks();
    });
    afterEach(() => {
        fetchMock.resetMocks();
    });
});
