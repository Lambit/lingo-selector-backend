# lingo-selector-backend

## Table of Contents
Description
Usage
Testing
Contributing


## Description
This Node.js Express application is designed to allow users to create an account and select their favorite language. 
It includes additional features such as sending a registration email and storing user data in an SQLite database. 
The application utilizes the following key packages: i18next for internationalization, nodemailer for email sending, and sqlite3 for database management.
The application is deployed on Heroku for easy access.

## Key Features
* User account creation with secure password storage.
* Selection of a favorite programming language from a predefined list.
* Sending a registration confirmation email.
* Storing user data in an SQLite database.
* Internationalization support with i18next.
* Responsive and user-friendly web interface.
* Deployment on Heroku for public access.


## Usage
### `npm start`
1. Open a web browser and navigate to http://localhost:3000 (or your configured port).
2. Sign up for an account by providing your email and password.
3. After successfully creating an account, you will be prompted to select your favorite language from the available options.
4. Once you've made your selection, you will be redirected to a confirmation page.
5. You can log in to your account at any time to view or update your favorite language.

## Testing
### `npm test`
This application uses Jest, Supertest, and smtp-server for testing. 

## Deployment
This application is deployed on Heroku for public access. You can access it at [Lingo Selector](https://peaceful-inlet-22477-28dd94940b26.herokuapp.com/).

## Contributing
1. If you would like to contribute to the development of this application, please follow these guidelines:
2. Fork the repository.
3. Create a new branch for your feature or bug fix:
   #### `git checkout -b feature-name`
5. Push your changes to your forked repository.
6. Create a pull request to merge your changes into the main repository.



