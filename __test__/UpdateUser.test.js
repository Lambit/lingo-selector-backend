const app = require('../src/app');
const request = require('supertest');
const { syncSequel, clearBefore, activeUser, addUser } = require('./constants');
const en = require('../locals/en/translation.json');
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

  //------Success tests------
  //Return success status code when updated
  //   it('returns 200 when valid update request sent from authorized user', async () => {
  //     const dbUser = await addUser();
  //     const userUpdated = { username: 'user1Updated' };
  //     const response = await putUser(dbUser.id, userUpdated, { auth: { email: dbUser.email, password: 'P4ssword' } });
  //     expect(response.status).toBe(200);
  //   });
});
