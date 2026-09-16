async function checkWorkflow() {
  const res = await fetch('https://api.github.com/repos/essassets-arch/thehimalayaerp/actions/runs?per_page=3', {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const data = await res.json();
  if (data.workflow_runs) {
    data.workflow_runs.forEach(r => {
      console.log(`${r.name} | #${r.run_number} | status: ${r.status} | conclusion: ${r.conclusion} | commit: ${r.head_commit?.message?.slice(0, 50)}`);
    });
  } else {
    console.log('API response:', data.message || data);
  }
}
checkWorkflow().catch(console.error);
