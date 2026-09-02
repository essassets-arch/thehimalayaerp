import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class WorkflowService {
  constructor(private prisma: PrismaService) {}

  async getInitialState(
    workflowCode: string,
    db: Prisma.TransactionClient | PrismaService = this.prisma,
  ) {
    let state = await db.workflowState.findFirst({
      where: {
        workflow: { code: workflowCode },
        isInitial: true,
      },
    });
    if (!state) {
      state = await db.workflowState.findFirst({
        where: {
          workflow: { code: workflowCode },
        },
        orderBy: { sequence: 'asc' },
      });
    }
    if (!state) {
      // Auto-seed for prototype development
      console.warn(
        `[WorkflowService] Auto-seeding initial state for workflow ${workflowCode}`,
      );

      let workflow = await db.workflowDefinition.findUnique({
        where: { code: workflowCode },
      });
      if (!workflow) {
        workflow = await db.workflowDefinition.create({
          data: {
            code: workflowCode,
            name: `${workflowCode} Workflow`,
          },
        });
      }

      state = await db.workflowState.create({
        data: {
          workflowId: workflow.id,
          name: 'NEW',
          code: 'NEW',
          sequence: 1,
          isInitial: true,
        },
      });
    }
    return state;
  }

  async getAvailableActions(workflowCode: string, currentStateId: string) {
    const transitions = await this.prisma.workflowTransition.findMany({
      where: {
        workflow: { code: workflowCode },
        fromStateId: currentStateId,
      },
      include: {
        workflow: {
          include: {
            states: true,
          },
        },
      },
    });

    return transitions.map((t) => ({
      action: t.actionName,
      label: t.actionLabel,
      requiresApproval: t.requiresApproval,
      toState: t.toStateId,
    }));
  }

  async processAction(
    params: {
      entityId: string;
      entityType: string; // e.g. "SALES_ORDER"
      workflowCode: string; // e.g. "SALES_ORDER_FLOW"
      currentStateId: string;
      actionName: string;
      userId: string;
      remarks?: string;
    },
    db: Prisma.TransactionClient | PrismaService = this.prisma,
  ) {
    if (params.currentStateId) {
      const currentStateObj = await db.workflowState.findUnique({
        where: { id: params.currentStateId },
      });
      if (currentStateObj?.isFinal) {
        throw new BadRequestException(
          `Entity is in a terminal state (${currentStateObj.name}) and cannot be transitioned.`,
        );
      }
    }

    let transition: any = null;
    if (params.currentStateId) {
      transition = await db.workflowTransition.findFirst({
        where: {
          workflow: { code: params.workflowCode },
          fromStateId: params.currentStateId,
          actionName: params.actionName,
        },
        include: {
          workflow: {
            include: {
              states: true,
            },
          },
        },
      });
    }

    if (!transition) {
      // Auto-create transition for dynamic workflow execution
      let workflow = await db.workflowDefinition.findUnique({
        where: { code: params.workflowCode },
        include: { states: true },
      });
      if (!workflow) {
        workflow = await db.workflowDefinition.create({
          data: {
            code: params.workflowCode,
            name: `${params.workflowCode} Workflow`,
          },
          include: { states: true },
        });
      }

      let fromStateId = params.currentStateId;
      if (!fromStateId) {
        const initialState = await this.getInitialState(
          params.workflowCode,
          db,
        );
        fromStateId = initialState.id;
      }

      let toState = workflow.states.find(
        (s) => s.code === params.actionName || s.name === params.actionName,
      );
      if (!toState) {
        toState = await db.workflowState.create({
          data: {
            workflowId: workflow.id,
            name: params.actionName,
            code: params.actionName,
            sequence: (workflow.states.length + 1) * 10,
          },
        });
        workflow.states.push(toState);
      }

      transition = await db.workflowTransition.create({
        data: {
          workflowId: workflow.id,
          fromStateId: fromStateId,
          toStateId: toState.id,
          actionName: params.actionName,
          actionLabel: params.actionName,
        },
        include: {
          workflow: {
            include: {
              states: true,
            },
          },
        },
      });
    }

    const fromState = transition.workflow.states.find(
      (s: any) => s.id === transition.fromStateId,
    );
    const toState = transition.workflow.states.find(
      (s: any) => s.id === transition.toStateId,
    );
    const company = await db.company.findFirst({
      select: { id: true },
      orderBy: { createdAt: 'asc' },
    });

    // Record history using the new generic WorkflowHistory schema
    try {
      await db.workflowHistory.create({
        data: {
          entityId: params.entityId,
          entityType: params.entityType,
          fromStatus: fromState?.name || 'Unknown',
          toStatus: toState?.name || 'Unknown',
          action: params.actionName,
          userId: params.userId,
          remarks: params.remarks,
        },
      });
    } catch (histErr) {
      console.warn('[WorkflowService] Failed to record workflow history:', histErr);
    }

    try {
      await db.auditLog.create({
        data: {
          actorUserId: params.userId,
          companyId: company?.id,
          action: params.actionName,
          entityType: params.entityType,
          entityId: params.entityId,
          before: {
            workflowStateId: transition.fromStateId,
            workflowState: fromState?.code || fromState?.name || 'Unknown',
          },
          after: {
            workflowStateId: transition.toStateId,
            workflowState: toState?.code || toState?.name || 'Unknown',
          },
        },
      });
    } catch (auditErr) {
      console.warn('[WorkflowService] Failed to record audit log:', auditErr);
    }

    // Create a generic notification for the state transition if user exists
    try {
      const userExists = params.userId
        ? await db.user.findUnique({
            where: { id: params.userId },
            select: { id: true },
          })
        : null;

      if (userExists && company?.id) {
        await db.notification.create({
          data: {
            companyId: company.id,
            userId: userExists.id,
            title: `${params.entityType} Update`,
            message: `${params.entityType} transitioned to ${toState?.name || 'Unknown'} via ${params.actionName}`,
            entityType: params.entityType,
            entityId: params.entityId,
            status: 'UNREAD',
          },
        });
      }
    } catch (notifErr) {
      console.warn('[WorkflowService] Failed to create notification:', notifErr);
    }

    return {
      nextStateId: transition.toStateId,
      nextStateName: toState?.name,
    };
  }
}
