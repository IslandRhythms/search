'use strict';

const axios = require('axios');
const config = require('../../.config');
const { createTokenAuth } = require('@octokit/auth-token');

const host = 'https://api.github.com';

module.exports = {
  async createRelease(tagAndName, body) {
    const url = host + '/repos/Automattic/mongoose/releases';
    const data = {
      tag_name: tagAndName,
      name: tagAndName,
      body: body,
    };
    const { token } = await createTokenAuth(config.githubAccessTokenForMongoose)();
    const headers = {
      authorization: `bearer ${token}`,
      accept: 'application/vnd.github.v3+json'
    };
    try {
      await axios.post(url, data, { headers }).then((res) => res.data);
    } catch (err) {
      // GitHub returns a 422 if there's already a release for that tag
      if (err.response.status === 422) {
        return;
      }
      throw err;
    }
  },
  async getUserFromToken(githubAccessToken) {
    const { token } = await createTokenAuth(githubAccessToken)();
    const headers = {
      authorization: `bearer ${token}`,
      accept: 'application/vnd.github.v3+json'
    };
    return axios.get('https://api.github.com/user', { headers }).then(res => res.data);
  },
  getAccessToken(code) {
    const body = {
      client_id: config.githubOAuthClientId,
      client_secret: config.githubOAuthClientSecret,
      code
    };
    const opts = { headers: { accept: 'application/json' } };
    return axios.post(`https://github.com/login/oauth/access_token`, body, opts).
      then(res => res.data);
  },
  getChangelog() {
    const url = host + '/repos/Automattic/mongoose/contents/CHANGELOG.md';
    const headers = {
      accept: 'application/vnd.github.v3.raw'
    };
    return axios.get(url, { headers }).then((res) => res.data);
  }
};