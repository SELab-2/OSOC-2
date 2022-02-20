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
### GET /student
### POST /student
### GET /student/all
### GET /student/\<student-id>
### POST /student/\<student-id>
### DELETE /student/\<student-id>
### GET /student/\<student-id>/suggest
### POST /student/\<student-id>/suggest
### POST /student/\<student-id>/remove
### DELETE /student/\<student-id>/remove
### POST /student/\<student-id>/confirm
### GET /student/search
### GET /coach
### GET /coach/all
### GET /coach/\<coach-id>
### POST /coach/\<coach-id>
### DELETE /coach/\<coach-id>
### GET /coach/request
### POST /coach/request
### GET /coach/request/\<request-id>
### POST /coach/request/\<request-id>
### DELETE /coach/request/\<request-id>
### GET /admin
### GET /admin/all
### GET /admin/\<admin-id>
### POST /admin/\<admin-id>
### DELETE /admin/\<admin-id>
### GET /project
### POST /project
### GET /project/all
### GET /project/\<project-id>
### POST /project/\<project-id>
### DELETE /project/\<project-id>
### GET /project/\<project-id>/draft
### POST /project/\<project-id>/draft
### GET /project/conflicts
### GET /followup
### GET /followup/all
### GET /followup/\<student-id>
### POST /followup/\<student-id>
### GET /followup/template
### POST /followup/template
### GET /followup/template/\<template-name>
### POST /followup/template/\<template-name>
### DELETE /followup/template/\<template-name>
