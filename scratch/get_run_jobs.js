async function getRunJobs() {
  const res = await fetch('https://api.github.com/repos/essassets-arch/thehimalayaerp/actions/runs?per_page=1', {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const data = await res.json();
  const latestRun = data.workflow_runs?.[0];
  console.log('Run ID:', latestRun?.id);

  const jobsRes = await fetch(`https://api.github.com/repos/essassets-arch/thehimalayaerp/actions/runs/${latestRun?.id}/jobs`, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const jobsData = await jobsRes.json();
  jobsData.jobs?.forEach(j => {
    console.log(`Job: ${j.name} | conclusion: ${j.conclusion}`);
    j.steps?.forEach(s => {
      console.log(`  Step: ${s.name} | status: ${s.status} | conclusion: ${s.conclusion}`);
    });
  });
}
getRunJobs().catch(console.error);
