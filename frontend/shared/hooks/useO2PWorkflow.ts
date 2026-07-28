'use client';

export type O2PStepNum = number;
export type StepMeta = any;
export type WorkflowEvent = any;

export const O2P_STEP = {
  LEAD: 1,
  QUOTE: 2,
  ORDER: 3
};
export const STEP_META = {};

export function useO2PWorkflow() {
  return {
    activeOrderId: null,
    workflowHistory: [],
    completedSteps: new Set(),
    isAdvancing: false,
    stepError: null,
    activeOrder: null,
    currentStep: 0,
    stepMeta: {},
    nextRoute: '',
    advance: () => {},
    closeOrder: () => {},
    setActiveOrder: () => {}
  };
}
