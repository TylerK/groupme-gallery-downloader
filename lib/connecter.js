import https from 'https';

/*
  https://api.groupme.com/v3/conversations/3035126/gallery?limit=100'
  -H 'Pragma: no-cache'
  -H 'Origin: https://app.groupme.com'
  -H 'Accept-Encoding: gzip, deflate, sdch'
  -H 'Accept-Language: en-US,en;q=0.8,nl;q=0.6,fr;q=0.4'
  -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36'
  -H 'Accept: application/json, text/plain, *\/*'
  -H 'Cache-Control: no-cache'
  -H 'Referer: https://app.groupme.com/chats'
  -H 'Connection: keep-alive'
  -H 'X-Access-Token: BEdmtViDKviivkhlCaOjlYBzApqdxBtP0rppzKBI'
  -H 'DNT: 1' --compressed
*/

export default function (token, id) {
  let allPhotos = [];

  let request = https.request({
    host: 'api.groupme.com',
    path: `/v3/conversations/${id}/gallery?limit=100`,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36',
      'Referer': 'https://app.groupme.com/chats',
      'X-Access-Token': token
    }
  });

  request.on('response', response => {
    let data = [];

    response.on('data', chunk => {
      data.push(chunk);
    });

    response.on('end', () => {
      let parsed = JSON.parse(data.toString());

      // parsed.response.messages.forEach(item => {
      //   allPhotos.push(item);
      // });

      allPhotos.push(parsed.response.messages);

      console.log(allPhotos);
    });
  });

  request.end();

  request.on('error', error => {
    console.error('Error with connector:', '\n', error.stack);
  });
}
