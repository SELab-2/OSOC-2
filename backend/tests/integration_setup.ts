import * as db from "./database_setup";

beforeAll(async () => await db.setup(false));
afterAll(async () => await db.teardown());
