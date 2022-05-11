import { errors } from "../../../../utility";

import { getAppliedRoles } from "../../../../routes/form";
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

test("Applied roles question value is null", async () => {
    const data = readFile("failAppliedRolesValueNull.json");
    expect(data).not.toBeNull();

    await expect(getAppliedRoles(data as Form)).rejects.toBe(
        errors.cookArgumentError()
    );
});

test("Applied roles question value is null", async () => {
    const data = readFile("failAppliedRolesOptions.json");
    expect(data).not.toBeNull();

    await expect(getAppliedRoles(data as Form)).rejects.toBe(
        errors.cookArgumentError()
    );
});

test("Applied roles other option value is null", async () => {
    const data = readFile("failAppliedRolesOtherOptionValueNull.json");
    expect(data).not.toBeNull();

    await expect(getAppliedRoles(data as Form)).rejects.toBe(
        errors.cookArgumentError()
    );
});

test("Applied roles other option value is valid", async () => {
    const data = readFile("appliedRolesOtherOptionValid.json");
    expect(data).not.toBeNull();

    await expect(getAppliedRoles(data as Form)).resolves.toStrictEqual([
        "Gamer",
    ]);
});
