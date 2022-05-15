import * as T from "../../../types";
import * as fs from "fs";
import * as path from "path";
import * as form_router from "../../../routes/form";
import * as form_keys from "../../../routes/form_keys.json";

export function readDataTestForms(): T.Requests.Form[] {
    return Object.values(
        fs.readdirSync(path.join(__dirname, "/../../../../testforms"))
    )
        .filter((filename) => filename.includes("testform"))
        .map((filename) => {
            const readFile = (path: string) => fs.readFileSync(path, "utf8");
            const fileData = readFile(
                path.join(__dirname, `/../../../../testforms/${filename}`)
            );
            return JSON.parse(fileData);
        });
}

describe.each(Object.values(form_keys))("Questions present", (key) => {
    if (typeof key === "string") {
        readDataTestForms().forEach((form) => {
            it(`Question with key ${key} is present`, () => {
                const res = form_router.filterQuestion(form, key);
                expect(res.data).not.toBe(null);
            });
        });
    }
});
