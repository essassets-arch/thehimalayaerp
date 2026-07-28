import React from 'react';
import { 
  Check, 
  Clock, 
  AlertTriangle, 
  FileText, 
  Calendar, 
  Box, 
  ShieldCheck, 
  Zap, 
  Truck, 
  CreditCard, 
  CheckCircle2, 
  ShieldAlert, 
  Archive, 
  Paperclip, 
  Activity, 
  CheckSquare, 
  Settings, 
  Clipboard,
  ChevronRight
} from 'lucide-react';

const MILESTONES = [
  { stage: 'Created', label: 'Created' },
  { stage: 'Planned', label: 'Planned' },
  { stage: 'Material Requested', label: 'Mat Req' },
  { stage: 'Material Approved', label: 'Approved' },
  { stage: 'Material Issued', label: 'Issued' },
  { stage: 'In Production', label: 'Production' },
  { stage: 'QC Pending', label: 'QC Pending' },
  { stage: 'QC Passed', label: 'QC Passed' },
  { stage: 'Dispatched', label: 'Dispatched' },
  { stage: 'Delivered', label: 'Delivered' },
  { stage: 'Payment Pending', label: 'Pay Pending' },
  { stage: 'Payment Verified', label: 'Verified' },
  { stage: 'Closed', label: 'Closed' }
];

const getStageColor = (stage) => {
  const s = stage || '';
  if (s.includes('Created')) return { color: '#5E6B82', bg: '#F5FAFE', border: '#D6E2F0' };
  if (s.includes('Planned')) return { color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' };
  if (s.includes('Req') || s.includes('Requested')) return { color: '#ea580c', bg: '#fff7ed', border: '#fed7aa' };
  if (s.includes('Approved')) return { color: '#d97706', bg: '#fffbeb', border: '#fde68a' };
  if (s.includes('Issued')) return { color: '#9333ea', bg: '#faf5ff', border: '#e9d5ff' };
  if (s.includes('Production') || s.includes('WO') || s.includes('Work Order') || s.includes('In Production')) return { color: '#d97706', bg: '#fffbeb', border: '#fde68a' };
  if (s.includes('QC Passed') || s.includes('QC OK') || s.includes('Passed')) return { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' };
  if (s.includes('QC Pending') || s.includes('QC Check') || s.includes('QC')) return { color: '#c026d3', bg: '#fdf4ff', border: '#f5d0fe' };
  if (s.includes('Dispatch') || s.includes('DSP') || s.includes('Dispatched')) return { color: '#0891b2', bg: '#ecfeff', border: '#a5f3fc' };
  if (s.includes('Transit') || s.includes('Route') || s.includes('In Transit')) return { color: '#0284c7', bg: '#f0f9ff', border: '#bae6fd' };
  if (s.includes('Delivered')) return { color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0' };
  if (s.includes('Pay Pending') || s.includes('Payment Pending') || s.includes('Invoice')) return { color: '#ea580c', bg: '#fff7ed', border: '#fed7aa' };
  if (s.includes('Verified')) return { color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0' };
  if (s.includes('Closed')) return { color: '#14532d', bg: '#f0fdf4', border: '#86efac' };
  return { color: '#0d9488', bg: '#f0fdfa', border: '#ccfbf1' }; // Default teal
};

const getStageIcon = (stage) => {
  const s = stage || '';
  if (s.includes('Created')) return FileText;
  if (s.includes('Planned')) return Calendar;
  if (s.includes('Material Requested') || s.includes('Mat Req')) return Box;
  if (s.includes('Approved')) return ShieldCheck;
  if (s.includes('Issued')) return Zap;
  if (s.includes('Production') || s.includes('In Production')) return Activity;
  if (s.includes('Work Order')) return CheckSquare;
  if (s.includes('QC Passed') || s.includes('QC OK') || s.includes('Passed')) return ShieldCheck;
  if (s.includes('QC Pending') || s.includes('QC Check')) return ShieldAlert;
  if (s.includes('Dispatch') || s.includes('DSP') || s.includes('Dispatched')) return Truck;
  if (s.includes('Transit') || s.includes('Route') || s.includes('In Transit')) return Truck;
  if (s.includes('Delivered')) return CheckCircle2;
  if (s.includes('Payment Pending') || s.includes('Pay Pending') || s.includes('Invoice')) return CreditCard;
  if (s.includes('Verified')) return CheckCircle2;
  if (s.includes('Closed')) return Archive;
  return Clock;
};

const renderRemarks = (remarks) => {
  if (!remarks) return null;
  
  // Check if remarks contains something ending in .png, .jpg, .webp, .pdf
  const fileRegex = /([a-zA-Z0-9_\-\(\)\.]+\.(png|jpg|jpeg|webp|pdf))/i;
  const match = remarks.match(fileRegex);
  
  if (match) {
    const filename = match[1];
    const parts = remarks.split(filename);
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <p style={{ fontSize: '12.5px', color: 'var(--color-text-primary)', margin: 0, fontWeight: '500', lineHeight: '1.4' }}>
          {parts[0]}
          <span style={{ fontWeight: '700', color: 'var(--color-accent-teal, #337a86)', wordBreak: 'break-all' }}>{filename}</span>
          {parts[1]}
        </p>
        
        {/* Attachment Card */}
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '8px', 
          background: 'var(--color-bg-base)', 
          border: '1px solid var(--color-border)', 
          borderRadius: '8px', 
          padding: '8px 12px',
          marginTop: '4px',
          width: 'fit-content',
          maxWidth: '100%'
        }}>
          <Paperclip size={14} color="var(--color-text-secondary)" />
          <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '240px' }}>
            {filename}
          </span>
          <span style={{ fontSize: '9px', background: 'var(--color-card-bg, #ffffff)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', padding: '1px 5px', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 'bold' }}>
            Attachment
          </span>
        </div>
      </div>
    );
  }
  
  return (
    <p style={{ fontSize: '12.5px', color: 'var(--color-text-primary)', margin: 0, fontWeight: '500', lineHeight: '1.4' }}>
      {remarks}
    </p>
  );
};

export default function Timeline({ timeline = [], currentStage = '', layout = 'both' }) {
  const normalizedStage = currentStage === 'Shortage' ? 'Material Requested' : (currentStage === 'Order Closed' ? 'Closed' : currentStage);
  
  // Find current active index in major milestones
  const activeIndex = MILESTONES.findIndex(m => m.stage === normalizedStage);

  return (
    <div className="timeline-container" style={{ display: 'flex', flexDirection: 'column', gap: layout === 'both' ? '24px' : '0px', width: '100%' }}>
      {/* 1. Premium Horizontal Progress Pipeline */}
      {layout !== 'vertical' && (() => {
        const totalStages = MILESTONES.length;
        const completedCount = currentStage === 'Closed' || currentStage === 'Order Closed'
          ? totalStages
          : Math.max(0, activeIndex);
        const pct = Math.round((completedCount / (totalStages - 1)) * 100);
        const activeStageColor = activeIndex >= 0 ? getStageColor(MILESTONES[activeIndex]?.stage || '') : getStageColor('Created');

        return (
          <div style={{
            background: 'var(--color-bg-card, #ffffff)',
            border: '1px solid var(--color-border)',
            borderRadius: '20px',
            boxShadow: 'var(--shadow-premium)',
            padding: '20px 24px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}>
            {/* Top bar: title + percentage */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '9px',
                  background: `linear-gradient(135deg, ${activeStageColor.color}22, ${activeStageColor.color}44)`,
                  border: `1px solid ${activeStageColor.color}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Activity size={14} color={activeStageColor.color} />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--color-text-primary)', letterSpacing: '-0.2px' }}>
                    Order Pipeline Progress
                  </div>
                  <div style={{ fontSize: '10.5px', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
                    Stage {completedCount + 1} of {totalStages} · {currentStage === 'Shortage' ? 'Shortage (Blocked)' : (currentStage || 'Unknown')}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* Pulsing live indicator */}
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  fontSize: '10px', fontWeight: '700',
                  color: currentStage === 'Closed' ? '#16a34a' : (currentStage === 'Shortage' ? '#ef4444' : '#0284c7'),
                  background: currentStage === 'Closed' ? '#dcfce7' : (currentStage === 'Shortage' ? '#fee2e2' : '#e0f2fe'),
                  border: `1px solid ${currentStage === 'Closed' ? '#bbf7d0' : (currentStage === 'Shortage' ? '#fecdd3' : '#bae6fd')}`,
                  padding: '3px 10px', borderRadius: '20px',
                }}>
                  <span style={{
                    width: '6px', height: '6px', borderRadius: '50%',
                    background: currentStage === 'Closed' ? '#22c55e' : (currentStage === 'Shortage' ? '#ef4444' : '#0284c7'),
                    animation: currentStage !== 'Closed' ? 'timelinePulse 1.6s ease-in-out infinite' : 'none',
                    display: 'inline-block',
                  }} />
                  {currentStage === 'Closed' ? 'Complete' : currentStage === 'Shortage' ? 'Stalled' : 'In Progress'}
                </span>
                {/* Percentage ring */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <svg width={52} height={52} style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx={26} cy={26} r={21} fill="none" stroke="#f1f5f9" strokeWidth={5} />
                    <circle
                      cx={26} cy={26} r={21}
                      fill="none"
                      stroke={currentStage === 'Shortage' ? '#ef4444' : activeStageColor.color}
                      strokeWidth={5}
                      strokeDasharray={`${(pct / 100) * 2 * Math.PI * 21} ${2 * Math.PI * 21}`}
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dasharray 1s cubic-bezier(.4,0,.2,1)' }}
                    />
                  </svg>
                  <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '11px', fontWeight: '900',
                    color: currentStage === 'Shortage' ? '#ef4444' : activeStageColor.color,
                  }}>
                    {pct}%
                  </div>
                </div>
              </div>
            </div>

            {/* Thin progress track */}
            <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden', position: 'relative' }}>
              <div style={{
                height: '100%',
                width: `${pct}%`,
                background: currentStage === 'Shortage'
                  ? 'linear-gradient(90deg, #ef444499, #ef4444)'
                  : `linear-gradient(90deg, ${activeStageColor.color}88, ${activeStageColor.color})`,
                borderRadius: '99px',
                transition: 'width 1s cubic-bezier(.4,0,.2,1)',
              }} />
            </div>

            {/* Milestone Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px 6px' }}>
              {MILESTONES.map((milestone, idx) => {
                const isCompleted = idx < activeIndex || currentStage === 'Closed' || currentStage === 'Order Closed';
                const isActive = idx === activeIndex && currentStage !== 'Closed' && currentStage !== 'Order Closed';
                const isShortage = currentStage === 'Shortage' && milestone.stage === 'Material Requested';

                let badgeBg = '#F5FAFE';
                let badgeBorder = '1px solid #DCE5F0';
                let badgeColor = '#8893A7';
                let circleBg = '#DCE5F0';
                let circleColor = '#8893A7';

                if (isCompleted) {
                  badgeBg = '#f0fdf4';
                  badgeBorder = '1px solid #bbf7d0';
                  badgeColor = '#16a34a';
                  circleBg = 'linear-gradient(135deg, #0d9488, #10b981)';
                  circleColor = '#ffffff';
                } else if (isActive) {
                  const sc = getStageColor(milestone.stage);
                  badgeBg = sc.bg;
                  badgeBorder = `2px solid ${sc.border}`;
                  badgeColor = sc.color;
                  circleBg = sc.color;
                  circleColor = '#ffffff';
                  if (isShortage) {
                    badgeBg = '#fee2e2';
                    badgeBorder = '2px solid #fecdd3';
                    badgeColor = '#ef4444';
                    circleBg = '#ef4444';
                  }
                }

                return (
                  <React.Fragment key={idx}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '7px',
                      background: badgeBg, border: badgeBorder,
                      padding: '5px 11px', borderRadius: '20px',
                      boxShadow: isActive
                        ? `0 0 0 3px ${(isShortage ? '#ef4444' : (getStageColor(milestone.stage).color))}20, 0 4px 12px rgba(0,0,0,0.06)`
                        : '0 1px 2px rgba(0,0,0,0.03)',
                      transition: 'all 0.2s ease',
                      cursor: 'default',
                      transform: isActive ? 'translateY(-1px)' : 'none',
                    }}>
                      <div style={{
                        width: '17px', height: '17px', borderRadius: '50%',
                        background: circleBg,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: circleColor, fontWeight: 'bold', fontSize: '9px', flexShrink: 0,
                      }}>
                        {isCompleted ? (
                          <Check size={9} strokeWidth={4} />
                        ) : isShortage ? (
                          <AlertTriangle size={9} strokeWidth={4} />
                        ) : (
                          idx + 1
                        )}
                      </div>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: isActive || isCompleted ? '700' : '500',
                        color: badgeColor, whiteSpace: 'nowrap',
                      }}>
                        {isShortage ? 'Shortage' : milestone.label}
                      </span>
                    </div>
                    {idx < MILESTONES.length - 1 && (
                      <ChevronRight size={12} color={idx < activeIndex ? '#10b981' : '#D6E2F0'} style={{ flexShrink: 0, opacity: 0.7 }} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* 2. Detailed Vertical Audit Timeline Logs */}
      {layout !== 'horizontal' && (
        <div className="vertical-timeline" style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingLeft: '8px' }}>
          <h4 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '8px' }}>Transaction History Logs</h4>
          {timeline.length === 0 ? (
            <span style={{ fontStyle: 'italic', fontSize: '12px', color: 'var(--color-text-secondary)' }}>No timeline entries registered yet.</span>
          ) : (
            [...timeline].reverse().map((event, idx) => {
              const stageColor = getStageColor(event.stage);
              const StageIcon = getStageIcon(event.stage);
              return (
                <div key={idx} style={{ display: 'flex', gap: '16px', position: 'relative' }}>
                  {/* Line connector */}
                  {idx < timeline.length - 1 && (
                    <div style={{
                      position: 'absolute',
                      left: '13px',
                      top: '28px',
                      bottom: '-24px',
                      width: '2px',
                      background: 'var(--color-border)',
                      opacity: 0.8
                    }}></div>
                  )}
                  
                  {/* Left dot icon */}
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: stageColor.bg,
                    border: `2px solid ${stageColor.color}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: stageColor.color,
                    flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                    zIndex: 2
                  }}>
                    <StageIcon size={12} />
                  </div>
                  
                  {/* Text content details */}
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '6px', 
                    background: '#ffffff', 
                    border: '1px solid var(--color-border)', 
                    borderLeft: `4px solid ${stageColor.color}`,
                    borderRadius: '12px', 
                    padding: '14px 18px', 
                    width: '100%',
                    boxShadow: 'var(--shadow-soft)',
                    transition: 'var(--transition-smooth)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '800', color: stageColor.color }}>{event.stage}</span>
                      <span style={{ fontSize: '10px', background: 'var(--color-bg-base)', color: 'var(--color-text-secondary)', padding: '2px 8px', borderRadius: '12px', fontWeight: '600' }}>
                        {event.date} {event.time || ''}
                      </span>
                    </div>
                    {renderRemarks(event.remarks)}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      <style>{`
        @keyframes timelinePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.75); }
        }
      `}</style>
    </div>
  );
}
