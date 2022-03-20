import prisma from '../prisma/prisma';

export async function addSessionKey(loginUserId: number, key: string) {
  const result = await prisma.session_keys.create(
      {data : {login_user_id : loginUserId, session_key : key}});
  return result;
}

export async function checkSessionKey(key: string) {
  const result = await prisma.session_keys.findUnique({
    where : {session_key : key},
    select : {login_user_id : true},
    rejectOnNotFound : true
  });
  return result;
}

export async function changeSessionKey(key: string, newkey: string) {
  const result = await prisma.session_keys.update(
      {where : {session_key : key}, data : {session_key : newkey}});
  return result;
}

export async function removeAllKeysForUser(key: string) {
  const result = await checkSessionKey(key).then(
      uid => prisma.session_keys.deleteMany(
          {where : {login_user_id : uid.login_user_id}}));
  return result;
}
