import { PrismaClient } from "@prisma/client";
import { mockDeep, mockReset, DeepMockProxy } from "jest-mock-extended";

/*
 * this file creates a mock of the prisma client, this mock is used in all the unit orm_tests
 */

import prisma from "../../prisma/prisma";

jest.mock("../../prisma/prisma", () => ({
    __esModule: true,
    default: mockDeep<PrismaClient>(),
}));

beforeEach(() => {
    mockReset(prismaMock);
});

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;
