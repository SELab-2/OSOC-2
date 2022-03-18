/*import express from 'express';

import * as ormP from '../orm_functions/person';
import * as rq from '../request';
import {Requests, Responses} from '../types';


function json_to_person(form : Requests.Form):
    Promise<Responses.Empty> {
    return ormP.create_person({
        firstname : "",
        lastname : "",
        email : "",
        gender : ""
    }).then(() => {
        return Promise.resolve({});
    });
}*/

/**
 *  Attempts to create a new user in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
/*async function createFormRequest(req: express.Request):
    Promise<Responses.Empty> {
    return rq.parseFormRequest(req).then(async form => {
        //let fields : Array<object> = form.data.fields;
        return Promise.resolve({});
        return json_to_person(form)
            .then(_ => {
                return Promise.resolve({});
            });
    });
}*/


