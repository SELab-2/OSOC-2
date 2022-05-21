import { errors } from "../../../../utility";
import { getVolunteerInfo, readFile } from "../../../../routes/form";
import { Requests } from "../../../../types";
import Form = Requests.Form;

test("Volunteer info question absent", async () => {
    const data = await readFile(
        "../tests/routes_unit/form/volunteer_info_files",
        "volunteerInfoQuestionAbsent.json"
    );
    expect(data).not.toBeNull();

    await expect(getVolunteerInfo(data as Form)).rejects.toBe(
        errors.cookArgumentError()
    );
});

test("Volunteer info options are absent", async () => {
    const data = await readFile(
        "../tests/routes_unit/form/volunteer_info_files",
        "volunteerInfoOptionsAbsent.json"
    );
    expect(data).not.toBeNull();

    await expect(getVolunteerInfo(data as Form)).rejects.toBe(
        errors.cookArgumentError()
    );
});
