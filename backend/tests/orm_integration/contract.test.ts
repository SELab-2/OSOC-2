import prisma from "../../prisma/prisma";
import {
  createContract,
  updateContract,
  removeContract,
  removeContractsFromStudent,
} from "../../orm_functions/contract";
import { CreateContract, UpdateContract } from "../../orm_functions/orm_types";
import { contract_status_enum } from "@prisma/client";

const contract1: UpdateContract = {
  contractId: 0,
  information: "Contract details",
  loginUserId: 0,
  contractStatus: contract_status_enum.SENT,
};

const contract2: UpdateContract = {
  contractId: 0,
  information: "New Contract details",
  loginUserId: 0,
  contractStatus: contract_status_enum.SIGNED,
};

it("should create 1 new contract linked to a student", async () => {
  const student = await prisma.student.findFirst();
  const project_role = await prisma.project_role.findFirst();
  const login_user = await prisma.login_user.findFirst();
  if (student && project_role && login_user) {
    const contract: CreateContract = {
      studentId: student.student_id,
      projectRoleId: project_role.project_role_id,
      information: "Contract details",
      loginUserId: login_user.login_user_id,
      contractStatus: contract_status_enum.SENT,
    };
    const created_contract = await createContract(contract);
    contract1.contractId = created_contract.contract_id;
    contract2.contractId = created_contract.contract_id;
    contract1.loginUserId = created_contract.created_by_login_user_id;
    contract2.loginUserId = created_contract.created_by_login_user_id;
    expect(created_contract).toHaveProperty(
      "contract_id",
      contract1.contractId
    );
    expect(created_contract).toHaveProperty(
      "information",
      contract1.information
    );
    expect(created_contract).toHaveProperty(
      "created_by_login_user_id",
      contract1.loginUserId
    );
    expect(created_contract).toHaveProperty(
      "contract_status",
      contract1.contractStatus
    );
  }
});

it("should create 1 new contract linked to a student", async () => {
  const student = await prisma.student.findFirst();
  const project_role = await prisma.project_role.findFirst();
  const login_user = await prisma.login_user.findFirst();
  if (student && project_role && login_user) {
    const contract: CreateContract = {
      studentId: student.student_id,
      projectRoleId: project_role.project_role_id,
      information: "Student Contract details",
      loginUserId: login_user.login_user_id,
      contractStatus: contract_status_enum.CANCELLED,
    };
    const created_contract = await createContract(contract);
    expect(created_contract).toHaveProperty(
      "information",
      contract.information
    );
    expect(created_contract).toHaveProperty(
      "created_by_login_user_id",
      contract.loginUserId
    );
    expect(created_contract).toHaveProperty(
      "contract_status",
      contract.contractStatus
    );
  }
});

it("should update contract based upon contract id", async () => {
  const updated_contract = await updateContract(contract2);
  expect(updated_contract).toHaveProperty("contract_id", contract2.contractId);
  expect(updated_contract).toHaveProperty("information", contract2.information);
  expect(updated_contract).toHaveProperty(
    "created_by_login_user_id",
    contract2.loginUserId
  );
  expect(updated_contract).toHaveProperty(
    "contract_status",
    contract2.contractStatus
  );
});

it("should delete the contract based upon contract id", async () => {
  const deleted_contract = await removeContract(contract2.contractId);
  expect(deleted_contract).toHaveProperty("contract_id", contract2.contractId);
  expect(deleted_contract).toHaveProperty("information", contract2.information);
  expect(deleted_contract).toHaveProperty(
    "created_by_login_user_id",
    contract2.loginUserId
  );
  expect(deleted_contract).toHaveProperty(
    "contract_status",
    contract2.contractStatus
  );
});

it("should delete the contracts based upon student", async () => {
  const students = await prisma.student.findMany();
  const deleted_contracts = await removeContractsFromStudent(
    students[0].student_id
  );
  expect(deleted_contracts).toHaveProperty("count", 1);
});
