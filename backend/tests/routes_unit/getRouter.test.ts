// Testing each getRouter function is useless - it would be like testing
//  the express library. However, it is quite some lines. To improve our own
//  coverage, we will simply run those lines. Every help function and so on
//  has been thoroughly tested, and it is not really possible to create a mocked
//  router which behaves as it should (also, we can't mock the other functions).

import * as admin from "../../routes/admin";
import * as coach from "../../routes/coach";
import * as followup from "../../routes/followup";
import * as form from "../../routes/form";
import * as github from "../../routes/github";
import * as login from "../../routes/login";
import * as osoc from "../../routes/osoc";
import * as project from "../../routes/project";
import * as reset from "../../routes/reset";
import * as role from "../../routes/role";
import * as student from "../../routes/student";
import * as template from "../../routes/template";
import * as user from "../../routes/user";
import * as verify from "../../routes/verify";

test("All getRouters don't throw", () => {
    [
        admin,
        coach,
        followup,
        form,
        github,
        login,
        osoc,
        project,
        reset,
        role,
        student,
        template,
        user,
        verify,
    ].forEach((route) => expect(route.getRouter).not.toThrow());
});
