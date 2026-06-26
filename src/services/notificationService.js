const { env } = require('../config/env');

async function sendSms(phone, message) {
  console.log(`[sms:${phone}] ${message}`);
}

async function sendEmail(email, subject, body) {
  console.log(`[email:${email}] ${subject} - ${body}`);
}

async function sendPush(userId, title, body) {
  console.log(`[push:${userId}] ${title} - ${body}`);
}

async function notifyOwners(title, body) {
  await Promise.all([
    ...env.ownerPhones.map((phone) => sendSms(phone, `${title}: ${body}`)),
    ...env.ownerEmails.map((email) => sendEmail(email, title, body))
  ]);
}

module.exports = { sendSms, sendEmail, sendPush, notifyOwners };
