# OSOC - API
*An overview of API endpoints, verbs and their uses.*  
*Note: this is still in-progress and will change over time.*

## Table of Contents
 - [Table of Contents](#table-of-contents)
 - [Overview Table](#overview-table)
 - [Endpoint-independent Responses](#endpoint-independent-responses)

## Overview Table

 Endpoint | Supports GET | Supports POST | Supports DELETE | Status
 --- | --- | --- | --- | ---
 `/login` | No | [Yes](#post-login) | [Yes](#delete-login) | ![todo]
`/student` | [Yes](#get-student) | [Yes](#post-student) | No | ![todo]
`/student/all` | [Yes](#get-studentall) | No | No | ![todo]
`/student/<student-id>` | [Yes](#get-studentstudent-id) | [Yes](#post-studentstudent-id) | [Yes](#delete-studentstudent-id) | ![todo]
`/student/<student-id>/suggest` | [Yes](#get-studentstudent-idsuggest) | [Yes](#post-studentstudent-idsuggest) | No | ![todo]
`/student/<student-id>/confirm` | No | [Yes](#post-studentstudent-idconfirm) | No | ![todo]
`/student/search` (see [searching.md](searching.md)) | [Yes](#get-studentsearch) | No | No | ![todoc]
`/coach` | [Yes](#get-coach) | No | No | ![todo]
`/coach/all` | [Yes](#get-coachall) | No | No | ![todo]
`/coach/<coach-id>` | [Yes](#get-coachcoach-id) | [Yes](#post-coachcoach-id) | [Yes](#delete-coachcoach-id) | ![todo]
`/coach/request` | [Yes](#get-coachrequest) | [Yes](#post-coachrequest) | No | ![todo]
`/coach/request/<request-id>` | [Yes](#get-coachrequestrequest-id) | [Yes](#post-coachrequestrequest-id) | [Yes](#delete-coachrequestrequest-id) | ![todo]
`/admin` | [Yes](#get-admin) | No | No | ![todo]
`/admin/all` | [Yes](#get-adminall) | No | No | ![todo]
`/admin/<admin-id>` | [Yes](#get-adminadmin-id) | [Yes](#post-adminadmin-id) | [Yes](#delete-adminadmin-id) | ![todo]
`/project` | [Yes](#get-project) | [Yes](#post-project) | No | ![todo]
`/project/all` | [Yes](#get-projectall) | No | No | ![todo]
`/project/<project-id>` | [Yes](#get-projectproject-id) | [Yes](#post-projectproject-id) | [Yes](#delete-projectproject-id) | ![todo]
`/project/<project-id>/draft` | [Yes](#get-projectproject-iddraft) | [Yes](#post-projectproject-iddraft) | No | ![todo]
`/project/conflicts` | [Yes](#get-projectconflicts) | No | No | ![todoc]
`/followup` | [Yes](#get-followup) | No | No | ![todo]
`/followup/all` | [Yes](#get-followupall) | No | No | ![todo]
`/followup/<student-id>` | [Yes](#get-followupstudent-id) | [Yes](#post-followupstudent-id) | No | ![todo]
`/followup/template` | [Yes](#get-followuptemplate) | [Yes](#post-followuptemplate) | No | ![todo]
`/followup/template/<template-name>` | [Yes](#get-followuptemplatetemplate-name) | [Yes](#post-followuptemplatetemplate-name) | [Yes](#delete-followuptemplatetemplate-name) | ![todo]

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
Location: /student/all
```

### POST /student
**Arguments:**  
 - `sessionkey:string` Your current session key.
 - `name:string` The new student's name.
 - `email:string` The new student's email address.

**Description:** Creates a new student in the system.  
**Response:**  
```json
{
    "success": true,
    "data": {
        "id": "new-student-id",
        "name": "new-student-name",
        "sessionkey": "updated-session-key"
    }
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
    "data": [
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
    "data": {
        "id": "student-id",
        "name": "student-name",
        "email": "email-address",
        "labels": [ "label-1", "label-2", "..." ],
        "sollicitation": "sollicitation-id",
        "project": {
            "id": "project-id",
            "contract": {
                "id": "contract-id",
                "info": "extra-contract-details"
            },
            "roles": [ "role-1-name", "role-2-name", "..." ]
        }
    },
    "sessionkey": "updated-session-key"
}
```
The `student.labels` field can be an empty array.
The `student.sollicitation` field can be an empty omitted (`undefined`) if the student has not yet submitted a sollicitation.  
The `student.project` field can be omitted (`undefined`) if the student has not been assigned to a project yet.

### POST /student/\<student-id>
**Arguments:**  
 - `sessionkey:string` Your current session key.
 - Student ID is parsed from the URL.
 - Any of the fields in the `student` field of the response for `GET /student/<student-id>` can be modified by adding it to the arguments (without the `student.` prefix). For the `project` field, you can only specify the project ID. Any values passed to `labels` or `sollicitations` (both are lists) are added to the list. If a value starting with `-` (a single minus sign) is passed in the `labels` or `sollicitations` list, those values are removed from the lists.

**Description:** Modifies the details of the student.  
**Response:**  
The `student` field contains all updated fields. If no field is updated, an [Argument error](#argument-error) is thrown.
```json
{
    "success": true,
    "data": {
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
    "data": {
        "yes": [],
        "maybe": [],
        "no": []
    },
    "sessionkey": "updated-session-key"
}
```
Where each suggestion array (`data.yes`, `suggesdatations.maybe` and `data.no`) contains 0 or more objects of the form (` | ` stands for `or`)
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
    "data": {
      "yes": 0,
      "maybe": 0,
      "no": 0
    },
    "sessionkey": "updated-session-key"
}
```
Each of the `data` fields (`data.yes`, `data.maybe`, `data.no`) will contain the amount of votes of that kind.

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
    "data": "yes | maybe | no",
    "sessionkey": "updated-session-key"
}
```
Here, the ` | ` in the `reply` field means `or`.

### GET /student/search
**Arguments:**  
 - `sessionkey:string` Your current session key.
 - See [searching.md](searching.md) for an overview of all filters. If no filter is given, this API endpoint will behave equivalent to [`GET /student/all`](#get-student-all).

**Description:** Searches for a student by certain values.  
**Response:**  
```json
{
    "success": true,
    "data": [
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
**Arguments:** (none)  
**Description:** Redirects towards `GET /coach/all`  
**Response:**
```http
HTTP/2 303 See Other
Location: /coach/all
```

### GET /coach/all
**Arguments:**  
 - `sessionkey:string` Your current session key.

**Description:** Gets the list of all coaches.  
**Response:**  
```json
{
    "success": true,
    "data": [
        {
            "id": "coach-id",
            "name": "coach-name"
        },
        ...
    ],
    "sessionkey": "updated-session-key"
}
```

### GET /coach/\<coach-id>
**Arguments:**  
 - `sessionkey:string` Your current session key.
 - Coach ID is parsed from the URL.

**Description:** Gets all details about a coach.  
**Response:**  
```json
{
    "success": true,
    "data": {
        "id": "coach-id",
        "name": "coach-name",
        "email": "coach-email",
        "project": "project-id"
    },
    "sessionkey": "updated-session-key"
}
```
The `coach.project` field can be omitted (`undefined`) if the coach has not been assigned to a project yet.

### POST /coach/\<coach-id>
**Arguments:**  
 - `sessionkey:string` Your current session key.
 - Coach ID is parsed from the URL.
 - `name:string` The updated name for the coach (optional).
 - `email:string` The updated email address for the coach (optional).
 - If the account for the `sessionkey` matches with the `<coach-id>` (the coach is modifying themselves), they can also change their password by adding the `pass:string` field.

**Description:** Modify the given coach.  
**Response:** TBD  
The `coach` field contains all updated fields. If no field is updated, an [Argument error](#argument-error) is thrown.
```json
{
    "success": true,
    "data": {
      "id": "coach-id"
    },
    "sessionkey": "updated-session-key"
}
```

### DELETE /coach/\<coach-id>
**Arguments:**  
 - `sessionkey:string` Your current session key.
 - Coach ID is parsed from the URL.

**Description:** Removes the given coach from the system.  
**Response:**
```json
{
    "success": true,
    "sessionkey": "updated-session-key"
}
```

### GET /coach/request
**Arguments:**  
 - `sessionkey:string` Your current session key.

**Description:** Lists all coach requests.  
**Response:**  
```json
{
    "success": true,
    "data": [
        {
            "id": "request-id",
            "name": "coach-name",
            "email": "coach-email"
        },
        ...
    ],
    "sessionkey": "updated-session-key"
}
```

### POST /coach/request
**Arguments:**  
 - `name:string` Your name.
 - `email:string` Your email address.
 - `pass:string` The password for your account, when it's activated.

**Description:** Access permission to be a coach by signing up.  
**Response:**  
```json
{
    "success": true,
    "id": "request-id"
}
```

### GET /coach/request/\<request-id>
**Arguments:**  
 - `sessionkey:string` Your current session key.
 - Request ID is parsed from the URL.

**Description:** View details about a coach request.  
**Response:**  
```json
{
    "success": true,
    "data": {
        "id": "request-id",
        "name": "requester-name",
        "email": "requester-email",
    },
    "sessionkey": "updated-session-key"
}
```

### POST /coach/request/\<request-id>
**Arguments:**  
 - `sessionkey:string` Your current session key.
 - Request ID is parsed from the URL.

**Description:** Accept a request for becoming a coach.  
**Response:**  
```json
{
    "success": true,
    "data": {
        "id": "request-id",
        "name": "new-coach-name",
    },
    "sessionkey": "updated-session-key"
}
```

### DELETE /coach/request/\<request-id>
**Arguments:**  
 - `sessionkey:string` Your current session key.
 - Request ID is parsed from the URL.

**Description:** Deny a request for becoming a coach.  
**Response:**  
```json
{
    "success": true,
    "sessionkey": "updated-session-key"
}
```

### GET /admin
**Arguments:** (none)  
**Description:** Redirects towards `GET /admin/all`  
**Response:**
```http
HTTP/2 303 See Other
Location: /admin/all
```

### GET /admin/all
**Arguments:**  
 - `sessionkey:string` Your current session key.

**Description:** List all admin accounts in the system.  
**Response:**  
```json
{
    "success": true,
    "data": [
        {
            "id": "admin-id",
            "name": "admin-name"
        },
        ...
    ],
    "sessionkey": "updated-session-key"
}
```

### GET /admin/\<admin-id>
**Arguments:**  
 - `sessionkey:string` Your current session key.
 - Admin ID is parsed from the request URL.

**Description:** Get all details about a single admin.  
**Response:**  
```json
{
    "success": true,
    "data": {
        "id": "admin-id",
        "name": "admin-name",
        "email": "admin-email-address"
    },
    "sessionkey": "updated-session-key"
}
```

### POST /admin/\<admin-id>
**Arguments:**  
 - `sessionkey:string` Your current session key.
 - Admin ID is parsed from the URL.
 - `name:string` The admin's updated name (optional).
 - `email:string` The admin's updated email address (optional).
 - If the `sessionkey` matches with the `sessionkey` for `<admin-id>` (the admin is modifying themselves), they can also change their password by using the field `pass:string`.

**Description:** Modify a single admin.  
**Response:**  
The `data` field contains all updated fields. If no field is updated, an [Argument error](#argument-error) is thrown.
```json
{
    "success": true,
    "data": {
        "id": "admin-id"
    },
    "sessionkey": "updated-session-key"
}
```

### DELETE /admin/\<admin-id>
**Arguments:**  
 - `sessionkey`: Your current session key.
 - Admin ID is parsed from the request.

**Description:** Remove an admin from the system.  
**Response:**  
```json
{
    "success": true,
    "sessionkey": "updated-session-key"
}
```

### GET /project
**Arguments:** (none)  
**Description:** Redirects towards `/project/all`  
**Response:**
```http
HTTP/2 303 See Other
Location: /project/all
```

### POST /project
**Arguments:**  
 - `sessionkey:string` Your current session key.
 - `project:json` A JSON-object representing the project. The following fields should be present:
   - `name:string` The project name.
   - `partner:string` The name of the partner requesting the project.
   - `roles:[string]` A list of roles required (optional).
   - `deadline:Date` The deadline date (optional).

**Description:** Creates a new project.  
**Response:**  
```json
{
    "success": true,
    "data": {
        "id": "new-project-id"
    },
    "sessionkey": "updated-session-key"
}
```

### GET /project/all
**Arguments:**
 - `sessionkey:string` Your current session key.

**Description:** Lists all projects in the current edition.  
**Response:**  
```json
{
    "success": true,
    "data": [
        {
            "id": "project-id",
            "name": "project-name"
        },
        ...
    ],
    "sessionkey": "updated-session-key"
}
```

### GET /project/\<project-id>
**Arguments:**  
 - `sessionkey:string` Your current session key.
 - Project ID is parsed from the request URL.

**Description:** Lists all details about a project.  
**Response:**  
```json
{
    "success": true,
    "data": {
        "id": "project-id",
        "name": "project-name",
        "partner": "project-partner-name",
        "deadline": "project-deadline",
        "coaches": [ "coach-1-id", "coach-2-id", "..." ],
        "roles": [ "required-role-1", "required-role-2", "..." ],
        "drafted": [
            {
                "id": "student-id",
                "name": "student-name",
                "role": "student-role"
            },
            ...
        ],
        "studentsreq": 0
    },
    "sessionkey": "updated-session-key"
}
```
The `project.coaches` field can be empty, but not omitted.  
The `project.roles` field can be empty, but not omitted.  
The `project.drafted` field can be empty, but not omitted.  
The `project.studentsreq` field contains the total amount of students required.

### POST /project/\<project-id>
**Arguments:**  
 - `sessionkey:string` Your current session key.
 - Project ID is parsed from the URL.
 - Any of the fields in the `project` field of the response for `GET /project/<project-id>` can be modified by adding it to the arguments (without the `project.` prefix). Some special values and exceptions:
   - Values passed in the `coaches` and `roles` arrays are added to the arrays in the database. If a value starts with a `-` (a single minus sign), that value is removed instead.
   - To add a student, simply use their ID in the `drafted` array. Similarly to the `coaches` and `roles`, you can remove students by adding `-<student-id>` in the `drafted` array. However, it is recommended to use the [`POST /project/<project-id>/draft`](#post-projectproject-iddraft) endpoint for this.

**Description:** Modifies a project.  
**Response:**  
The `project` field contains all updated fields. If no field is updated, an [Argument error](#argument-error) is thrown.
```json
{
    "success": true,
    "data": {
      "id": "project-id"
    },
    "sessionkey": "updated-session-key"
}
```

### DELETE /project/\<project-id>
**Arguments:**  
 - `sessionkey:string` Your current session key.
 - The project ID is parsed from the request URL.

**Description:** Removes a project from the current edition.  
**Response:**  
```json
{
    "success": true,
    "sessionkey": "updated-session-key"
}
```

### GET /project/\<project-id>/draft
**Arguments:**  
 - `sessionkey:string` Your current session key.
 - The project ID is parsed from the URL.

**Description:** Get all students drafted for this project.  
**Response:**  
```json
{
    "success": true,
    "data": {
        "id": "project-id",
        "name": "project-name"
    },
    "students": [
        {
            "id": "student-id",
            "name": "student-name",
            "roles": [ "role-1", "role-2", "..." ]
        },
        ...
    ]
}
```
The `students` array can be empty, but not omitted.  
For each student in the `students` array, the `roles` array can be empty, but not omitted.

### POST /project/\<project-id>/draft
**Arguments:**  
 - `sessionkey:string` Your current session key.
 - Project ID is parsed from the URL.
 - `id:string` The student ID.
 - `roles:[string]` An array containing all roles to add/remove for this student (optional). To remove a role, simply put `-` (a single minus sign) in front of the role.

If the `roles` field is not set (`undefined`), the request causes the following behaviour:
 - If the student is not yet on the project, it will be added (drafted).
 - If the student is already on the project, it will be removed.

**Description:** Modify a student on this project by either adding (drafting) them, modifying their roles or removing them.  
**Response:**  
```json
{
    "success": true,
    "data": {
        "drafted": true,
        "roles": [ "role-1", "role-2", "..." ]
    },
    "sessionkey": "updated-session-key"
}
```
The `drafted` field will be `true` if the student is on the project, and `false` otherwise.

### GET /project/conflicts
**Arguments:**  
 - `sessionkey:string` Your current session key.

**Description:** List all conflicts in all projects. This endpoint only allows to list and view conflicts, not resolve them.  
**Response:** TBD  
```json
```

### GET /followup
**Arguments:** (none)  
**Description:** Redirects towards `GET /followup/all`   
**Response:**
```http
HTTP/2 303 See Other
Location: /followup/all
```

### GET /followup/all
**Arguments:**  
 - `sessionkey:string` Your current session key.

**Description:** List all e-mails sent for each student.  
**Response:**  
```json
{
    "success": true,
    "data": [
        {
            "id": "student-id",
            "name": "student-name",
            "sent": [ "type-1", "type-2", "..." ]
        },
        ...
    ],
    "sessionkey": "updated-session-key"
}
```
The values in the `students[i].sent` array can be the following:
 - `"hold-tight"` A "hold tight" email has been sent to a student marked as `"maybe"`.
 - `"confirmed"` A confirmation email has been sent to this student.
 - `"cancelled"` An email stating that a student has not been accepted has been sent.
 - (This list is non-exhaustive. If more types of emails pop up during development, they will be added).

### GET /followup/\<student-id>
**Arguments:**  
 - `sessionkey:string` Your current session key.
 - The student ID is parsed from the URL.

**Description:** Get all follow-up e-mails sent to this student.  
**Response:**  
```json
{
    "success": true,
    "data": [
        {
            "type": "email-type",
            "sent": "2012-04-23T18:25:43.511Z"
        },
        ...
    ],
    "sessionkey": "updated-session-key"
}
```
The `mails[i].type` field is one of the values listed above (in the [`GET /followup/all`](#get-followupall)).  
The `mails[i].sent` field is the JavaScript serialized date and time of the moment the mail was marked as sent.

### POST /followup/\<student-id>
**Arguments:**  
 - `sessionkey:string` Your current session key.
 - The student ID is parsed from the URL.
 - `type:string` The type of email sent (see [`GET /followup/all`](#get-followupall)).

**Description:** Mark a follow-up e-mail as sent (for this student).  
**Response:**  
```json
{
    "success": true,
    "id": "student-id",
    "sessionkey": "updated-session-key"
}
```

### GET /followup/template
**Arguments:**  
 - `sessionkey:string` Your current session key.

**Description:** List all follow-up e-mail templates in the system.  
**Response:**  
```json
{
    "success": true,
    "data": [
        {
            "name": "template-name",
            "desc": "description"
        },
        ...
    ],
    "sessionkey": "updated-session-key"
}
```
The `templates[i].desc` field can be omitted and/or empty.

### POST /followup/template
**Arguments:**  
 - `sessionkey:string` Your current session key.
 - `name:string` The name for the new template.
 - `desc:string` The description for the new template (optional).
 - `subject:string` A template message for the email subject (optional).
 - `cc:string` A list of email addresses to be in the CC field of the email (optional).
 - `content:string` The content of the email template.
**Description:** Add a follow-up e-mail template.  
**Response:**  
```json
{
    "success": true,
    "data": {
        "name": "template-name",
        "desc": "template-description"
    },
    "sessionkey": "updated-session-key"
}
```
The `template.desc` field is omitted if the `desc` field of the request was not filled in.

### GET /followup/template/\<template-name>
**Arguments:**  
 - `sessionkey:string` Your current session key.
 - Template name (the same as its ID) is parsed from the request.

**Description:** Returns the requested follow-up e-mail template.  
**Response:**  
```json
{
    "success": true,
    "data": {
        "name": "template-name",
        "desc": "template-description",
        "subject": "email-subject",
        "cc": [ "cc-address-1", "cc-address-2", "..." ],
        "content": "email-content"
    },
    "sessionkey": "updated-session-key"
}
```
The `template.desc` and `template.subject` fields can be omitted (if they were not specified yet).  
The `template.cc` can be an empty list.

### POST /followup/template/\<template-name>
**Arguments:**  
 - `sessionkey:string` Your current session key.
 - The template name (the same as its ID) is parsed from the request.
 - `desc:string` The new description for the template (optional).
 - `subject:string` The new subject line for the template (optional).
 - `cc:[string]`: Each email address in the `cc` array is added to the `cc` array of the template, except those starting with `-`  (a single minus sign); those are removed.
 - `content:string`: The updated content for the tempate.

**Description:** Modifies the requested follow-up e-mail template.  
**Response:**  
The `template` field contains all modified fields in the template. If no field was modified by this request, an [Argument error](#argument-error) is thrown.
```json
{
    "success": true,
    "data": {
        "name": "template-name"
    },
    "sessionkey": "updated-session-key"
}
```

### DELETE /followup/template/\<template-name>
**Arguments:**  
 - `sessionkey:string` Your current session key.
 - Template name (the same as its ID) is parsed from request URL.

**Description:** Removes the requested follow-up e-mail template.  
**Response:**  
```json
{
    "success": true,
    "sessionkey": "updated-session-key"
}
```

## Endpoint-independent Responses
### Request to a non-existent endpoint
**Cause:** The user requested an endpoint URL which has no associated verbs (example `GET /admin/none`).  
**Status Code:** 404 Not Found  
**Response:**
```json
{
    "success": false,
    "reason": "The endpoint requested (<endpoint url>) does not exist."
}
```

### Request with the wrong HTTP verb
**Cause:** The user requested an endpoint URL for which the HTTP verb was invalid. Another verb should be used (example: `GET /login`).  
**Status Code:** 405 Method Not Allowed  
**Response:**
```json
{
    "success": false,
    "reason": "This HTTP verb (<verb>) is not supported for this endpoint (<endpoint url>)."
}
```

### Request for non-JSON data
**Cause:** The user used a header that didn't include `Accept: application/json`. Only JSON responses are supported.  
**Status Code:** 406 Not Acceptable  
**Response:**
```json
{
    "success": false,
    "reason": "All endpoints only support JSON (<MIME type> requested)."
}
```

### Request without authentication
**Cause:** The required authentication parameters aren't filled in. The only endpoints that can't throw this response are `POST /login` and `POST /coach/request`  
**Status Code:** 401 Unauthorized  
**Response:**
```json
{
    "success": false,
    "reason": "Unauthenticated request. Please log in first."
}
```

### Request with insufficient rights
**Cause:** The user requested a resource they don't have access to.  
**Status Code:** 403 Forbidden  
**Response:**
```json
{
    "success": false,
    "reason": "Unauthorized request. You do not have sufficient rights to access this endpoint."
}
```

### Request with invalid ID
**Cause:** Some endpoints require an ID in their URL. When given an invalid ID, this response is thrown.  
**Status Code:** 204 No Content  
**Response:**
```json
{
    "success": false,
    "reason": "This endpoint requires an ID. The ID you provided was invalid."
}
```

### Argument error
**Cause:** When a required argument is omitted or an argument has the wrong type, this response is thrown.  
**Status Code:** 400 Bad Request  
**Response:**  
```json
{
    "success": false,
    "reason": "One of the arguments is incorrect or not present. Please check your request."
}
```

### Server error
**Cause:** Something went wrong while processing the request.  
**Status Code:** 500 Internal Server Error  
**Response:**  
```json
{
    "success": false,
    "reason": "Something went wrong while trying to execute your request."
}
```

[#]: !links
[todoc]: https://shields.io/badge/Status-To_document-black
[todo]: https://shields.io/badge/Status-To_do-red
[in-progress]: https://shields.io/badge/Status-In_progress-orange
[to-test]: https://shields.io/badge/Status-Tests_required-yellow
[merging]: https://shields.io/badge/Status-Merging-yellowgreen
[done]: https://shields.io/badge/Status-Done-brightgreen
