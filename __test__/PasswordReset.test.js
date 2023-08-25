const app = require('../src/app');
const request = require('supertest');
const { syncSequel, clearBefore } = require('./constants');
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

//Test post request to password route set language headers sent with users email
const postReset = (email = 'user1@mail.com', options = {}) => {
  let agent = request(app).post('/api/user/password');
  if (options.language) {
    agent.set('Accept-Language', options.language);
  }
  return agent.send({ email: email });
};

/*
    -----Password Reset-----
    Tests for route '/api/user/password', located at the UserRouter page.
*/
describe('Password Reset', () => {
  //Return 404
  it('returns 404 when password reset request is sent from unknown e-mail', async () => {
    const response = await postReset();
    expect(response.status).toBe(404);
  });

  it.each`
    language | message
    ${'tr'}  | ${tr.email_not_inuse}
    ${'en'}  | ${en.email_not_inuse}
    ${'cn'}  | ${cn.email_not_inuse}
    ${'de'}  | ${de.email_not_inuse}
    ${'es'}  | ${es.email_not_inuse}
    ${'fr'}  | ${fr.email_not_inuse}
    ${'gr'}  | ${gr.email_not_inuse}
    ${'jp'}  | ${jp.email_not_inuse}
    ${'np'}  | ${np.email_not_inuse}
    ${'pt'}  | ${pt.email_not_inuse}
  `(
    'returns error body $message for unknown email for password reset when language is set to $language',
    async ({ language, message }) => {
      const milliSec = new Date().getTime();
      const response = await postReset('user1@mail.com', { language: language });
      expect(response.body.path).toBe('/api/user/password');
      expect(response.body.timestamp).toBeGreaterThan(milliSec);
      expect(response.body.message).toEqual(message);
    },
  );

  it.each`
    language | message
    ${'tr'}  | ${tr.email_invalid}
    ${'en'}  | ${en.email_invalid}
    ${'cn'}  | ${cn.email_invalid}
    ${'de'}  | ${de.email_invalid}
    ${'es'}  | ${es.email_invalid}
    ${'fr'}  | ${fr.email_invalid}
    ${'gr'}  | ${gr.email_invalid}
    ${'jp'}  | ${jp.email_invalid}
    ${'np'}  | ${np.email_invalid}
    ${'pt'}  | ${pt.email_invalid}
  `(
    'returns 404 with validation error response having $message when when request does not have valid email and language is set to $language',
    async ({ language, message }) => {
      const response = await postReset(null, { language: language });
      expect(response.body.validationErrors.email).toBe(message);
      expect(response.status).toBe(400);
    },
  );
});
