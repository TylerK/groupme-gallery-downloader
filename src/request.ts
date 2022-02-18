import fetch from 'node-fetch';

export const httpHeaders = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36',
  Referer: 'https://app.groupme.com/chats',
};

export function handleResponse(response: Response) {
  if (response.ok) {
    return response.json();
  }
  throw new Error(response.statusText);
}

export function request(token: string, path = '') {
  const url = `https://api.groupme.com/v3/${path}`;
  const options = {
    headers: {
      ...httpHeaders,
      'X-Access-Token': token,
    },
  };

  return fetch(url, options);
}
