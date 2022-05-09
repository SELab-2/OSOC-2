import * as supertest from "supertest";
import * as server from "../../server";
import * as ogConf from "../../config.json";
import { Verb, ApiError } from "../../types";
import { errors, generateKey } from "../../utility";
import prisma from "../../prisma/prisma";

/**
 *  The type of the configuration for supertest requests
 */
export interface Config {
    /**
     *  The configuration for the authentication scheme
     */
    auth: {
        /**
         *  Enable this part of the config?
         */
        enable: boolean;
        /**
         *  The type of authentication (the authentication scheme)
         */
        type: string;
        /**
         *  The value for the authentication (the actual session key, ...)
         */
        value: string;
    };
    /**
     *  The configuration for the Accept header
     */
    accept: {
        /**
         *  Enable this part of the config?
         */
        enable: boolean;
        /**
         *  The MIME type to accept (e.g. `application/json`)
         */
        value: string;
    };
}

/**
 *  The type of the request parameters (a dictionary of string to string)
 */
export interface RequestParams {
    [key: string]: string;
}

/**
 *  The type for the data to send in supertest requests
 *  @template T The type of data for the body
 */
export interface Data<T extends string | object | undefined> {
    /**
     *  The request parameters (or URL parameters) to pass
     */
    request?: RequestParams;
    /**
     *  The body data to pass
     */
    body?: T;
}

/**
 *  The type for an expected Response
 *  @template T The type of data you expect to receive
 */
export interface Response<T extends object> {
    /**
     *  The expected HTTP status code
     */
    code: number;
    /**
     *  The expected data in the body
     */
    data: T;
}

/**
 *  A default configuration. It is ready to accept a normal session key, and
 * requests the server to return `application/json`.
 */
export const conf: Config = {
    auth: { enable: true, type: ogConf.global.authScheme, value: "" },
    accept: { enable: true, value: "application/json" },
};

/**
 *  Sets up a config authenticated with the given key.
 *  @param key The key to inject into the config.
 *  @param og An initial config. If this value is not given, use the default
 * config. This value will never be modified (a copy will be returned).
 *  @param correctType Whether or not to set the correct authentication scheme.
 * If this value is not given, use the default false (don't set the correct
 * type).
 *  @returns A copy of the given config, where the key has been set. If no
 * initial config is given, copies the default config. If `correctType == true`,
 * also sets the correct authentication scheme.
 */
export function keyConf(
    key: string,
    og: Config = conf,
    correctType = false
): Config {
    const val = { ...og, auth: { ...conf.auth, value: key } };
    if (correctType) val.auth.type = ogConf.global.authScheme;
    return val;
}

/**
 *  Uses supertest to call the given endpoint. The returned value can be used as
 * a Promise (which supports further testing). Upon awaiting, returns the result
 * from supertest (which among others holds the response data and status code).
 *  @template T The type of data held in the body (can be undefined).
 *  @param verb The HTTP verb to use.
 *  @param ep The endpoint to call (should start with a leading `/`).
 *  @param data The data to pass (both request parameters and body data).
 *  @param config The configuration to use. If this parameter is not given, uses
 * the default config.
 *  @returns The result from calling the given endpoint using supertest (a
 * Promise-like object).
 */
export function endpoint<T extends string | object | undefined>(
    verb: Verb,
    ep: string,
    data: Data<T>,
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

/**
 *  Checks whether the given supertest result has the given status code
 * (using jest), then returns the body of the result. This method will cause the
 * surrounding jest test to fail if the HTTP code does not match.
 *  @param req The result from supertest.
 *  @param code The HTTP code you expect.
 *  @returns The body of the supertest result.
 */
export async function expectHttp(req: supertest.Test, code: number) {
    const res = await req;
    expect(res.statusCode).toBe(code);
    return res.body;
}

/**
 *  Checks whether the given supertes result has both the given status code and
 * body data (using jest). This method will cause the surrounding jest test to
 * fail if either does not match.
 *  @template T The type of the body (should be an object).
 *  @param req The result from supertest.
 *  @param data A Response object holding the expected values.
 */
export async function expectResponse<T extends object>(
    req: supertest.Test,
    data: Response<T>
) {
    const body = await expectHttp(req, data.code);
    expect(body).toStrictEqual(data.data);
}

/**
 *  Convenience wrapper around expectResponse for ApiError values.
 *  @see expectResponse(req, data).
 *  @param req The result from supertest.
 *  @param err The API error you expect the server to 'throw'.
 */
export async function expectApiError(req: supertest.Test, err: ApiError) {
    return expectResponse(req, {
        code: err.http,
        data: { success: false, reason: err.reason },
    });
}

/**
 *  Calls the given endpoint without a session key, and expects an API error of
 * type unauthenticated request.
 *  @template T The type of data held in the body (can be undefined).
 *  @param verb The HTTP verb to use.
 *  @param ep The endpoint to call (should start with a leading `/`).
 *  @param data The data to pass (both request parameters and body data). Each
 * of these values is passed as a separate request.
 *  @param config The configuration to use. If this parameter is not given, uses
 * the default config. This value is never modified, and is re-used for each \
 * object in the data parameter.
 */
export async function runNoSessionKey<T extends string | object | undefined>(
    verb: Verb,
    ep: string,
    data: Data<T>[],
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

/**
 *  Calls the given endpoint with a random, invalid session key, and expects an
 * API error of type unauthenticated request.
 *  @template T The type of data held in the body (can be undefined).
 *  @param verb The HTTP verb to use.
 *  @param ep The endpoint to call (should start with a leading `/`).
 *  @param data The data to pass (both request parameters and body data). Each
 * of these values is passed as a separate request.
 *  @param config The configuration to use. If this parameter is not given, uses
 * the default config. This value is never modified, and is re-used for each \
 * object in the data parameter.
 */
export async function runInvalidSessionKey<
    T extends string | object | undefined
>(verb: Verb, ep: string, data: Data<T>[], config: Config = conf) {
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

const realLog = console.log.bind(global.console);
const logStub = jest.fn(() => {
    /* does nothing, NOTHING! */
});

// disable console.log because it's annoying
beforeAll(() => {
    global.console.log = logStub;
});

// re-enable console.log, just in case
afterAll(() => {
    global.console.log = realLog;
});
