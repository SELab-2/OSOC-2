import { errors } from "../../../../utility";
import { getFunFact, readFile } from "../../../../routes/form";
import { Requests } from "../../../../types";
import Form = Requests.Form;

test("Fun fact question absent", async () => {
    const data = await readFile(
        "../tests/routes_unit/form/fun_fact_files",
        "funFactQuestionAbsent.json"
    );
    expect(data).not.toBeNull();

    await expect(getFunFact(data as Form)).rejects.toBe(
        errors.cookArgumentError()
    );
});
