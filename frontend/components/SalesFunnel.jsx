
export default function SalesFunnel({ leadsCount, samplesCount, quotationsCount, ordersCount }) {
  const calcRate = (current, previous) => {
    if (!previous) return '0%';
    return `${Math.round((current / previous) * 100)}%`;
  };

  const funnelSteps = [
    { label: 'Leads', count: leadsCount, rate: 'Base' },
    { label: 'Samples', count: samplesCount, rate: calcRate(samplesCount, leadsCount) + ' Conv.' },
    { label: 'Quotations', count: quotationsCount, rate: calcRate(quotationsCount, samplesCount) + ' Conv.' },
    { label: 'Orders', count: ordersCount, rate: calcRate(ordersCount, quotationsCount) + ' Conv.' },
  ];

  return (
    <div className="funnel-container">
      {funnelSteps.map((step) => (
        <div key={step.label} className="funnel-step">
          <div className="funnel-label-group">
            <span className="funnel-label">{step.label}</span>
            <span className="funnel-count">{step.count}</span>
          </div>
          <span className="funnel-rate">{step.rate}</span>
        </div>
      ))}
    </div>
  );
}
