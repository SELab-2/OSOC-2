import * as supertest from "supertest";
import * as server from "../../server";
import * as ogConf from "../../config.json";
import { Verb, Anything, ApiError } from "../../types";
import * as db from "../database_setup";

export interface Config {
    auth: { enable: boolean; type: string; value: string };
    accept: { enable: boolean; value: string };
}

export interface RequestParams {
    [key: string]: string;
}

export interface Data {
    request?: RequestParams;
    body?: Anything;
}

export interface Response {
    code: number;
    data: Anything;
}

export const conf: Config = {
    auth: { enable: true, type: ogConf.global.authScheme, value: "" },
    accept: { enable: true, value: "application/json" },
};

export function keyConf(key: string): Config {
    return { ...conf, auth: { ...conf.auth, value: key } };
}

export function endpoint(verb: Verb, ep: string, data: Data, config?: Config) {
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

export async function expectResponse(req: supertest.Test, data: Response) {
    const res = await req;
    expect(res.statusCode).toBe(data.code);
    expect(res.body).toStrictEqual(data.data);
}

export async function expectApiError(req: supertest.Test, err: ApiError) {
    return expectResponse(req, {
        code: err.http,
        data: { success: false, reason: err.reason },
    });
}

beforeAll(async () => await db.hashAllPasswords());
