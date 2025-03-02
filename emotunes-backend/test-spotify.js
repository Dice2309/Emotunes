const fetch = require('node-fetch').default;

const clientId = '840eb8450f6a49ef9169cca1abbf9a7f';
const clientSecret = '8f09dbe41fa2467597ba3e1c4ae1fd3f';
const authString = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

async function getToken() {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${authString}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  const data = await response.json();
  console.log('Access Token:', data.access_token);
}

getToken();