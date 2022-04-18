import prisma from "../prisma/prisma";

import { CreatePerson, UpdatePerson } from "./orm_types";

/**
 *
 * @param person: person object with the needed information
 */
export async function createPerson(person: CreatePerson) {
  return await prisma.person.create({
    data: {
      firstname: person.firstname,
      lastname: person.lastname,
      github: person.github,
      email: person.email,
      github_id: person.github_id,
    },
  });
}

/**
 *
 * @returns a list of all the person objects in the database
 */
export async function getAllPersons() {
  return await prisma.person.findMany();
}

/**
 *
 * @param email: this is the email of the person we are looking up in the
 *     database
 * @returns: password of the login user matching with the person
 */
export async function getPasswordPersonByEmail(email: string) {
  return await prisma.person.findUnique({
    where: { email: email },
    select: {
      login_user: {
        select: {
          password: true,
          login_user_id: true,
          account_status: true,
          is_admin: true,
          is_coach: true,
        },
      },
    },
  });
}

/**
 *
 * @param github: this is the GitHub username of the person we are looking up in
 *     the database
 * @returns: password of the login user matching with the person
 */
export async function getPasswordPersonByGithub(github: string) {
  return await prisma.person.findUnique({
    where: { github_id: github },
    select: {
      github: true,
      person_id: true,
      firstname: true,
      login_user: {
        select: {
          password: true,
          login_user_id: true,
          account_status: true,
          is_admin: true,
          is_coach: true,
        },
      },
    },
  });
}

/**
 *
 * @param name: This is the name of the person we are looking, can be firstname
 *     as lastname
 * @returns: a list of all the person objects in the database that match
 */
export async function searchPersonByName(name: string) {
  return await prisma.person.findMany({
    where: {
      OR: [
        {
          firstname: { contains: name },
        },
        {
          lastname: { contains: name },
        },
      ],
    },
  });
}

/**
 *
 * @param login: This is the email or GitHub of the person we are looking for
 * @returns: a list of all the person objects in the database that match either
 * the email or github
 */
export async function searchPersonByLogin(login: string) {
  return prisma.person.findMany({
    where: {
      OR: [
        {
          email: { contains: login },
        },
        {
          github: { contains: login },
        },
      ],
    },
  });
}

/**
 *
 * @param person: UpdatePerson object with the values that need to be updated
 * @returns the updated entry in the database
 */
export async function updatePerson(person: UpdatePerson) {
  return await prisma.person.update({
    where: { person_id: person.personId },
    data: {
      firstname: person.firstname,
      lastname: person.lastname,
      github: person.github,
      email: person.email,
    },
  });
}

/**
 *
 * @param personId the person whose info we are deleting from the person-table
 * @returns the deleted person record
 */
export async function deletePersonById(personId: number) {
  return await prisma.person.delete({ where: { person_id: personId } });
}
