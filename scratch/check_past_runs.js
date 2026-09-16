async function checkAllRuns() {
  const res = await fetch('https://api.github.com/repos/essassets-arch/thehimalayaerp/actions/runs?per_page=10', {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const data = await res.json();
  data.workflow_runs?.forEach(r => {
    console.log(`${r.name} | #${r.run_number} | status: ${r.status} | conclusion: ${r.conclusion} | commit: ${r.head_commit?.message?.slice(0, 60)}`);
  });
}
checkAllRuns().catch(console.error);
