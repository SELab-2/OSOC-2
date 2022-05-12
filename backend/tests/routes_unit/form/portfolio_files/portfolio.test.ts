import { errors } from "../../../../utility";

import { getPortfolio } from "../../../../routes/form";
import * as T from "../../../../types";
import fs from "fs";
import path from "path";
import { Requests } from "../../../../types";
import Form = Requests.Form;

export function readFile(file: string): T.Requests.Form | null {
    const readFile = (path: string) => fs.readFileSync(path, "utf8");
    const fileData = readFile(path.join(__dirname, `./${file}`));
    return JSON.parse(fileData);
}

test("The portfolio link question is absent", async () => {
    const data = readFile("portfolioLinkQuestionAbsent.json");
    expect(data).not.toBeNull();

    await expect(getPortfolio(data as Form)).rejects.toBe(
        errors.cookArgumentError()
    );
});

test("The value of the portfolio link question is not empty", async () => {
    const data = readFile("portfolioLinkValueNotEmpty.json");
    expect(data).not.toBeNull();

    await expect(getPortfolio(data as Form)).resolves.toStrictEqual({
        data: [
            "https://storage.googleapis.com/tally-response-assets/repXzN/b1a201e0-9d51-4cba-811b-a6c62c0ba098/attachment.txt",
        ],
        types: ["PORTFOLIO_URL"],
    });
});

test("The url field in the portfolio upload question is undefined", async () => {
    const data = readFile("portfolioUrlNotDefined.json");
    expect(data).not.toBeNull();

    await expect(getPortfolio(data as Form)).rejects.toBe(
        errors.cookArgumentError()
    );
});

test("The value of the portfolio upload field is valid", async () => {
    const data = readFile("portfolioUploadValueValid.json");
    expect(data).not.toBeNull();

    await expect(getPortfolio(data as Form)).resolves.toStrictEqual({
        data: [
            "https://storage.googleapis.com/tally-response-assets/repXzN/acddeba6-6022-4eed-88cc-7e6b632dcf55/attachment.txt",
        ],
        types: ["PORTFOLIO_URL"],
    });
});
