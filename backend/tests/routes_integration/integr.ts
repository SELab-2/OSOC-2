import * as supertest from "supertest";
import * as server from "../../server";
import * as ogConf from "../../config.json";
import { Verb, Anything, ApiError } from "../../types";
import { errors, generateKey } from "../../utility";
import prisma from "../../prisma/prisma";

export interface Config {
    auth: { enable: boolean; type: string; value: string };
    accept: { enable: boolean; value: string };
}

export interface RequestParams {
    [key: string]: string;
}

export interface Data {
    request?: RequestParams;
    body?: unknown;
}

export interface Response {
    code: number;
    data: Anything;
}

export const conf: Config = {
    auth: { enable: true, type: ogConf.global.authScheme, value: "" },
    accept: { enable: true, value: "application/json" },
};

export function keyConf(
    key: string,
    og: Config = conf,
    correctType = false
): Config {
    const val = { ...og, auth: { ...conf.auth, value: key } };
    if (correctType) val.auth.type = ogConf.global.authScheme;
    return val;
}

export function endpoint(
    verb: Verb,
    ep: string,
    data: Data,
    config: Config = conf
) {
    if (config == undefined) {
        config = conf;
    }

    if (data.request != undefined) {
        ep += "?";
        for (const key in data.request) {
            ep +=
                encodeURIComponent(key) +
                "=" +
                encodeURIComponent(data.request[key]) +
                "&";
        }
    }

    let intermediate = supertest.default(server.app)[verb](ep);

    if (config.accept.enable) {
        intermediate = intermediate.set("Accept", config.accept.value);
    }

    if (config.auth.enable) {
        intermediate = intermediate.set(
            "Authorization",
            config.auth.type + " " + config.auth.value
        );
    }

    if (data.body != undefined) {
        return intermediate.send(data.body);
    }
    return intermediate.send();
}

export async function expectHttp(req: supertest.Test, code: number) {
    const res = await req;
    expect(res.statusCode).toBe(code);
    return res.body;
}

export async function expectResponse(req: supertest.Test, data: Response) {
    const body = await expectHttp(req, data.code);
    expect(body).toStrictEqual(data.data);
}

export async function expectApiError(req: supertest.Test, err: ApiError) {
    return expectResponse(req, {
        code: err.http,
        data: { success: false, reason: err.reason },
    });
}

export async function runNoSessionKey(
    verb: Verb,
    ep: string,
    data: Data[],
    config: Config = conf
) {
    const updConf: Config = {
        ...config,
        auth: { enable: false, type: "", value: "" },
    };

    await Promise.all(
        data.map(async (sub) => {
            const req = endpoint(verb, ep, sub, updConf);
            await expectApiError(req, errors.cookUnauthenticated());
        })
    );
}

export async function runInvalidSessionKey(
    verb: Verb,
    ep: string,
    data: Data[],
    config: Config = conf
) {
    await Promise.all(
        data.map(async (sub) => {
            let key = "";
            let found = false;
            do {
                // generate unused key (shouldn't usually take more than one try)
                key = generateKey();
                const tmp = await prisma.session_keys.findUnique({
                    where: { session_key: key },
                });
                found = tmp != null;
            } while (found);

            const withKey = keyConf(key, config, true);
            const req = endpoint(verb, ep, sub, withKey);
            await expectApiError(req, errors.cookUnauthenticated());
        })
    );
}
