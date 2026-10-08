const https = require('https');

https.get('https://api.github.com/repos/essassets-arch/thehimalayaerp/actions/runs/37756648031/jobs', {
  headers: { 'User-Agent': 'node' }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const job = JSON.parse(data).jobs[0];
    console.log('Job ID:', job.id);
    https.get(`https://api.github.com/repos/essassets-arch/thehimalayaerp/actions/jobs/${job.id}/logs`, {
      headers: { 'User-Agent': 'node' }
    }, (res2) => {
      if (res2.statusCode === 302) {
        https.get(res2.headers.location, (res3) => {
          let log = '';
          res3.on('data', chunk => log += chunk);
          res3.on('end', () => {
            console.log('=== LOG TAIL ===\n', log.slice(-3000));
          });
        });
      } else {
        let log = '';
        res2.on('data', chunk => log += chunk);
        res2.on('end', () => console.log('Log:', log.slice(-1000)));
      }
    });
  });
});
