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
} from "../../orm_functions/osoc";
import prisma from "../../prisma/prisma";

import "../integration_setup";

it("should create a new osoc edition", async () => {
    const newOsoc = await createOsoc(2024);
    expect(newOsoc).toHaveProperty("year", 2024);
    expect(newOsoc).toHaveProperty("osoc_id");
});

it("should return all osoc editions", async () => {
    const osocs = await getAllOsoc();
    [2022, 2023, 2024].forEach((year, index) => {
        if (year in osocs.map((osoc) => osoc.year)) {
            expect(osocs[index]).toHaveProperty("year", year);
            expect(osocs[index]).toHaveProperty("osoc_id");
        }
    });
});

it("should return the latest osoc edition", async () => {
    const osoc = await getLatestOsoc();
    expect(osoc).toHaveProperty("year", 2024);
    expect(osoc).toHaveProperty("osoc_id");
});

it("should return the osoc edition by year", async () => {
    const osoc = await getOsocByYear(2022);
    expect(osoc).toBeTruthy();
    expect(osoc).toHaveProperty("year", 2022);
    expect(osoc).toHaveProperty("osoc_id");
    const osoc2 = await getOsocByYear(2050);
    expect(osoc2).toBeNull();
});

it("should return all editions before 2024", async () => {
    const osocs = await getOsocBeforeYear(2024);
    [2022, 2023].forEach((year, index) => {
        expect(osocs[index]).toHaveProperty("year", year);
        expect(osocs[index]).toHaveProperty("osoc_id");
    });
    expect(osocs.length).toEqual(2);
});

it("should return all osoc editions after 2022", async () => {
    const osocs = await getOsocAfterYear(2022);
    [2023, 2024].forEach((year, index) => {
        expect(osocs[index]).toHaveProperty("year", year);
        expect(osocs[index]).toHaveProperty("osoc_id");
    });
    expect(osocs.length).toEqual(2);
});

it("should update the selected osoc", async () => {
    const osoc = await getOsocByYear(2024);

    if (osoc) {
        const updatedOsoc = await updateOsoc({
            osocId: osoc.osoc_id,
            year: 2025,
        });
        expect(updatedOsoc).toHaveProperty("year", 2025);

        const osocUpdatedFound = await prisma.osoc.findUnique({
            where: {
                osoc_id: osoc.osoc_id,
            },
        });
        expect(osocUpdatedFound).toHaveProperty("year", 2025);
    }
});

it("should delete the osoc", async () => {
    const osoc = await getOsocByYear(2025);

    if (osoc) {
        const removedOsoc = await deleteOsoc(osoc.osoc_id);
        expect(removedOsoc).toHaveProperty("year", osoc.year);
        expect(removedOsoc).toHaveProperty("osoc_id", osoc.osoc_id);

        const searchDeleted = await getOsocByYear(osoc.year);
        expect(searchDeleted).toBeNull();
    }
});

it("should delete the osoc by year", async () => {
    const year = 2024;
    const osoc = await createOsoc(year);

    if (osoc) {
        const removedOsoc = await deleteOsocByYear(year);
        expect(removedOsoc).toHaveProperty("osoc_id", osoc.osoc_id);
        expect(removedOsoc).toHaveProperty("year", osoc.year);

        const searchDeleted = await getOsocByYear(year);
        expect(searchDeleted).toBeNull();
    }
});
