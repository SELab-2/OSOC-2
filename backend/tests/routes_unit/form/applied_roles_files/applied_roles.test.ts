import { errors } from "../../../../utility";

import { getAppliedRoles, readFile } from "../../../../routes/form";
import { Requests } from "../../../../types";
import Form = Requests.Form;

test("Applied roles question value is null", async () => {
    const data = await readFile(
        "../tests/routes_unit/form/applied_roles_files",
        "failAppliedRolesValueNull.json"
    );
    expect(data).not.toBeNull();

    await expect(getAppliedRoles(data as Form)).rejects.toBe(
        errors.cookArgumentError()
    );
});

test("Applied roles question value is null", async () => {
    const data = await readFile(
        "../tests/routes_unit/form/applied_roles_files",
        "failAppliedRolesOptions.json"
    );
    expect(data).not.toBeNull();

    await expect(getAppliedRoles(data as Form)).rejects.toBe(
        errors.cookArgumentError()
    );
});

test("Applied roles other option value is null", async () => {
    const data = await readFile(
        "../tests/routes_unit/form/applied_roles_files",
        "failAppliedRolesOtherOptionValueNull.json"
    );
    expect(data).not.toBeNull();

    await expect(getAppliedRoles(data as Form)).rejects.toBe(
        errors.cookArgumentError()
    );
});

test("Applied roles other option value is valid", async () => {
    const data = await readFile(
        "../tests/routes_unit/form/applied_roles_files",
        "appliedRolesOtherOptionValid.json"
    );
    expect(data).not.toBeNull();

    await expect(getAppliedRoles(data as Form)).resolves.toStrictEqual([
        "Gamer",
    ]);
});
