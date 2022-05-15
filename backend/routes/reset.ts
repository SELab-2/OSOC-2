import express from "express";
import * as gapi from "googleapis";
import * as nodemailer from "nodemailer";

import * as config from "../config.json";
import * as ormLU from "../orm_functions/login_user";
import * as ormPR from "../orm_functions/password_reset";
import * as ormP from "../orm_functions/person";
import * as ormSK from "../orm_functions/session_key";
import * as rq from "../request";
import { Email, Responses } from "../types";
import * as util from "../utility";
import * as session_key from "./session_key.json";
import * as bcrypt from "bcrypt";

export async function sendMail(mail: Email) {
    const oauthclient = new gapi.Auth.OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
    );
    oauthclient.setCredentials({
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });
    const accesstoken = await oauthclient
        .getAccessToken()
        .then((token) => {
            if (token != null && token.token != null) {
                return token.token;
            } else {
                return Promise.reject(
                    new Error("Received token from Google OAuth was null")
                );
            }
        })
        .catch((e) => console.log("Email error:" + JSON.stringify(e)));

    const transp = nodemailer.createTransport({
        service: "gmail",
        auth: {
            type: "OAUTH2",
            user: "osoc2.be@gmail.com",
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
            accessToken: accesstoken as string,
        },
    });

    return transp
        .sendMail({
            from: config.email.from,
            to: mail.to,
            subject: mail.subject,
            html: mail.html,
        })
        .then((res) => {
            transp.close();
            return Promise.resolve(res);
        })
        .catch((e) => {
            console.log("Email error: " + JSON.stringify(e));
            return Promise.reject(config.apiErrors.reset.sendEmail);
        });
}

/**
 * Handles password reset requests
 * If the email in the 'GET' body is correct, an email with a reset link will be
 * sent. If not returns an error. Route: `/reset`
 * @param req Request body should be of form { email: string }
 */
export async function requestReset(
    req: express.Request
): Promise<Responses.Empty> {
    return rq.parseRequestResetRequest(req).then((parsed) =>
        ormP.getPasswordPersonByEmail(parsed.email).then(async (person) => {
            if (person == null || person.login_user == null) {
                return Promise.reject(config.apiErrors.reset.invalidEmail);
            }
            const date: Date = new Date(Date.now());
            date.setHours(date.getHours() + 24);
            return ormPR
                .createOrUpdateReset(
                    person.login_user.login_user_id,
                    util.generateKey(),
                    date
                )
                .catch((e) => {
                    console.log(e);
                    return Promise.reject();
                })
                .then(async (code) => {
                    return sendMail({
                        to: parsed.email,
                        subject: config.email.header,
                        html: createEmail(code.reset_id),
                    }).then(() => {
                        return Promise.resolve({});
                    });
                });
        })
    );
}

/**
 * Route used to check if a reset code is valid.
 * Use route `/reset/:id` with a 'GET' request.
 * @param req
 */
export async function checkCode(
    req: express.Request
): Promise<Responses.Empty> {
    return rq
        .parseCheckResetCodeRequest(req)
        .then((parsed) => ormPR.findResetByCode(parsed.code))
        .then((res) => {
            if (res == null || res.valid_until < new Date(Date.now()))
                return Promise.reject();

            return Promise.resolve({});
        })
        .catch(() => Promise.reject(config.apiErrors.reset.resetFailed));
}

function setSessionKey(req: express.Request, key: string): void {
    req.headers.authorization = config.global.authScheme + " " + key;
}

/**
 * Route that will reset the password when the code and password are valid.
 * Use route `/reset/:id` with a 'POST' request with body of form
 * { password: string }
 * @param req
 */
export async function resetPassword(
    req: express.Request
): Promise<Responses.Key> {
    return rq.parseResetPasswordRequest(req).then((parsed) =>
        ormPR.findResetByCode(parsed.code).then(async (code) => {
            if (code == null || code.valid_until < new Date(Date.now()))
                return Promise.reject(util.errors.cookArgumentError());

            // calculate the hash of the new password
            const hash = await bcrypt.hash(
                parsed.password,
                config.encryption.encryptionRounds
            );

            return ormLU
                .getLoginUserById(code.login_user_id)
                .then((user) => {
                    if (user == null) return Promise.reject();
                    return ormLU.updateLoginUser({
                        loginUserId: user.login_user_id,
                        isAdmin: user.is_admin,
                        isCoach: user.is_coach,
                        accountStatus: user?.account_status,
                        password: hash,
                    });
                })
                .then((user) => {
                    console.log(JSON.stringify(user));
                    const futureDate = new Date();
                    futureDate.setDate(
                        futureDate.getDate() + session_key.valid_period
                    );
                    return ormSK.addSessionKey(
                        user.login_user_id,
                        util.generateKey(),
                        futureDate
                    );
                })
                .then(async (key) => {
                    return ormPR
                        .deleteResetWithResetId(code.reset_id)
                        .then(() =>
                            Promise.resolve({ sessionkey: key.session_key })
                        );
                })
                .then((v) => {
                    setSessionKey(req, v.sessionkey);
                    return v;
                })
                .catch(() =>
                    Promise.reject(config.apiErrors.reset.resetFailed)
                );
        })
    );
}

export function getRouter(): express.Router {
    const router: express.Router = express.Router();

    router.post("/", (req, res) =>
        util.respOrErrorNoReinject(res, requestReset(req))
    );
    router.get("/:id", (req, res) =>
        util.respOrErrorNoReinject(res, checkCode(req))
    );
    util.route(router, "post", "/:id", resetPassword);

    util.addAllInvalidVerbs(router, ["/", "/:id"]);

    return router;
}

/**
 * Returns the html body for the email with the reset code applied.
 * @param resetID The ID that validates the password reset.
 */
export function createEmail(resetID: string) {
    return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <title>Selections - Password Reset</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width,initial-scale=1">
            <meta name="x-apple-disable-message-reformatting">
            <link
                    href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&display=swap"
                    rel="stylesheet" type="text/css"/>
            <!--[if mso]>
            <noscript>
                <xml>
                    <o:OfficeDocumentSettings>
                        <o:PixelsPerInch>96</o:PixelsPerInch>
                    </o:OfficeDocumentSettings>
                </xml>
            </noscript>
            <![endif]-->
        </head>

        <body style="margin:0;padding:0">
            <table style="width:100%;border-collapse:collapse;border:0;border-spacing:0;background:#ffffff;">
                <tr style="box-shadow: 0 0 4px 6px rgba(0, 0, 0, 0.1);height: 50px;padding: 20px 15px;">
                    <td>
                        <img src="https://sel2-2.ugent.be/img/logo-osoc-color.png" alt="" width="70" height="" style="width: 70px; border:0;height:auto;display:block;"/>
                        <p style="text-align: left;padding: 8px;font-weight: bold; font-size: 24px;font-family: 'Montserrat', sans-serif;color: #0A0839;">Selections</p>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 8px;font-family: 'Montserrat', sans-serif;color: #0A0839;">You have requested a password reset for your OSOC Selections account.
                        Please click the link below to reset your password.</td>
                </tr>
                <tr>
                    <td style="padding: 8px;font-family: 'Montserrat', sans-serif;color: #0A0839;"><strong>Note:</strong> This link is only valid for 24 hours.</td>
                </tr>
                <tr>
                    <td style="padding: 12px 8px;"> <a href=${process.env.FRONTEND}/reset/${resetID} style="
                    font-family: 'Montserrat', sans-serif;
                    color: #0A0839;
                    border: none;
                    border-radius: 0;
                    padding: 8px;
                    font-weight: bold;
                    font-size: 16px;
                    background-color: #1DE1AE;
                    text-decoration: none;">Reset Password</a> </td>
                </tr>
                <tr style="opacity: 50%;">
                    <td style="padding: 12px 8px;font-family: 'Montserrat', sans-serif;color: #0A0839;">If you believe that the password reset was not requested by you, please contact us as soon as possibe at <a
                            href="mailto:osoc2.be@gmail.com">osoc2.be@gmail.com</a></td>
                </tr>
            </table>
        </body>
        </html>
    `;
}
