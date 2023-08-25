const app = require('../src/app');
const request = require('supertest');
const { syncSequel, clearBefore, activeUser, addUser, in64, base64File } = require('./constants');
const User = require('../src/user/model/User');
const en = require('../locals/en/translation.json');
const cn = require('../locals/cn/translation.json');
const de = require('../locals/de/translation.json');
const es = require('../locals/es/translation.json');
const fr = require('../locals/fr/translation.json');
const gr = require('../locals/gr/translation.json');
const jp = require('../locals/jp/translation.json');
const np = require('../locals/np/translation.json');
const pt = require('../locals/pt/translation.json');
const tr = require('../locals/tr/translation.json');

syncSequel();
clearBefore();

const putUser = async (id = 5, body = null, options = {}) => {
  let agent = request(app);
  // let token;

  if (options.auth) {
    await agent.post('/api/auth').send(options.auth);
    // token = response.body.token;
  }

  agent = request(app).put('/api/users/' + id);

  if (options.language) {
    agent.set('Accept-Language', options.language);
  }
  if (options.token) {
    agent.set('Authorization', `Bearer ${options.token}`);
  }
  return agent.send(body);
};

/*
    -----Update Routes-----
    Tests for route '/api/auth', located at the AuthRouter page.
*/
describe('Update User', () => {
  //Return forbidden status code
  it('returns forbidden when request sent without basic authorization', async () => {
    const response = await putUser();
    expect(response.status).toBe(403);
  });
  /*
    Internalization message Tests ----Create a table with messages
  */
  it.each`
    language | message
    ${'en'}  | ${en.unauth_update}
    ${'cn'}  | ${cn.unauth_update}
    ${'de'}  | ${de.unauth_update}
    ${'es'}  | ${es.unauth_update}
    ${'fr'}  | ${fr.unauth_update}
    ${'gr'}  | ${gr.unauth_update}
    ${'jp'}  | ${jp.unauth_update}
    ${'np'}  | ${np.unauth_update}
    ${'pt'}  | ${pt.unauth_update}
    ${'tr'}  | ${tr.unauth_update}
  `(
    'returns error body with $message for unauthorized request when language is set as $language',
    async ({ language, message }) => {
      const milliSec = new Date().getTime();
      const response = await putUser(5, null, { language });
      expect(response.body.path).toBe('/api/users/5');
      expect(response.body.timestamp).toBeGreaterThan(milliSec);
      expect(response.body.message).toBe(message);
    },
  );

  //Return correct response with incorrect email
  it('returns forbidden when request sent with incorrect email in basic authorization request', async () => {
    await addUser();
    const response = await putUser(5, null, { auth: { email: 'user000@mail.com', password: 'P4ssword' } });
    expect(response.status).toBe(403);
  });

  //Return correct response with incorrect password
  it('returns forbidden when request sent with incorrect password in basic authorization request', async () => {
    await addUser();
    const response = await putUser(5, null, { auth: { email: 'user1@mail.com', password: 'Password' } });
    expect(response.status).toBe(403);
  });

  //Return correct response with correct credentials but different user
  it('returns forbidden when update request is sent with correct credentials but for different user', async () => {
    await addUser();
    const userReqUpdated = await addUser({ ...activeUser, username: 'user21', email: 'user21@mail.com' });
    const response = await putUser(userReqUpdated.id, null, {
      auth: { email: 'user1@mail.com', password: 'P4ssword' },
    });
    expect(response.status).toBe(403);
  });

  //Return correct response invalid token
  it('returns 403 when token is not valid', async () => {
    const response = await putUser(5, null, { token: '567' });
    expect(response.status).toBe(403);
  });

  //Saves image in database
  it('saves the users image when update contains image as base64', async () => {
    const userSaved = await addUser();
    const usernameUpdated = { username: 'userNew21', image: in64 };
    await putUser(userSaved.id, usernameUpdated, {
      auth: { email: userSaved.email, password: 'P4ssword' },
    });
    const stored = await User.findOne({ where: { id: userSaved.id } });
    expect(stored.image).toBeTruthy();
  });

  //Returns 200 when exactly 2MB
  // it('returns 200 when image size is exactly 2mb', async () => {
  //   const testPng = base64File();
  //   const pngByte = Buffer.from(testPng, 'base64').length;
  //   const twoMB = 1024 * 1024 * 2;
  //   const fill = 'a'.repeat(twoMB - pngByte);
  //   const fillBase64 = Buffer.from(fill).toString('base64');
  //   const userSaved = await addUser();
  //   const usernameUpdated = { username: 'userNew21', image: testPng + fillBase64 };
  //   const response = await putUser(userSaved.id, usernameUpdated, {
  //     auth: { email: userSaved.email, password: 'P4ssword' },
  //   });
  //   expect(response.status).toBe(200);
  // });

  // //Returns 400 when over 2MB
  // it('returns 400 when image size is exceeds 2mb', async () => {
  //   const twoMBPlus = 'a'.repeat(1024 * 1024 * 2) + 'a';
  //   const base64 = Buffer.from(twoMBPlus).toString('base64');
  //   const userSaved = await addUser();
  //   const usernameUpdated = { username: 'userNew21', image: base64 };
  //   const response = await putUser(userSaved.id, usernameUpdated, {
  //     auth: { email: userSaved.email, password: 'P4ssword' },
  //   });
  //   expect(response.status).toBe(400);
  // });
});
