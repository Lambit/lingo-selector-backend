const app = require('../src/app');
const request = require('supertest');
const Token = require('../src/auth/model/Token');
const { syncSequel, clearBefore, activeUser, addUser } = require('./constants');
const en = require('../locals/en/translation.json');
const tr = require('../locals/tr/translation.json');

syncSequel();
clearBefore();

const postAuth = async (credentials, options = {}) => {
  let agent = request(app).post('/api/auth');
  if (options.language) {
    agent.set('Accept-Language', options.language);
  }
  return await agent.send(credentials);
};

const postLogout = (options = {}) => {
  let agent = request(app).post('/api/logout');
  if (options.token) {
    agent.set('Authorization', `Bearer ${options.token}`);
  }
  return agent.send();
};

/*
    -----Auth Routes-----
    Tests for route '/api/auth', located at the AuthRouter page.
*/
describe('Authentication', () => {
  //Success tests
  //Return success status code
  it('returns 200 when credentials are correct', async () => {
    await addUser();
    const response = await postAuth({ email: 'user1@mail.com', password: 'P4ssword' });
    expect(response.status).toBe(200);
  });

  //Return correct credentials when logged in
  it('returns only user id, username, and token when login success', async () => {
    const user = await addUser();
    const response = await postAuth({ email: 'user1@mail.com', password: 'P4ssword' });
    expect(response.body.id).toBe(user.id);
    expect(response.body.username).toBe(user.username);
    expect(Object.keys(response.body)).toEqual(['id', 'username', 'token']);
  });

  //Return fail status code
  it('returns 401 when user dose not exist', async () => {
    const response = await postAuth({ email: 'user1@mail.com', password: 'P4ssword' });
    expect(response.status).toBe(401);
  });

  //Return fail body
  it('returns proper response body when authentication fails', async () => {
    const milliSec = new Date().getTime();
    const response = await postAuth({ email: 'user1@mail.com', password: 'P4ssword' });
    const error = response.body;
    expect(error.path).toBe('/api/auth');
    expect(error.timestamp).toBeGreaterThan(milliSec);
    expect(Object.keys(error)).toEqual(['path', 'timestamp', 'message']);
  });

  /*
    Internalization message Tests ---- Create a table with messages
  */
  it.each`
    language | message
    ${'en'}  | ${en.auth_failure}
    ${'tr'}  | ${tr.auth_failure}
  `('returns $message when authentication fails and language is set as $language', async ({ language, message }) => {
    const response = await postAuth({ email: 'user1@mail.com', password: 'P4ssword' }, { language });
    expect(response.body.message).toBe(message);
  });

  //Return correct status code when credentials are wrong.
  it('returns 401 when user dose not exist', async () => {
    await addUser();
    const response = await postAuth({ email: 'user1@mail.com', password: 'Password' });
    expect(response.status).toBe(401);
  });

  //Return correct status code when user is inactive.
  it('returns 403 when logging in with an inactive account', async () => {
    await addUser({ ...activeUser, inactive: true });
    const response = await postAuth({ email: 'user1@mail.com', password: 'P4ssword' });
    expect(response.status).toBe(403);
  });

  //Return fail body
  it('returns proper response body when authentication fails', async () => {
    await addUser({ ...activeUser, inactive: true });
    const milliSec = new Date().getTime();
    const response = await postAuth({ email: 'user1@mail.com', password: 'P4ssword' });
    const error = response.body;
    expect(error.path).toBe('/api/auth');
    expect(error.timestamp).toBeGreaterThan(milliSec);
    expect(Object.keys(error)).toEqual(['path', 'timestamp', 'message']);
  });

  //Return token in body with correct credentials.
  it('returns token in response body when credentials are correct', async () => {
    await addUser();
    const response = await postAuth({ email: 'user1@mail.com', password: 'P4ssword' });
    expect(response.body.token).not.toBeUndefined();
  });
});

/*
   ----- Logout Tests -----
*/
describe('Logout', () => {
  it('returns 200 ok when unauthorized request send for logout', async () => {
    const response = await postLogout();
    expect(response.status).toBe(200);
  });
  it('removes token from database', async () => {
    await addUser();
    const response = await postAuth({ email: 'user1@mail.com', password: 'P4ssword' });
    const token = response.body.token;
    await postLogout({ token: token });
    const savedToken = await Token.findOne({ where: { token: token } });
    expect(savedToken).toBeNull();
  });
});
