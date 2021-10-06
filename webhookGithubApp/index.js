'use strict';

const axios = require('axios');
const azureWrapper = require('../util/azureWrapper');
const { createTokenAuth } = require('@octokit/auth-token');
const config = require('../.config');
const mongoose = require('mongoose');

let conn = null;
const subscriberSchema = new mongoose.Schema({
  email: { type: String, required: true },
  githubUsername: { type: String, required: true },
  githubUserId: { type: String },
  githubOrganization: { type: String },
  githubOrganizationId: { type: String }
});

module.exports = azureWrapper(async function webhookGithubApp(context, req) {
  console.log(req.body);
  let Subscriber;
  if (conn == null) {
    conn = mongoose.createConnection(config.uri);
    await conn.asPromise();
  }

  Subscriber = conn.model('Subscriber', subscriberSchema, 'Subscriber');

  // const { token } = await createTokenAuth(config.githubAccessTokenForMongoose)();

  const { installation, sender } = req.body;

  if(installation.account.type == 'Organization') {
    const membersList =  await axios.get(`https://api.github.com/orgs/${installation.account.login}/members`).then((res) => res.data);
    console.log('members', membersList);
    const memberName = membersList.map((name) => name.login);
    await Subscriber.insertMany(memberName);
  }
  return {ok: 1};
});