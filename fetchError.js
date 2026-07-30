const http = require('http');
http.get('http://localhost:3000/store/purchase?tab=Replacement%20Deliveries', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    // try to find Error in text
    let m = data.match(/Error: ([^<]+)/g);
    if(m) console.log(m);
    else console.log(data.substring(0, 500));
  });
});
