import * as helpers from "./integr";
import { errors } from "../../utility";
import * as db from "../database_setup";
import "../integration_setup";

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

beforeAll(async () => await db.hashAllPasswords());
