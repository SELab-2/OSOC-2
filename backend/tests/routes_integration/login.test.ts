import * as helpers from "./integr";
import { errors } from "../../utility";

describe("POST /login endpoint", () => {
    const loginConfig = {
        ...helpers.conf,
        auth: { enable: false, type: "", value: "" },
    };
    test("  -> with missing arguments", async () => {
        const bodies = [{}, { name: "jeff" }, { pass: "jeff" }];
        await Promise.all(
            bodies.map(async (v) => {
                const request = helpers.endpoint(
                    "post",
                    "/login",
                    { body: v },
                    loginConfig
                );
                await helpers.expectApiError(
                    request,
                    errors.cookArgumentError()
                );
            })
        );
    });
});
