import { prismaMock } from "./singleton";
import { contract_status_enum } from "@prisma/client";
import {
    createContract,
    removeContract,
    removeContractsFromStudent,
    updateContract,
    contractsForStudent,
    contractsByProject,
    sortedContractsByOsocEdition,
} from "../../orm_functions/contract";

test("should create a contract", async () => {
    const contract = {
        studentId: 1,
        projectRoleId: 1,
        information: "fake information",
        loginUserId: 5,
        contractStatus: contract_status_enum.AWAITING_PROJECT,
    };

    const returnContract = {
        contract_id: 5,
        student_id: 1,
        project_role_id: 1,
        information: "fake information",
        created_by_login_user_id: 5,
        contract_status: contract_status_enum.AWAITING_PROJECT,
    };

    prismaMock.contract.create.mockResolvedValue(returnContract);

    await expect(createContract(contract)).resolves.toEqual(returnContract);
});

test("should update a contract", async () => {
    const contract = {
        contractId: 1,
        information: "fake information",
        loginUserId: 5,
        contractStatus: contract_status_enum.AWAITING_PROJECT,
    };

    const returnContract = {
        contract_id: 1,
        student_id: 2,
        project_role_id: 1,
        information: "fake information",
        created_by_login_user_id: 5,
        contract_status: contract_status_enum.AWAITING_PROJECT,
    };

    prismaMock.contract.update.mockResolvedValue(returnContract);

    await expect(updateContract(contract)).resolves.toEqual(returnContract);
});

test("should remove contracts associated with the student", async () => {
    const count = { count: 4 };

    const studentId = 2;

    prismaMock.contract.deleteMany.mockResolvedValue(count);

    await expect(removeContractsFromStudent(studentId)).resolves.toEqual(count);
});

test("should remove the give contract", async () => {
    const contractId = 2;

    const returnContract = {
        contract_id: 1,
        student_id: 2,
        project_role_id: 1,
        information: "fake information",
        created_by_login_user_id: 5,
        contract_status: contract_status_enum.AWAITING_PROJECT,
    };

    prismaMock.contract.delete.mockResolvedValue(returnContract);

    await expect(removeContract(contractId)).resolves.toEqual(returnContract);
});

test("should list all contracts of a student", async () => {
    const returnContract = [
        {
            student_id: 1,
            project_role_id: 1,
            information: "fake information",
            created_by_login_user_id: 5,
            contract_status: contract_status_enum.AWAITING_PROJECT,
            contract_id: 5,
            project_role: {
                project: {
                    osoc_id: 1,
                },
                project_id: 1,
            },
            student: {
                student_id: 1,
                pronouns: "he",
                nickname: "nick",
                alumni: true,
                gender: "M",
                person_id: 1,
                phone_number: "0452986104",
            },
        },
    ];

    prismaMock.contract.findMany.mockResolvedValue(returnContract);

    await expect(contractsForStudent(1)).resolves.toEqual(returnContract);
});

test("should list all contracts linked to a project", async () => {
    const returnContract = [
        {
            student_id: 1,
            project_role_id: 1,
            information: "fake information",
            created_by_login_user_id: 5,
            contract_status: contract_status_enum.AWAITING_PROJECT,
            contract_id: 5,
            project_role: {
                project: {
                    osoc_id: 1,
                },
                project_id: 1,
            },
            student: {
                student_id: 1,
                pronouns: "he",
                nickname: "nick",
                alumni: true,
                gender: "M",
                person_id: 1,
                phone_number: "0452986104",
            },
        },
    ];

    prismaMock.contract.findMany.mockResolvedValue(returnContract);

    await expect(contractsByProject(1)).resolves.toEqual(returnContract);
});

test("should list all contracts linked to an osoc edition", async () => {
    const returnContract = [
        {
            student_id: 2,
            project_role_id: 2,
            information: "fake information",
            created_by_login_user_id: 5,
            contract_status: contract_status_enum.AWAITING_PROJECT,
            contract_id: 4,
            project_role: {
                project: {
                    osoc_id: 1,
                },
                project_id: 1,
            },
            student: {
                student_id: 2,
                pronouns: "he",
                nickname: "nick",
                alumni: true,
                gender: "M",
                person_id: 1,
                phone_number: "0452986104",
            },
        },
        {
            student_id: 1,
            project_role_id: 1,
            information: "fake information",
            created_by_login_user_id: 5,
            contract_status: contract_status_enum.AWAITING_PROJECT,
            contract_id: 5,
            project_role: {
                project: {
                    osoc_id: 1,
                },
                project_id: 1,
            },
            student: {
                student_id: 1,
                pronouns: "he",
                nickname: "nick",
                alumni: true,
                gender: "M",
                person_id: 1,
                phone_number: "0452986104",
            },
        },
    ];

    prismaMock.contract.findMany.mockResolvedValue(returnContract);

    await expect(sortedContractsByOsocEdition(1)).resolves.toEqual(
        returnContract
    );
});
