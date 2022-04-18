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

let states: string[] = [];

function getHome(): string {
    const root = `${process.env.GITHUB_AUTH_CALLBACK_URL}`;
    // check if dev or production
    console.log("Home is: " + root);
    return root;
}

function genState(): string {
    const state = crypto.randomBytes(64).join("");
    states.push(state);
    return state;
}

function checkState(state: string) {
    if (!states.includes(state)) {
        return false;
    }

    states = states.filter((x) => x != state);
    return true;
}

// Step 1: redirect to github for identity
// Step 2: redirect to github for authentication
// Step 3: set session key, ...

function ghIdentity(resp: express.Response): void {
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
    util.redirect(resp, url);
}

async function ghExchangeAccessToken(
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

function parseGHLogin(data: Anything): Promise<Requests.GHLogin> {
    if ("login" in data && "name" in data && "login" in data) {
        return Promise.resolve({
            login: data.login as string,
            name:
                data.name == null
                    ? (data.login as string)
                    : (data.name as string),
            id: (data.id as number).toString(),
        });
    }
    return Promise.reject();
}

function githubNameChange(
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

async function ghSignupOrLogin(
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
            const futureDate = new Date();
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

    router.get("/", (_, rs) => ghIdentity(rs));
    router.get(
        "/challenge",
        async (req, res) => await ghExchangeAccessToken(req, res)
    );

    return router;
}
