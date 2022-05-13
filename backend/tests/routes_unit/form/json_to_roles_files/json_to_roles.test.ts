import { Requests } from "../../../../types";
import Form = Requests.Form;

import * as form_router from "../../../../routes/form";

test("Parse the form to the applied roles", async () => {
    const dataForm = await form_router.readFile(
        "../tests/routes_unit/form/json_to_roles_files",
        "form.json"
    );

    await expect(
        form_router.jsonToRoles(dataForm as Form)
    ).resolves.toStrictEqual({
        roles: ["Front-end developer", "Back-end developer"],
    });
});
