const fs = require('fs');
const filePath = 'd:/prototype-next/shared/context/ERPContext.jsx';
let content = fs.readFileSync(filePath, 'utf-8');

const hookOld = `          const storedNotifications = JSON.parse(window.localStorage.getItem('erp_notifications') || 'null');
          if (Array.isArray(storedNotifications)) {
            notifications = storedNotifications;
          }
        }`;

const hookNew = `          const storedNotifications = JSON.parse(window.localStorage.getItem('erp_notifications') || 'null');
          if (Array.isArray(storedNotifications)) {
            notifications = storedNotifications;
          }
          
          // --- PATCH: Apply logistics local overrides to global orders ---
          try {
            const transit = JSON.parse(window.localStorage.getItem('erp_active_transit') || '[]');
            transit.forEach(t => {
              const tid = String(t.orderId || t.workOrderNo).toLowerCase();
              const idx = orders.findIndex(o => String(o.orderNo).toLowerCase() === tid || String(o.id).toLowerCase() === tid);
              if (idx !== -1) {
                orders[idx] = {
                  ...orders[idx],
                  status: 'IN_TRANSIT',
                  orderStatus: 'In Transit',
                  overallStage: 'IN_TRANSIT'
                };
              }
            });

            const delivered = JSON.parse(window.localStorage.getItem('erp_delivered_orders') || '[]');
            delivered.forEach(d => {
              const did = String(d.orderId || d.workOrderNo).toLowerCase();
              const idx = orders.findIndex(o => String(o.orderNo).toLowerCase() === did || String(o.id).toLowerCase() === did);
              if (idx !== -1) {
                orders[idx] = {
                  ...orders[idx],
                  status: 'DELIVERED',
                  orderStatus: 'Delivered',
                  overallStage: 'DELIVERED',
                  deliveredAt: d.actualDeliveryDate || d.dispatchDate || new Date().toISOString(),
                  actualDeliveryDate: d.actualDeliveryDate || d.dispatchDate || new Date().toISOString()
                };
              }
            });
          } catch(e) {
            console.error('Failed to merge dispatch local state', e);
          }
          // -------------------------------------------------------------
        }`;

content = content.replace(hookOld, hookNew);
fs.writeFileSync(filePath, content, 'utf-8');
console.log('Fixed ERPContext orders merge');
