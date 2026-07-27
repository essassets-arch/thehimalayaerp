module.exports=[940965,a=>{"use strict";a.s(["default",()=>y],940965);var b=a.i(187924),c=a.i(572131);let d=(a,b)=>{if(!b)return"";let c=String(b).trim().toLowerCase(),d=(a.leads||[]).find(a=>String(a.companyName||"").trim().toLowerCase()===c);if(d&&(d.phone||d.siteInchargeMobile))return d.phone||d.siteInchargeMobile;let e=(a.customers||[]).find(a=>String(a.name||"").trim().toLowerCase()===c);return e&&e.phone?e.phone:""};var e=a.i(866491),f=a.i(752562),g=a.i(470944),h=a.i(390702),i=a.i(483138),j=a.i(853704),k=a.i(308658),l=a.i(39157),m=a.i(63331),n=a.i(924613);let o={Lead:{icon:e.Phone,badgeClass:"badge-follow-up",color:"#d97706",bgColor:"rgba(217, 119, 6, 0.08)"},Sample:{icon:j.FlaskConical,badgeClass:"badge-sent",color:"#0284c7",bgColor:"rgba(2, 132, 199, 0.08)"},Quotation:{icon:i.FileText,badgeClass:"badge-new",color:"#1e40af",bgColor:"rgba(30, 64, 175, 0.08)"},Order:{icon:m.Box,badgeClass:"badge-confirmed",color:"#4338ca",bgColor:"rgba(67, 56, 202, 0.08)"},Production:{icon:n.Wrench,badgeClass:"badge-processing",color:"#b45309",bgColor:"rgba(180, 83, 9, 0.08)"},Payment:{icon:l.CreditCard,badgeClass:"badge-outstanding",color:"#dc2626",bgColor:"rgba(220, 38, 38, 0.08)"}};function p({task:a,onDone:c,onReschedule:d}){var e;let i=o[a.type]||{icon:k.Layers,badgeClass:"badge-pending",color:"#4b5563",bgColor:"rgba(75, 85, 99, 0.08)"},j=i.icon,l="Overdue"===a.status;return(0,b.jsxs)("div",{className:`app-card task-card ${l?"task-card-overdue":""}`,style:{padding:"10px 14px",borderRadius:"14px",border:"1px solid var(--color-border)",borderLeft:l?"4px solid #ef4444":`4px solid ${i.color}`,background:"#ffffff",display:"flex",flexDirection:"column",gap:"6px",boxShadow:l?"0 4px 20px rgba(239, 68, 68, 0.05)":"var(--shadow-card)",transition:"var(--transition-smooth)",position:"relative"},children:[(0,b.jsxs)("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between"},children:[(0,b.jsxs)("span",{className:`badge ${i.badgeClass}`,style:{display:"inline-flex",alignItems:"center",gap:"5px",fontWeight:"800",fontSize:"9.5px",textTransform:"uppercase",letterSpacing:"0.05em",padding:"3px 6px"},children:[(0,b.jsx)(j,{size:9,style:{strokeWidth:3}}),a.type]}),l&&(0,b.jsxs)("span",{className:"badge badge-overdue animate-pulse",style:{display:"inline-flex",alignItems:"center",gap:"4px",fontWeight:"800",fontSize:"9.5px",textTransform:"uppercase",letterSpacing:"0.05em",padding:"3px 6px"},children:[(0,b.jsx)(h.AlertTriangle,{size:9,style:{strokeWidth:3}}),"Overdue"]})]}),(0,b.jsxs)("div",{children:[(0,b.jsxs)("h3",{style:{fontSize:"14px",fontWeight:"800",color:"var(--color-text-primary)",letterSpacing:"-0.3px",marginBottom:"2px",display:"flex",alignItems:"center",justifyContent:"space-between"},children:[(0,b.jsx)("span",{children:a.clientName}),a.amount>0&&(0,b.jsx)("span",{style:{fontSize:"13px",fontWeight:"800",color:i.color},children:(e=a.amount)?e>=1e5?`₹${(e/1e5).toFixed(2)} L`:`₹${e.toLocaleString("en-IN")}`:null})]}),(0,b.jsx)("p",{style:{fontSize:"12px",color:"var(--color-text-secondary)",lineHeight:"1.35",fontWeight:"500",whiteSpace:"pre-wrap",margin:"0"},children:a.notes})]}),(0,b.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:"5px",fontSize:"10.5px",color:l?"#ef4444":"var(--color-text-muted)",fontWeight:"700"},children:[(0,b.jsx)(g.Calendar,{size:11}),(0,b.jsxs)("span",{children:["Action Date: ",a.followUpDate]})]}),(0,b.jsxs)("div",{className:"task-actions",style:{display:"flex",justifyContent:"flex-end",gap:"6px",marginTop:"0px",borderTop:"1px solid #f1f5f9",paddingTop:"6px"},children:[(0,b.jsxs)("button",{type:"button",className:"btn-small btn-outline-small task-card-btn",style:{display:"inline-flex",alignItems:"center",justifyContent:"center",gap:"4px",borderColor:"var(--color-border)",fontWeight:"700",padding:"5px 10px",minWidth:"85px",flex:"none"},onClick:()=>d(a),children:[(0,b.jsx)(g.Calendar,{size:10,strokeWidth:2.5}),"Reschedule"]}),(0,b.jsxs)("button",{type:"button",className:"btn-small btn-primary-small task-card-btn",style:{display:"inline-flex",alignItems:"center",justifyContent:"center",gap:"4px",background:"var(--color-lime-brand)",border:"none",color:"var(--color-text-primary)",fontWeight:"800",boxShadow:"none",padding:"5px 10px",minWidth:"85px",flex:"none"},onClick:()=>c(a),children:[(0,b.jsx)(f.Check,{size:10,strokeWidth:3}),"Done"]})]})]})}var q=a.i(641544),r=a.i(343419),s=a.i(79362),t=a.i(308311),u=a.i(97546),v=a.i(233540),w=a.i(474215),x=a.i(853046);function y({state:a,dispatch:e,navigate:f,showToast:h,module:i="Sales"}){let[j,k]=(0,c.useState)("2026-06-15"),[l,m]=(0,c.useState)(""),[n,o]=(0,c.useState)("All"),[y,z]=(0,c.useState)(null),[A,B]=(0,c.useState)(""),C=a?.leads||[],D=a?.quotations||[],E=new Date(j+"T00:00:00").getTime(),F=C.filter(a=>!!a.followUpDate&&new Date(a.followUpDate).getTime()<=E&&"Converted"!==a.status&&"Lost"!==a.status),G=D.filter(a=>!!a.validTill&&new Date(a.validTill).getTime()<=E+1728e5&&"Approved"!==a.status&&"Closed"!==a.status),H=((a,b)=>{let c=b||(()=>{let a=new Date,b=a.getTimezoneOffset();return new Date(a.getTime()-60*b*1e3).toISOString().split("T")[0]})(),e=[],f=a.leads||[],g=a.samples||[],h=a.quotations||[],i=a.orders||[],j=a.payments||[];return f.forEach(a=>{if(a.followUpDate&&"Converted"!==a.status&&"Lost"!==a.status){let b=a.followUpDate<c;e.push({id:`LD-${a.id}`,sourceId:a.id,clientName:a.companyName,type:"Lead",status:b?"Overdue":"Pending",followUpDate:a.followUpDate,notes:a.notes||a.requirements||"Follow up on client requirements",amount:a.budget||0,phone:a.phone||a.siteInchargeMobile||"",rawEntity:a})}}),g.forEach(b=>{if(b.followUpDate||"Pending"===b.status){let f=b.followUpDate||b.dispatchDate||c,g=f<c;e.push({id:`SMP-${b.id}`,sourceId:b.id,clientName:b.leadName,type:"Sample",status:g?"Overdue":"Pending"===b.status?"Pending":"Completed",followUpDate:f,notes:`Test Sample: ${b.product} (Qty: ${b.quantity})`,amount:0,phone:d(a,b.leadName),rawEntity:b})}}),h.forEach(b=>{if(b.followUpDate||"Draft"===b.status||"Sent"===b.status){let f=b.followUpDate||b.validTill||c,g=f<c;e.push({id:`QT-${b.id}`,sourceId:b.id,clientName:b.customerName,type:"Quotation",status:g?"Overdue":"Pending",followUpDate:f,notes:`Quotation #${b.id}: ${b.items} (Valid Till: ${b.validTill||"N/A"})`,amount:b.totalAmount||0,phone:d(a,b.customerName),rawEntity:b})}}),i.forEach(b=>{let f=b.customer?.name||b.customerName||"Unknown Customer";if(("Pending"===b.status||"Pending"===b.salesStatus||"PENDING_PLANT_HEAD"===b.status||"Pending Confirmation"===b.status)&&e.push({id:`ORD-${b.orderNo}`,sourceId:b.orderNo,clientName:f,type:"Order",status:"Pending",followUpDate:b.date||c,notes:`Verify Order confirmation for ${b.products}`,amount:b.payment?.totalAmount||b.totalValue||0,phone:d(a,f),rawEntity:b}),b.deliveryDate){let g=b.deliveryDate<c,h="Pending"===b.productionStatus&&g;e.push({id:`PROD-${b.orderNo}`,sourceId:b.orderNo,clientName:f,type:"Production",status:g?"Overdue":"Pending",followUpDate:b.deliveryDate,notes:`Production stage: ${b.overallStage||b.productionStatus||"Running"} (${h?"DELAYED":"ON TRACK"})`,amount:b.payment?.totalAmount||b.totalValue||0,phone:d(a,f),rawEntity:b})}}),j.forEach(b=>{if("Outstanding"===b.status&&b.dueDate){let f=b.dueDate<c;e.push({id:`PM-${b.id}`,sourceId:b.id,clientName:b.customerName,type:"Payment",status:f?"Overdue":"Pending",followUpDate:b.dueDate,notes:`Outstanding Invoice #${b.invoiceNo} (Remaining: ₹${((b.totalAmount||0)-(b.paidAmount||0)).toLocaleString("en-IN")})`,amount:(b.totalAmount||0)-(b.paidAmount||0),phone:d(a,b.customerName),rawEntity:b})}}),e})(a,j);"Finance"===i?H=H.filter(a=>["Payment","Order","Production"].includes(a.type)):"Sales"===i&&(H=H.filter(a=>["Lead","Quotation","Sample"].includes(a.type)));let I=H.length,J=H.filter(a=>"Overdue"===a.status).length,[K,L]=(0,c.useState)([]),M=H.filter(a=>!K.includes(a.id)),N=K.length,O=M.filter(a=>"Overdue"===a.status||"Payment"===a.type).length,P=M.filter(a=>{let b=(l||"").toLowerCase(),c=a.clientName?.toLowerCase().includes(b)||a.notes?.toLowerCase().includes(b)||!1,d=!1;return"All"===n||"Leads"===n&&"Lead"===a.type||"Quotations"===n&&"Quotation"===a.type||"Payments"===n&&"Payment"===a.type||"Orders"===n&&("Order"===a.type||"Production"===a.type)?d=!0:"Samples"===n&&"Sample"===a.type&&(d=!0),c&&d}),Q=a=>{x.default.fire({title:"Complete Task?",text:`Mark this ${a.type} task for "${a.clientName}" as resolved?`,icon:"success",showCancelButton:!0,confirmButtonText:"Yes, Complete",cancelButtonText:"Cancel",customClass:{popup:"swal-premium-popup",title:"swal-premium-title",htmlContainer:"swal-premium-text",confirmButton:"swal-premium-confirm-btn",cancelButton:"swal-premium-cancel-btn"},buttonsStyling:!1}).then(b=>{b.isConfirmed&&R(a.id,"Task marked completed")})},R=(b,c)=>{let d=b.split("-")[0],f=b.replace(`${d}-`,"");if("LD"===d){let b=(a.sales?.leads||[]).find(a=>String(a.id)===f);if(b){let a=[...b.timeline||[],{stage:"Follow-up Completed",text:c,date:j,timestamp:Date.now()}];e({type:"UPDATE_LEAD",payload:{id:Number(f),followUpDate:null,timeline:a}})}}else"SMP"===d?e({type:"UPDATE_SAMPLE",payload:{id:Number(f),followUpDate:null,status:"Approved"}}):"QT"===d?e({type:"UPDATE_QUOTATION",payload:{id:Number(f),followUpDate:null,status:"Sent"}}):"ORD"===d?e({type:"UPDATE_ORDER",payload:{orderNo:f,status:"Created",salesStatus:"Confirmed",overallStage:"Created",currentDepartment:"Plant Head",timeline:[{stage:"Created",timestamp:Date.now(),remarks:"Purchase order confirmed by Sales via Daily Tasks"}]}}):"PROD"===d?e({type:"UPDATE_ORDER",payload:{orderNo:f,deliveryDate:null,productionStatus:"Completed",overallStage:"Production Completed"}}):"PM"===d&&e({type:"RECEIVE_PAYMENT",payload:{paymentUpdate:{id:Number(f),status:"Paid",verified:"Verified",paidAmount:a.payments.find(a=>String(a.id)===String(f))?.totalAmount||0}}});L([...K,b]),h(`Task ${b} completed successfully!`)},S=a=>{z(a),B(a.followUpDate||j)};return(0,b.jsxs)("div",{className:"daily-task-viewport",style:{paddingBottom:"40px"},children:[(0,b.jsx)("style",{dangerouslySetInnerHTML:{__html:`
        .daily-task-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }
        .daily-task-visuals-grid {
          display: grid;
          grid-template-columns: 1fr 1.5fr 1fr;
          gap: 20px;
          margin-bottom: 24px;
        }
        .tasks-layout-row {
          display: grid;
          grid-template-columns: 2.2fr 1fr;
          gap: 24px;
        }
        .task-grid-container {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 16px;
        }
        .task-card {
          max-width: 480px;
          width: 100%;
        }
        .task-card-btn {
          width: auto !important;
          flex: 0 0 auto !important;
          min-width: 85px !important;
          padding: 5px 12px !important;
          height: 30px !important;
          font-size: 11px !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        @media (max-width: 1024px) {
          .daily-task-stats-grid { grid-template-columns: repeat(2, 1fr); }
          .daily-task-visuals-grid { grid-template-columns: 1fr; }
          .tasks-layout-row { grid-template-columns: 1fr; }
        }
        @media (max-width: 768px) {
          .daily-task-viewport {
            padding-left: 16px !important;
            padding-right: 16px !important;
            padding-top: 16px !important;
          }
          .daily-task-viewport .hero-banner.compact {
            margin: 0 0 16px 0 !important;
            width: 100% !important;
          }
          .daily-task-stats-grid {
            gap: 12px !important;
          }
          .stats-card {
            padding: 12px 16px !important;
          }
          .hero-banner.compact .hero-top-row, .hero-top-row {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 16px !important;
          }
          .hero-top-row > div {
            width: 100% !important;
          }
        }
        @media (max-width: 480px) {
          .daily-task-stats-grid { 
            grid-template-columns: repeat(2, 1fr) !important; 
          }
          .stats-card {
            padding: 10px 14px !important;
          }
          .task-actions {
            flex-direction: column !important;
            gap: 6px !important;
          }
          .task-card-btn {
            width: 100% !important;
            flex: 1 1 auto !important;
            padding: 8px 12px !important;
            height: 36px !important;
            font-size: 12.5px !important;
          }
        }
        .filter-tab-bar {
          display: flex;
          gap: 8px;
          background: #f1f3f5;
          padding: 6px;
          border-radius: 12px;
          overflow-x: auto;
          margin-bottom: 16px;
        }
        .filter-tab-bar::-webkit-scrollbar { display: none; }
        .filter-tab-btn {
          padding: 8px 16px;
          border-radius: 8px;
          border: 1px solid transparent;
          font-size: 12px;
          font-weight: 700;
          color: var(--color-text-secondary);
          background: transparent;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        .filter-tab-btn:hover {
          color: var(--color-text-primary);
          background: rgba(0, 0, 0, 0.04);
        }
        .filter-tab-btn.active {
          box-shadow: 0 2px 6px rgba(0,0,0,0.06);
        }
        .card-visual-container {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 10px 0;
          min-height: 120px;
        }
        .heatmap-square {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }
        .heatmap-square:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }
        .tooltip-custom {
          display: none;
          position: absolute;
          bottom: 34px;
          left: 50%;
          transform: translateX(-50%);
          background: #000000;
          color: #ffffff;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 9px;
          white-space: nowrap;
          z-index: 100;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        .tooltip-custom::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border-width: 4px;
          border-style: solid;
          border-color: #000000 transparent transparent transparent;
        }
        .heatmap-square:hover .tooltip-custom {
          display: block;
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
      `}}),(0,b.jsx)("div",{className:"hero-banner compact",style:{minHeight:"auto"},children:(0,b.jsxs)("div",{className:"hero-top-row",children:[(0,b.jsxs)("div",{children:[(0,b.jsx)("span",{style:{fontSize:"12px",fontWeight:"800",textTransform:"uppercase",color:"var(--color-lime-brand)",letterSpacing:"1px"},children:"Sales Operations Hub"}),(0,b.jsx)("h1",{className:"brand-title",style:{fontSize:"26px",marginTop:"4px"},children:"🎯 Daily Action Center"}),(0,b.jsx)("p",{style:{color:"rgba(255,255,255,0.7)",fontSize:"13px",marginTop:"4px",fontWeight:"500"},children:"Data-driven follow-ups, confirmation checks, sample feedback, and outstanding receipts."})]}),(0,b.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:"8px",background:"rgba(255,255,255,0.15)",padding:"6px 12px",borderRadius:"12px",border:"1px solid rgba(255,255,255,0.2)",width:"fit-content"},children:[(0,b.jsx)(g.Calendar,{size:14,style:{color:"#fff"}}),(0,b.jsx)("span",{style:{color:"#fff",fontSize:"12.5px",fontWeight:"700"},children:"Schedule Date:"}),(0,b.jsx)("input",{type:"date",value:j,onChange:a=>{k(a.target.value),L([])},style:{border:"none",background:"transparent",color:"#ffffff",fontWeight:"800",fontSize:"12.5px",cursor:"pointer",outline:"none"}})]})]})}),(0,b.jsxs)("div",{className:"daily-task-stats-grid",children:[(0,b.jsxs)("div",{className:"app-card stats-card",style:{padding:"16px 20px",borderRadius:"20px",background:"#ffffff",border:"1px solid var(--color-border)"},children:[(0,b.jsxs)("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center"},children:[(0,b.jsx)("span",{style:{fontSize:"11px",fontWeight:"700",color:"var(--color-text-secondary)",textTransform:"uppercase"},children:"Today's Tasks"}),(0,b.jsx)("div",{style:{background:"rgba(51, 122, 134, 0.1)",color:"var(--color-accent-teal)",padding:"6px",borderRadius:"50%"},children:(0,b.jsx)(q.ClipboardList,{size:16})})]}),(0,b.jsx)("div",{style:{marginTop:"12px"},children:(0,b.jsx)("span",{style:{fontSize:"28px",fontWeight:"800",color:"var(--color-text-primary)",letterSpacing:"-1px"},children:I})})]}),(0,b.jsxs)("div",{className:"app-card stats-card",style:{padding:"16px 20px",borderRadius:"20px",background:"#ffffff",border:"1px solid var(--color-border)"},children:[(0,b.jsxs)("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center"},children:[(0,b.jsx)("span",{style:{fontSize:"11px",fontWeight:"700",color:"var(--color-text-secondary)",textTransform:"uppercase"},children:"High Priority"}),(0,b.jsx)("div",{style:{background:"rgba(239, 68, 68, 0.1)",color:"#dc2626",padding:"6px",borderRadius:"50%"},children:(0,b.jsx)(r.TrendingUp,{size:16})})]}),(0,b.jsx)("div",{style:{marginTop:"12px"},children:(0,b.jsx)("span",{style:{fontSize:"28px",fontWeight:"800",color:"#dc2626",letterSpacing:"-1px"},children:O})})]}),(0,b.jsxs)("div",{className:"app-card stats-card",style:{padding:"16px 20px",borderRadius:"20px",background:"#ffffff",border:"1px solid var(--color-border)"},children:[(0,b.jsxs)("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center"},children:[(0,b.jsx)("span",{style:{fontSize:"11px",fontWeight:"700",color:"var(--color-text-secondary)",textTransform:"uppercase"},children:"Overdue Action"}),(0,b.jsx)("div",{style:{background:"rgba(239, 68, 68, 0.1)",color:"#ef4444",padding:"6px",borderRadius:"50%"},children:(0,b.jsx)(t.Clock,{size:16,className:J>0?"animate-pulse":""})})]}),(0,b.jsx)("div",{style:{marginTop:"12px"},children:(0,b.jsx)("span",{style:{fontSize:"28px",fontWeight:"800",color:"#ef4444",letterSpacing:"-1px"},children:J})})]}),(0,b.jsxs)("div",{className:"app-card stats-card",style:{padding:"16px 20px",borderRadius:"20px",background:"#ffffff",border:"1px solid var(--color-border)"},children:[(0,b.jsxs)("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center"},children:[(0,b.jsx)("span",{style:{fontSize:"11px",fontWeight:"700",color:"var(--color-text-secondary)",textTransform:"uppercase"},children:"Completed Tasks"}),(0,b.jsx)("div",{style:{background:"rgba(34, 197, 94, 0.1)",color:"#166534",padding:"6px",borderRadius:"50%"},children:(0,b.jsx)(s.CheckCircle,{size:16})})]}),(0,b.jsx)("div",{style:{marginTop:"12px"},children:(0,b.jsx)("span",{style:{fontSize:"28px",fontWeight:"800",color:"#166534",letterSpacing:"-1px"},children:N})})]})]}),(0,b.jsxs)("div",{className:"tasks-layout-row",children:[(0,b.jsxs)("div",{style:{minWidth:0},children:[(0,b.jsx)("div",{className:"filter-tab-bar",children:[{id:"All",label:"All Tasks",bg:"var(--color-accent-teal)",color:"#ffffff",border:"1px solid var(--color-accent-teal)"},{id:"Leads",label:"📞 Leads",bg:"#fffbeb",color:"#b45309",border:"1px solid #fde68a"},{id:"Quotations",label:"📄 Quotations",bg:"#eff6ff",color:"#1e40af",border:"1px solid #bfdbfe"},{id:"Payments",label:"💰 Payments",bg:"#fef2f2",color:"#dc2626",border:"1px solid #fecaca"},{id:"Orders",label:"🏭 Orders & Prod.",bg:"#e0e7ff",color:"#4338ca",border:"1px solid #c7d2fe"},{id:"Samples",label:"🧪 Samples",bg:"#e0f2fe",color:"#0284c7",border:"1px solid #bae6fd"}].filter(a=>"Finance"===i?["All","Payments","Orders"].includes(a.id):"Sales"!==i||["All","Leads","Quotations","Samples"].includes(a.id)).map(a=>{let c=n===a.id;return(0,b.jsx)("button",{className:`filter-tab-btn ${c?"active":""}`,style:c?{backgroundColor:a.bg,color:a.color,border:a.border}:{},onClick:()=>o(a.id),children:a.label},a.id)})}),(0,b.jsxs)("div",{style:{position:"relative",marginBottom:"16px"},children:[(0,b.jsx)("input",{type:"text",className:"form-input",placeholder:"Search tasks by client or remarks...",value:l,onChange:a=>m(a.target.value),style:{width:"100%",paddingLeft:"40px",height:"42px",borderRadius:"12px",background:"#ffffff",border:"1px solid var(--color-border)",fontSize:"13px"}}),(0,b.jsx)(v.Search,{size:16,style:{position:"absolute",left:"14px",top:"50%",transform:"translateY(-50%)",color:"var(--color-text-muted)"}})]}),(0,b.jsx)("div",{className:"task-grid-container",children:0===P.length?(0,b.jsxs)("div",{className:"app-card",style:{padding:"40px 20px",borderRadius:"20px",textAlign:"center",color:"var(--color-text-muted)",background:"#ffffff",border:"1px solid var(--color-border)",display:"flex",flexDirection:"column",alignItems:"center",gap:"12px"},children:[(0,b.jsx)("div",{style:{background:"#F5FAFE",color:"var(--color-text-muted)",padding:"16px",borderRadius:"50%",display:"inline-flex"},children:(0,b.jsx)(s.CheckCircle,{size:32})}),(0,b.jsxs)("div",{children:[(0,b.jsx)("h3",{style:{fontSize:"15px",fontWeight:"800",color:"var(--color-text-primary)"},children:"All Tasks Cleared!"}),(0,b.jsxs)("p",{style:{fontSize:"12px",color:"var(--color-text-secondary)",marginTop:"4px"},children:["No pending items match this filter for ",j,"."]})]})]}):P.map(a=>(0,b.jsx)(p,{task:a,onDone:Q,onReschedule:S},a.id))})]}),(0,b.jsx)("div",{style:{display:"flex",flexDirection:"column",gap:"16px",minWidth:0},children:(0,b.jsxs)("div",{className:"app-card",style:{background:"#ffffff",border:"1px solid var(--color-border)",borderRadius:"20px",padding:"20px",boxShadow:"var(--shadow-premium)",display:"flex",flexDirection:"column",gap:"16px"},children:[(0,b.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:"8px",color:"#dc2626"},children:[(0,b.jsx)(u.AlertCircle,{size:18}),(0,b.jsx)("span",{style:{fontSize:"14px",fontWeight:"800",textTransform:"uppercase",letterSpacing:"0.5px"},children:"At Risk Deals"})]}),(0,b.jsxs)("div",{style:{display:"flex",flexDirection:"column",gap:"12px"},children:[F.map(a=>(0,b.jsxs)("div",{style:{background:"#fff5f5",border:"1px solid #fee2e2",borderRadius:"12px",padding:"12px",display:"flex",justifyContent:"space-between",alignItems:"center",gap:"10px"},children:[(0,b.jsxs)("div",{style:{minWidth:0,flex:1},children:[(0,b.jsx)("span",{style:{fontSize:"13px",fontWeight:"800",color:"#991b1b",display:"block",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},children:a.companyName}),(0,b.jsxs)("span",{style:{fontSize:"11px",color:"#dc2626",display:"block",marginTop:"2px"},children:["Followup overdue since ",a.followUpDate]})]}),(0,b.jsx)("button",{onClick:()=>"function"==typeof f?f("/sales/leads"):f?.push?.("/sales/leads"),style:{background:"#ef4444",color:"#ffffff",border:"none",padding:"6px 12px",borderRadius:"8px",fontSize:"11px",fontWeight:"800",cursor:"pointer",whiteSpace:"nowrap"},children:"Contact"})]},a.id)),G.map(a=>(0,b.jsxs)("div",{style:{background:"#fff5f5",border:"1px solid #fee2e2",borderRadius:"12px",padding:"12px",display:"flex",justifyContent:"space-between",alignItems:"center",gap:"10px"},children:[(0,b.jsxs)("div",{style:{minWidth:0,flex:1},children:[(0,b.jsx)("span",{style:{fontSize:"13px",fontWeight:"800",color:"#991b1b",display:"block",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},children:a.customerName}),(0,b.jsxs)("span",{style:{fontSize:"11px",color:"#dc2626",display:"block",marginTop:"2px"},children:["Proposal expires on ",a.validTill]})]}),(0,b.jsx)("button",{onClick:()=>"function"==typeof f?f("/sales/quotations"):f?.push?.("/sales/quotations"),style:{background:"#ef4444",color:"#ffffff",border:"none",padding:"6px 12px",borderRadius:"8px",fontSize:"11px",fontWeight:"800",cursor:"pointer",whiteSpace:"nowrap"},children:"Renew"})]},a.id)),0===F.length&&0===G.length&&(0,b.jsx)("div",{style:{padding:"20px 0",textAlign:"center",color:"var(--color-text-muted)",fontSize:"12px",fontWeight:"600"},children:"No immediate risks detected."})]})]})})]}),y&&(0,b.jsx)("div",{className:"modal-overlay active",onClick:()=>z(null),children:(0,b.jsxs)("div",{className:"modal-box",onClick:a=>a.stopPropagation(),style:{width:"420px",borderRadius:"20px",padding:"24px"},children:[(0,b.jsxs)("div",{className:"modal-header-row",style:{borderBottom:"1px solid #eaeaea",paddingBottom:"12px",marginBottom:"16px"},children:[(0,b.jsxs)("h3",{className:"modal-title-text",style:{display:"flex",alignItems:"center",gap:"8px",fontSize:"16px",fontWeight:"800"},children:[(0,b.jsx)(g.Calendar,{size:18,style:{color:"#d97706"}}),(0,b.jsx)("span",{children:"Reschedule Follow-up"})]}),(0,b.jsx)("button",{className:"modal-close-btn",onClick:()=>z(null),style:{border:"none",background:"transparent",cursor:"pointer",fontSize:"16px"},children:(0,b.jsx)(w.X,{size:18})})]}),(0,b.jsxs)("div",{style:{marginBottom:"16px"},children:[(0,b.jsx)("p",{style:{fontSize:"13px",fontWeight:"700",color:"var(--color-text-primary)"},children:y.clientName}),(0,b.jsxs)("p",{style:{fontSize:"11px",color:"var(--color-text-secondary)",marginTop:"2px"},children:["Type: ",y.type," | Current: ",y.followUpDate]})]}),(0,b.jsxs)("form",{onSubmit:a=>{if(a.preventDefault(),!A||!y)return;let b=y.id,c=b.split("-")[0],d=b.replace(`${c}-`,"");"LD"===c?e({type:"UPDATE_LEAD",payload:{id:Number(d),followUpDate:A}}):"SMP"===c?e({type:"UPDATE_SAMPLE",payload:{id:Number(d),followUpDate:A}}):"QT"===c?e({type:"UPDATE_QUOTATION",payload:{id:Number(d),followUpDate:A}}):"ORD"===c?e({type:"UPDATE_ORDER",payload:{orderNo:d,date:A}}):"PROD"===c?e({type:"UPDATE_ORDER",payload:{orderNo:d,deliveryDate:A}}):"PM"===c&&e({type:"RECEIVE_PAYMENT",payload:{paymentUpdate:{id:Number(d),dueDate:A}}}),h(`Task rescheduled to ${A}`),z(null)},children:[(0,b.jsxs)("div",{className:"form-group",style:{marginBottom:"20px"},children:[(0,b.jsx)("label",{className:"form-label",style:{fontWeight:"700",fontSize:"12px"},children:"Choose New Date *"}),(0,b.jsx)("input",{type:"date",className:"form-input",value:A,onChange:a=>B(a.target.value),style:{borderRadius:"10px"},required:!0})]}),(0,b.jsxs)("div",{className:"form-actions",style:{display:"flex",gap:"8px",justifyContent:"flex-end",marginTop:"16px"},children:[(0,b.jsx)("button",{type:"button",className:"btn-small btn-outline-small",onClick:()=>z(null),children:"Cancel"}),(0,b.jsx)("button",{type:"submit",className:"btn-small btn-primary-small",style:{background:"#d97706",border:"none",color:"#fff",fontWeight:"700"},children:"Save Date"})]})]})]})})]})}}];

//# sourceMappingURL=components_DailyTaskView_jsx_622f7d0a._.js.map