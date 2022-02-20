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
**Description:**  
**Response:**  
```json
```
### GET /student
**Arguments:** TBD  
**Description:**  
**Response:**  
```json
```
### POST /student
**Arguments:** TBD  
**Description:**  
**Response:**  
```json
```
### GET /student/all
**Arguments:** TBD  
**Description:**  
**Response:**  
```json
```
### GET /student/\<student-id>
**Arguments:** TBD  
**Description:**  
**Response:**  
```json
```
### POST /student/\<student-id>
**Arguments:** TBD  
**Description:**  
**Response:**  
```json
```
### DELETE /student/\<student-id>
**Arguments:** TBD  
**Description:**  
**Response:**  
```json
```
### GET /student/\<student-id>/suggest
**Arguments:** TBD  
**Description:**  
**Response:**  
```json
```
### POST /student/\<student-id>/suggest
**Arguments:** TBD  
**Description:**  
**Response:**  
```json
```
### POST /student/\<student-id>/remove
**Arguments:** TBD  
**Description:**  
**Response:**  
```json
```
### DELETE /student/\<student-id>/remove
**Arguments:** TBD  
**Description:**  
**Response:**  
```json
```
### POST /student/\<student-id>/confirm
**Arguments:** TBD  
**Description:**  
**Response:**  
```json
```
### GET /student/search
**Arguments:** TBD  
**Description:**  
**Response:**  
```json
```
### GET /coach
**Arguments:** TBD  
**Description:**  
**Response:**  
```json
```
### GET /coach/all
**Arguments:** TBD  
**Description:**  
**Response:**  
```json
```
### GET /coach/\<coach-id>
**Arguments:** TBD  
**Description:**  
**Response:**  
```json
```
### POST /coach/\<coach-id>
**Arguments:** TBD  
**Description:**  
**Response:**  
```json
```
### DELETE /coach/\<coach-id>
**Arguments:** TBD  
**Description:**  
**Response:**  
```json
```
### GET /coach/request
**Arguments:** TBD  
**Description:**  
**Response:**  
```json
```
### POST /coach/request
**Arguments:** TBD  
**Description:**  
**Response:**  
```json
```
### GET /coach/request/\<request-id>
**Arguments:** TBD  
**Description:**  
**Response:**  
```json
```
### POST /coach/request/\<request-id>
**Arguments:** TBD  
**Description:**  
**Response:**  
```json
```
### DELETE /coach/request/\<request-id>
**Arguments:** TBD  
**Description:**  
**Response:**  
```json
```
### GET /admin
**Arguments:** TBD  
**Description:**  
**Response:**  
```json
```
### GET /admin/all
**Arguments:** TBD  
**Description:**  
**Response:**  
```json
```
### GET /admin/\<admin-id>
**Arguments:** TBD  
**Description:**  
**Response:**  
```json
```
### POST /admin/\<admin-id>
**Arguments:** TBD  
**Description:**  
**Response:**  
```json
```
### DELETE /admin/\<admin-id>
**Arguments:** TBD  
**Description:**  
**Response:**  
```json
```
### GET /project
**Arguments:** TBD  
**Description:**  
**Response:**  
```json
```
### POST /project
**Arguments:** TBD  
**Description:**  
**Response:**  
```json
```
### GET /project/all
**Arguments:** TBD  
**Description:**  
**Response:**  
```json
```
### GET /project/\<project-id>
**Arguments:** TBD  
**Description:**  
**Response:**  
```json
```
### POST /project/\<project-id>
**Arguments:** TBD  
**Description:**  
**Response:**  
```json
```
### DELETE /project/\<project-id>
**Arguments:** TBD  
**Description:**  
**Response:**  
```json
```
### GET /project/\<project-id>/draft
**Arguments:** TBD  
**Description:**  
**Response:**  
```json
```
### POST /project/\<project-id>/draft
**Arguments:** TBD  
**Description:**  
**Response:**  
```json
```
### GET /project/conflicts
**Arguments:** TBD  
**Description:**  
**Response:**  
```json
```
### GET /followup
**Arguments:** TBD  
**Description:**  
**Response:**  
```json
```
### GET /followup/all
**Arguments:** TBD  
**Description:**  
**Response:**  
```json
```
### GET /followup/\<student-id>
**Arguments:** TBD  
**Description:**  
**Response:**  
```json
```
### POST /followup/\<student-id>
**Arguments:** TBD  
**Description:**  
**Response:**  
```json
```
### GET /followup/template
**Arguments:** TBD  
**Description:**  
**Response:**  
```json
```
### POST /followup/template
**Arguments:** TBD  
**Description:**  
**Response:**  
```json
```
### GET /followup/template/\<template-name>
**Arguments:** TBD  
**Description:**  
**Response:**  
```json
```
### POST /followup/template/\<template-name>
**Arguments:** TBD  
**Description:**  
**Response:**  
```json
```
### DELETE /followup/template/\<template-name>
**Arguments:** TBD  
**Description:**  
**Response:**  
```json
```
