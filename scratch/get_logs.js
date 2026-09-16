async function getLogs() {
  const jobsRes = await fetch(`https://api.github.com/repos/essassets-arch/thehimalayaerp/actions/runs/35104693931/jobs`, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const jobsData = await jobsRes.json();
  const jobId = jobsData.jobs?.[0]?.id;
  console.log('Job ID:', jobId);

  const logsRes = await fetch(`https://api.github.com/repos/essassets-arch/thehimalayaerp/actions/jobs/${jobId}/logs`, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const logsText = await logsRes.text();
  console.log('Logs length:', logsText.length);
  // print last 1000 characters
  console.log('Logs tail:');
  console.log(logsText.slice(-2000));
}
getLogs().catch(console.error);
