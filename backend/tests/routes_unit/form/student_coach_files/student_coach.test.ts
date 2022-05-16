import { errors } from "../../../../utility";
import { isStudentCoach, readFile } from "../../../../routes/form";
import { Requests } from "../../../../types";
import Form = Requests.Form;

test("Student coach question absent", async () => {
    const data = await readFile(
        "../tests/routes_unit/form/student_coach_files",
        "studentCoachQuestionAbsent.json"
    );
    expect(data).not.toBeNull();

    await expect(isStudentCoach(data as Form, true)).rejects.toBe(
        errors.cookArgumentError()
    );
});

test("Student coach options absent", async () => {
    const data = await readFile(
        "../tests/routes_unit/form/student_coach_files",
        "studentCoachOptionsAbsent.json"
    );
    expect(data).not.toBeNull();

    await expect(isStudentCoach(data as Form, true)).rejects.toBe(
        errors.cookArgumentError()
    );
});

test("Student coach value is No", async () => {
    const data = await readFile(
        "../tests/routes_unit/form/student_coach_files",
        "studentCoachNotParticipatedYet.json"
    );
    expect(data).not.toBeNull();

    await expect(isStudentCoach(data as Form, false)).resolves.toBeNull();
});
