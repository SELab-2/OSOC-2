import prisma from '../prisma/prisma';

import {CreateContract, UpdateContract} from './orm_types';

/**
 * add contract created by login_user_id for student_id that has the role
 * project_role_id
 *
 * @param contract: CreateContract object with all the info about the contract
 *     we want to create (who made the contract for which student for which job)
 * @returns created contract object in the database
 */
export async function createContract(contract: CreateContract) {
  return await prisma.contract.create({
    data : {
      student_id : contract.studentId,
      project_role_id : contract.projectRoleId,
      information : contract.information,
      created_by_login_user_id : contract.loginUserId,
      contract_status : contract.contractStatus,
    }
  });
}

/**
 * add contract created by login_user_id for student_id that has the role
 * project_role_id
 *
 * @param contract: the updated contract. Only the information and
 *     contractStatus field can be changed.
 * The created_by_login_user_id is updated to the user that made these last
 * changes
 * @returns the updated contract
 */
export async function updateContract(contract: UpdateContract) {
  return await prisma.contract.update({
    where : {contract_id : contract.contractId},
    data : {
      created_by_login_user_id : contract.loginUserId,
      contract_status : contract.contractStatus,
      information : contract.information
    }
  });
}

/**
 * remove all the contracts associated with studentId
 *
 * @param studentId: the id of the student whose contracts we are removing
 * @returns the number of removed contracts {count: number}
 */
export async function removeContractsFromStudent(studentId: number) {
  return await prisma.contract.deleteMany({where : {student_id : studentId}});
}

/**
 * remove the contract with contractId
 *
 * @param contractId: the id of the contract we are removing
 * @returns the removed contract
 */
export async function removeContract(contractId: number) {
  return await prisma.contract.delete({where : {contract_id : contractId}});
}

/**
 * find all contracts for the given student
 *
 * @param studentId: the id of the student
 * @returns the contract(s)
 */
export async function contractsForStudent(studentId: number) {
  return await prisma.contract.findMany({
    where : {student_id : studentId},
    select : {
      contract_id : true,
      project_role :
          {select : {project_id : true, project : {select : {osoc_id : true}}}},
      student : true
    }
  });
}

export async function contractsByProject(projectId: number) {
  return await prisma.contract.findMany({
    where : {project_role : {project_id : projectId}},
    select : {student : true, project_role : {select : {project : true}}}
  })
}
