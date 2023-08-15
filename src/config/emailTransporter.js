const nodemailer = require('nodemailer');
const nodeMailerStub = require('nodemailer-stub');

//Initializing and email transport to send activation emails
const transporter = nodemailer.createTransport(nodeMailerStub.stubTransport);

module.exports = transporter;
