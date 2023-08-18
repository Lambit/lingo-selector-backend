const express = require('express');
const UserRouter = require('./user/routes/UserRouter');
const AuthRouter = require('./auth/routes/AuthRouter');
const i18next = require('i18next');
const Backend = require('i18next-fs-backend');
const middleware = require('i18next-http-middleware');
const errorHandler = require('../src/error/ErrorHandler');
const tokenAuth = require('../src/middleware/tokenAuth');

// i18next middleware with options created in the initialize object.
i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init(
    {
      fallbackLng: 'en',
      lng: 'en',
      ns: ['translation'],
      defaultNS: 'translation',
      backend: {
        loadPath: './locals/{{lng}}/{{ns}}.json',
      },
      detection: {
        lookupHeader: 'accept-language',
      },
      debug: true,
    },
    // (err) => {
    //   if (err) return console.log('something went wrong loading', err);
    //   // t('key');
    // },
  );

const app = express();

app.use(middleware.handle(i18next));
//Called so express can parse json correctly
app.use(express.json());

app.use(tokenAuth);
//app is using UserRoutes, AuthRoutes, created with express.Router()
app.use(UserRouter);
app.use(AuthRouter);

app.use(errorHandler);

// console.log('env: ' + process.env.NODE_ENV);

module.exports = app;
