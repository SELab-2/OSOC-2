# OSOC - API
*An overview of API endpoints, verbs and their uses.*  
*Note: this is still in-progress and will change over time.*

## Table of Contents
 - [Table of Contents](table-of-contents)
 - [Overview Table](overview-table)
 - [Endpoint-independent Responses](endpoint-independent-responses)

## Overview Table

 Endpoint | Supports GET | Supports POST | Supports DELETE | Status
 --- | --- | --- | --- | ---
 `/login` | No | [Yes](#post-login) | [Yes](#delete-login) | ![todo]
`/student` | [Yes](#get-student) | [Yes](#post-student) | No | ![todoc]
`/student/all` | [Yes](#get-studentall) | No | No | ![todo]
`/student/<student-id>` | [Yes](#get-studentstudent-id) | [Yes](#post-studentstudent-id) | [Yes](#delete-studentstudent-id) | ![todoc]
`/student/<student-id>/suggest` | [Yes](#get-studentstudent-idsuggest) | [Yes](#post-studentstudent-idsuggest) | No | ![todo]
`/student/<student-id>/confirm` | No | [Yes](#post-studentstudent-idconfirm) | No | ![todo]
`/student/search` | [Yes](#get-studentsearch) | No | No | ![todoc]
`/coach` | [Yes](#get-coach) | No | No | ![todoc]
`/coach/all` | [Yes](#get-coachall) | No | No | ![todoc]
`/coach/<coach-id>` | [Yes](#get-coachcoach-id) | [Yes](#post-coachcoach-id) | [Yes](#delete-coachcoach-id) | ![todoc]
`/coach/request` | [Yes](#get-coachrequest) | [Yes](#post-coachrequest) | No | ![todoc]
`/coach/request/<request-id>` | [Yes](#get-coachrequestrequest-id) | [Yes](#post-coachrequestrequest-id) | [Yes](#delete-coachrequestrequest-id) | ![todoc]
`/admin` | [Yes](#get-admin) | No | No | ![todoc]
`/admin/all` | [Yes](#get-adminall) | No | No | ![todoc]
`/admin/<admin-id>` | [Yes](#get-adminadmin-id) | [Yes](#post-adminadmin-id) | [Yes](#delete-adminadmin-id) | ![todoc]
`/project` | [Yes](#get-project) | [Yes](#post-project) | No | ![todoc]
`/project/all` | [Yes](#get-projectall) | No | No | ![todoc]
`/project/<project-id>` | [Yes](#get-projectproject-id) | [Yes](#post-projectproject-id) | [Yes](#delete-projectproject-id) | ![todoc]
`/project/<project-id>/draft` | [Yes](#get-projectproject-iddraft) | [Yes](#post-projectproject-iddraft) | No | ![todoc]
`/project/conflicts` | [Yes](#get-projectconflicts) | No | No | ![todoc]
`/followup` | [Yes](#get-followup) | No | No | ![todoc]
`/followup/all` | [Yes](#get-followupall) | No | No | ![todoc]
`/followup/<student-id>` | [Yes](#get-followupstudent-id) | [Yes](#post-followupstudent-id) | No | ![todoc]
`/followup/template` | [Yes](#get-followuptemplate) | [Yes](#post-followuptemplate) | No | ![todoc]
`/followup/template/<template-name>` | [Yes](#get-followuptemplatetemplate-name) | [Yes](#post-followuptemplatetemplate-name) | [Yes](#delete-followuptemplatetemplate-name) | ![todoc]

## Endpoints
The responses listed here are success responses; for error responses, see the [Endpoint-independent Responses](#endpoint-independent-responses) (for example [Argument error](#argument-error) or [Server error](#server-error)).

### POST /login
**Arguments:**  
 - `name:string` The name of the user to log in.
 - `pass:string` The password of the user to log in.

**Description:** Attempts to log a user in into the system.  
**Response:**
```json
{
    "success": true,
    "sessionkey": "session-key-as-hex-string"
}
```

### DELETE /login
**Arguments:**  
 - `sessionkey:string` The session key of the user to log out.

**Description:** Attempts to log out.  
**Response:**
```json
{
    "success": true
}
```

### GET /student
**Arguments:** (none)  
**Description:** Redirects towards `GET /student/all`  
**Response:** HTTP 303  
```http
HTTP/2 303 See Other
Location: <server-url>/student/all
```

### POST /student
**Arguments:**  
 - `sessionkey:string` Your current session key.
 - TODO

**Description:** Creates a new student in the system.  
**Response:**  
```json
{
    "success": true,
    "newid": "new-student-id",
    "sessionkey": "updated-session-key"
}
```

### GET /student/all
**Arguments:**  
 - `sessionkey:string` Your current session key.

**Description:** Lists all students in the system.  
**Response:**
```json
{
    "success": true,
    "students": [
        {
            "id": "student-id",
            "name": "student-name"
        },
        ...
    ],
    "sessionkey": "updated-session-key"
}
```

### GET /student/\<student-id>
**Arguments:**  
 - `sessionkey:key` Your current session key.
 - Student ID is parsed from the URL.

**Description:** Lists all details about the student with the given id.  
**Response:**  
```json
{
    "success": true,
    "student": {},
    "sessionkey": "updated-session-key"
}
```

### POST /student/\<student-id>
**Arguments:**  
 - `sessionkey:string` Your current session key.
 - Student ID is parsed from the URL.
 - TODO

**Description:** Modifies the details of the student.  
**Response:**  
The `student` field contains all updated fields. If no field is updated, an [Argument error](#argument-error) is thrown.
```json
{
    "success": true,
    "student": {
      "id": "student-id"
    },
    "sessionkey": "updated-session-key"
}
```

### DELETE /student/\<student-id>
**Arguments:**  
 - `sessionkey:string` Your current session key.
 - Student ID is parsed from the URL.

**Description:** Removes the given student from the system.  
**Response:**  
```json
{
    "success": true,
    "sessionkey": "updated-session-key"
}
```

### GET /student/\<student-id>/suggest
**Arguments:**  
 - `sessionkey:string` You current session key.
 - Student ID is parsed from the URL.

**Description:** List the suggestions (yes/maybe/no) for this student.  
**Response:**  
```json
{
    "success": true,
    "suggestions": {
        "yes": [],
        "maybe": [],
        "no": []
    },
    "sessionkey": "updated-session-key"
}
```
Where each suggestion array (`suggestions.yes`, `suggestions.maybe` and `suggestions.no`) contains 0 or more objects of the form (` | ` stands for `or`)
```json
{
    "type": "yes | maybe | no",
    "sender": {
        "id": "user-id-of-the-suggester",
        "name": "user-name-of-the-suggester"
    },
    "reason": "reason-for-the-suggestion"
}
```
(The `reason` field is the only field that can be `undefined`, and thus omitted).

### POST /student/\<student-id>/suggest
**Arguments:**  
 - `sessionkey:string` Your current session key.
 - Student ID is parsed from the URL.
 - `suggestion:string` Your suggestion. Should be one of `"yes"`, `"maybe"`, `"no"`. Another value results in an [Argument error](#argument-error).
 - `reason:string` The reason for your suggestion. Can be omitted.

**Description:** Add or modify your suggestion (yes/maybe/no) for this student.  
**Response:**  
```json
{
    "success": true,
    "tally": {
      "yes": 0,
      "maybe": 0,
      "no": 0
    },
    "sessionkey": "updated-session-key"
}
```
Each of the `tally` fields (`tally.yes`, `tally.maybe`, `tally.no`) will contain the amount of votes of that kind.

### POST /student/\<student-id>/confirm
**Arguments:**  
 - `sessionkey:string` Your current session key.
 - Student ID is parsed from the URL.
 - `reply:string` The final reply. Should be one of `"yes"`, `"maybe"`, `"no"`. Any other value results in an [Argument error](#argument-error). This value can be omitted, and if it is, the final reply is decided by majority vote (from the existing suggestions).

**Description:** Confirms the reply to this student (yes/maybe/no). Does not modify the follow-up data in those endpoints.   
**Response:**  
```json
{
    "success": true,
    "reply": "yes | maybe | no",
    "sessionkey": "updated-session-key"
}
```
Here, the ` | ` in the `reply` field means `or`.

### GET /student/search
**Arguments:**  
 - `sessionkey:string` Your current session key.
 - See [searching.md](./searching.md) for an overview of all filters. If no filter is given, this API endpoint will behave equivalent to [`GET /student/all`](#get-student-all).

**Description:** Searches for a student by certain values.  
**Response:**  
```json
{
    "success": true,
    "students": [
        {
            "id": "student-id",
            "name": "student-name"
        },
        ...
    ],
    "sessionkey": "updated-session-key"
}
```

### GET /coach
**Arguments:** TBD  
**Description:** Redirects towards `GET /coach/all`  
**Response:**
```http
HTTP/2 303 See Other
Location: <server-url>/coach/all
```

### GET /coach/all
**Arguments:** TBD  
**Description:** Gets the list of all coaches.  
**Response:** TBD  
```json
```

### GET /coach/\<coach-id>
**Arguments:** TBD  
**Description:** Gets all details about a coach.  
**Response:** TBD  
```json
```

### POST /coach/\<coach-id>
**Arguments:** TBD  
**Description:** Modify the given coach.  
**Response:** TBD  
```json
```

### DELETE /coach/\<coach-id>
**Arguments:** TBD  
**Description:** Removes the given coach from the system. If the coach was a student coach, they remain in the system as a normal student.  
**Response:** TBD  
```json
```

### GET /coach/request
**Arguments:** TBD  
**Description:** Lists all coach requests.  
**Response:** TBD  
```json
```

### POST /coach/request
**Arguments:** TBD  
**Description:** Access permission to be a coach, either by signing up or requesting as a student to become a student coach.  
**Response:** TBD  
```json
```

### GET /coach/request/\<request-id>
**Arguments:** TBD  
**Description:** View details about a coach request.  
**Response:** TBD  
```json
```

### POST /coach/request/\<request-id>
**Arguments:** TBD  
**Description:** Accept a request for becoming a (student) coach.  
**Response:** TBD  
```json
```

### DELETE /coach/request/\<request-id>
**Arguments:** TBD  
**Description:** Deny a request for becoming a (student) coach.  
**Response:** TBD  
```json
```

### GET /admin
**Arguments:** TBD  
**Description:** Redirects towards `GET /admin/all`  
**Response:**
```http
HTTP/2 303 See Other
Location: <server-url>/admin/all
```

### GET /admin/all
**Arguments:** TBD  
**Description:** List all admin accounts in the system.  
**Response:** TBD  
```json
```

### GET /admin/\<admin-id>
**Arguments:** TBD  
**Description:** Get all details about a single admin.  
**Response:** TBD  
```json
```

### POST /admin/\<admin-id>
**Arguments:** TBD  
**Description:** Modify a single admin.  
**Response:** TBD  
```json
```

### DELETE /admin/\<admin-id>
**Arguments:** TBD  
**Description:** Remove an admin from the system.  
**Response:** TBD  
```json
```

### GET /project
**Arguments:** TBD  
**Description:** Redirects towards `/project/all`  
**Response:**
```http
HTTP/2 303 See Other
Location: <server-url>/project/all
```

### POST /project
**Arguments:** TBD  
**Description:** Creates a new project.  
**Response:** TBD  
```json
```

### GET /project/all
**Arguments:** TBD  
**Description:** Lists all projects in the current edition.  
**Response:** TBD  
```json
```

### GET /project/\<project-id>
**Arguments:** TBD  
**Description:** Lists all details about a project.  
**Response:** TBD  
```json
```

### POST /project/\<project-id>
**Arguments:** TBD  
**Description:** Modifies a project.  
**Response:** TBD  
```json
```

### DELETE /project/\<project-id>
**Arguments:** TBD  
**Description:** Removes a project from the current edition.  
**Response:** TBD  
```json
```

### GET /project/\<project-id>/draft
**Arguments:** TBD  
**Description:** Get all students drafted for this project.  
**Response:** TBD  
```json
```

### POST /project/\<project-id>/draft
**Arguments:** TBD  
**Description:** Draft a student for this project.  
**Response:** TBD  
```json
```

### GET /project/conflicts
**Arguments:** TBD  
**Description:** List all conflicts in all projects. This endpoint only allows to list and view conflicts, not resolve them.  
**Response:** TBD  
```json
```

### GET /followup
**Arguments:** TBD  
**Description:** Redirects towards `GET /followup/all`   
**Response:**
```http
HTTP/2 303 See Other
Location: <server-url>/followup/all
```

### GET /followup/all
**Arguments:** TBD  
**Description:** List all e-mails sent for each student.  
**Response:** TBD  
```json
```

### GET /followup/\<student-id>
**Arguments:** TBD  
**Description:** Get all follow-up e-mails sent to this student.  
**Response:** TBD  
```json
```

### POST /followup/\<student-id>
**Arguments:** TBD  
**Description:** Mark a follow-up e-mail as sent (for this student).  
**Response:** TBD  
```json
```

### GET /followup/template
**Arguments:** TBD  
**Description:** List all follow-up e-mail templates in the system.  
**Response:** TBD  
```json
```

### POST /followup/template
**Arguments:** TBD  
**Description:** Add a follow-up e-mail template.  
**Response:** TBD  
```json
```

### GET /followup/template/\<template-name>
**Arguments:** TBD  
**Description:** Returns the requested follow-up e-mail template.  
**Response:** TBD  
```json
```

### POST /followup/template/\<template-name>
**Arguments:** TBD  
**Description:** Modifies the requested follow-up e-mail template.  
**Response:** TBD  
```json
```

### DELETE /followup/template/\<template-name>
**Arguments:** TBD  
**Description:** Remove sthe requested follow-up e-mail template.  
**Response:** TBD  
```json
```

### GET /easter/eggs
**Arguments:** None  
**Description:** An Easter Egg.  
**Response:**
```http
HTTP/<version> 418 I'm A Teapot
Content-Type: text; charset=utf-8

Hi. I'm your friendly neighborhood teapot. Sadly I can't produce coffee for you. Perhaps try my neighbor, the Coffee Pot. Would you like some peppermint tea while you wait?
```

## Endpoint-independent Responses
### Request to a non-existent endpoint
**Cause:** The user requested an endpoint URL which has no associated verbs (example `GET /admin/none`).  
**Status Code:** 404 Not Found  
**Response:** TBD
```json
```

### Request with the wrong HTTP verb
**Cause:** The user requested an endpoint URL for which the HTTP verb was invalid. Another verb should be used (example: `GET /login`).  
**Status Code:** 405 Method Not Allowed  
**Response:** TBD
```json
```

### Request for non-JSON data
**Cause:** The user used a header that didn't include `Accept: application/json`. Only JSON responses are supported.  
**Status Code:** 406 Not Acceptable  
**Response:** TBD
```http
```

### Request without authentication
**Cause:** The required authentication parameters aren't filled in. The only endpoint that can't throw this response is `POST /login`  
**Status Code:** 401 Unauthorized  
**Response:** TBD
```json
```

### Request with insufficient rights
**Cause:** The user requested a resource they don't have access to.  
**Status Code:** 403 Forbidden  
**Response:** TBD
```json
```

### Request with invalid ID
**Cause:** Some endpoints require an ID in their URL. When given an invalid ID, this response is thrown.  
**Status Code:** 204 No Content  
**Response:** TBD
```json
```

### Argument error
**Cause:** When a required argument is omitted or an argument has the wrong type, this response is thrown.  
**Status Code:** 400 Bad Request  
**Response:** TBD  
```json
```

### Server error
**Cause:** Something went wrong while processing the request.  
**Status Code:** 500 Internal Server Error  
**Response:** TBD  
```json
```

[#]: !links
[todoc]: https://shields.io/badge/Status-To_document-black
[todo]: https://shields.io/badge/Status-To_do-red
[in-progress]: https://shields.io/badge/Status-In_progress-orange
[to-test]: https://shields.io/badge/Status-Tests_required-yellow
[merging]: https://shields.io/badge/Status-Merging-yellowgreen
[done]: https://shields.io/badge/Status-Done-brightgreen
