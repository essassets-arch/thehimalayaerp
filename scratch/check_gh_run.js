const https = require('https');

https.get('https://api.github.com/repos/essassets-arch/thehimalayaerp/actions/runs?per_page=10', {
  headers: { 'User-Agent': 'node' }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const runs = JSON.parse(data).workflow_runs;
    const deployRuns = runs.filter(r => r.name === 'Deploy ERP to VPS');
    console.log(`Found ${deployRuns.length} deploy runs:`);
    deployRuns.slice(0, 3).forEach(r => {
      console.log(`Run #${r.run_number} (id: ${r.id}) - ${r.status} (${r.conclusion}) commit: ${r.head_commit?.message?.slice(0, 60)}`);
    });
    if (deployRuns.length > 0) {
      const latest = deployRuns[0];
      https.get(latest.jobs_url, { headers: { 'User-Agent': 'node' } }, (res2) => {
        let data2 = '';
        res2.on('data', chunk => data2 += chunk);
        res2.on('end', () => {
          const jobs = JSON.parse(data2).jobs;
          jobs.forEach(j => {
            console.log(`Job: ${j.name}, status: ${j.status}, conclusion: ${j.conclusion}`);
            j.steps.forEach(s => {
              console.log(`  Step: ${s.name} - ${s.status} (${s.conclusion})`);
            });
          });
        });
      });
    }
  });
});
