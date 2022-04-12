import {filterLoginUsers} from "../../orm_functions/login_user";

it("test", async () => {
    const res = await filterLoginUsers(undefined, undefined, undefined, undefined, undefined, undefined, undefined);
    console.log(res);
})