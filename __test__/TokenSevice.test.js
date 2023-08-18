const { syncSequel } = require('./constants');
const Token = require('../src/auth/model/Token');
const TokenService = require('../src/auth/services/TokenService');

syncSequel();

//Clear database of test created users
beforeEach(async () => {
  await Token.destroy({ truncate: true });
});

describe('Clears expired tokens in database', () => {
  //Use fake timers create token object for model, make eight days time in milliseconds.
  it('clears expired tokens with scheduled task', async () => {
    jest.useFakeTimers();
    const token = 'test-toke';
    const eightDays = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);
    await Token.create({
      token: token,
      lastUsedAt: eightDays,
    });

    //Call cleanUp function, add five seconds to test, find token expect it to be null.
    TokenService.scheduleCleanup();
    jest.advanceTimersByTime(60 * 60 * 1000 + 5000);
    const savedToken = await Token.findOne({ where: { token: token } });
    expect(savedToken).toBeNull();
  });
});
