import * as db from "../database_setup";

let flag = false;

beforeAll(async () => {
    if (!flag) {
        console.log("DOING SETUP");
        await db.setup(false);
        flag = true;
    }
});
afterAll(async () => {
    console.log("DOING TEARDOWN");
    await db.teardown();
});
