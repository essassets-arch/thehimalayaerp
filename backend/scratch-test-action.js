const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const orderId = 'd720458d-31d7-4e2e-b003-779be39e7832';
  const action = 'PLANT_APPROVE';

  try {
    const user = await prisma.user.findFirst({
      where: { role: { code: 'PLANT_HEAD' } }
    });
    if (!user) {
      console.error('No PLANT_HEAD user found!');
      return;
    }
    console.log('Using User:', user.id, user.email);

    const userNotifs = await prisma.notification.findMany({
      where: { userId: user.id }
    });
    console.log('Notifications for user:', userNotifs);
    return;
    console.log('Order current workflowStateId:', order.workflowStateId);

    // Let's run the transaction and log the exact error
    await prisma.$transaction(async (tx) => {
      // 1. Workflow transition
      console.log('Simulating workflow transition...');
      let transition = await tx.workflowTransition.findFirst({
        where: {
          workflow: { code: 'SALES_ORDER' },
          fromStateId: order.workflowStateId,
          actionName: action,
        },
        include: {
          workflow: { include: { states: true } }
        }
      });
      console.log('Found transition:', !!transition);

      if (!transition) {
        console.log('Transition not found, auto-creating...');
        let workflow = await tx.workflowDefinition.findUnique({
          where: { code: 'SALES_ORDER' },
          include: { states: true },
        });
        if (!workflow) {
          console.log('Creating SALES_ORDER workflow definition...');
          workflow = await tx.workflowDefinition.create({
            data: { code: 'SALES_ORDER', name: 'SALES_ORDER Workflow' },
            include: { states: true },
          });
        }
        
        let fromStateId = order.workflowStateId;
        if (!fromStateId) {
          const initialState = await tx.workflowState.findFirst({
            where: { workflow: { code: 'SALES_ORDER' } },
            orderBy: { sequence: 'asc' }
          });
          fromStateId = initialState.id;
        }

        let toState = workflow.states.find(s => s.code === action || s.name === action);
        if (!toState) {
          console.log('Creating state:', action);
          toState = await tx.workflowState.create({
            data: {
              workflowId: workflow.id,
              name: action,
              code: action,
              sequence: (workflow.states.length + 1) * 10
            }
          });
        }

        console.log('Creating transition...');
        transition = await tx.workflowTransition.create({
          data: {
            workflowId: workflow.id,
            fromStateId,
            toStateId: toState.id,
            actionName: action,
            actionLabel: action,
          },
          include: {
            workflow: { include: { states: true } }
          }
        });
      }

      console.log('Recording history...');
      const fromState = transition.workflow.states.find(s => s.id === transition.fromStateId);
      const toState = transition.workflow.states.find(s => s.id === transition.toStateId);
      
      const company = await tx.company.findFirst({
        select: { id: true },
        orderBy: { createdAt: 'asc' },
      });
      console.log('Company found:', company?.id);

      await tx.workflowHistory.create({
        data: {
          entityId: order.id,
          entityType: 'SALES_ORDER',
          fromStatus: fromState?.name || 'Unknown',
          toStatus: toState?.name || 'Unknown',
          action: action,
          userId: user.id,
        },
      });

      console.log('Recording audit log...');
      await tx.auditLog.create({
        data: {
          actorUserId: user.id,
          companyId: company?.id,
          action: action,
          entityType: 'SALES_ORDER',
          entityId: order.id,
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

      console.log('Creating notification...');
      await tx.notification.create({
        data: {
          companyId: company?.id || 'SYSTEM',
          userId: user.id,
          title: `SALES_ORDER Update`,
          message: `SALES_ORDER transitioned to ${toState?.name || 'Unknown'} via ${action}`,
          entityType: 'SALES_ORDER',
          entityId: order.id,
          status: 'UNREAD',
        },
      });

      console.log('Updating SalesOrder status...');
      const updated = await tx.salesOrder.update({
        where: { id: orderId },
        data: {
          workflowStateId: transition.toStateId,
          status: 'PLANT_APPROVED',
          version: { increment: 1 }
        }
      });
      console.log('Successfully completed simulation!', updated.id);
    });
  } catch (error) {
    console.error('SIMULATION FAILURE:', error);
  } finally {
    await prisma.$disconnect();
  }
}

run();
