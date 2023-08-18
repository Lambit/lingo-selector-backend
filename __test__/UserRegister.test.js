const app = require('../src/app');
const request = require('supertest');
const User = require('../src/user/model/User');
const { syncSequel, clearBefore } = require('./constants');
const nodemailerStub = require('nodemailer-stub');
const EmailService = require('../src/email/EmailService');
const en = require('../locals/en/translation.json');
const tr = require('../locals/tr/translation.json');

syncSequel();
clearBefore();

//User object to be passed as a parameter at postUser function
const validUser = {
  username: 'user1',
  email: 'user1@mail.com',
  password: 'P4ssword',
};

//Post call of username, email and password sent to backend, turn into a variable to be used through tests
const postUser = (user = validUser, options = {}) => {
  const agent = request(app).post('/api/users');
  if (options.language) {
    agent.set('Accept-Language', options.language);
  }
  return agent.send(user);
};

describe('User Registration', () => {
  /*
    -----Post Request Test-----
  */

  //Return correct response status when successful
  it('returns 200 OK when signup request is valid', async () => {
    const response = await postUser();
    expect(response.status).toBe(200);
  });

  //Return correct message response when successful
  it('returns success message when signup request is valid', async () => {
    const response = await postUser();
    expect(response.body.message).toBe(en.user_create_success);
  });

  //Created user is saved to database
  it('saves user to database', async () => {
    await postUser();
    //query user model
    const userList = await User.findAll();
    expect(userList.length).toBe(1);
  });

  //Created users username and email are saved correctly
  it('saves username and email to database', async () => {
    await postUser();
    //query user model
    const userList = await User.findAll();
    //beforeEach ensures correct location database is clear and start clean with no test users
    const saved = userList[0];
    expect(saved.username).toBe('user1');
    expect(saved.email).toBe('user1@mail.com');
  });

  //Created users password is save and hashed correctly, checks that password doesn't match one passed initially
  it('hashes the password in database', async () => {
    await postUser();
    //query user model
    const userList = await User.findAll();
    //beforeEach ensures correct location database is clear and start clean with no test users
    const saved = userList[0];
    expect(saved.password).not.toBe('P4ssword');
  });
  //Return errors is username and email are null
  it('returns errors for both when username and email is null', async () => {
    const response = await postUser({
      username: null,
      email: null,
      password: 'P4ssword',
    });
    const body = response.body;
    expect(Object.keys(body.validationErrors)).toEqual(['username', 'email']);
  });

  /*
    -----Invalid User Tests------
  */

  //Table created for variables and params passed
  it.each`
    field         | value              | expectedMessage
    ${'username'} | ${null}            | ${en.username_null}
    ${'username'} | ${'urs'}           | ${en.username_size}
    ${'username'} | ${'a'.repeat(33)}  | ${en.username_size}
    ${'email'}    | ${null}            | ${en.email_null}
    ${'email'}    | ${'mail.com'}      | ${en.email_invalid}
    ${'email'}    | ${'user.mail.com'} | ${en.email_invalid}
    ${'email'}    | ${'user@mail'}     | ${en.email_invalid}
    ${'password'} | ${null}            | ${en.password_null}
    ${'password'} | ${'P4ss'}          | ${en.password_size}
    ${'password'} | ${'lowercase'}     | ${en.password_pattern}
    ${'password'} | ${'LOWERCASE'}     | ${en.password_pattern}
    ${'password'} | ${'123456789'}     | ${en.password_pattern}
    ${'password'} | ${'lowerCASE'}     | ${en.password_pattern}
    ${'password'} | ${'lower1234'}     | ${en.password_pattern}
    ${'password'} | ${'LOWER1234'}     | ${en.password_pattern}
  `('returns %expectedMessage when %field is $value', async ({ field, expectedMessage, value }) => {
    const user = {
      username: 'user1',
      email: 'user1@mail.com',
      password: 'P4ssword',
    };
    user[field] = value;
    const response = await postUser(user);
    const body = response.body;
    expect(body.validationErrors[field]).toBe(expectedMessage);
  });

  //Errors for already used email
  it(`returns ${en.email_inuse} when same email is already in use`, async () => {
    await User.create({ ...validUser });
    const response = await postUser();
    expect(response.body.validationErrors.email).toBe(en.email_inuse);
  });
  //Errors for already used username
  it('returns errors for both username and email is in use', async () => {
    await User.create({ ...validUser });
    const response = await postUser({
      username: null,
      email: validUser.email,
      password: 'P4ssword',
    });
    const body = response.body;
    expect(Object.keys(body.validationErrors)).toEqual(['username', 'email']);
  });
  //----Inactive User-----
  it('creates user in inactive mode', async () => {
    await postUser();
    //query user model
    const userList = await User.findAll();
    //beforeEach ensures correct location database is clear and start clean with no test users
    const saved = userList[0];
    expect(saved.inactive).toBe(true);
  });
  it('creates user in inactive mode even the request body contains inactive', async () => {
    const newUser = { ...validUser, inactive: false };
    await postUser(newUser);
    const userList = await User.findAll();
    //beforeEach ensures correct location database is clear and start clean with no test users
    const saved = userList[0];
    expect(saved.inactive).toBe(true);
  });
  //Activation token
  it('creates activationToken for user', async () => {
    await postUser();
    const userList = await User.findAll();
    //beforeEach ensures correct location database is clear and start clean with no test users
    const saved = userList[0];
    expect(saved.activationToken).toBeTruthy();
  });
  //Activation email----test are dependant on the nodemailer-stub library
  it('sends an Account activation email with activationToken', async () => {
    await postUser();
    const lastMail = nodemailerStub.interactsWithMail.lastMail();
    expect(lastMail.to[0]).toBe('user1@mail.com');
    const userList = await User.findAll();
    const saved = userList[0];
    expect(lastMail.content).toContain(saved.activationToken);
  });
  //Mock failure status when email send fails
  it(`returns 502 Bad Gateway when sending email fails`, async () => {
    const mockSendAccountActivation = jest
      .spyOn(EmailService, 'sendAccountActivation')
      .mockRejectedValue({ message: 'Failed to deliver email.' });
    const response = await postUser();
    expect(response.status).toBe(502);
    mockSendAccountActivation.mockRestore();
  });
  //Mock failure status when email send fails
  it(`returns Email failure message when sending email fails`, async () => {
    const mockSendAccountActivation = jest
      .spyOn(EmailService, 'sendAccountActivation')
      .mockRejectedValue({ message: 'Failed to deliver email.' });
    const response = await postUser();
    mockSendAccountActivation.mockRestore();
    expect(response.body.message).toBe('E-mail failure');
  });
  //Validation Errors---------------------
  it('returns Validation Failure message in error response body when validation fails', async () => {
    const response = await postUser({
      username: null,
      email: validUser.email,
      password: 'P4ssword',
    });
    expect(response.body.message).toBe(en.validation_failure);
  });
});

/*
    -----Internalization Tests------
*/
describe('Internalization', () => {
  it.each`
    field         | value              | expectedMessage
    ${'username'} | ${null}            | ${tr.username_null}
    ${'username'} | ${'urs'}           | ${tr.username_size}
    ${'username'} | ${'a'.repeat(33)}  | ${tr.username_size}
    ${'email'}    | ${null}            | ${tr.email_null}
    ${'email'}    | ${'mail.com'}      | ${tr.email_invalid}
    ${'email'}    | ${'user.mail.com'} | ${tr.email_invalid}
    ${'email'}    | ${'user@mail'}     | ${tr.email_invalid}
    ${'password'} | ${null}            | ${tr.password_null}
    ${'password'} | ${'P4ss'}          | ${tr.password_size}
    ${'password'} | ${'lowercase'}     | ${tr.password_pattern}
    ${'password'} | ${'LOWERCASE'}     | ${tr.password_pattern}
    ${'password'} | ${'123456789'}     | ${tr.password_pattern}
    ${'password'} | ${'lowerCASE'}     | ${tr.password_pattern}
    ${'password'} | ${'lower1234'}     | ${tr.password_pattern}
    ${'password'} | ${'LOWER1234'}     | ${tr.password_pattern}
  `(
    'returns %expectedMessage when %field is $value when language is set as tr',
    async ({ field, expectedMessage, value }) => {
      const user = {
        username: 'user1',
        email: 'user1@mail.com',
        password: 'P4ssword',
      };
      user[field] = value;
      const response = await postUser(user, { language: 'tr' });
      const body = response.body;
      expect(body.validationErrors[field]).toBe(expectedMessage);
    },
  );

  //Errors for already used email
  it(`returns ${tr.email_inuse} when same email is already in use when language is set as turkish`, async () => {
    await User.create({ ...validUser });
    const response = await postUser({ ...validUser }, { language: 'tr' });
    expect(response.body.validationErrors.email).toBe(tr.email_inuse);
  });

  //Creation success in turkish
  it(`returns success message ${tr.user_create_success} when signup request is valid`, async () => {
    const response = await postUser({ ...validUser }, { language: 'tr' });
    expect(response.body.message).toBe(tr.user_create_success);
  });
  //Email send failure in Turkish
  it(`returns ${tr.email_failure} message when sending email fails and language`, async () => {
    const mockSendAccountActivation = jest
      .spyOn(EmailService, 'sendAccountActivation')
      .mockRejectedValue({ message: 'Failed to deliver email.' });
    const response = await postUser({ ...validUser }, { language: 'tr' });
    mockSendAccountActivation.mockRestore();
    expect(response.body.message).toBe(tr.email_failure);
  });
  //Validation Errors---------------------
  it(`returns ${tr.validation_failure} message in error response body when validation fails`, async () => {
    const response = await postUser(
      {
        username: null,
        email: validUser.email,
        password: 'P4ssword',
      },
      { language: 'tr' },
    );
    expect(response.body.message).toBe(tr.validation_failure);
  });
});

describe('Account Activation', () => {
  it('activates account when correct token sent', async () => {
    await postUser();
    let users = await User.findAll();
    const token = users[0].activationToken;
    await request(app)
      .post('/api/users/token/' + token)
      .send();
    users = await User.findAll();
    expect(users[0].inactive).toBe(false);
  });
  it('removes the token from users table after successful activation', async () => {
    await postUser();
    let users = await User.findAll();
    const token = users[0].activationToken;
    await request(app)
      .post('/api/users/token/' + token)
      .send();
    users = await User.findAll();
    expect(users[0].activationToken).toBeFalsy();
  });
  it('does not activate account when token is wrong', async () => {
    await postUser();
    const token = 'no-token';
    await request(app)
      .post('/api/users/token/' + token)
      .send();
    const users = await User.findAll();
    expect(users[0].inactive).toBe(true);
  });
  it('returns bad request when token is wrong', async () => {
    await postUser();
    const token = 'no-token';
    const response = await request(app)
      .post('/api/users/token/' + token)
      .send();
    expect(response.status).toBe(400);
  });
});

describe('Error Model', () => {
  it('returns path, timestamp, message and validationErrors in response when validation failure', async () => {
    const response = await postUser({ ...validUser, username: null });
    const body = response.body;
    expect(Object.keys(body)).toEqual(['path', 'timestamp', 'message', 'validationErrors']);
  });
  it('returns path, timestamp, message in response when validation failure', async () => {
    const token = 'no-token';
    const response = await request(app)
      .post('/api/users/token/' + token)
      .send();
    const body = response.body;
    expect(Object.keys(body)).toEqual(['path', 'timestamp', 'message']);
  });
  it('returns path in error body', async () => {
    const token = 'no-token';
    const response = await request(app)
      .post('/api/users/token/' + token)
      .send();
    const body = response.body;
    expect(body.path).toEqual('/api/users/token/' + token);
  });
  it('returns timestamp in milliseconds with in 5 seconds value in error body', async () => {
    const millSec = new Date().getTime();
    const fiveSec = millSec + 5 * 1000;
    const token = 'no-token';
    const response = await request(app)
      .post('/api/users/token/' + token)
      .send();
    const body = response.body;
    expect(body.timestamp).toBeGreaterThan(millSec);
    expect(body.timestamp).toBeLessThan(fiveSec);
  });
});
