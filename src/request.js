import fetch from 'node-fetch';

export const handleResponse = response => {
  if (response.ok) {
    return response.json();
  }
  throw new Error(response.status);
}

export default (token, path = '') => {
  const url = `https://api.groupme.com/v3/${path}`
  const options = {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36',
      'Referer': 'https://app.groupme.com/chats',
      'X-Access-Token': token
    }
  }

  return fetch(url, options);
}
