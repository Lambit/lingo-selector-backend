const app = require('../src/app');
const request = require('supertest');
const { syncSequel, clearBefore, activeUser, addUser } = require('./constants');
const en = require('../locals/en/translation.json');
const tr = require('../locals/tr/translation.json');

syncSequel();
clearBefore();

const auth = async (options = {}) => {
  let token;
  if (options.auth) {
    const response = await request(app).post('/api/auth').send(options.auth);
    token = response.body.token;
  }
  return token;
};

const deleteUser = async (id = 5, options = {}) => {
  const agent = request(app).delete('/api/users/' + id);
  if (options.language) {
    agent.set('Accept-Language', options.language);
  }
  if (options.token) {
    agent.set('Authorization', `Bearer ${options.token}`);
  }
  return agent.send();
};

/*
    -----Delete Routes-----
    Tests for route '/api/auth', located at the AuthRouter page.
*/
describe('Delete User', () => {
  //Return forbidden status code
  it('returns forbidden when request sent unauthorized', async () => {
    const response = await deleteUser();
    expect(response.status).toBe(403);
  });
  /*
    Internalization message Tests ----Create a table with messages
  */
  it.each`
    language | message
    ${'en'}  | ${en.unauth_delete}
    ${'tr'}  | ${tr.unauth_delete}
  `(
    'returns error body with $message for unauthorized request when language is set as $language',
    async ({ language, message }) => {
      const milliSec = new Date().getTime();
      const response = await deleteUser(5, { language });
      expect(response.body.path).toBe('/api/users/5');
      expect(response.body.timestamp).toBeGreaterThan(milliSec);
      expect(response.body.message).toBe(message);
    },
  );
  //Return correct response with correct credentials different user
  it('returns forbidden when delete request sent with correct credentials, but for different user', async () => {
    await addUser();
    const toDelete = await addUser({ ...activeUser, username: 'user2', email: 'user2@mail.com' });
    const token = await auth({ auth: { email: 'user000@mail.com', password: 'P4ssword' } });
    const response = await deleteUser(toDelete.id, { token: token });
    expect(response.status).toBe(403);
  });
  //Return correct response with incorrect token
  it('returns 403 if token is invalid', async () => {
    const response = await deleteUser(5, { token: '456' });
    expect(response.status).toBe(403);
  });
  //Return correct response with incorrect password
  //   it('returns 200 ok when delete request sent from authorized user', async () => {
  //     const savedUser = await addUser();
  //     const token = await auth({ auth: { email: 'user1@mail.com', password: 'P4ssword' } });
  //     const response = await deleteUser(savedUser.id, { token: token });
  //     expect(response.status).toBe(200);
  //   });
});
