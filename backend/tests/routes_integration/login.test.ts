import * as helpers from "./integr";
import { errors } from "../../utility";
import * as db from "../database_setup";
import prisma from "../../prisma/prisma";
import "../integration_setup";
import { ApiError, StringDict } from "../../types";
import * as config from "../../config.json";
import * as bcrypt from "bcrypt";
import { account_status_enum } from "@prisma/client";

let ogPasswords: db.OGNamePass[] = [];

const credError: ApiError = {
    http: 409,
    reason: "Invalid e-mail or password.",
};
const disabledError: ApiError = {
    http: 409,
    reason: "Account is disabled.",
};

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

    test("  -> with invalid email addresses", async () => {
        await Promise.all(
            ogPasswords.map(async (og) => {
                const bd = { ...og, name: "some" + og.name }; // modify email addresses
                const req = helpers.endpoint(
                    "post",
                    "/login",
                    { body: bd },
                    loginConfig
                );
                return helpers.expectApiError(req, credError);
            })
        );
    });

    test("  -> with invalid passwords", async () => {
        await Promise.all(
            ogPasswords.map(async (og) => {
                const bd = { ...og, pass: "some" + og.pass }; // modify passwords
                const req = helpers.endpoint(
                    "post",
                    "/login",
                    { body: bd },
                    loginConfig
                );
                return helpers.expectApiError(req, credError);
            })
        );
    });

    test("  -> with valid credentials", async () => {
        const keys = await Promise.all(
            ogPasswords.map(async (og) => {
                const req = helpers.endpoint(
                    "post",
                    "/login",
                    { body: og },
                    loginConfig
                );
                return helpers.expectHttp(req, 200).then((x) => ({
                    key: x.sessionkey as string,
                    name: og.name,
                }));
            })
        );

        expect(new Set(keys.map((x) => x.key)).size).toBe(keys.length); // all keys are unique

        await Promise.all(
            keys.map(async (v) => {
                const res = await prisma.session_keys.findUnique({
                    where: {
                        session_key: v.key,
                    },
                    select: {
                        login_user: { select: { person: true } },
                    },
                });

                expect(res).not.toBeNull(); // existence
                expect(res?.login_user.person.email).toBe(v.name); // match email
            })
        );
    });

    test("  -> with disabled account", async () => {
        // set up disabled account
        const pass = "imapassword";
        const hash = await bcrypt.hash(
            pass,
            config.encryption.encryptionRounds
        );
        const user = {
            password: hash,
            is_admin: false,
            is_coach: false,
            account_status: "DISABLED" as account_status_enum,
        };
        const person = {
            email: "person@person.com",
            name: "person",
        };
        await prisma.person.create({ data: person }).then((p) => {
            const u = { ...user, person_id: p.person_id };
            return prisma.login_user.create({ data: u });
        });

        // call ep
        const req = helpers.endpoint(
            "post",
            "/login",
            { body: { name: person.email, pass: pass } },
            loginConfig
        );
        await helpers.expectApiError(req, disabledError);
    });
});

describe("DELETE /login endpoint", () => {
    test("  -> with missing session key", async () => {
        await helpers.runNoSessionKey("delete", "/login", [{}]);
    });

    test("  -> with invalid session key", async () => {
        await helpers.runInvalidSessionKey("delete", "/login", [{}]);
    });

    test("  -> with valid session key", async () => {
        // setup
        const resp = { code: 200, data: { success: true } };
        const byUser: StringDict<{ keys: string[]; user: number }> = {};
        (await prisma.session_keys.findMany()).forEach((key) => {
            if (key.login_user_id in byUser)
                byUser[key.login_user_id.toString()].keys.push(key.session_key);
            else
                byUser[key.login_user_id.toString()] = {
                    keys: [key.session_key],
                    user: key.login_user_id,
                };
        });

        for (const user in byUser) {
            expect(byUser[user].keys.length).toBeGreaterThan(0); // quite important
            const conf = helpers.keyConf(
                byUser[user].keys[0],
                helpers.conf,
                true
            );
            const req = helpers.endpoint("delete", "/login", {}, conf);
            await helpers.expectResponse(req, resp); // ep succeeds

            const result = await prisma.session_keys.findMany({
                where: { login_user_id: byUser[user].user },
            });
            expect(result.length).toBe(0); // no keys left for user
        }
    });
});

beforeAll(async () => (ogPasswords = await db.hashAllPasswords()));
