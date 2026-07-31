import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useERPStore } from '../store/erpStore';
import { selectOrderTimeline } from '../store/domains/shared/workflowUtils';
import { 
  FileText, 
  Calendar, 
  Activity, 
  ShieldCheck, 
  Truck, 
  CheckCircle2, 
  CreditCard, 
  Archive, 
  Clock, 
  AlertTriangle,
  Loader2,
  Paperclip,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const MILESTONE_GROUPS = [
  { id: 'Created', label: 'Created', icon: FileText, microStages: ['Created', 'Quoted'] },
  { id: 'Planned', label: 'Planned', icon: Calendar, microStages: ['Confirmed', 'Planned'] },
  { id: 'Production', label: 'Production', icon: Activity, microStages: ['Material Requested', 'Material Approved', 'Material Issued', 'In Production'] },
  { id: 'QC', label: 'QC', icon: ShieldCheck, microStages: ['QC Pending', 'QC Passed'], failureStage: 'QC Failed' },
  { id: 'Dispatch', label: 'Dispatch', icon: Truck, microStages: ['Dispatch Planned', 'Dispatched', 'In Transit'], failureStage: 'Dispatch Failed' },
  { id: 'Delivered', label: 'Delivered', icon: CheckCircle2, microStages: ['Delivered'] },
  { id: 'Payment', label: 'Payment', icon: CreditCard, microStages: ['Payment Pending', 'Payment Verified'], failureStage: 'Payment Rejected' },
  { id: 'Closed', label: 'Closed', icon: Archive, microStages: ['Closed'] }
];

const getStageColor = (status) => {
  if (status === 'Failed') return { color: '#ef4444', bg: '#fef2f2', border: '#fecdd3' };
  if (status === 'Completed') return { color: '#10b981', bg: '#ecfdf5', border: '#a7f3d0' };
  if (status === 'Active') return { color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe' };
  return { color: '#5E6B82', bg: '#F5FAFE', border: '#DCE5F0' };
};

const getStageIcon = (stage) => {
  const s = stage || '';
  if (s.includes('Created')) return FileText;
  if (s.includes('Planned')) return Calendar;
  if (s.includes('Material Requested') || s.includes('Mat Req')) return Activity;
  if (s.includes('Approved')) return ShieldCheck;
  if (s.includes('Issued')) return Activity;
  if (s.includes('Production') || s.includes('In Production')) return Activity;
  if (s.includes('Work Order')) return Activity;
  if (s.includes('QC Passed') || s.includes('QC OK') || s.includes('Passed')) return ShieldCheck;
  if (s.includes('QC Pending') || s.includes('QC Check')) return AlertTriangle;
  if (s.includes('Dispatch') || s.includes('DSP') || s.includes('Dispatched')) return Truck;
  if (s.includes('Transit') || s.includes('Route') || s.includes('In Transit')) return Truck;
  if (s.includes('Delivered')) return CheckCircle2;
  if (s.includes('Payment Pending') || s.includes('Pay Pending') || s.includes('Invoice')) return CreditCard;
  if (s.includes('Verified') || s.includes('Payment Verified')) return CreditCard;
  if (s.includes('Closed')) return Archive;
  return Clock;
};

const renderRemarks = (remarks) => {
  if (!remarks) return null;
  const fileRegex = /([a-zA-Z0-9_\-\(\)\.]+\.(png|jpg|jpeg|webp|pdf))/i;
  const match = remarks.match(fileRegex);
  
  if (match) {
    const filename = match[1];
    const parts = remarks.split(filename);
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <p style={{ fontSize: '12px', color: 'var(--color-text-primary)', margin: 0, fontWeight: '500', lineHeight: '1.4' }}>
          {parts[0]}
          <span style={{ fontWeight: '700', color: 'var(--color-accent-teal, #337a86)', wordBreak: 'break-all' }}>{filename}</span>
          {parts[1]}
        </p>
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '6px', 
          background: 'var(--color-bg-base)', 
          border: '1px solid var(--color-border)', 
          borderRadius: '6px', 
          padding: '6px 10px',
          marginTop: '2px',
          width: 'fit-content',
          maxWidth: '100%'
        }}>
          <Paperclip size={12} color="var(--color-text-secondary)" />
          <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>
            {filename}
          </span>
        </div>
      </div>
    );
  }
  
  return (
    <p style={{ fontSize: '12px', color: 'var(--color-text-primary)', margin: 0, fontWeight: '500', lineHeight: '1.4' }}>
      {remarks}
    </p>
  );
};

export default function OrderTimeline({ orderId, compact = false }) {
  const canonicalState = useERPStore((store) => store.state);
  const [revision, setRevision] = useState(0);
  const timeline = useMemo(
    () => selectOrderTimeline(canonicalState, orderId),
    [canonicalState, orderId, revision]
  );
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  
  const activeNodeRef = useRef(null);

  // Auto scroll to active node on mount/update
  useEffect(() => {
    if (activeNodeRef.current) {
      setTimeout(() => {
        activeNodeRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }, 300);
    }
  }, [timeline]);

  if (!orderId) {
    return (
      <div className="glass-card" style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        No order reference specified.
      </div>
    );
  }

  if (timeline.length === 0) {
    return null;
  }

  // Deduce stage info
  const latestEvent = timeline[timeline.length - 1];
  const currentStage = latestEvent ? latestEvent.stage : 'Created';

  // Determine active milestone index
  let activeIndex = 0;
  let isFailedState = false;
  let activeMilestoneId = 'Created';

  MILESTONE_GROUPS.forEach((milestone, idx) => {
    const hasSucceeded = milestone.microStages.some(s => timeline.some(t => t.stage === s));
    const hasFailed = milestone.failureStage && timeline.some(t => t.stage === milestone.failureStage);
    
    if (hasFailed) {
      activeIndex = idx;
      isFailedState = true;
      activeMilestoneId = milestone.id;
    } else if (hasSucceeded || milestone.microStages.includes(currentStage)) {
      activeIndex = idx;
      activeMilestoneId = milestone.id;
    }
  });

  const pct = Math.round((activeIndex / (MILESTONE_GROUPS.length - 1)) * 100);

  return (
    <div style={{ border: '1px solid #f0f0f0', borderRadius: '12px', padding: '16px', marginBottom: '20px', background: '#ffffff' }}>
      <h4 style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#5E6B82', marginBottom: '16px', letterSpacing: '0.5px' }}>
        Production & Fulfillment Journey
      </h4>
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 1. Milestone Progress Indicator */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
        padding: '24px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        backdropFilter: 'blur(20px)',
        color: '#ffffff'
      }}>
        {/* Top summary row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: isFailedState ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              border: `1px solid ${isFailedState ? '#ef4444' : '#10b981'}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Activity size={14} color={isFailedState ? '#ef4444' : '#10b981'} />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '800', letterSpacing: '-0.2px', color: '#F5FAFE' }}>
                Pipeline Milestone Tracking
              </div>
              <div style={{ fontSize: '11px', color: '#8893A7', fontWeight: '600' }}>
                Active State: <span style={{ color: isFailedState ? '#f87171' : '#34d399', fontWeight: '800' }}>{currentStage}</span>
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              fontSize: '10px', fontWeight: '700',
              color: isFailedState ? '#ef4444' : (currentStage === 'Closed' ? '#10b981' : '#3b82f6'),
              background: isFailedState ? 'rgba(239, 68, 68, 0.15)' : (currentStage === 'Closed' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.15)'),
              border: `1px solid ${isFailedState ? '#fca5a5' : (currentStage === 'Closed' ? '#a7f3d0' : '#bfdbfe')}25`,
              padding: '4px 10px', borderRadius: '12px'
            }}>
              <span className="timeline-pulse-dot" style={{
                width: '6px', height: '6px', borderRadius: '50%',
                background: isFailedState ? '#ef4444' : (currentStage === 'Closed' ? '#10b981' : '#3b82f6'),
                display: 'inline-block'
              }} />
              {isFailedState ? 'Workflow Halted' : (currentStage === 'Closed' ? 'Closed & Settled' : 'In Transit/Flow')}
            </span>
            <div style={{ fontSize: '12.5px', fontWeight: '900', color: isFailedState ? '#f87171' : '#10b981' }}>
              {pct}%
            </div>
          </div>
        </div>

        {/* Progress Pipeline Dots */}
        <div className="hide-scrollbar" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          width: '100%', 
          padding: '10px 0 45px 0',
          position: 'relative',
          overflowX: 'auto',
          overflowY: 'hidden',
          gap: '12px'
        }}>
          {MILESTONE_GROUPS.map((milestone, idx) => {
            const hasFailed = milestone.failureStage && timeline.some(t => t.stage === milestone.failureStage);
            const isCompleted = currentStage === 'Closed' || (!hasFailed && idx < activeIndex);
            const isActive = idx === activeIndex && currentStage !== 'Closed';
            
            let milestoneStatus = 'Pending';
            if (hasFailed) milestoneStatus = 'Failed';
            else if (isCompleted) milestoneStatus = 'Completed';
            else if (isActive) milestoneStatus = 'Active';

            const Icon = milestone.icon;
            const colors = getStageColor(milestoneStatus);

            let pulseStyle = {};
            if (milestoneStatus === 'Active') {
              pulseStyle = {
                boxShadow: `0 0 0 5px rgba(59, 130, 246, 0.25)`,
                animation: 'timelineActivePulse 1.8s infinite ease-in-out'
              };
            }

            const isSelected = selectedMilestone?.id === milestone.id;

            return (
              <React.Fragment key={idx}>
                {/* Milestone Dot Card */}
                <div 
                  ref={isActive ? activeNodeRef : null}
                  onClick={() => {
                    setSelectedMilestone(isSelected ? null : milestone);
                  }}
                  title={`${milestone.label} (${milestoneStatus})`}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    zIndex: 2,
                    position: 'relative',
                    flex: '1 0 70px',
                    cursor: 'pointer',
                    transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                    transition: 'transform 0.2s ease'
                  }}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: milestoneStatus === 'Pending' ? '#1e293b' : colors.bg,
                    border: `2px solid ${colors.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: milestoneStatus === 'Pending' ? '#5E6B82' : colors.color,
                    transition: 'all 0.3s ease',
                    ...pulseStyle
                  }}>
                    <Icon size={14} strokeWidth={2.5} />
                  </div>
                  
                  <span style={{
                    fontSize: '10px',
                    fontWeight: '700',
                    color: isSelected ? '#ffffff' : (milestoneStatus === 'Pending' ? '#5E6B82' : '#D6E2F0'),
                    textAlign: 'center',
                    whiteSpace: 'nowrap'
                  }}>
                    {milestone.label}
                  </span>

                  {/* Failure State Side-Branching (RED branch hanging down) */}
                  {milestoneStatus === 'Failed' && (
                    <div style={{
                      position: 'absolute',
                      top: '40px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      zIndex: 5
                    }}>
                      <div style={{ width: '2px', height: '12px', background: '#ef4444' }} />
                      <div style={{
                        width: '14px',
                        height: '14px',
                        borderRadius: '50%',
                        background: '#ef4444',
                        border: '2px solid #ffffff',
                        boxShadow: '0 0 6px rgba(239, 68, 68, 0.6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }} />
                      <span style={{ fontSize: '8.5px', color: '#f87171', fontWeight: '800', whiteSpace: 'nowrap', marginTop: '3px' }}>
                        {milestone.failureStage}
                      </span>
                    </div>
                  )}
                </div>

                {/* Connecting Line (Moving Gradient Wave if completed/active) */}
                {idx < MILESTONE_GROUPS.length - 1 && (
                  <div 
                    className={milestoneStatus === 'Completed' || milestoneStatus === 'Active' ? 'animated-connector' : ''}
                    style={{
                      flex: '1 1 auto',
                      height: '3px',
                      background: milestoneStatus === 'Completed' ? '#10b981' : (milestoneStatus === 'Failed' ? '#ef4444' : '#334155'),
                      margin: '0 -10px 20px -10px',
                      zIndex: 1,
                      minWidth: '24px'
                    }} 
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Expandable Milestone Micro-stages detail drawer */}
      {selectedMilestone && (
        <div style={{
          background: 'rgba(15, 23, 42, 0.9)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          animation: 'timelineDrawerSlide 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ fontSize: '13px', fontWeight: '800', margin: 0, color: '#F5FAFE', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-primary)' }} />
              {selectedMilestone.label} Milestone - Sub-Stages
            </h4>
            <button 
              onClick={() => setSelectedMilestone(null)}
              style={{ background: 'transparent', border: 'none', color: '#8893A7', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Close
            </button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            {[...selectedMilestone.microStages, selectedMilestone.failureStage].filter(Boolean).map((stage, sIdx) => {
              const matchedLog = timeline.find(t => t.stage === stage);
              const isFailedStage = stage === selectedMilestone.failureStage;
              
              return (
                <div key={sIdx} style={{
                  background: matchedLog ? (isFailedStage ? 'rgba(239,68,68,0.06)' : 'rgba(16,185,129,0.06)') : 'rgba(255,255,255,0.02)',
                  border: `1.5px solid ${matchedLog ? (isFailedStage ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)') : 'rgba(255,255,255,0.05)'}`,
                  borderRadius: '8px',
                  padding: '10px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11.5px', fontWeight: '800', color: matchedLog ? (isFailedStage ? '#f87171' : '#34d399') : '#5E6B82' }}>
                      {stage}
                    </span>
                    <span style={{ fontSize: '9px', color: '#8893A7' }}>
                      {matchedLog ? 'Cleared ✓' : 'Awaiting'}
                    </span>
                  </div>
                  {matchedLog ? (
                    <>
                      <span style={{ fontSize: '9.5px', color: '#D6E2F0', fontWeight: '500' }}>
                        {matchedLog.date} {matchedLog.time}
                      </span>
                      {matchedLog.remarks && (
                        <p style={{ fontSize: '10.5px', color: '#8893A7', margin: '4px 0 0 0', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '4px', lineHeight: '1.3' }}>
                          {matchedLog.remarks}
                        </p>
                      )}
                    </>
                  ) : (
                    <span style={{ fontSize: '9.5px', color: '#475569', fontStyle: 'italic' }}>Pending workflow step</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Detailed History List - Hidden in Compact Mode */}
      {!compact && (
        <div style={{
          background: 'rgba(15, 23, 42, 0.9)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          backdropFilter: 'blur(20px)'
        }}>
          <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#F5FAFE', margin: '0 0 4px 0' }}>
            Event Log History
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[...timeline].reverse().map((event, idx) => {
              const isFailedEvent = event.stage.includes('Failed') || event.stage.includes('Rejected');
              const stageColor = getStageColor(isFailedEvent ? 'Failed' : (idx === 0 ? 'Active' : 'Completed'));
              const StageIcon = getStageIcon(event.stage);
              
              return (
                <div key={idx} style={{ display: 'flex', gap: '12px', position: 'relative' }}>
                  {idx < timeline.length - 1 && (
                    <div style={{
                      position: 'absolute',
                      left: '11px',
                      top: '24px',
                      bottom: '-20px',
                      width: '2px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      opacity: 0.6
                    }} />
                  )}

                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: stageColor.bg,
                    border: `1.5px solid ${stageColor.color}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: stageColor.color,
                    flexShrink: 0,
                    zIndex: 2
                  }}>
                    <StageIcon size={10} />
                  </div>

                  <div style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderLeft: `3px solid ${stageColor.color}`,
                    borderRadius: '8px',
                    padding: '10px 14px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '800', color: stageColor.color }}>
                        {event.stage}
                      </span>
                      <span style={{ fontSize: '10px', color: '#8893A7', fontWeight: '600' }}>
                        {event.date} {event.time}
                      </span>
                    </div>
                    {renderRemarks(event.remarks)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes timelineActivePulse {
          0% { box-shadow: 0 0 0 0px rgba(59, 130, 246, 0.4); }
          70% { box-shadow: 0 0 0 8px rgba(59, 130, 246, 0); }
          100% { box-shadow: 0 0 0 0px rgba(59, 130, 246, 0); }
        }
        @keyframes gradient-wave {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        .animated-connector {
          background: linear-gradient(90deg, #10b981 0%, #34d399 25%, #10b981 50%, #34d399 75%, #10b981 100%);
          background-size: 200% auto;
          animation: gradient-wave 2s linear infinite;
        }
        @keyframes timelineDrawerSlide {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
      </div>
    </div>
  );
}
