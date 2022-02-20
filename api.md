# OSOC - API
*An overview of API endpoints, verbs and their uses.*  
*Note: this is still in-progress and will change over time.*

## Overview table

 Endpoint | Supports GET | Supports POST | Supports DELETE
 --- | --- | --- | ---
 `/login` | No | [Yes](#post-login) | No
`/student` | [Yes](#get-student) | [Yes](#post-student) | No
`/student/all` | [Yes](#get-studentall) | No | No
`/student/<student-id>` | [Yes](#get-studentstudent-id) | [Yes](#post-studentstudent-id) | [Yes](#delete-studentstudent-id)
`/student/<student-id>/suggest` | [Yes](#get-studentstudent-idsuggest) | [Yes](#post-studentstudent-idsuggest) | No
`/student/<student-id>/remove` | No | [Yes](#post-studentstudent-idremove) | [Yes](#delete-studentstudent-idremove)
`/student/<student-id>/confirm` | No | [Yes](#post-studentstudent-idconfirm) | No
`/student/search` | [Yes](#get-studentsearch) | No | No
`/coach` | [Yes](#get-coach) | No | No
`/coach/all` | [Yes](#get-coachall) | No | No
`/coach/<coach-id>` | [Yes](#get-coachcoach-id) | [Yes](#post-coachcoach-id) | [Yes](#delete-coachcoach-id)
`/coach/request` | [Yes](#get-coachrequest) | [Yes](#post-coachrequest) | No
`/coach/request/<request-id>` | [Yes](#get-coachrequestrequest-id) | [Yes](#post-coachrequestrequest-id) | [Yes](#delete-coachrequestrequest-id)
`/admin` | [Yes](#get-admin) | No | No
`/admin/all` | [Yes](#get-adminall) | No | No
`/admin/<admin-id>` | [Yes](#get-adminadmin-id) | [Yes](#post-adminadmin-id) | [Yes](#delete-adminadmin-id)
`/project` | [Yes](#get-project) | [Yes](#post-project) | No
`/project/all` | [Yes](#get-projectall) | No | No
`/project/<project-id>` | [Yes](#get-projectproject-id) | [Yes](#post-projectproject-id) | [Yes](#delete-projectproject-id)
`/project/<project-id>/draft` | [Yes](#get-projectproject-iddraft) | [Yes](#post-projectproject-iddraft) | No
`/project/conflicts` | [Yes](#get-projectconflicts) | No | No
`/followup` | [Yes](#get-followup) | No | No
`/followup/all` | [Yes](#get-followupall) | No | No
`/followup/<student-id>` | [Yes](#get-followupstudent-id) | [Yes](#post-followupstudent-id) | No
`/followup/template` | [Yes](#get-followuptemplate) | [Yes](#post-followuptemplate) | No
`/followup/template/<template-name>` | [Yes](#get-followuptemplatetemplate-name) | [Yes](#post-followuptemplatetemplate-name) | [Yes](#delete-followuptemplatetemplate-name)

## Endpoints
### POST /login
**Arguments:** TBD  
**Description:** Attempts to log a user in into the system.  
**Response:** TBD  
```json
```

### GET /student
**Arguments:** TBD  
**Description:** Redirects towards `GET /student/all`  
**Response:** HTTP 303  
```http
HTTP/<version> 303 See Other
Location: <server-url>/student/all
```

### POST /student
**Arguments:** TBD  
**Description:** Creates a new student in the system.  
**Response:** TBD  
```json
```

### GET /student/all
**Arguments:** TBD  
**Description:** Lists all students in the system.  
**Response:** TBD  
```json
```

### GET /student/\<student-id>
**Arguments:** TBD  
**Description:** Lists all details about the student with the given id.  
**Response:** TBD  
```json
```

### POST /student/\<student-id>
**Arguments:** TBD  
**Description:** Modifies the details of the student.  
**Response:** TBD  
```json
```

### DELETE /student/\<student-id>
**Arguments:** TBD  
**Description:** Removes the given student from the system.  
**Response:** TBD  
```json
```

### GET /student/\<student-id>/suggest
**Arguments:** TBD  
**Description:** List the suggestions (yes/maybe/no) for this student.  
**Response:** TBD  
```json
```

### POST /student/\<student-id>/suggest
**Arguments:** TBD  
**Description:** Add or modify your suggestion (yes/maybe/no) for this student.  
**Response:** TBD  
```json
```

### POST /student/\<student-id>/remove
**Arguments:** TBD  
**Description:** Allows a student to request the removal of their data.  
**Response:** TBD  
```json
```

### DELETE /student/\<student-id>/remove
**Arguments:** TBD  
**Description:** Allows an admin to remove the data of this student.  
**Response:** TBD  
```json
```

### POST /student/\<student-id>/confirm
**Arguments:** TBD  
**Description:** Confirms the reply to this student (yes/maybe/no). Does not modify the follow-up data in those endpoints. The second time this request is made for this student, the e-mail follow-up has been confirmed as well.  
**Response:** TBD  
```json
```

### GET /student/search
**Arguments:** TBD  
**Description:** Searches for a student by certain values.  
**Response:** TBD  
```json
```

### GET /coach
**Arguments:** TBD  
**Description:** Redirects towards `GET /coach/all`  
**Response:**
```http
HTTP/<version> 303 See Other
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
HTTP/<version> 303 See Other
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
**Description:** Redirects towards `/projects/all`  
**Response:**
```http
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
HTTP/<version> 303 See Other
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
