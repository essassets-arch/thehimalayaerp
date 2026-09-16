async function inspectStep() {
  const jobsRes = await fetch(`https://api.github.com/repos/essassets-arch/thehimalayaerp/actions/runs/35104693931/jobs`, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const jobsData = await jobsRes.json();
  const sshStep = jobsData.jobs?.[0]?.steps?.find(s => s.name?.includes('SSH'));
  console.log('SSH Step:', JSON.stringify(sshStep, null, 2));
}
inspectStep().catch(console.error);
