"use client";

import React, { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useERPStore } from "@/store/erpStore";
import { ArrowLeft, Package, User, MapPin, Calendar, Clock, Hash, Truck, CheckCircle, AlertCircle, FileText, DollarSign, Layers } from "lucide-react";

const statusColors = {
  ORDER_CONFIRMED:    { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
  QC_APPROVED:        { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
  IN_TRANSIT:         { bg: "#fff7ed", color: "#c2410c", border: "#fed7aa" },
  DISPATCH_CREATED:   { bg: "#fef9c3", color: "#854d0e", border: "#fde68a" },
  DELIVERED:          { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
  PRODUCTION_STARTED: { bg: "#f5f3ff", color: "#7c3aed", border: "#ddd6fe" },
  QC_PENDING:         { bg: "#fefce8", color: "#a16207", border: "#fef08a" },
  DEFAULT:            { bg: "#F5FAFE", color: "#475569", border: "#DCE5F0" },
};

function StatusPill({ status }) {
  const key = (status || "").toUpperCase().replace(/ /g, "_");
  const s = statusColors[key] || statusColors.DEFAULT;
  return (
    <span style={{ display:"inline-flex",alignItems:"center",gap:5,padding:"4px 12px",borderRadius:999,fontSize:12,fontWeight:700,background:s.bg,color:s.color,border:`1.5px solid ${s.border}`,whiteSpace:"nowrap" }}>
      <span style={{ width:6,height:6,borderRadius:"50%",background:s.color }} />{status}
    </span>
  );
}

function InfoCard({ icon: Icon, label, value, highlight = false }) {
  return (
    <div style={{ display:"flex",flexDirection:"column",gap:4,padding:"14px 16px",background:highlight?"rgba(166,213,61,0.07)":"#fafafa",border:`1px solid ${highlight?"rgba(166,213,61,0.25)":"#e5e7eb"}`,borderRadius:10 }}>
      <div style={{ display:"flex",alignItems:"center",gap:6,color:"#5E6B82",fontSize:11.5,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.06em" }}>
        <Icon size={13} />{label}
      </div>
      <div style={{ fontSize:14,fontWeight:700,color:"#24345C",lineHeight:1.4 }}>{value || "—"}</div>
    </div>
  );
}

const stages = [
  { key:"ORDER_CONFIRMED",    label:"Confirmed",  icon:FileText },
  { key:"PRODUCTION_STARTED", label:"Production", icon:Layers },
  { key:"QC_PENDING",         label:"QC Inspect", icon:AlertCircle },
  { key:"QC_APPROVED",        label:"QC Passed",  icon:CheckCircle },
  { key:"DISPATCH_CREATED",   label:"Dispatched", icon:Package },
  { key:"IN_TRANSIT",         label:"In Transit", icon:Truck },
  { key:"DELIVERED",          label:"Delivered",  icon:CheckCircle },
];

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.orderId;
  const storeState = useERPStore((s) => s.state);
  const salesOrders = storeState?.sales?.orders || [];
  const productionWorkOrders = storeState?.production?.workOrders || [];
  const productionQcRecords = storeState?.production?.qcRecords || [];
  const dispatchConsignments = storeState?.dispatch?.consignments || [];

  const order = useMemo(() => {
    return salesOrders.find((o) =>
      String(o.id) === String(orderId) ||
      String(o.orderNo) === String(orderId) ||
      String(o.order_no) === String(orderId)
    ) || null;
  }, [salesOrders, orderId]);

  const workOrder = useMemo(() => {
    if (!order) return null;
    return productionWorkOrders.find((wo) =>
      String(wo.orderId) === String(order.id) ||
      String(wo.orderNo) === String(order.orderNo) ||
      String(wo.id) === String(order.workOrderId)
    ) || null;
  }, [productionWorkOrders, order]);

  const dispatchRec = useMemo(() => {
    if (!order) return null;
    return dispatchConsignments.find((d) =>
      String(d.orderId) === String(order.id) ||
      String(d.orderNo) === String(order.orderNo)
    ) || null;
  }, [dispatchConsignments, order]);

  const qcInspection = useMemo(() => {
    if (!order) return null;
    return productionQcRecords.find((qc) =>
      String(qc.orderId) === String(order.id) ||
      String(qc.orderNo) === String(order.orderNo)
    ) || null;
  }, [productionQcRecords, order]);

  if (!order) {
    return (
      <div style={{ padding:60,textAlign:"center",color:"#5E6B82" }}>
        <AlertCircle size={52} style={{ margin:"0 auto 16px",color:"#D6E2F0" }} />
        <h2 style={{ fontSize:22,fontWeight:800,color:"#24345C",marginBottom:8 }}>Order Not Found</h2>
        <p style={{ marginBottom:20 }}>No order matches ID: <strong>{orderId}</strong></p>
        <button onClick={() => router.back()} style={{ background:"#24345C",color:"#fff",border:"none",borderRadius:8,padding:"10px 20px",cursor:"pointer",fontWeight:700,fontSize:13 }}>Go Back</button>
      </div>
    );
  }

  const customerName = order.customerName || order.customer_name || order.customer?.name || "—";
  const deliveryAddr  = order.deliveryAddress || order.delivery_address || "—";
  const workflowStatus =
    order.commercialStatus === "ORDER_CLOSED"
      ? "ORDER_CLOSED"
      : order.dispatchStatus || order.qcStatus || order.productionStatus ||
        order.planningStatus || order.commercialStatus || order.workflowStatus ||
        order.status || order.orderStatus || "—";
  const totalAmount = Number(order.grandTotal || order.totalAmount || order.total_amount || 0);
  const priority = order.priority || "Standard";
  const items = order.detailedItems?.length ? order.detailedItems : (order.items?.length ? order.items : []);
  const timeline = order.history || order.timeline || [];
  const fmt = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day:"2-digit",month:"short",year:"numeric" }) : "—";

  const currentStageIdx = (() => {
    const norm = workflowStatus.toUpperCase().replace(/ /g,"_");
    const idx = stages.findIndex((s) => norm.includes(s.key));
    return idx === -1 ? 0 : idx;
  })();

  return (
    <div style={{ padding:24,maxWidth:1200,margin:"0 auto",fontFamily:"Inter, system-ui, sans-serif" }}>
      <div style={{ display:"flex",alignItems:"center",gap:16,marginBottom:28 }}>
        <button onClick={() => router.back()} style={{ display:"flex",alignItems:"center",gap:6,background:"rgba(15,23,42,0.07)",border:"none",borderRadius:8,padding:"8px 14px",cursor:"pointer",fontWeight:600,fontSize:13,color:"#374151" }}>
          <ArrowLeft size={15} /> Back
        </button>
        <div style={{ flex:1 }}>
          <div style={{ display:"flex",alignItems:"center",gap:10,flexWrap:"wrap" }}>
            <h1 style={{ margin:0,fontSize:22,fontWeight:800,color:"#24345C" }}>{order.orderNo || order.id}</h1>
            <StatusPill status={workflowStatus} />
            <span style={{ fontSize:12,padding:"3px 10px",borderRadius:999,fontWeight:700,background:priority==="High"?"#fef2f2":"#f0fdf4",color:priority==="High"?"#dc2626":"#16a34a",border:`1px solid ${priority==="High"?"#fecaca":"#bbf7d0"}` }}>{priority}</span>
          </div>
          <div style={{ fontSize:13,color:"#5E6B82",marginTop:3 }}>Order for <strong style={{ color:"#24345C" }}>{customerName}</strong></div>
        </div>
      </div>

      <div style={{ background:"#fff",border:"1px solid #e5e7eb",borderRadius:14,padding:"20px 24px",marginBottom:20 }}>
        <div style={{ fontSize:12,fontWeight:700,color:"#5E6B82",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:16 }}>Order Progress</div>
        <div style={{ display:"flex",alignItems:"center",overflowX:"auto",paddingBottom:4 }}>
          {stages.map((stage, idx) => {
            const done = idx <= currentStageIdx;
            const curr = idx === currentStageIdx;
            const Icon = stage.icon;
            return (
              <React.Fragment key={stage.key}>
                <div style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:6,minWidth:86 }}>
                  <div style={{ width:34,height:34,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",background:done?(curr?"#a6d53d":"#dcfce7"):"#f1f5f9",border:`2px solid ${done?(curr?"#7baa1e":"#4ade80"):"#DCE5F0"}`,boxShadow:curr?"0 0 0 4px rgba(166,213,61,0.2)":"none" }}>
                    <Icon size={15} color={done?(curr?"#2d4a00":"#16a34a"):"#8893A7"} />
                  </div>
                  <span style={{ fontSize:10,fontWeight:curr?800:500,color:curr?"#2d4a00":(done?"#374151":"#8893A7"),textAlign:"center",lineHeight:1.2 }}>{stage.label}</span>
                </div>
                {idx < stages.length-1 && <div style={{ flex:1,height:2,background:idx<currentStageIdx?"#4ade80":"#DCE5F0",minWidth:16,marginBottom:20 }} />}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:20 }}>
        <div style={{ background:"#fff",border:"1px solid #e5e7eb",borderRadius:14,padding:20 }}>
          <div style={{ fontWeight:800,fontSize:14,color:"#24345C",marginBottom:14,display:"flex",alignItems:"center",gap:7 }}><User size={16} color="#a6d53d" />Customer & Order Details</div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
            <InfoCard icon={User} label="Customer Name" value={customerName} highlight />
            <InfoCard icon={Hash} label="Order No" value={order.orderNo || order.id} />
            <InfoCard icon={FileText} label="Quotation Ref" value={order.quotationRef || order.quotationId} />
            <InfoCard icon={DollarSign} label="Grand Total" value={totalAmount ? `\u20B9${totalAmount.toLocaleString("en-IN")}` : "—"} highlight />
            <InfoCard icon={Calendar} label="Order Date" value={fmt(order.createdAt || order.orderDate)} />
            <InfoCard icon={Calendar} label="Exp. Delivery" value={fmt(order.expectedDeliveryDate || order.deliveryDate)} highlight />
          </div>
        </div>
        <div style={{ background:"#fff",border:"1px solid #e5e7eb",borderRadius:14,padding:20 }}>
          <div style={{ fontWeight:800,fontSize:14,color:"#24345C",marginBottom:14,display:"flex",alignItems:"center",gap:7 }}><MapPin size={16} color="#a6d53d" />Delivery & Production</div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
            <div style={{ gridColumn:"span 2" }}><InfoCard icon={MapPin} label="Delivery Address" value={deliveryAddr} /></div>
            <InfoCard icon={Layers} label="Work Order ID" value={workOrder?.id || workOrder?.workOrderNo || order.workOrderId} />
            <InfoCard icon={Package} label="Produced Qty" value={workOrder?.producedQuantity ?? order.producedQuantity} />
            <InfoCard icon={CheckCircle} label="QC Approved Qty" value={qcInspection?.approvedQuantity ?? order.qcApprovedQuantity} />
            <InfoCard icon={AlertCircle} label="QC Rejected Qty" value={qcInspection?.rejectedQuantity ?? order.qcRejectedQuantity ?? 0} />
          </div>
        </div>
      </div>

      {items.length > 0 && (
        <div style={{ background:"#fff",border:"1px solid #e5e7eb",borderRadius:14,padding:20,marginBottom:20 }}>
          <div style={{ fontWeight:800,fontSize:14,color:"#24345C",marginBottom:14,display:"flex",alignItems:"center",gap:7 }}><Package size={16} color="#a6d53d" />Ordered Items</div>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%",borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ background:"#F5FAFE",borderBottom:"2px solid #e5e7eb" }}>
                  {["#","Product","Qty","Unit","Unit Price","Total","HSN"].map(h => (
                    <th key={h} style={{ padding:"10px 14px",textAlign:"left",fontSize:11.5,fontWeight:700,color:"#5E6B82",textTransform:"uppercase",letterSpacing:"0.05em",whiteSpace:"nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => {
                  const qty = Number(item.quantity ?? item.qty ?? 0);
                  const price = Number(item.unitPrice || item.rate || item.price || 0);
                  const total = Number(item.totalAmount || item.amount || (qty*price) || 0);
                  return (
                    <tr key={i} style={{ borderBottom:"1px solid #f1f5f9" }}>
                      <td style={{ padding:"12px 14px",fontSize:13,color:"#8893A7",fontWeight:600 }}>{i+1}</td>
                      <td style={{ padding:"12px 14px",fontSize:13.5,fontWeight:700,color:"#24345C" }}>{item.productName||item.product_name||item.name||"—"}</td>
                      <td style={{ padding:"12px 14px",fontSize:13.5,fontWeight:700 }}>{qty||"—"}</td>
                      <td style={{ padding:"12px 14px",fontSize:13,color:"#475569" }}>{item.unit||item.uom||"Units"}</td>
                      <td style={{ padding:"12px 14px",fontSize:13,color:"#475569" }}>{price?`\u20B9${price.toLocaleString("en-IN")}`:"—"}</td>
                      <td style={{ padding:"12px 14px",fontSize:13,fontWeight:700,color:"#15803d" }}>{total?`\u20B9${total.toLocaleString("en-IN")}`:"—"}</td>
                      <td style={{ padding:"12px 14px",fontSize:12,color:"#5E6B82" }}>{item.hsnCode||item.hsn||"—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop:14,display:"flex",justifyContent:"flex-end" }}>
            <div style={{ background:"#F5FAFE",border:"1px solid #e5e7eb",borderRadius:10,padding:"14px 20px",minWidth:240 }}>
              {[{label:"Sub Total",value:order.subTotal,neg:false},{label:"Discount",value:order.discountAmount,neg:true},{label:"Tax (GST)",value:order.taxAmount,neg:false},{label:"Freight",value:order.freightCharges,neg:false}].filter(r=>r.value).map(row=>(
                <div key={row.label} style={{ display:"flex",justifyContent:"space-between",padding:"4px 0",fontSize:13,color:"#475569" }}>
                  <span>{row.label}</span>
                  <span style={{ color:row.neg?"#dc2626":"#374151",fontWeight:600 }}>{row.neg?"-":""}\u20B9{Number(row.value).toLocaleString("en-IN")}</span>
                </div>
              ))}
              <div style={{ borderTop:"2px solid #e5e7eb",marginTop:8,paddingTop:8,display:"flex",justifyContent:"space-between",fontSize:15,fontWeight:800,color:"#24345C" }}>
                <span>Grand Total</span>
                <span style={{ color:"#15803d" }}>\u20B9{totalAmount.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:20 }}>
        <div style={{ background:"#fff",border:"1px solid #e5e7eb",borderRadius:14,padding:20 }}>
          <div style={{ fontWeight:800,fontSize:14,color:"#24345C",marginBottom:14,display:"flex",alignItems:"center",gap:7 }}><Truck size={16} color="#a6d53d" />Dispatch Information</div>
          {dispatchRec ? (
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
              <InfoCard icon={Hash} label="Dispatch ID" value={dispatchRec.id||dispatchRec.dispatchId} />
              <InfoCard icon={Truck} label="Vehicle No" value={dispatchRec.vehicleNo||dispatchRec.vehicle_number} />
              <InfoCard icon={User} label="Driver Name" value={dispatchRec.driverName||dispatchRec.driver_name} />
              <InfoCard icon={User} label="Driver Mobile" value={dispatchRec.driverMobile} />
              <InfoCard icon={FileText} label="LR Number" value={dispatchRec.lrNumber} />
              <InfoCard icon={FileText} label="E-Way Bill" value={dispatchRec.ewayBill} />
              <InfoCard icon={Package} label="Dispatched Qty" value={dispatchRec.quantity} highlight />
              <InfoCard icon={Clock} label="Dispatch Status" value={dispatchRec.status||dispatchRec.dispatchStatus} highlight />
            </div>
          ) : <div style={{ color:"#8893A7",fontSize:13,fontStyle:"italic",padding:"20px 0",textAlign:"center" }}>No dispatch record yet</div>}
        </div>

        <div style={{ background:"#fff",border:"1px solid #e5e7eb",borderRadius:14,padding:20 }}>
          <div style={{ fontWeight:800,fontSize:14,color:"#24345C",marginBottom:14,display:"flex",alignItems:"center",gap:7 }}><Clock size={16} color="#a6d53d" />Activity Timeline</div>
          {timeline.length > 0 ? (
            <div style={{ display:"flex",flexDirection:"column" }}>
              {timeline.map((ev, i) => (
                <div key={i} style={{ display:"flex",gap:12,paddingBottom:i<timeline.length-1?16:0 }}>
                  <div style={{ display:"flex",flexDirection:"column",alignItems:"center" }}>
                    <div style={{ width:10,height:10,borderRadius:"50%",background:i===0?"#a6d53d":"#D6E2F0",border:`2px solid ${i===0?"#7baa1e":"#DCE5F0"}`,flexShrink:0,marginTop:3 }} />
                    {i<timeline.length-1 && <div style={{ width:2,flex:1,background:"#DCE5F0",marginTop:4 }} />}
                  </div>
                  <div>
                    <div style={{ fontSize:13,fontWeight:700,color:"#24345C" }}>{ev.event||ev.status}</div>
                    {ev.actor && <div style={{ fontSize:11.5,color:"#5E6B82",marginTop:2 }}>By {ev.actor} · {ev.department}</div>}
                    {ev.timestamp && <div style={{ fontSize:11,color:"#8893A7",marginTop:2 }}>{new Date(ev.timestamp).toLocaleString("en-IN")}</div>}
                  </div>
                </div>
              ))}
            </div>
          ) : <div style={{ color:"#8893A7",fontSize:13,fontStyle:"italic",padding:"20px 0",textAlign:"center" }}>No timeline events recorded</div>}
        </div>
      </div>
    </div>
  );
}
