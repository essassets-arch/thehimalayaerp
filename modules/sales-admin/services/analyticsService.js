const SIMULATION_TODAY = new Date('2026-06-15');

export function getColor(value) {
  if (value >= 100) return 'green';
  if (value >= 70) return 'yellow';
  if (value >= 40) return 'orange';
  return 'red';
}

export function matchesTimeFilter(dateStr, timeFilter) {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return false;
  
  const diffTime = SIMULATION_TODAY.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (timeFilter === 'today') {
    return diffDays === 0;
  }
  if (timeFilter === 'last7days') {
    return diffDays >= 0 && diffDays <= 7;
  }
  if (timeFilter === 'monthly') {
    return date.getFullYear() === 2026 && date.getMonth() === 5;
  }
  return true; // 'all'
}

// Baseline data to ensure initial values align with the 6Cr Target / 2.1Cr Achieved spec
const BASELINES = {
  'USR-002': { revenue: 12500000, received: 10500000, leads: 10, orders: 4 }, // Alex Carter
  'USR-006': { revenue: 6000000, received: 4500000, leads: 8, orders: 2 },   // Sarah Connor
  'EMP-001': { revenue: 2500000, received: 1000000, leads: 5, orders: 1 }    // Alex Rivera
};

export function calculatePerformance(state, filters) {
  const users = (state.users || []).filter(u => 
    u.department === 'Sales' || 
    u.role === 'Sales' || 
    u.role === 'Sales Executive' || 
    u.role === 'Team Leader' || 
    u.role === 'Manager'
  );

  const orders = state.sales?.orders || [];
  const payments = state.payments || [];
  const leads = state.sales?.leads || [];
  const salesTargets = state.settings?.salesTargets || {};

  let performers = users.map(user => {
    const baseline = BASELINES[user.id] || { revenue: 0, received: 0, leads: 0, orders: 0 };
    
    // Dynamic order revenue closed by this user
    const userOrders = orders.filter(o => 
      o.salesperson === user.name && 
      matchesTimeFilter(o.date, filters.time)
    );
    const dynamicRevenue = userOrders.reduce((sum, o) => sum + (o.payment?.totalAmount || 0), 0);
    
    // Apply baselines when not narrowed down to short timeframes
    const showBaseline = filters.time === 'all' || filters.time === 'monthly';
    const revenue = dynamicRevenue + (showBaseline ? baseline.revenue : 0);
    
    // Dynamic payments received (Paid status)
    const userPayments = payments.filter(p => {
      const order = orders.find(o => o.orderNo === p.orderNo);
      return order && order.salesperson === user.name && matchesTimeFilter(p.dueDate, filters.time);
    });
    const dynamicReceived = userPayments.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.paidAmount, 0);
    const received = dynamicReceived + (showBaseline ? baseline.received : 0);

    const target = salesTargets[user.id] !== undefined ? salesTargets[user.id] : 0;
    const gap = Math.max(0, target - revenue);
    const achievement = target > 0 ? (revenue / target) * 100 : 0;

    // Payment efficiency: received / revenue
    const paymentEfficiency = revenue > 0 ? (received / revenue) * 100 : 100;

    // Leads & Conversions
    const userLeads = leads.filter(l => l.salesperson === user.name);
    const dynamicLeadsCount = userLeads.filter(l => {
      const createdDate = l.timeline?.[0]?.date;
      return matchesTimeFilter(createdDate, filters.time);
    }).length;

    const leadsCount = dynamicLeadsCount + (showBaseline ? baseline.leads : 0);
    const ordersCount = userOrders.length + (showBaseline ? baseline.orders : 0);
    const conversionRate = leadsCount > 0 ? (ordersCount / leadsCount) * 100 : 0;

    // Activity scoring
    const followupsCount = userLeads.reduce((sum, l) => {
      const count = (l.timeline || []).filter(evt => evt.stage === 'Follow-up' || evt.stage === 'Lead Follow-up').length;
      return sum + count;
    }, 0);
    const activityScore = (followupsCount * 3) + (ordersCount * 10);
    const normalizedActivity = Math.min(100, activityScore);

    // Ranking score
    const rankScore = (achievement * 0.4) + (paymentEfficiency * 0.3) + (conversionRate * 0.2) + (normalizedActivity * 0.1);

    return {
      ...user,
      target,
      revenue,
      received,
      gap,
      achievement,
      paymentEfficiency,
      conversionRate,
      leadsCount,
      ordersCount,
      activityScore,
      rankScore: Math.round(rankScore),
      color: getColor(achievement)
    };
  });

  // Sort performers by rank score descending
  performers.sort((a, b) => b.rankScore - a.rankScore);
  performers = performers.map((p, idx) => ({ ...p, rank: idx + 1 }));

  // Apply User Filter (if user is selected)
  if (filters.user && filters.user !== 'all') {
    performers = performers.filter(p => p.id === filters.user);
  }

  // Apply Performance Filter
  if (filters.performance && filters.performance !== 'all') {
    performers = performers.filter(p => {
      if (filters.performance === 'high') return p.achievement >= 100;
      if (filters.performance === 'stable') return p.achievement >= 70 && p.achievement < 100;
      if (filters.performance === 'risk') return p.achievement >= 40 && p.achievement < 70;
      if (filters.performance === 'critical') return p.achievement < 40;
      return true;
    });
  }

  return performers;
}
