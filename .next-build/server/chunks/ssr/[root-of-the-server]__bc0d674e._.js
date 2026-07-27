module.exports=[909270,(a,b,c)=>{"use strict";b.exports=a.r(342602).vendored.contexts.AppRouterContext},736313,(a,b,c)=>{"use strict";b.exports=a.r(342602).vendored.contexts.HooksClientContext},818341,(a,b,c)=>{"use strict";b.exports=a.r(342602).vendored.contexts.ServerInsertedHtml},918622,(a,b,c)=>{b.exports=a.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},556704,(a,b,c)=>{b.exports=a.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},832319,(a,b,c)=>{b.exports=a.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},120635,(a,b,c)=>{b.exports=a.x("next/dist/server/app-render/action-async-storage.external.js",()=>require("next/dist/server/app-render/action-async-storage.external.js"))},342602,(a,b,c)=>{"use strict";b.exports=a.r(918622)},187924,(a,b,c)=>{"use strict";b.exports=a.r(342602).vendored["react-ssr"].ReactJsxRuntime},572131,(a,b,c)=>{"use strict";b.exports=a.r(342602).vendored["react-ssr"].React},935112,(a,b,c)=>{"use strict";b.exports=a.r(342602).vendored["react-ssr"].ReactDOM},162591,a=>{"use strict";a.s(["Mail",()=>b.default]);var b=a.i(287828)},238010,920226,862435,a=>{"use strict";a.s(["useAuthStore",()=>h],238010),a.s(["create",()=>e],920226);var b=a.i(572131);let c=a=>{let b,c=new Set,d=(a,d)=>{let e="function"==typeof a?a(b):a;if(!Object.is(e,b)){let a=b;b=(null!=d?d:"object"!=typeof e||null===e)?e:Object.assign({},b,e),c.forEach(c=>c(b,a))}},e=()=>b,f={setState:d,getState:e,getInitialState:()=>g,subscribe:a=>(c.add(a),()=>c.delete(a))},g=b=a(d,e,f);return f},d=a=>{let d=(a=>a?c(a):c)(a),e=a=>(function(a,c=a=>a){let d=b.default.useSyncExternalStore(a.subscribe,b.default.useCallback(()=>c(a.getState()),[a,c]),b.default.useCallback(()=>c(a.getInitialState()),[a,c]));return b.default.useDebugValue(d),d})(d,a);return Object.assign(e,d),e},e=a=>a?d(a):d;a.s(["persist",()=>g],862435);let f=a=>b=>{try{let c=a(b);if(c instanceof Promise)return c;return{then:a=>f(a)(c),catch(a){return this}}}catch(a){return{then(a){return this},catch:b=>f(b)(a)}}},g=(a,b)=>(c,d,e)=>{let g,h={storage:function(a,b){let c;try{c=a()}catch(a){return}return{getItem:a=>{var b;let d=a=>null===a?null:JSON.parse(a,void 0),e=null!=(b=c.getItem(a))?b:null;return e instanceof Promise?e.then(d):d(e)},setItem:(a,b)=>c.setItem(a,JSON.stringify(b,void 0)),removeItem:a=>c.removeItem(a)}}(()=>window.localStorage),partialize:a=>a,version:0,merge:(a,b)=>({...b,...a}),...b},i=!1,j=0,k=new Set,l=new Set,m=h.storage;if(!m)return a((...a)=>{console.warn(`[zustand persist middleware] Unable to update item '${h.name}', the given storage is currently unavailable.`),c(...a)},d,e);let n=()=>{let a=h.partialize({...d()});return m.setItem(h.name,{state:a,version:h.version})},o=e.setState;e.setState=(a,b)=>(o(a,b),n());let p=a((...a)=>(c(...a),n()),d,e);e.getInitialState=()=>p;let q=()=>{var a,b;if(!m)return;let e=++j;i=!1,k.forEach(a=>{var b;return a(null!=(b=d())?b:p)});let o=(null==(b=h.onRehydrateStorage)?void 0:b.call(h,null!=(a=d())?a:p))||void 0;return f(m.getItem.bind(m))(h.name).then(a=>{if(a)if("number"!=typeof a.version||a.version===h.version)return[!1,a.state];else{if(h.migrate){let b=h.migrate(a.state,a.version);return b instanceof Promise?b.then(a=>[!0,a]):[!0,b]}console.error("State loaded from storage couldn't be migrated since no migrate function was provided")}return[!1,void 0]}).then(a=>{var b;if(e!==j)return;let[f,i]=a;if(c(g=h.merge(i,null!=(b=d())?b:p),!0),f)return n()}).then(()=>{e===j&&(null==o||o(d(),void 0),g=d(),i=!0,l.forEach(a=>a(g)))}).catch(a=>{e===j&&(null==o||o(void 0,a))})};return e.persist={setOptions:a=>{h={...h,...a},a.storage&&(m=a.storage)},clearStorage:()=>{null==m||m.removeItem(h.name)},getOptions:()=>h,rehydrate:()=>q(),hasHydrated:()=>i,onHydrate:a=>(k.add(a),()=>{k.delete(a)}),onFinishHydration:a=>(l.add(a),()=>{l.delete(a)})},h.skipHydration||q(),g||p},h=e()(g(a=>({user:null,role:null,isAuthenticated:!1,accessToken:null,login:(b,c,d)=>a({role:b,user:c,accessToken:d,isAuthenticated:!0}),setAccessToken:b=>a({accessToken:b,isAuthenticated:!!b}),logout:()=>a({role:null,user:null,accessToken:null,isAuthenticated:!1})}),{name:"auth-storage",partialize:a=>({user:a.user,role:a.role})}))},164831,966515,390864,a=>{"use strict";a.s(["default",()=>j],164831);var b=a.i(572131);let c=(...a)=>a.filter((a,b,c)=>!!a&&""!==a.trim()&&c.indexOf(a)===b).join(" ").trim(),d=a=>{let b=a.replace(/^([A-Z])|[\s-_]+(\w)/g,(a,b,c)=>c?c.toUpperCase():b.toLowerCase());return b.charAt(0).toUpperCase()+b.slice(1)};a.s(["default",()=>i],390864);var e={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};a.s(["LucideProvider",()=>g,"useLucideContext",()=>h],966515);let f=(0,b.createContext)({});function g({children:a,size:c,color:d,strokeWidth:e,absoluteStrokeWidth:g,className:h}){let i=(0,b.useMemo)(()=>({size:c,color:d,strokeWidth:e,absoluteStrokeWidth:g,className:h}),[c,d,e,g,h]);return(0,b.createElement)(f.Provider,{value:i},a)}let h=()=>(0,b.useContext)(f),i=(0,b.forwardRef)(({color:a,size:d,strokeWidth:f,absoluteStrokeWidth:g,className:i="",children:j,iconNode:k,...l},m)=>{let{size:n=24,strokeWidth:o=2,absoluteStrokeWidth:p=!1,color:q="currentColor",className:r=""}=h()??{},s=g??p?24*Number(f??o)/Number(d??n):f??o;return(0,b.createElement)("svg",{ref:m,...e,width:d??n??e.width,height:d??n??e.height,stroke:a??q,strokeWidth:s,className:c("lucide",r,i),...!j&&!(a=>{for(let b in a)if(b.startsWith("aria-")||"role"===b||"title"===b)return!0;return!1})(l)&&{"aria-hidden":"true"},...l},[...k.map(([a,c])=>(0,b.createElement)(a,c)),...Array.isArray(j)?j:[j]])}),j=(a,e)=>{let f=(0,b.forwardRef)(({className:f,...g},h)=>(0,b.createElement)(i,{ref:h,iconNode:e,className:c(`lucide-${d(a).replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase()}`,`lucide-${a}`,f),...g}));return f.displayName=d(a),f}},914547,a=>{"use strict";a.s(["default",()=>b]);let b=(0,a.i(164831).default)("eye",[["path",{d:"M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0",key:"1nclc0"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]])},755681,a=>{"use strict";a.s(["Eye",()=>b.default]);var b=a.i(914547)},336273,460880,a=>{"use strict";a.s(["ShieldCheck",()=>b],336273),a.s(["default",()=>b],460880);let b=(0,a.i(164831).default)("shield-check",[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]])},287828,a=>{"use strict";a.s(["default",()=>b]);let b=(0,a.i(164831).default)("mail",[["path",{d:"m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7",key:"132q7q"}],["rect",{x:"2",y:"4",width:"20",height:"16",rx:"2",key:"izxlao"}]])},783694,a=>{"use strict";a.s(["default",()=>l],783694);var b=a.i(187924),c=a.i(572131),d=a.i(571987),e=a.i(50944),f=a.i(238010),g=a.i(21422),g=g,h=a.i(162591),i=a.i(336273),j=a.i(755681),k=a.i(274413),k=k;function l(){let{login:a}=(0,f.useAuthStore)(),l=(0,e.useRouter)(),[m,n]=(0,c.useState)(""),[o,p]=(0,c.useState)(""),[q,r]=(0,c.useState)(!1),[s,t]=(0,c.useState)(""),[u,v]=(0,c.useState)(!1),w=async b=>{if(b.preventDefault(),!m||!o)return void t("Please fill in both email and password fields.");v(!0),t("");try{var c;let b=await fetch("/api/backend/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:m.toLowerCase().trim(),password:o})}),d=await b.json();if(!b.ok){if(401===b.status)throw Error("Invalid email or password.");if(403===b.status)throw Error("Your account has been disabled. Please contact your administrator.");if(504===b.status||503===b.status)throw Error("Backend service is unavailable. Please try again shortly.");throw Error(d?.message||"Login failed. Please try again.")}let{accessToken:e,user:f}=d.data;if(!e||!f)throw Error("Unexpected response from server. Please try again.");let g=f.role.toLowerCase().replace(/_/g," ").replace(/\b\w/g,a=>a.toUpperCase());a(g,{...f,role:g},e);let h={SALES:"/sales/dashboard",SALES_ADMIN:"/sales/dashboard",PLANT_HEAD:"/plant-head/dashboard",PRODUCTION:"/production/dashboard",STORE:"/store/dashboard",QC:"/qc/dashboard",DISPATCH:"/dispatch/dashboard",FINANCE:"/finance/dashboard",FINANCE_EXECUTIVE:"/finance-executive/dashboard",HR:"/hr/dashboard",ADMIN:"/admin/dashboard",SUPER_ADMIN:"/super-admin/dashboard"}[c=f.role]||({Sales:"/sales/dashboard","Sales Admin":"/sales/dashboard","Plant Head":"/plant-head/dashboard",Production:"/production/dashboard",Store:"/store/dashboard",QC:"/qc/dashboard",Dispatch:"/dispatch/dashboard",Finance:"/finance/dashboard","Finance Executive":"/finance-executive/dashboard",HR:"/hr/dashboard",Admin:"/admin/dashboard","Super Admin":"/super-admin/dashboard"})[c]||"/sales/dashboard";l.push(h)}catch(a){t(a.message||"Login failed. Please try again.")}finally{v(!1)}};return(0,b.jsxs)(b.Fragment,{children:[(0,b.jsx)("style",{children:`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .login-root {
          min-height: 100vh;
          width: 100vw;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(145deg, #EFF6FF 0%, #F0F9FF 40%, #E0F2FE 70%, #EEF2FF 100%);
          padding: 20px;
          font-family: 'Outfit', sans-serif;
          position: relative;
          overflow: hidden;
        }

        .login-root::before {
          content: '';
          position: fixed;
          top: -120px;
          right: -120px;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(59,174,235,0.12) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }
        .login-root::after {
          content: '';
          position: fixed;
          bottom: -100px;
          left: -100px;
          width: 420px;
          height: 420px;
          background: radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }

        .login-card {
          width: 100%;
          max-width: 440px;
          background: #ffffff;
          border-radius: 24px;
          padding: 44px 40px;
          box-shadow:
            0 1px 3px rgba(0,0,0,0.04),
            0 8px 32px rgba(47,67,117,0.08),
            0 32px 64px rgba(47,67,117,0.06);
          border: 1px solid rgba(226,232,240,0.8);
          display: flex;
          flex-direction: column;
          gap: 28px;
          position: relative;
          z-index: 1;
          animation: cardIn 0.45s cubic-bezier(0.34,1.56,0.64,1) both;
        }

        @keyframes cardIn {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .login-label {
          font-size: 11px;
          font-weight: 700;
          color: #94A3B8;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 2px;
        }

        .login-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .login-icon {
          position: absolute;
          left: 14px;
          color: #94A3B8;
          pointer-events: none;
          transition: color 0.2s;
        }

        .login-input {
          width: 100%;
          padding: 13px 14px 13px 42px;
          background: #F8FAFD;
          border: 1.5px solid #E2E8F0;
          border-radius: 12px;
          color: #1E293B;
          font-size: 14px;
          font-family: 'Outfit', sans-serif;
          outline: none;
          transition: all 0.2s;
        }
        .login-input::placeholder { color: #CBD5E1; }
        .login-input:focus {
          background: #FFFFFF;
          border-color: #3BAEEB;
          box-shadow: 0 0 0 3px rgba(59,174,235,0.12);
        }
        .login-input:focus + .login-icon,
        .login-input-wrap:focus-within .login-icon {
          color: #3BAEEB;
        }

        .login-input-pr { padding-right: 42px; }

        .pass-toggle {
          position: absolute;
          right: 14px;
          background: none;
          border: none;
          cursor: pointer;
          color: #94A3B8;
          display: flex;
          align-items: center;
          padding: 0;
          transition: color 0.2s;
        }
        .pass-toggle:hover { color: #3BAEEB; }

        .login-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, #E2E8F0 50%, transparent 100%);
        }

        .login-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #2F4375 0%, #3BAEEB 100%);
          color: #fff;
          border: none;
          border-radius: 12px;
          font-weight: 800;
          font-size: 14.5px;
          font-family: 'Outfit', sans-serif;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 4px 20px rgba(47,67,117,0.22);
          transition: all 0.2s;
          margin-top: 4px;
        }
        .login-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(47,67,117,0.28);
        }
        .login-btn:active:not(:disabled) { transform: translateY(0); }
        .login-btn:disabled { opacity: 0.65; cursor: not-allowed; }

        .login-error {
          background: #FFF5F5;
          border: 1.5px solid #FECACA;
          border-radius: 10px;
          padding: 11px 16px;
          color: #DC2626;
          font-size: 13px;
          font-weight: 500;
          text-align: center;
          line-height: 1.5;
          animation: shake 0.35s ease;
        }
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          25%      { transform: translateX(-6px); }
          75%      { transform: translateX(6px); }
        }

        @media (max-width: 480px) {
          .login-card { padding: 32px 24px; }
        }
      `}),(0,b.jsx)("div",{className:"login-root",children:(0,b.jsxs)("div",{className:"login-card",children:[(0,b.jsx)("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",gap:"8px",textAlign:"center"},children:(0,b.jsx)("div",{style:{padding:"12px 28px",borderRadius:"16px",background:"linear-gradient(135deg, #EFF6FF 0%, #F0F9FF 100%)",border:"1.5px solid #DBEAFE",marginBottom:"6px",boxShadow:"0 2px 8px rgba(47,67,117,0.06)"},children:(0,b.jsx)(d.default,{src:"/himalaya-logo-trimmed.png",alt:"Himalaya",width:240,height:80,style:{width:"190px",height:"auto",objectFit:"contain"},priority:!0})})}),(0,b.jsx)("div",{className:"login-divider"}),s&&(0,b.jsx)("div",{className:"login-error",children:s}),(0,b.jsxs)("form",{onSubmit:w,style:{display:"flex",flexDirection:"column",gap:"18px"},children:[(0,b.jsxs)("div",{style:{display:"flex",flexDirection:"column",gap:"7px"},children:[(0,b.jsx)("label",{className:"login-label",children:"Email Address"}),(0,b.jsxs)("div",{className:"login-input-wrap",children:[(0,b.jsx)(h.Mail,{size:15,className:"login-icon"}),(0,b.jsx)("input",{type:"email",id:"login-email",className:"login-input",placeholder:"user@himalayaerp.local",value:m,onChange:a=>n(a.target.value),disabled:u,autoComplete:"email"})]})]}),(0,b.jsxs)("div",{style:{display:"flex",flexDirection:"column",gap:"7px"},children:[(0,b.jsx)("label",{className:"login-label",children:"Password"}),(0,b.jsxs)("div",{className:"login-input-wrap",children:[(0,b.jsx)(g.default,{size:15,className:"login-icon"}),(0,b.jsx)("input",{type:q?"text":"password",id:"login-password",className:"login-input login-input-pr",placeholder:"••••••••••••",value:o,onChange:a=>p(a.target.value),disabled:u,autoComplete:"current-password"}),(0,b.jsx)("button",{type:"button",className:"pass-toggle",onClick:()=>r(a=>!a),tabIndex:-1,"aria-label":q?"Hide password":"Show password",children:q?(0,b.jsx)(k.default,{size:15}):(0,b.jsx)(j.Eye,{size:15})})]})]}),(0,b.jsxs)("button",{type:"submit",id:"login-submit",disabled:u,className:"login-btn",children:[(0,b.jsx)(i.ShieldCheck,{size:16}),u?"Authenticating…":"Sign In"]})]})]})})]})}}];

//# sourceMappingURL=%5Broot-of-the-server%5D__bc0d674e._.js.map