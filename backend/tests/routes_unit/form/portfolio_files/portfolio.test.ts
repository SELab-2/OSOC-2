import { errors } from "../../../../utility";

import { getPortfolio, readFile } from "../../../../routes/form";
import { Requests } from "../../../../types";
import Form = Requests.Form;

test("The portfolio link question is absent", async () => {
    const data = await readFile(
        "../tests/routes_unit/form/portfolio_files",
        "portfolioLinkQuestionAbsent.json"
    );
    expect(data).not.toBeNull();

    await expect(getPortfolio(data as Form)).rejects.toBe(
        errors.cookArgumentError()
    );
});

test("The value of the portfolio link question is not empty", async () => {
    const data = await readFile(
        "../tests/routes_unit/form/portfolio_files",
        "portfolioLinkValueNotEmpty.json"
    );
    expect(data).not.toBeNull();

    await expect(getPortfolio(data as Form)).resolves.toStrictEqual({
        data: [
            "https://storage.googleapis.com/tally-response-assets/repXzN/b1a201e0-9d51-4cba-811b-a6c62c0ba098/attachment.txt",
        ],
        types: ["PORTFOLIO_URL"],
    });
});

test("The url field in the portfolio upload question is undefined", async () => {
    const data = await readFile(
        "../tests/routes_unit/form/portfolio_files",
        "portfolioUrlNotDefined.json"
    );
    expect(data).not.toBeNull();

    await expect(getPortfolio(data as Form)).rejects.toBe(
        errors.cookArgumentError()
    );
});

test("The value of the portfolio upload field is valid", async () => {
    const data = await readFile(
        "../tests/routes_unit/form/portfolio_files",
        "portfolioUploadValueValid.json"
    );
    expect(data).not.toBeNull();

    await expect(getPortfolio(data as Form)).resolves.toStrictEqual({
        data: [
            "https://storage.googleapis.com/tally-response-assets/repXzN/acddeba6-6022-4eed-88cc-7e6b632dcf55/attachment.txt",
        ],
        types: ["PORTFOLIO_URL"],
    });
});
