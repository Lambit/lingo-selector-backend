const User = require('../src/user/model/User');
const { syncSequel, clearBefore, activeUser, getUsers, incrementUser, getUser } = require('./constants');
const en = require('../locals/en/translation.json');
const tr = require('../locals/tr/translation.json');

syncSequel();
clearBefore();

/*
    -----Get All Users-----
    Tests for route '/api/users', located at the UserRouter page.
*/
describe('Listing Users', () => {
  //Return correct response status when successful
  it('returns 200 OK when no users in database', async () => {
    const response = await getUsers();
    expect(response.status).toBe(200);
  });

  //Return object in response body
  it('returns page object as response body', async () => {
    const response = await getUsers();
    expect(response.body).toEqual({
      content: [],
      page: 0,
      size: 10,
      totalPages: 0,
    });
  });

  //Return just 10 users for pagination
  it('returns 10 users in page content when there are 11 users in database', async () => {
    await incrementUser(11);
    const response = await getUsers();
    expect(response.body.content.length).toBe(10);
  });

  //Return selected user data
  it('returns only id, username, and email in content array for each user', async () => {
    await incrementUser(11);
    const response = await getUsers();
    const user = response.body.content[0];
    expect(Object.keys(user)).toEqual(['id', 'username', 'email']);
  });

  //Return total page amount
  it('returns 2 as totalPage when there are 15 active and 7 inactive users', async () => {
    await incrementUser(15, 7);
    const response = await getUsers();
    expect(response.body.totalPages).toBe(2);
  });

  //Return page indicator
  it('returns second page users and page indicator when page is set as 1 in request', async () => {
    await incrementUser(11);
    const response = await getUsers().query({ page: 1 });
    expect(response.body.content[0].username).toBe('user11');
    expect(response.body.page).toBe(1);
  });
});

/*
    -----Get user by id-----
    Tests for route '/api/user/id', located at the UserRouter page.
*/
describe('Get User', () => {
  //Return user not found error
  it('returns 404 when user is not found', async () => {
    const response = await getUser();
    expect(response.status).toBe(404);
  });

  it.each`
    language | message
    ${'tr'}  | ${tr.user_not_found}
    ${'en'}  | ${en.user_not_found}
  `('returns $message for unknown user when language is set to $language', async ({ language, message }) => {
    const response = await getUser().set('Accept-Language', language);
    expect(response.body.message).toBe(message);
  });

  //Return error body
  it('returns proper name body when user not found', async () => {
    const milliSec = new Date().getTime();
    const response = await getUser();
    const error = response.body;
    expect(error.path).toBe('/api/users/5');
    expect(error.timestamp).toBeGreaterThan(milliSec);
    expect(Object.keys(error)).toEqual(['path', 'timestamp', 'message']);
  });

  //Return 200 status
  it('returns 200 when active user exists', async () => {
    const user = await User.create({ ...activeUser });
    const response = await getUser(user.id);
    expect(response.status).toBe(200);
  });

  //Return response body
  it('returns id, username and email in response body when an active user exist', async () => {
    const user = await User.create({ ...activeUser });
    const response = await getUser(user.id);
    expect(Object.keys(response.body)).toEqual(['id', 'username', 'email']);
  });
});
