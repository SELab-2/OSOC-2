// only test successes because
// 1: checkSessionKey/isAdmin has been tested
// 2: orm functions are fully tested
// 3: respOrError has been tested
// 4: all parsers have been tested
// -> failures use those stacks and aren't usually caught in the routes
// -> if those stacks work, all failures work as well (because Promises).

import {getMockReq} from '@jest-mock/express';
import {login_user, person} from '@prisma/client';

// setup mock for request
import * as req from '../../request';
jest.mock('../../request');
const reqMock = req as jest.Mocked<typeof req>;

// setup mock for utility
import * as util from '../../utility';
jest.mock('../../utility');
const utilMock = util as jest.Mocked<typeof util>;

// setup mocks for orm
import * as ormL from '../../orm_functions/login_user';
jest.mock('../../orm_functions/login_user');
const ormLMock = ormL as jest.Mocked<typeof ormL>;
import * as ormP from '../../orm_functions/person';
jest.mock('../../orm_functions/person');
const ormPMock = ormP as jest.Mocked<typeof ormP>;

import * as admin from '../../routes/admin';

const people: (login_user&{person : person})[] = [
  {
    person : {
      person_id : 1,
      firstname : 'Jeffrey',
      lastname : 'Jan',
      email : 'jeffrey@jan.be',
      github : null
    },
    is_coach : false,
    is_admin : true,
    login_user_id : 7,
    person_id : 1,
    password : 'jeffreyForEver',
    account_status : 'PENDING'
  },
  {
    person : {
      person_id : 2,
      firstname : 'Jan',
      lastname : 'Jeffrey',
      email : null,
      github : '@jan_jeffrey'
    },
    is_coach : false,
    is_admin : true,
    login_user_id : 8,
    person_id : 2,
    password : null,
    account_status : 'ACTIVATED'
  }
];

// setup
beforeEach(() => {
  // mocks for request
  reqMock.parseAdminAllRequest.mockResolvedValue({sessionkey : "abcd"});
  reqMock.parseSingleAdminRequest.mockResolvedValue(
      {sessionkey : "abcd", id : 0});
  reqMock.parseUpdateAdminRequest.mockImplementation(
      req => Promise.resolve(req.body));
  reqMock.parseDeleteAdminRequest.mockResolvedValue(
      {sessionkey : 'abcd', id : 1});

  // mocks for utility
  utilMock.checkSessionKey.mockImplementation(
      v => Promise.resolve({userId : 0, data : v}));
  utilMock.isAdmin.mockImplementation(
      v => Promise.resolve({userId : 0, data : v}));

  // mocks for orm
  ormLMock.searchAllAdminLoginUsers.mockResolvedValue(people);
  ormLMock.updateLoginUser.mockImplementation(v => {
    if (v.loginUserId != 7 && v.loginUserId != 8)
      return Promise.reject({});
    return Promise.resolve(v.loginUserId == 7 ? people[0] : people[1]);
  });
  ormLMock.deleteLoginUserByPersonId.mockImplementation(v => {
    if (v != 1 && v != 2)
      return Promise.reject();
    return Promise.resolve(v == 1 ? people[0] : people[1]);
  });
  ormPMock.deletePersonById.mockImplementation(v => {
    if (v != 1 && v != 2)
      return Promise.reject();
    return Promise.resolve(v == 1 ? people[0].person : people[1].person);
  })
});

// reset
afterEach(() => {
  reqMock.parseAdminAllRequest.mockReset();
  reqMock.parseSingleAdminRequest.mockReset();
  reqMock.parseUpdateAdminRequest.mockReset();
  reqMock.parseDeleteAdminRequest.mockReset();

  utilMock.checkSessionKey.mockReset();
  utilMock.isAdmin.mockReset();

  ormLMock.searchAllAdminLoginUsers.mockReset();
  ormLMock.deleteLoginUserByPersonId.mockReset();
  ormLMock.updateLoginUser.mockReset();
  ormPMock.deletePersonById.mockReset();
});

function expectCall<T, U>(func: T, val: U) {
  expect(func).toHaveBeenCalledTimes(1);
  expect(func).toHaveBeenCalledWith(val);
}

function expectNoCall<T>(func: T) { expect(func).toHaveBeenCalledTimes(0); }

test('Can list all admins.', async () => {
  const req = getMockReq();

  const res =
      people.map(val => ({
                   person_data : {
                     id : val.person.person_id,
                     name : val.person.firstname + " " + val.person.lastname,
                     email : val.person.email,
                     github : val.person.github
                   },
                   coach : val.is_coach,
                   admin : val.is_admin,
                   activated : val.account_status as string
                 }));

  await expect(admin.listAdmins(req))
      .resolves.toStrictEqual({data : res, sessionkey : 'abcd'});
  expectCall(utilMock.checkSessionKey, {sessionkey : 'abcd'});
  expectCall(reqMock.parseAdminAllRequest, req);
  expectCall(ormL.searchAllAdminLoginUsers, true);
  expectNoCall(utilMock.isAdmin);
});

test('Getting a single admin is deprecated.', async () => {
  await expect(admin.getAdmin(getMockReq()))
      .rejects.toStrictEqual({http : 410, reason : 'Deprecated endpoint.'});
  expect(utilMock.isAdmin).toHaveBeenCalledTimes(1);
  expectNoCall(utilMock.checkSessionKey);
});

test("Can modify a single admin (1).", async () => {
  const req = getMockReq();
  req.body = {id : 7, pass : 'jeff', sessionkey : 'abcd'};
  const res = {data : {id : 7, name : 'Jeffrey Jan'}, sessionkey : 'abcd'};
  await expect(admin.modAdmin(req)).resolves.toStrictEqual(res);
  expectCall(utilMock.isAdmin, {id : 7, pass : 'jeff', sessionkey : 'abcd'});
  expectCall(reqMock.parseUpdateAdminRequest, req);
  expectCall(ormLMock.updateLoginUser, {
    loginUserId : 7,
    password : 'jeff',
    isAdmin : undefined,
    isCoach : undefined,
    accountStatus : undefined
  });
  expectNoCall(util.checkSessionKey);
});

test("Can modify a single admin (2).", async () => {
  const req = getMockReq();
  req.body = {
    id : 7,
    pass : 'jeff',
    isAdmin : true,
    isCoach : false,
    sessionkey : 'abcd'
  };
  const res = {data : {id : 7, name : 'Jeffrey Jan'}, sessionkey : 'abcd'};
  await expect(admin.modAdmin(req)).resolves.toStrictEqual(res);
  expectCall(utilMock.isAdmin, req.body);
  expectCall(reqMock.parseUpdateAdminRequest, req);
  expectCall(ormLMock.updateLoginUser, {
    loginUserId : 7,
    password : 'jeff',
    isAdmin : true,
    isCoach : false,
    accountStatus : undefined
  });
  expectNoCall(util.checkSessionKey);
});

test("Can delete admins", async () => {
  const req = getMockReq();
  req.body = {id : 1, sessionkey : 'abcd'};
  const res = {sessionkey : 'abcd'};

  await expect(admin.deleteAdmin(req)).resolves.toStrictEqual(res);
  expectCall(utilMock.isAdmin, req.body);
  expectCall(reqMock.parseDeleteAdminRequest, req);
  expectCall(ormLMock.deleteLoginUserByPersonId, req.body.id);
  expectCall(ormPMock.deletePersonById, req.body.id);
});
