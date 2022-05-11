import * as T from "../../../../types";
import fs from "fs";
import path from "path";

import { Requests } from "../../../../types";
import Form = Requests.Form;

import * as form_router from "../../../../routes/form";
//jest.mock("../../../../routes/form");
//const formMock = form as jest.Mocked<typeof form>;

// setup
beforeEach(() => {
    // mocks for orm
    /*formMock.getAppliedRoles.mockResolvedValue([
        "Front-end developer",
        "Back-end developer",
    ]);*/
});

// reset
afterEach(() => {
    //formMock.getAppliedRoles.mockReset();
});

function readFile(file: string): T.Requests.Form | null {
    const readFile = (path: string) => fs.readFileSync(path, "utf8");
    const fileData = readFile(path.join(__dirname, `./${file}`));
    return JSON.parse(fileData);
}

test("Parse the form to the applied roles", async () => {
    const dataForm = readFile("form.json");

    await expect(
        form_router.jsonToRoles(dataForm as Form)
    ).resolves.toStrictEqual({
        roles: ["Front-end developer", "Back-end developer"],
    });
});
