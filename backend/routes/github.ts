import { account_status_enum } from "@prisma/client";
import axios from "axios";
import * as crypto from "crypto";
import express from "express";

import * as config from "../config.json";
import * as ormLU from "../orm_functions/login_user";
import * as ormP from "../orm_functions/person";
import * as ormSK from "../orm_functions/session_key";
import { Anything, Requests, Responses } from "../types";
import * as util from "../utility";

import * as session_key from "./session_key.json";

// holds states that are currently active. States are required to validate
// github callbacks.
export let states: string[] = [];

/**
 *  Gets the home URL for the github callback.
 *  @returns The home URL.
 */
function getHome(): string {
    const root = `${process.env.GITHUB_AUTH_CALLBACK_URL}`;
    // check if dev or production
    console.log("Home is: " + root);
    return root;
}

/**
 *  Generates a new state for GitHub, then adds it to the current states. This
 *  state is a a string of 64 cryptographically random bytes.
 *
 *  @returns The new state.
 */
export function genState(): string {
    const state = crypto.randomBytes(64).join("");
    states.push(state);
    return state;
}

/**
 *  Checks if a state exists, then removes that state from the set of valid
 * states.
 *
 *  @param state The state to check.
 *  @returns True if the state is valid, otherwise false.
 */
export function checkState(state: string) {
    if (!states.includes(state)) {
        return false;
    }

    states = states.filter((x) => x != state);
    return true;
}

// Step 1: redirect to github for identity
// Step 2: redirect to github for authentication
// Step 3: set session key, ...

/**
 *  Step one of the GitHub OAuth process: getting the identity of the user.
 * This calls GitHub's login, then asks Github to redirect the user to
 * `/github/challenge` on our server. This function only generates a new state,
 * makes it valid and then redirects.
 */
export function ghIdentity(resp: express.Response): Promise<void> {
    let url = "https://github.com/login/oauth/authorize?";
    url += "client_id=" + process.env.GITHUB_CLIENT_ID; // add client id
    url += "&allow_signup=true"; // allow users to sign up to github itself
    url += // set redirect
        "&redirect_uri=" +
        encodeURIComponent(
            getHome() + config.global.preferred + "/github/challenge"
        );
    url += "&state=" + genState();
    console.log("--- REDIRECTING TO GITHUB AT " + url + " ---");
    return util.redirect(resp, url);
}

/**
 *  Step two of the GitHub OAuth process: exchanging the temporary code for an
 * access token. This function first asks an access token, then checks if a
 * a user exists in our system and if not, creates one.
 */
export async function ghExchangeAccessToken(
    req: express.Request,
    res: express.Response
): Promise<void> {
    if (!("code" in req.query)) {
        return Promise.reject(config.apiErrors.github.argumentMissing);
    }

    if (!("state" in req.query)) {
        return Promise.reject(config.apiErrors.github.argumentMissing);
    }

    if (!checkState(req.query.state as string)) {
        return Promise.reject(config.apiErrors.github.illegalState);
    }

    return axios
        .post(
            "https://github.com/login/oauth/access_token",
            {
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_SECRET,
                code: req.query.code as string,
                redirect_uri:
                    getHome() + config.global.preferred + "/github/login",
            },
            { headers: { Accept: "application/json" } }
        )
        .then((ares) =>
            axios.get("https://api.github.com/user", {
                headers: { Authorization: "token " + ares.data.access_token },
            })
        )
        .then((ares) => parseGHLogin(ares.data))
        .then((login) => ghSignupOrLogin(login))
        .then((result) =>
            util.redirect(
                res,
                process.env.FRONTEND + "/login/" + result.sessionkey
            )
        )
        .catch((err) => {
            console.log("GITHUB ERROR " + err);
            util.redirect(
                res,
                process.env.FRONTEND +
                    "/login?loginError=" +
                    config.apiErrors.github.other.reason
            );
            return Promise.resolve();
        });
}

/**
 *  Checks if all required fields are available. We need (at least) a `login`,
 * `name` and `id` in the request.
 */
export function parseGHLogin(data: Anything): Promise<Requests.GHLogin> {
    if ("login" in data && "name" in data && "id" in data) {
        return Promise.resolve({
            login: data.login as string,
            name:
                data.name == null
                    ? (data.login as string)
                    : (data.name as string),
            id: (data.id as number).toString(),
        });
    }
    return Promise.reject({});
}

/**
 *  Checks if we need to update a GitHub user's name and/or handle.
 */
export function githubNameChange(
    login: Requests.GHLogin,
    person: {
        github: string | null;
        person_id: number;
        firstname: string;
        login_user: {
            password: string | null;
            login_user_id: number;
            account_status: account_status_enum;
            is_admin: boolean;
            is_coach: boolean;
        } | null;
    }
): boolean {
    if (person.github != login.login) return true;
    if (person.firstname != login.name) return true;
    return false;
}

/**
 *  Callback for the actual signup and/or login. Uses the provided GitHub data
 * to access our underlying database. If the user doesn't exist, their account
 * is created. If the user exists, we check if we need to update their name
 * and/or GitHub handle.
 */
export async function ghSignupOrLogin(
    login: Requests.GHLogin
): Promise<Responses.Login> {
    return ormP
        .getPasswordPersonByGithub(login.id)
        .then(async (person) => {
            if (person == null || person.login_user == null) {
                return Promise.reject({ is_not_existent: true });
            } else if (
                person.github != null &&
                githubNameChange(login, person)
            ) {
                return ormP
                    .updatePerson({
                        personId: person.person_id,
                        github: login.login,
                        firstname: login.name,
                    })
                    .then(() => person.login_user);
            } else {
                return Promise.resolve(person.login_user);
            }
        })
        .catch(async (error) => {
            if ("is_not_existent" in error && error.is_not_existent) {
                return ormP
                    .createPerson({
                        github: login.login,
                        firstname: login.name,
                        lastname: "",
                        github_id: login.id,
                    })
                    .then((person) =>
                        ormLU.createLoginUser({
                            personId: person.person_id,
                            isAdmin: false,
                            isCoach: true,
                            accountStatus: "PENDING",
                        })
                    )
                    .then((res) =>
                        Promise.resolve({
                            password: res.password,
                            login_user_id: res.login_user_id,
                            account_status: res.account_status,
                            is_admin: false,
                            is_coach: true,
                        })
                    );
            } else {
                return Promise.reject(error); // pass on
            }
        })
        .then((data) => util.getOrReject(data))
        .then(async (loginuser) => {
            const key: string = util.generateKey();
            const futureDate = new Date(Date.now());
            futureDate.setDate(futureDate.getDate() + session_key.valid_period);
            return ormSK
                .addSessionKey(loginuser.login_user_id, key, futureDate)
                .then((newkey) =>
                    Promise.resolve({
                        sessionkey: newkey.session_key,
                        is_admin: loginuser.is_admin,
                        is_coach: loginuser.is_coach,
                    })
                );
        });
}

export function getRouter(): express.Router {
    const router: express.Router = express.Router();

    router.get("/", async (_, rs) => await ghIdentity(rs));
    router.get(
        "/challenge",
        async (req, res) => await ghExchangeAccessToken(req, res)
    );

    return router;
}
