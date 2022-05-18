import { prismaMock } from "./singleton";
import {
    createOsoc,
    deleteOsoc,
    deleteOsocByYear,
    getAllOsoc,
    getOsocAfterYear,
    getOsocBeforeYear,
    getOsocByYear,
    updateOsoc,
    getLatestOsoc,
    deleteOsocFromDB,
    getNewestOsoc,
    filterOsocs,
    getOsocById,
} from "../../orm_functions/osoc";
import { UpdateOsoc } from "../../orm_functions/orm_types";
import { account_status_enum, email_status_enum } from "@prisma/client";

const returnValue = {
    osoc_id: 0,
    year: 2022,
};

test("should create a new OSOC edition and return it", async () => {
    prismaMock.osoc.create.mockResolvedValue(returnValue);
    await expect(createOsoc(2022)).resolves.toEqual(returnValue);
});

test("should return all osoc editions", async () => {
    const returnValue = [
        {
            osoc_id: 0,
            year: 2022,
        },
    ];

    prismaMock.osoc.findMany.mockResolvedValue(returnValue);
    await expect(getAllOsoc()).resolves.toEqual(returnValue);
});

test("should return the latest osoc editions", async () => {
    const returnValue = {
        osoc_id: 0,
        year: 2022,
    };

    prismaMock.osoc.findFirst.mockResolvedValue(returnValue);
    await expect(getLatestOsoc()).resolves.toEqual(returnValue);
});

test("should return the osoc edition of the given year", async () => {
    prismaMock.osoc.findUnique.mockResolvedValue(returnValue);
    await expect(getOsocByYear(2022)).resolves.toEqual(returnValue);
});

test("should return every osoc edition BEFORE (exclusive) the given year", async () => {
    const returnValue = [
        {
            osoc_id: 0,
            year: 2022,
        },
    ];

    prismaMock.osoc.findMany.mockResolvedValue(returnValue);
    await expect(getOsocBeforeYear(2023)).resolves.toEqual(returnValue);
});

test("should return every osoc edition AFTER (exclusive) the given year", async () => {
    const returnValue = [
        {
            osoc_id: 0,
            year: 2022,
        },
    ];

    prismaMock.osoc.findMany.mockResolvedValue(returnValue);
    await expect(getOsocAfterYear(2020)).resolves.toEqual(returnValue);
});

test("should update the osoc edition", async () => {
    const updatedOsoc: UpdateOsoc = {
        osocId: 0,
        year: 2023,
    };

    prismaMock.osoc.update.mockResolvedValue(returnValue);
    await expect(updateOsoc(updatedOsoc)).resolves.toEqual(returnValue);
});

test("should delete the given osoc by id and return the deleted record", async () => {
    prismaMock.osoc.delete.mockResolvedValue(returnValue);
    await expect(deleteOsoc(0)).resolves.toEqual(returnValue);
});

test("should delete the given osoc by year and return the deleted record", async () => {
    prismaMock.osoc.delete.mockResolvedValue(returnValue);
    await expect(deleteOsocByYear(2022)).resolves.toEqual(returnValue);
});

test("should delete everything associated with the give osoc edition", async () => {
    prismaMock.project.findMany.mockResolvedValue([
        {
            project_id: 0,
            name: "",
            osoc_id: 0,
            partner: "",
            description: "",
            start_date: new Date(),
            end_date: new Date(),
        },
    ]);
    prismaMock.project_role.findMany.mockResolvedValue([
        {
            project_role_id: 0,
            project_id: 0,
            role_id: 0,
            positions: 0,
        },
    ]);
    prismaMock.job_application.findMany.mockResolvedValue([
        {
            job_application_id: 0,
            student_id: 0,
            student_volunteer_info: "",
            responsibilities: "",
            fun_fact: "",
            student_coach: false,
            osoc_id: 0,
            edus: [""],
            edu_level: "",
            edu_duration: 0,
            edu_year: "",
            edu_institute: "",
            email_status: email_status_enum.DRAFT,
            created_at: new Date(),
        },
    ]);
    prismaMock.project_user.deleteMany.mockResolvedValue({ count: 0 });
    prismaMock.login_user_osoc.deleteMany.mockResolvedValue({ count: 0 });
    prismaMock.contract.deleteMany.mockResolvedValue({ count: 0 });
    prismaMock.project_role.deleteMany.mockResolvedValue({ count: 0 });
    prismaMock.project.deleteMany.mockResolvedValue({ count: 0 });
    prismaMock.evaluation.deleteMany.mockResolvedValue({ count: 0 });
    prismaMock.applied_role.deleteMany.mockResolvedValue({ count: 0 });
    prismaMock.job_application_skill.deleteMany.mockResolvedValue({ count: 0 });
    prismaMock.attachment.deleteMany.mockResolvedValue({ count: 0 });
    prismaMock.job_application.deleteMany.mockResolvedValue({ count: 0 });
    prismaMock.osoc.delete.mockResolvedValue({
        osoc_id: 0,
        year: 0,
    });

    await deleteOsocFromDB(0);

    expect(prismaMock.project.findMany).toBeCalledTimes(1);
    expect(prismaMock.project_role.findMany).toBeCalledTimes(1);
    expect(prismaMock.job_application.findMany).toBeCalledTimes(1);
    expect(prismaMock.project_user.deleteMany).toBeCalledTimes(1);
    expect(prismaMock.login_user_osoc.deleteMany).toBeCalledTimes(1);
    expect(prismaMock.contract.deleteMany).toBeCalledTimes(1);
    expect(prismaMock.project_role.deleteMany).toBeCalledTimes(1);
    expect(prismaMock.project.deleteMany).toBeCalledTimes(1);
    expect(prismaMock.evaluation.deleteMany).toBeCalledTimes(1);
    expect(prismaMock.applied_role.deleteMany).toBeCalledTimes(1);
    expect(prismaMock.job_application_skill.deleteMany).toBeCalledTimes(1);
    expect(prismaMock.attachment.deleteMany).toBeCalledTimes(1);
    expect(prismaMock.job_application.deleteMany).toBeCalledTimes(1);
    expect(prismaMock.osoc.delete).toBeCalledTimes(1);
});

test("should return the newest osoc edition", async () => {
    const expected = {
        osoc_id: 0,
        year: 2022,
    };

    prismaMock.osoc.findFirst.mockResolvedValue(expected);
    const res = await getNewestOsoc();
    expect(res).toHaveProperty("osoc_id");
    expect(res).toHaveProperty("year");
    expect(prismaMock.osoc.findFirst).toBeCalledTimes(1);
});

test("should return filtered list of osocs", async () => {
    const expected = [
        {
            osoc_id: 0,
            year: 2022,
        },
    ];

    const user_response = {
        session_id: "50",
        login_user_id: 1,
        person_id: 0,
        password: "password",
        is_admin: false,
        is_coach: false,
        session_keys: ["key1", "key2"],
        account_status: account_status_enum.DISABLED,
        login_user_osoc: [
            {
                osoc: {
                    year: 2022,
                },
            },
        ],
    };
    prismaMock.login_user.findUnique.mockResolvedValue(user_response);
    prismaMock.osoc.findMany.mockResolvedValue(expected);
    const res = await filterOsocs(
        { currentPage: 0, pageSize: 25 },
        2022,
        undefined,
        0
    );
    res.data.forEach((val) => {
        expect(val).toHaveProperty("osoc_id");
        expect(val).toHaveProperty("year");
    });
    expect(prismaMock.osoc.findMany).toBeCalledTimes(1);
});

test("should return filtered list of osocs", async () => {
    const expected = [
        {
            osoc_id: 0,
            year: 2022,
        },
    ];

    const user_response = {
        session_id: "50",
        login_user_id: 1,
        person_id: 0,
        password: "password",
        is_admin: false,
        is_coach: false,
        session_keys: ["key1", "key2"],
        account_status: account_status_enum.DISABLED,
        login_user_osoc: [
            {
                osoc: {
                    year: 2022,
                },
            },
        ],
    };
    prismaMock.login_user.findUnique.mockResolvedValue(user_response);
    prismaMock.osoc.findMany.mockResolvedValue(expected);
    const res = await filterOsocs(
        { currentPage: 0, pageSize: 25 },
        2022,
        undefined,
        0
    );
    expect(res.pagination).toStrictEqual({ page: 0, count: undefined });
    res.data.forEach((val) => {
        expect(val).toHaveProperty("osoc_id");
        expect(val).toHaveProperty("year");
    });
    expect(prismaMock.osoc.findMany).toBeCalledTimes(1);
});

test("should return filtered list of osocs", async () => {
    const expected = [
        {
            osoc_id: 0,
            year: 2022,
        },
    ];

    const user_response = {
        session_id: "50",
        login_user_id: 1,
        person_id: 0,
        password: "password",
        is_admin: false,
        is_coach: false,
        session_keys: ["key1", "key2"],
        account_status: account_status_enum.DISABLED,
        login_user_osoc: [
            {
                osoc: {
                    year: 0,
                },
            },
        ],
    };
    prismaMock.login_user.findUnique.mockResolvedValue(user_response);
    prismaMock.osoc.findMany.mockResolvedValue(expected);
    const res = await filterOsocs(
        { currentPage: 0, pageSize: 25 },
        2022,
        undefined,
        0
    );
    res.data.forEach((val) => {
        expect(val).toHaveProperty("osoc_id");
        expect(val).toHaveProperty("year");
    });
    expect(prismaMock.osoc.findMany).toBeCalledTimes(0);
});

test("should return the found osoc edition", async () => {
    const osoc = {
        osoc_id: 0,
        year: 0,
    };
    prismaMock.osoc.findUnique.mockResolvedValue(osoc);
    await expect(getOsocById(0)).resolves.toEqual(osoc);
});

test("should return filtered list of osocs (yearFilter is undefined)", async () => {
    const expected = [
        {
            osoc_id: 0,
            year: 2022,
        },
    ];

    prismaMock.osoc.findMany.mockResolvedValue(expected);
    const res = await filterOsocs(
        { currentPage: 0, pageSize: 25 },
        undefined,
        undefined,
        0
    );
    expect(res.pagination).toStrictEqual({ page: 0, count: undefined });
    res.data.forEach((val) => {
        expect(val).toHaveProperty("osoc_id");
        expect(val).toHaveProperty("year");
    });
    expect(prismaMock.osoc.findMany).toBeCalledTimes(1);
});
