import * as db from "./database_setup";

/* istanbul ignore file */

beforeAll(async () => await db.setup(false));
afterAll(async () => await db.teardown());
