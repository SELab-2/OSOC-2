import express from "express";

import * as ormT from "../orm_functions/template";
import * as rq from "../request";
import { ApiError, Responses } from "../types";
import * as util from "../utility";

export const notOwnerError: ApiError = {
    http: util.errors.cookInsufficientRights().http,
    reason: "You can only modify/delete templates you own.",
};

export async function getAllTemplates(
    req: express.Request
): Promise<Responses.TemplateList> {
    return rq
        .parseTemplateListRequest(req)
        .then((parsed) => util.isAdmin(parsed))
        .then(() =>
            ormT
                .getAllTemplates()
                .then((res) =>
                    res.map((obj) => ({
                        id: obj.template_email_id,
                        owner: obj.owner_id,
                        name: obj.name,
                    }))
                )
                .then((res) =>
                    Promise.resolve({
                        data: res,
                    })
                )
        );
}

export async function getSingleTemplate(
    req: express.Request
): Promise<Responses.Template> {
    return rq
        .parseGetTemplateRequest(req)
        .then((parsed) => util.isAdmin(parsed))
        .then((checked) =>
            ormT
                .getTemplateById(checked.data.id)
                .then((res) => util.getOrReject(res))
                .then((res) =>
                    Promise.resolve({
                        id: res.template_email_id,
                        owner: res.owner_id,
                        name: res.name,
                        content: res.content,
                    })
                )
        );
}

export async function createTemplate(
    req: express.Request
): Promise<Responses.Template> {
    return rq
        .parseNewTemplateRequest(req)
        .then((parsed) => util.isAdmin(parsed))
        .then((checked) =>
            ormT
                .createTemplate({
                    ownerId: checked.userId,
                    name: checked.data.name,
                    content: checked.data.content,
                    cc: checked.data.cc,
                    subject: checked.data.subject,
                })
                .then((res) =>
                    Promise.resolve({
                        id: res.template_email_id,
                        name: res.name,
                        content: res.content,
                        cc: res.cc,
                        owner: res.owner_id,
                        subject: res.subject,
                    })
                )
        );
}

export async function updateTemplate(
    req: express.Request
): Promise<Responses.Template> {
    return rq
        .parseUpdateTemplateRequest(req)
        .then((parsed) => util.isAdmin(parsed))
        .then(async (checked) => {
            return ormT
                .getTemplateById(checked.data.id)
                .then((templ) => util.getOrReject(templ))
                .then((templ) => {
                    if (templ.owner_id != checked.userId) {
                        return Promise.reject(notOwnerError);
                    }

                    return templ;
                })
                .then((templ) =>
                    ormT.updateTemplate({
                        templateId: templ.template_email_id,
                        name: checked.data.name,
                        content: checked.data.content,
                        cc: checked.data.cc,
                        subject: checked.data.subject,
                    })
                )
                .then((res) =>
                    Promise.resolve({
                        content: res.content,
                        id: res.template_email_id,
                        owner: res.owner_id,
                        name: res.name,
                        cc: res.cc,
                        subject: res.subject,
                    })
                );
        });
}

export async function deleteTemplate(
    req: express.Request
): Promise<Responses.Empty> {
    return rq
        .parseDeleteTemplateRequest(req)
        .then((parsed) => util.isAdmin(parsed))
        .then(async (checked) => {
            return ormT
                .getTemplateById(checked.data.id)
                .then((templ) => util.getOrReject(templ))
                .then(async (templ) => {
                    if (templ.owner_id != checked.userId) {
                        return util
                            .isAdmin(checked.data)
                            .catch(() => Promise.reject(notOwnerError));
                    }
                    return Promise.resolve(templ);
                })
                .then((templ) => ormT.deleteTemplate(templ.template_email_id))
                .then(() => Promise.resolve({}));
        });
}

export function getRouter(): express.Router {
    const router: express.Router = express.Router();

    util.setupRedirect(router, "/template");
    util.route(router, "post", "/", createTemplate);

    util.route(router, "get", "/all", getAllTemplates);

    util.route(router, "get", "/:id", getSingleTemplate);
    util.route(router, "post", "/:id", updateTemplate);
    util.route(router, "delete", "/:id", deleteTemplate);

    return router;
}
