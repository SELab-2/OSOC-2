import express from 'express';
import * as gapi from 'googleapis';
import * as nodemailer from 'nodemailer';

import * as config from '../config.json';
import * as google from '../email.json';
import * as ormLU from '../orm_functions/login_user';
import * as ormPR from '../orm_functions/password_reset';
import * as ormP from '../orm_functions/person';
import * as ormSK from '../orm_functions/session_key';
import * as rq from '../request';
import {Email, Responses} from '../types';
import * as util from '../utility';
import github from "../github.json";

export async function sendMail(mail: Email) {
    const oauthclient = new gapi.Auth.OAuth2Client(
        google['google-client-id'], google['google-client-secret']);
    oauthclient.setCredentials({refresh_token: google['google-refresh-token']});
    const accesstoken =
        await oauthclient.getAccessToken().then(token => token.token!);
    const transp = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAUTH2',
            user: 'osoc2.be@gmail.com',
            clientId: google['google-client-id'],
            clientSecret: google['google-client-secret'],
            refreshToken: google['google-refresh-token'],
            accessToken: accesstoken
        }
    });

    return transp
        .sendMail({
            from: config.email.from,
            to: mail.to,
            subject: mail.subject,
            html: mail.html
        })
        .then(res => {
            transp.close();
            return Promise.resolve(res);
        })
        .catch(e => {
            console.log('Email error: ' + JSON.stringify(e));
            return Promise.reject(e);
        });
}

/**
 * Handles password reset requests
 * If the email in the 'GET' body is correct, an email with a reset link will be sent.
 * If not returns an error.
 * Route: `/reset`
 * @param req Request body should be of form { email: string }
 */
async function requestReset(req: express.Request): Promise<Responses.Empty> {
    return rq.parseRequestResetRequest(req).then(
        (parsed) =>
            ormP.getPasswordPersonByEmail(parsed.email).then(async (person) => {
                if (person == null || person.login_user == null) {
                    return Promise.reject(config.apiErrors.invalidEmailReset);
                }
                const date: Date = new Date(Date.now());
                date.setHours(date.getHours() + 24);
                return ormPR
                    .createOrUpdateReset(person.login_user.login_user_id,
                        util.generateKey(), date)
                    .then(async (code) => {
                        return sendMail({
                            to: parsed.email,
                            subject: config.email.header,
                            html: createEmail(code.reset_id)
                        })
                            .then(data => {
                                console.log(data);
                                nodemailer.getTestMessageUrl(data);
                                return Promise.resolve({});
                            });
                    });
            }));
}

/**
 * Route used to check if a reset code is valid.
 * Use route `/reset/:id` with a 'GET' request.
 * @param req
 */
async function checkCode(req: express.Request): Promise<Responses.Empty> {
    return rq.parseCheckResetCodeRequest(req)
        .then(parsed => ormPR.findResetByCode(parsed.code))
        .then(res => {
            if (res == null || res.valid_until < new Date(Date.now()))
                return Promise.reject();

            return Promise.resolve({});
        })
        .catch(() => Promise.reject(util.errors.cookArgumentError()));
}

/**
 * Route that will reset the password when the code and password are valid.
 * Use route `/reset/:id` with a 'POST' request with body of form
 * { password: string }
 * @param req
 */
async function resetPassword(req: express.Request): Promise<Responses.Key> {
    return rq.parseResetPasswordRequest(req).then(
        parsed => ormPR.findResetByCode(parsed.code).then(async code => {
            if (code == null || code.valid_until < new Date(Date.now()))
                return Promise.reject(util.errors.cookArgumentError());

            return ormLU.getLoginUserById(code.login_user_id)
                .then(user => {
                    if (user == null)
                        return Promise.reject();
                    console.log("Updating user " + JSON.stringify(user) +
                        "'s  password to " + parsed.password);
                    return ormLU.updateLoginUser({
                        loginUserId: user.login_user_id,
                        isAdmin: user.is_admin,
                        isCoach: user.is_coach,
                        accountStatus: user?.account_status,
                        password: parsed.password
                    });
                })
                .then(user => {
                    console.log(JSON.stringify(user));
                    return ormSK.addSessionKey(user.login_user_id,
                        util.generateKey());
                })
                .then(async key => {
                    return ormPR.deleteResetWithResetId(code.reset_id)
                        .then(() => Promise.resolve({sessionkey: key.session_key}));
                });
        }));
}

export function getRouter(): express.Router {
    const router: express.Router = express.Router();

    router.post('/',
        (req, res) => util.respOrErrorNoReinject(res, requestReset(req)));
    router.get('/:id',
        (req, res) => util.respOrErrorNoReinject(res, checkCode(req)));
    router.post("/:id", (req, res) =>
        util.respOrErrorNoReinject(res, resetPassword(req)));

    util.addAllInvalidVerbs(router, ["/", "/:id"]);

    return router;
}

/**
 * Returns the html body for the email with the reset code applied.
 * @param resetID The ID that validates the password reset.
 */
function createEmail(resetID: string) {
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
                        <img src="../public/img/logo-osoc-color.png" alt="" width="70" height="" style="border:0;height:auto;display:block;"/>
                    </td>
                    <td style="padding: 12px;font-weight: bold; font-size: 24px;font-family: 'Montserrat', sans-serif;color: #0A0839;">Selections</td>
                </tr>
                <tr>
                    <td style="padding: 12px;font-family: 'Montserrat', sans-serif;color: #0A0839;">You have requested a password reset for your OSOC Selections account. 
                        Please click the link below to reset your password.</td>
                </tr>
                <tr>
                    <td style="padding: 12px;font-family: 'Montserrat', sans-serif;color: #0A0839;"><strong>Note:</strong> This link is only valid for 24 hours.</td>
                </tr>
                <tr>
                    <td> <a href=${github.frontend}/reset/${resetID} style="
                    font-family: 'Montserrat', sans-serif;
                    color: #0A0839;
                    border: none;
                    border-radius: 0;
                    font-weight: bold;
                    font-size: 12px;
                    padding: 12px;
                    background-color: #1DE1AE;
                    text-decoration: none;">Reset Password</a> </td>
                </tr>
                <tr style="opacity: 50%;">
                    <td style="padding: 12px;font-family: 'Montserrat', sans-serif;color: #0A0839;">If you believe that the password reset was not requested by you, please contact us as soon as possibe at <a
                            href="mailto:osoc2.be@gmail.com">osoc2.be@gmail.com</a></td>
                </tr>
            </table>
        </body>
        </html>
    `
}
