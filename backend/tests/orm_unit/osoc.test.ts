import {prismaMock} from "./singleton";
import {
    createOsoc, deleteOsoc, deleteOsocByYear,
    getAllOsoc,
    getOsocAfterYear,
    getOsocBeforeYear,
    getOsocByYear,
    updateOsoc, getLatestOsoc
} from "../../orm_functions/osoc";
import {UpdateOsoc} from "../../orm_functions/orm_types";

const returnValue = {
    osoc_id: 0,
    year: 2022
}

test("should create a new OSOC edition and return it", async () => {
    prismaMock.osoc.create.mockResolvedValue(returnValue);
    await expect(createOsoc(2022)).resolves.toEqual(returnValue);
});

test("should return all osoc editions", async () => {
    const returnValue = [{
        osoc_id: 0,
        year: 2022
    }];

    prismaMock.osoc.findMany.mockResolvedValue(returnValue);
    await expect(getAllOsoc()).resolves.toEqual(returnValue);
});

test("should return the latest osoc editions", async () => {
    const returnValue = {
        osoc_id: 0,
        year: 2022
    };

    prismaMock.osoc.findFirst.mockResolvedValue(returnValue);
    await expect(getLatestOsoc()).resolves.toEqual(returnValue);
});

test("should return the osoc edition of the given year", async () => {
    prismaMock.osoc.findUnique.mockResolvedValue(returnValue);
    await expect(getOsocByYear(2022)).resolves.toEqual(returnValue);
});

test("should return every osoc edition BEFORE (exclusive) the given year", async () => {
    const returnValue = [{
        osoc_id: 0,
        year: 2022
    }];

    prismaMock.osoc.findMany.mockResolvedValue(returnValue);
    await expect(getOsocBeforeYear(2023)).resolves.toEqual(returnValue);
});

test("should return every osoc edition AFTER (exclusive) the given year", async () => {
    const returnValue = [{
        osoc_id: 0,
        year: 2022
    }];

    prismaMock.osoc.findMany.mockResolvedValue(returnValue);
    await expect(getOsocAfterYear(2020)).resolves.toEqual(returnValue);
});

test("should update the osoc edition", async () => {
    const updatedOsoc: UpdateOsoc = {
        osocId: 0,
        year: 2023
    }

    prismaMock.osoc.update.mockResolvedValue(returnValue)
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