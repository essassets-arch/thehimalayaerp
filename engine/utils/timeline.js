

export const addTimelineEvent = (order, stage, remarks = '') => {
  const newEvent = {
    stage,
    timestamp: Date.now(),
    remarks: remarks || `Status changed to ${stage}`,
    date: new Date().toISOString().split('T')[0]
  };
  
  return {
    ...order,
    overallStage: stage,
    timeline: [
      ...(order.timeline || []),
      newEvent
    ]
  };
};
