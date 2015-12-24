import https from 'https';

function Connect (token, id, page) {
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

export default async function (token, id) {
  let allPhotos = [];
}
