(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/components/SamplesView.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SamplesView,
    "getSampleDaysLeft",
    ()=>getSampleDaysLeft
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/search.mjs [app-client] (ecmascript) <export default as Search>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flask$2d$conical$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FlaskConical$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/flask-conical.mjs [app-client] (ecmascript) <export default as FlaskConical>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/check.mjs [app-client] (ecmascript) <export default as Check>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-right.mjs [app-client] (ecmascript) <export default as ArrowRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2d$pen$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Edit$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/square-pen.mjs [app-client] (ecmascript) <export default as Edit>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/eye.mjs [app-client] (ecmascript) <export default as Eye>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-left.mjs [app-client] (ecmascript) <export default as ArrowLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$truck$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Truck$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/truck.mjs [app-client] (ecmascript) <export default as Truck>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/map-pin.mjs [app-client] (ecmascript) <export default as MapPin>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/clock.mjs [app-client] (ecmascript) <export default as Clock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/triangle-alert.mjs [app-client] (ecmascript) <export default as AlertTriangle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/plus.mjs [app-client] (ecmascript) <export default as Plus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-left.mjs [app-client] (ecmascript) <export default as ChevronLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-right.mjs [app-client] (ecmascript) <export default as ChevronRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sweetalert2/dist/sweetalert2.all.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$context$2f$ERPContext$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/shared/context/ERPContext.jsx [app-client] (ecmascript) <locals>");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
function getSampleDaysLeft(evaluationEndDate) {
    if (!evaluationEndDate) return null;
    const today = new Date();
    const endDate = new Date(evaluationEndDate);
    today.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    return Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / 86400000));
}
function SamplesView(param) {
    let { samples, onUpdateSampleStatus, onUpdateSample, onMoveToQuotation, onCreateQuotationClick, onCreateReplacementSample, flat = false } = param;
    _s();
    const navigate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const { state } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$context$2f$ERPContext$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useERP"])();
    const dispatchDetailsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [search, setSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [filter, setFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('All');
    const [selectedSample, setSelectedSample] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [currentTick, setCurrentTick] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "SamplesView.useState": ()=>new Date()
    }["SamplesView.useState"]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SamplesView.useEffect": ()=>{
            const timer = setInterval({
                "SamplesView.useEffect.timer": ()=>setCurrentTick(new Date())
            }["SamplesView.useEffect.timer"], 60000);
            return ({
                "SamplesView.useEffect": ()=>clearInterval(timer)
            })["SamplesView.useEffect"];
        }
    }["SamplesView.useEffect"], []);
    const getDispatchStatus = (sample)=>{
        if ((sample === null || sample === void 0 ? void 0 : sample.dispatchStatus) === 'Delivered' || (sample === null || sample === void 0 ? void 0 : sample.delivered) || (sample === null || sample === void 0 ? void 0 : sample.deliveredDate) || (sample === null || sample === void 0 ? void 0 : sample.deliveredAt) || [
            'Evaluation Active',
            'Client Testing',
            'Testing',
            'Returned',
            'Approved',
            'Lost'
        ].includes(sample === null || sample === void 0 ? void 0 : sample.status)) {
            return 'Delivered';
        }
        return (sample === null || sample === void 0 ? void 0 : sample.dispatchStatus) || ((sample === null || sample === void 0 ? void 0 : sample.dispatchDate) ? 'In Transit' : 'Pending Dispatch');
    };
    const handleRequestReturn = (sampleId)=>{
        if (onUpdateSample) {
            onUpdateSample(sampleId, {
                status: 'Sample Back Requested',
                returnRequestedDate: new Date().toISOString()
            });
        }
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
            icon: 'success',
            title: 'Sample Back Initiated',
            text: 'Sample Back request sent to Dispatch department successfully!',
            timer: 1800,
            showConfirmButton: false
        });
        navigate.push("/dispatch/sample-dispatch?sampleId=".concat(encodeURIComponent(sampleId), "&mode=return"));
    };
    const handleCreateQuotation = (sample)=>{
        if (onCreateQuotationClick) {
            onCreateQuotationClick(sample);
        } else if (onMoveToQuotation) {
            onMoveToQuotation(sample);
        } else {
            const targetLeadId = sample.leadId || sample.id;
            navigate.push("/sales/create-quotation?leadId=".concat(encodeURIComponent(targetLeadId), "&sampleId=").concat(sample.id));
        }
    };
    const showPodPopup = (sample)=>{
        const pod = sample.podImage || sample.pod_image;
        if (!pod) return;
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
            imageUrl: pod,
            imageAlt: 'Proof of Delivery',
            title: "Proof of Delivery — ".concat(formatSampleId(sample.id)),
            text: sample.deliveryDate || sample.deliveredDate ? "Delivered on ".concat(sample.deliveryDate || sample.deliveredDate) : undefined,
            confirmButtonText: 'Close',
            customClass: {
                popup: 'swal-premium-popup',
                title: 'swal-premium-title',
                confirmButton: 'swal-premium-confirm-btn'
            },
            buttonsStyling: false
        });
    };
    const getDocType = (doc)=>{
        if (!doc) return 'none';
        const lower = String(doc).toLowerCase();
        if (lower.startsWith('data:application/pdf') || lower.endsWith('.pdf')) {
            return 'pdf';
        }
        if (lower.startsWith('data:image/') || lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.png') || lower.endsWith('.gif') || lower.endsWith('.webp')) {
            return 'image';
        }
        return 'other';
    };
    const getDocFilename = (doc, sampleId)=>{
        if (!doc) return '';
        if (doc.startsWith('data:')) {
            const ext = doc.startsWith('data:application/pdf') ? 'pdf' : 'png';
            return "dispatch_document_".concat(formatSampleId(sampleId), ".").concat(ext);
        }
        return doc.split('/').pop();
    };
    const showDispatchDocument = (doc, sampleId)=>{
        if (!doc) {
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
                title: "Dispatch Document — ".concat(formatSampleId(sampleId)),
                html: '\n          <div style="display: flex; flex-direction: column; align-items: center; padding: 20px; gap: 12px;">\n            <span style="font-size: 48px;">📄</span>\n            <h4 style="margin: 0; color: var(--color-text-secondary);">No dispatch document uploaded.</h4>\n            <button class="swal-premium-confirm-btn" onclick="Swal.close()">Close</button>\n          </div>\n        ',
                showConfirmButton: false,
                customClass: {
                    popup: 'swal-premium-popup',
                    title: 'swal-premium-title'
                }
            });
            return;
        }
        const docType = getDocType(doc);
        if (docType === 'image') {
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
                title: "Dispatch Document — ".concat(formatSampleId(sampleId)),
                html: '\n          <div style="display: flex; flex-direction: column; align-items: center; gap: 16px; width: 100%;">\n            <div style="border: 1px solid #D6E2F0; border-radius: 8px; padding: 8px; background: #F5FAFE; max-width: 100%; display: flex; justify-content: center;">\n              <img src="'.concat(doc, '" alt="Dispatch Document" style="max-width: 100%; max-height: 450px; object-fit: contain; border-radius: 6px;" />\n            </div>\n            <div style="display: flex; gap: 12px; justify-content: center; width: 100%;">\n              <button id="swal-download-btn" class="swal-premium-confirm-btn" style="display: inline-flex; align-items: center; gap: 4px; border: none; cursor: pointer; padding: 10px 18px; border-radius: 8px; font-weight: bold;">\n                ⬇ Download\n              </button>\n              <a href="').concat(doc, '" target="_blank" class="swal-premium-cancel-btn" style="text-decoration: none; display: inline-flex; align-items: center; gap: 4px; padding: 10px 18px; border-radius: 8px; font-weight: bold;">\n                ↗ Open in New Tab\n              </a>\n              <button class="swal-premium-cancel-btn" style="border: none; cursor: pointer; padding: 10px 18px; border-radius: 8px; font-weight: bold;" onclick="Swal.close()">\n                Close\n              </button>\n            </div>\n          </div>\n        '),
                showConfirmButton: false,
                showCloseButton: true,
                customClass: {
                    popup: 'swal-premium-popup',
                    title: 'swal-premium-title'
                },
                didOpen: ()=>{
                    var _document_getElementById;
                    (_document_getElementById = document.getElementById('swal-download-btn')) === null || _document_getElementById === void 0 ? void 0 : _document_getElementById.addEventListener('click', ()=>{
                        downloadDispatchDocument(doc, sampleId);
                    });
                }
            });
        } else if (docType === 'pdf') {
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
                title: "Dispatch Document — ".concat(formatSampleId(sampleId)),
                html: '\n          <div style="display: flex; flex-direction: column; align-items: center; gap: 16px; width: 100%;">\n            <div style="border: 1px solid #D6E2F0; border-radius: 8px; overflow: hidden; background: #F5FAFE; width: 100%; height: 500px;">\n              <iframe src="'.concat(doc, '" style="width:100%; height:100%; border:none;" title="Dispatch Document Preview"></iframe>\n            </div>\n            <div style="display: flex; gap: 12px; justify-content: center; width: 100%;">\n              <button id="swal-download-btn" class="swal-premium-confirm-btn" style="display: inline-flex; align-items: center; gap: 4px; border: none; cursor: pointer; padding: 10px 18px; border-radius: 8px; font-weight: bold;">\n                ⬇ Download\n              </button>\n              <a href="').concat(doc, '" target="_blank" class="swal-premium-cancel-btn" style="text-decoration: none; display: inline-flex; align-items: center; gap: 4px; padding: 10px 18px; border-radius: 8px; font-weight: bold;">\n                ↗ Open in New Tab\n              </a>\n              <button class="swal-premium-cancel-btn" style="border: none; cursor: pointer; padding: 10px 18px; border-radius: 8px; font-weight: bold;" onclick="Swal.close()">\n                Close\n              </button>\n            </div>\n          </div>\n        '),
                showConfirmButton: false,
                showCloseButton: true,
                width: '800px',
                customClass: {
                    popup: 'swal-premium-popup',
                    title: 'swal-premium-title'
                },
                didOpen: ()=>{
                    var _document_getElementById;
                    (_document_getElementById = document.getElementById('swal-download-btn')) === null || _document_getElementById === void 0 ? void 0 : _document_getElementById.addEventListener('click', ()=>{
                        downloadDispatchDocument(doc, sampleId);
                    });
                }
            });
        } else {
            window.open(doc, '_blank');
        }
    };
    const downloadDispatchDocument = (doc, sampleId)=>{
        if (!doc) return;
        const link = document.createElement('a');
        link.href = doc;
        link.download = "dispatch-doc-".concat(formatSampleId(sampleId));
        link.click();
    };
    const formatDateClean = (dt)=>{
        if (!dt) return '—';
        try {
            const d = new Date(dt);
            if (isNaN(d.getTime())) return dt;
            return d.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
        } catch (e) {
            return dt;
        }
    };
    const getTimelineMilestones = (sample, hasQuotation)=>{
        const ds = getDispatchStatus(sample);
        const delivered = ds === 'Delivered' || (sample === null || sample === void 0 ? void 0 : sample.delivered) || (sample === null || sample === void 0 ? void 0 : sample.deliveredAt) || (sample === null || sample === void 0 ? void 0 : sample.deliveredDate);
        const isReturned = (sample === null || sample === void 0 ? void 0 : sample.status) === 'Returned' || (sample === null || sample === void 0 ? void 0 : sample.retrievalStatus) === 'Retrieved';
        const isReturnPending = [
            'Return Due',
            'Return Requested',
            'Return In Transit'
        ].includes(sample === null || sample === void 0 ? void 0 : sample.status);
        const passed = (sample === null || sample === void 0 ? void 0 : sample.status) === 'Testing Passed' || (sample === null || sample === void 0 ? void 0 : sample.status) === 'Approved' || (sample === null || sample === void 0 ? void 0 : sample.testingStatus) === 'PASSED';
        return [
            {
                label: 'Sample Created',
                active: true
            },
            {
                label: 'Sent to Dispatch',
                active: true
            },
            {
                label: 'Vehicle Assigned',
                active: !!((sample === null || sample === void 0 ? void 0 : sample.vehicleNo) || (sample === null || sample === void 0 ? void 0 : sample.vehicle_no))
            },
            {
                label: 'Dispatched',
                active: !!(sample === null || sample === void 0 ? void 0 : sample.dispatchDate) && ds !== 'Pending Dispatch'
            },
            {
                label: 'In Transit',
                active: ds === 'In Transit' || delivered
            },
            {
                label: 'Delivered',
                active: !!delivered
            },
            {
                label: 'Client Testing Started',
                active: !!delivered
            },
            {
                label: 'Waiting Client Feedback',
                active: !!delivered && !passed && !isReturned
            },
            {
                label: 'Return Sample',
                active: isReturnPending || isReturned
            },
            {
                label: 'Returned',
                active: isReturned
            },
            {
                label: 'Testing Passed',
                active: passed
            },
            {
                label: 'Quotation Created',
                active: hasQuotation
            }
        ];
    };
    const renderDetailRow = (label, value)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                display: 'flex',
                justifyContent: 'space-between',
                borderBottom: '1px solid #f1f5f9',
                paddingBottom: '6px'
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    style: {
                        fontSize: '13px',
                        color: 'var(--color-text-secondary)'
                    },
                    children: label
                }, void 0, false, {
                    fileName: "[project]/components/SamplesView.jsx",
                    lineNumber: 258,
                    columnNumber: 7
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    style: {
                        fontSize: '13.5px',
                        fontWeight: '700',
                        color: 'var(--color-text-primary)',
                        textAlign: 'right'
                    },
                    children: value || '—'
                }, void 0, false, {
                    fileName: "[project]/components/SamplesView.jsx",
                    lineNumber: 259,
                    columnNumber: 7
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/SamplesView.jsx",
            lineNumber: 257,
            columnNumber: 5
        }, this);
    const formatSampleId = (id)=>"SMP-".concat(String(id).padStart(3, '0'));
    const formatLeadId = (id)=>{
        if (!id) return '';
        const idStr = String(id);
        if (idStr.startsWith('LD-')) return idStr;
        return "LD-" + (id > 1000 ? idStr.substring(1) : idStr.padStart(3, '0'));
    };
    const getExactCountdown = (sample)=>{
        const ds = getDispatchStatus(sample);
        if (ds !== 'Delivered' && !(sample === null || sample === void 0 ? void 0 : sample.deliveredAt) && !(sample === null || sample === void 0 ? void 0 : sample.deliveredDate) && !(sample === null || sample === void 0 ? void 0 : sample.deliveryDate)) {
            return {
                isDelivered: false,
                isExpired: false,
                days: 20,
                hours: 0,
                minutes: 0,
                percent: 100,
                expDateStr: '—',
                displayDays: 'Waiting Delivery'
            };
        }
        const baseDtStr = (sample === null || sample === void 0 ? void 0 : sample.deliveredAt) || (sample === null || sample === void 0 ? void 0 : sample.deliveredDate) || (sample === null || sample === void 0 ? void 0 : sample.testingStartDate) || (sample === null || sample === void 0 ? void 0 : sample.deliveryDate) || (sample === null || sample === void 0 ? void 0 : sample.dispatchDate) || new Date().toISOString();
        const baseDt = new Date(baseDtStr);
        const expDt = (sample === null || sample === void 0 ? void 0 : sample.testingEndDate) || (sample === null || sample === void 0 ? void 0 : sample.evaluationEndDate) ? new Date((sample === null || sample === void 0 ? void 0 : sample.testingEndDate) || (sample === null || sample === void 0 ? void 0 : sample.evaluationEndDate)) : new Date(baseDt.getTime() + 20 * 86400000);
        const expDateStr = expDt.toISOString().split('T')[0];
        const diff = expDt.getTime() - currentTick.getTime();
        if (diff <= 0) {
            return {
                isDelivered: true,
                isExpired: true,
                days: 0,
                hours: 0,
                minutes: 0,
                percent: 0,
                expDateStr,
                displayDays: 'Testing Period Expired'
            };
        }
        const days = Math.floor(diff / 86400000);
        const hours = Math.floor(diff % 86400000 / 3600000);
        const minutes = Math.floor(diff % 3600000 / 60000);
        const totalDuration = 20 * 86400000;
        const percent = Math.max(0, Math.min(100, Math.round(diff / totalDuration * 100)));
        return {
            isDelivered: true,
            isExpired: false,
            days,
            hours,
            minutes,
            percent,
            expDateStr,
            displayDays: "".concat(days, " Days Left")
        };
    };
    const getMockInfo = (sample)=>{
        if (!sample) return {
            days: 0,
            exp: '',
            displayDays: '-'
        };
        const exact = getExactCountdown(sample);
        return {
            days: exact.days,
            exp: exact.expDateStr,
            displayDays: exact.displayDays
        };
    };
    const getElapsedDays = (sample)=>{
        if (!sample) return 0;
        const id = sample.id;
        if (id === 1) return 16;
        if (id === 2) return 9;
        if (id === 3) return 13;
        if (id === 4) return 38;
        if (id === 5) return 8;
        if (id === 6) return 33;
        if (id === 7) return 25;
        if (!sample.dispatchDate) return 0;
        const start = new Date(sample.dispatchDate);
        const diffTime = new Date() - start;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    };
    // Local modal handlers removed in favor of standalone routing
    const handleUpdateStatusClick = (sampleId, newStatus, textAction)=>{
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
            title: "".concat(textAction, " Sample?"),
            text: 'Are you sure you want to set the sample status to "'.concat(newStatus, '"?'),
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: "Yes, ".concat(textAction),
            cancelButtonText: 'Cancel',
            customClass: {
                popup: 'swal-premium-popup',
                title: 'swal-premium-title',
                htmlContainer: 'swal-premium-text',
                confirmButton: 'swal-premium-confirm-btn',
                cancelButton: 'swal-premium-cancel-btn'
            },
            buttonsStyling: false
        }).then((result)=>{
            if (result.isConfirmed) {
                onUpdateSampleStatus(sampleId, newStatus);
                if (selectedSample && selectedSample.id === sampleId) {
                    setSelectedSample((prev)=>({
                            ...prev,
                            status: newStatus
                        }));
                }
            }
        });
    };
    const handleCreateQuotationClick = (sample)=>{
        onMoveToQuotation(sample);
    };
    const handleCreateReplacementSample = (sample)=>{
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
            title: 'Create Replacement Sample?',
            text: "This will create a new replacement sample request for ".concat(sample.leadName, " for the product: ").concat(sample.product, "."),
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, Create Replacement',
            cancelButtonText: 'Cancel',
            customClass: {
                popup: 'swal-premium-popup',
                title: 'swal-premium-title',
                confirmButton: 'swal-premium-confirm-btn',
                cancelButton: 'swal-premium-cancel-btn'
            },
            buttonsStyling: false
        }).then((result)=>{
            if (result.isConfirmed) {
                if (onCreateReplacementSample) {
                    onCreateReplacementSample(sample);
                }
            }
        });
    };
    const handleRequestRetrievalClick = (sampleId)=>{
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
            title: 'Request Sample Retrieval?',
            text: 'This will notify the logistics dispatch team to schedule a pick-up and retrieve the sample cargo from the client site.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, Request Pickup',
            cancelButtonText: 'Cancel',
            customClass: {
                popup: 'swal-premium-popup',
                title: 'swal-premium-title',
                htmlContainer: 'swal-premium-text',
                confirmButton: 'swal-premium-confirm-btn',
                cancelButton: 'swal-premium-cancel-btn'
            },
            buttonsStyling: false
        }).then((result)=>{
            if (result.isConfirmed) {
                onUpdateSample(sampleId, {
                    retrievalStatus: 'Requested'
                });
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
                    icon: 'success',
                    title: 'Retrieval Requested',
                    text: 'Retrieval collection request submitted successfully to the logistics team.',
                    customClass: {
                        popup: 'swal-premium-popup',
                        title: 'swal-premium-title',
                        confirmButton: 'swal-premium-confirm-btn'
                    },
                    buttonsStyling: false
                });
            }
        });
    };
    const handleRequestTakeBack = (sampleId)=>{
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
            title: 'Take Back Sample?',
            text: 'This will mark the client feedback/deal status as "Lost" and issue an immediate return pick-up order to the Dispatch department to take back this sample.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, Take Back',
            cancelButtonText: 'Cancel',
            customClass: {
                popup: 'swal-premium-popup',
                title: 'swal-premium-title',
                htmlContainer: 'swal-premium-text',
                confirmButton: 'swal-premium-confirm-btn',
                cancelButton: 'swal-premium-cancel-btn'
            },
            buttonsStyling: false
        }).then((result)=>{
            if (result.isConfirmed) {
                onUpdateSample(sampleId, {
                    status: 'Lost',
                    retrievalStatus: 'Requested'
                });
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
                    icon: 'success',
                    title: 'Take Back Initiated',
                    text: 'Return pickup request submitted to the dispatch department successfully.',
                    customClass: {
                        popup: 'swal-premium-popup',
                        title: 'swal-premium-title',
                        confirmButton: 'swal-premium-confirm-btn'
                    },
                    buttonsStyling: false
                });
            }
        });
    };
    const [currentPage, setCurrentPage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(1);
    // Reset page when search or filter changes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SamplesView.useEffect": ()=>{
            setCurrentPage(1);
        }
    }["SamplesView.useEffect"], [
        search,
        filter
    ]);
    const filteredSamples = samples.filter((sample)=>{
        const leadName = (sample === null || sample === void 0 ? void 0 : sample.leadName) || '';
        const product = (sample === null || sample === void 0 ? void 0 : sample.product) || '';
        const sampleId = (sample === null || sample === void 0 ? void 0 : sample.id) ? formatSampleId(sample.id) : '';
        const leadId = (sample === null || sample === void 0 ? void 0 : sample.leadId) ? formatLeadId(sample.leadId) : '';
        const matchesSearch = leadName.toLowerCase().includes(search.toLowerCase()) || product.toLowerCase().includes(search.toLowerCase()) || sampleId.toLowerCase().includes(search.toLowerCase()) || leadId.toLowerCase().includes(search.toLowerCase());
        let matchesFilter = false;
        if (filter === 'All') {
            matchesFilter = true;
        } else if (filter === 'Sent') {
            const ds = getDispatchStatus(sample);
            matchesFilter = [
                'Sent',
                'Dispatched',
                'Delivered',
                'Client Testing',
                'Evaluation Active',
                'In Transit'
            ].includes((sample === null || sample === void 0 ? void 0 : sample.status) || '') || ds === 'Delivered' && ![
                'Returned',
                'Approved',
                'Lost'
            ].includes(sample === null || sample === void 0 ? void 0 : sample.status);
        } else if (filter === 'Pending') {
            const ds = getDispatchStatus(sample);
            matchesFilter = [
                'Pending',
                'Pending Dispatch',
                'Created',
                'Requested'
            ].includes((sample === null || sample === void 0 ? void 0 : sample.status) || '') && ds !== 'Delivered';
        } else {
            matchesFilter = sample.status === filter;
        }
        return matchesSearch && matchesFilter;
    });
    const ITEMS_PER_PAGE = 25;
    const totalPages = Math.ceil(filteredSamples.length / ITEMS_PER_PAGE) || 1;
    const displayedSamples = flat ? filteredSamples : filteredSamples.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
    const getStatusBadge = (status)=>{
        return "badge badge-".concat((status || '').toLowerCase().replace(/\s+/g, '-'));
    };
    if (selectedSample) {
        var _sample_retrievalDetails, _sample_retrievalDetails1, _sample_retrievalDetails2;
        const sample = samples.find((s)=>s.id === selectedSample.id) || selectedSample;
        const exactInfo = getExactCountdown(sample);
        const mockInfo = getMockInfo(sample);
        const percentRemaining = exactInfo.percent;
        const dispatchStatus = getDispatchStatus(sample);
        const hasQuotation = (state.quotations || []).some((q)=>q.sampleId === sample.id);
        const timelineMilestones = getTimelineMilestones(sample, hasQuotation);
        const podImage = sample.podImage || sample.pod_image;
        const dispatchDoc = sample.dispatchDocument || sample.dispatch_document;
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "app-card",
            style: {
                flex: 1
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("style", {
                    children: "\n          @keyframes truck-bounce {\n            0% { transform: translate(-50%, -55%); }\n            100% { transform: translate(-50%, -45%); }\n          }\n        "
                }, void 0, false, {
                    fileName: "[project]/components/SamplesView.jsx",
                    lineNumber: 509,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        borderBottom: '1px solid var(--color-border)',
                        paddingBottom: '16px',
                        marginBottom: '20px'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            className: "btn-small btn-outline-small",
                            style: {
                                alignSelf: 'flex-start',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                cursor: 'pointer'
                            },
                            onClick: ()=>setSelectedSample(null),
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__["ArrowLeft"], {
                                    size: 13
                                }, void 0, false, {
                                    fileName: "[project]/components/SamplesView.jsx",
                                    lineNumber: 523,
                                    columnNumber: 13
                                }, this),
                                " Back to Samples"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/SamplesView.jsx",
                            lineNumber: 518,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                flexWrap: 'wrap',
                                gap: '12px',
                                marginTop: '8px'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                            style: {
                                                fontSize: '20px',
                                                fontWeight: '800',
                                                color: 'var(--color-text-primary)',
                                                margin: 0
                                            },
                                            children: [
                                                "Sample Testing Details: ",
                                                formatSampleId(sample.id)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/SamplesView.jsx",
                                            lineNumber: 528,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                fontSize: '13px',
                                                color: 'var(--color-text-secondary)',
                                                marginTop: '4px',
                                                display: 'inline-block'
                                            },
                                            children: [
                                                "Customer: ",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                    children: sample.leadName
                                                }, void 0, false, {
                                                    fileName: "[project]/components/SamplesView.jsx",
                                                    lineNumber: 532,
                                                    columnNumber: 27
                                                }, this),
                                                " | Associated Lead: ",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                    children: formatLeadId(sample.leadId)
                                                }, void 0, false, {
                                                    fileName: "[project]/components/SamplesView.jsx",
                                                    lineNumber: 532,
                                                    columnNumber: 81
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/SamplesView.jsx",
                                            lineNumber: 531,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/SamplesView.jsx",
                                    lineNumber: 527,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        display: 'flex',
                                        gap: '10px'
                                    },
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: "btn-small btn-outline-small",
                                        onClick: ()=>navigate.push("/sales/edit-sample/".concat(sample.id)),
                                        style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2d$pen$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Edit$3e$__["Edit"], {
                                                size: 12
                                            }, void 0, false, {
                                                fileName: "[project]/components/SamplesView.jsx",
                                                lineNumber: 541,
                                                columnNumber: 17
                                            }, this),
                                            " Edit Info"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/SamplesView.jsx",
                                        lineNumber: 536,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/SamplesView.jsx",
                                    lineNumber: 535,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/SamplesView.jsx",
                            lineNumber: 526,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/SamplesView.jsx",
                    lineNumber: 517,
                    columnNumber: 9
                }, this),
                sample.dispatchDate && mockInfo.days === 0 && sample.status !== 'Approved' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        background: 'rgba(239, 68, 68, 0.08)',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        borderRadius: '12px',
                        padding: '16px 20px',
                        marginBottom: '20px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '16px'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
                            size: 24,
                            color: "#ef4444",
                            style: {
                                flexShrink: 0,
                                marginTop: '2px'
                            }
                        }, void 0, false, {
                            fileName: "[project]/components/SamplesView.jsx",
                            lineNumber: 559,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '6px'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                    style: {
                                        fontSize: '15px',
                                        fontWeight: '800',
                                        color: '#b91c1c',
                                        margin: 0
                                    },
                                    children: [
                                        "Evaluation Window Exceeded (",
                                        getElapsedDays(sample),
                                        " Days Elapsed)"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/SamplesView.jsx",
                                    lineNumber: 561,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    style: {
                                        fontSize: '13px',
                                        color: '#7f1d1d',
                                        margin: 0,
                                        lineHeight: '1.5'
                                    },
                                    children: [
                                        "This sample has been at the customer site for ",
                                        getElapsedDays(sample),
                                        " days since dispatch (20-day evaluation limit exceeded). Please initiate sample collection to take it back to the Haridwar factory."
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/SamplesView.jsx",
                                    lineNumber: 564,
                                    columnNumber: 15
                                }, this),
                                sample.retrievalStatus && sample.retrievalStatus !== 'None' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        fontSize: '13px',
                                        fontWeight: '700',
                                        color: '#c2410c',
                                        marginTop: '6px'
                                    },
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: [
                                            "🚛 Return collection is already ",
                                            sample.retrievalStatus === 'Requested' ? 'Requested' : sample.retrievalStatus === 'In Transit' ? 'In Return Transit' : 'Completed (Returned)',
                                            "."
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/SamplesView.jsx",
                                        lineNumber: 569,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/SamplesView.jsx",
                                    lineNumber: 568,
                                    columnNumber: 17
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        display: 'flex',
                                        gap: '12px',
                                        marginTop: '8px'
                                    },
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>handleRequestTakeBack(sample.id),
                                        style: {
                                            background: '#ef4444',
                                            color: '#ffffff',
                                            border: 'none',
                                            padding: '8px 16px',
                                            borderRadius: '8px',
                                            fontSize: '12.5px',
                                            fontWeight: '800',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            boxShadow: '0 2px 4px rgba(239, 68, 68, 0.2)',
                                            transition: 'background 0.2s'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$truck$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Truck$3e$__["Truck"], {
                                                size: 14
                                            }, void 0, false, {
                                                fileName: "[project]/components/SamplesView.jsx",
                                                lineNumber: 591,
                                                columnNumber: 21
                                            }, this),
                                            " Take Back Sample"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/SamplesView.jsx",
                                        lineNumber: 573,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/SamplesView.jsx",
                                    lineNumber: 572,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/SamplesView.jsx",
                            lineNumber: 560,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/SamplesView.jsx",
                    lineNumber: 549,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                        gap: '24px'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '20px'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        background: '#F5FAFE',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: '12px',
                                        padding: '16px 20px'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            style: {
                                                fontSize: '14px',
                                                fontWeight: '800',
                                                color: 'var(--color-text-primary)',
                                                margin: '0 0 14px 0',
                                                borderBottom: '1px solid #DCE5F0',
                                                paddingBottom: '8px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flask$2d$conical$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FlaskConical$3e$__["FlaskConical"], {
                                                    size: 16,
                                                    color: "var(--color-accent-teal)"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/SamplesView.jsx",
                                                    lineNumber: 606,
                                                    columnNumber: 17
                                                }, this),
                                                "📦 Product & Logistics Information"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/SamplesView.jsx",
                                            lineNumber: 605,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '12px'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        borderBottom: '1px solid #f1f5f9',
                                                        paddingBottom: '6px'
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            style: {
                                                                fontSize: '13px',
                                                                color: 'var(--color-text-secondary)'
                                                            },
                                                            children: "Customer / Company"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/SamplesView.jsx",
                                                            lineNumber: 611,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            style: {
                                                                fontSize: '13.5px',
                                                                fontWeight: '700',
                                                                color: 'var(--color-text-primary)'
                                                            },
                                                            children: sample.leadName
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/SamplesView.jsx",
                                                            lineNumber: 612,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/SamplesView.jsx",
                                                    lineNumber: 610,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        borderBottom: '1px solid #f1f5f9',
                                                        paddingBottom: '6px'
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            style: {
                                                                fontSize: '13px',
                                                                color: 'var(--color-text-secondary)'
                                                            },
                                                            children: "Associated Lead Ref"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/SamplesView.jsx",
                                                            lineNumber: 615,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            style: {
                                                                fontSize: '13.5px',
                                                                fontWeight: '700',
                                                                color: 'var(--color-text-primary)'
                                                            },
                                                            children: formatLeadId(sample.leadId)
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/SamplesView.jsx",
                                                            lineNumber: 616,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/SamplesView.jsx",
                                                    lineNumber: 614,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        borderBottom: '1px solid #f1f5f9',
                                                        paddingBottom: '6px'
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            style: {
                                                                fontSize: '13px',
                                                                color: 'var(--color-text-secondary)'
                                                            },
                                                            children: "Sample Product"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/SamplesView.jsx",
                                                            lineNumber: 619,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            style: {
                                                                fontSize: '13.5px',
                                                                fontWeight: '700',
                                                                color: 'var(--color-text-primary)'
                                                            },
                                                            children: sample.product
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/SamplesView.jsx",
                                                            lineNumber: 620,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/SamplesView.jsx",
                                                    lineNumber: 618,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        display: 'flex',
                                                        justifyContent: 'space-between'
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            style: {
                                                                fontSize: '13px',
                                                                color: 'var(--color-text-secondary)'
                                                            },
                                                            children: "Quantity Sent"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/SamplesView.jsx",
                                                            lineNumber: 623,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            style: {
                                                                fontSize: '13.5px',
                                                                fontWeight: '700',
                                                                color: 'var(--color-text-primary)'
                                                            },
                                                            children: [
                                                                sample.quantity,
                                                                " Pcs"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/components/SamplesView.jsx",
                                                            lineNumber: 624,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/SamplesView.jsx",
                                                    lineNumber: 622,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/SamplesView.jsx",
                                            lineNumber: 609,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/SamplesView.jsx",
                                    lineNumber: 604,
                                    columnNumber: 13
                                }, this),
                                dispatchStatus !== 'Pending Dispatch' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    ref: dispatchDetailsRef,
                                    style: {
                                        background: '#F5FAFE',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: '12px',
                                        padding: '16px 20px'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            style: {
                                                fontSize: '14px',
                                                fontWeight: '800',
                                                color: 'var(--color-text-primary)',
                                                margin: '0 0 14px 0',
                                                borderBottom: '1px solid #DCE5F0',
                                                paddingBottom: '8px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$truck$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Truck$3e$__["Truck"], {
                                                    size: 16,
                                                    color: "var(--color-primary)"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/SamplesView.jsx",
                                                    lineNumber: 633,
                                                    columnNumber: 19
                                                }, this),
                                                "🚚 Dispatch Details"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/SamplesView.jsx",
                                            lineNumber: 632,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '12px'
                                            },
                                            children: [
                                                renderDetailRow('Vehicle Number', sample.vehicleNo || sample.vehicle_no),
                                                renderDetailRow('Driver Name', sample.driverName || sample.driver_name),
                                                renderDetailRow('Transport Mode', sample.transportMode || sample.transport_mode || sample.courier),
                                                renderDetailRow('LR / AWB Number', sample.lrAwbNumber || sample.lr_awb_number || sample.trackingNo),
                                                renderDetailRow('Dispatch Date', formatDateClean(sample.dispatchDate)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        borderBottom: '1px solid #f1f5f9',
                                                        paddingBottom: '6px'
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            style: {
                                                                fontSize: '13px',
                                                                color: 'var(--color-text-secondary)'
                                                            },
                                                            children: "Dispatch Status"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/SamplesView.jsx",
                                                            lineNumber: 644,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            style: {
                                                                fontSize: '13.5px',
                                                                fontWeight: '700',
                                                                color: dispatchStatus === 'Delivered' ? '#16a34a' : '#2563eb'
                                                            },
                                                            children: dispatchStatus === 'Delivered' ? 'Delivered ✅' : dispatchStatus
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/SamplesView.jsx",
                                                            lineNumber: 645,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/SamplesView.jsx",
                                                    lineNumber: 643,
                                                    columnNumber: 19
                                                }, this),
                                                dispatchStatus === 'Delivered' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                    children: [
                                                        renderDetailRow('Delivered On', formatDateClean(sample.deliveredDate || sample.deliveredAt || sample.deliveryDate)),
                                                        renderDetailRow('Delivered Time', sample.deliveredTime || '06:42 PM'),
                                                        renderDetailRow('Received By', sample.receiverName || sample.receiver_name || 'Rajesh Sharma'),
                                                        renderDetailRow('POD Uploaded', 'Yes')
                                                    ]
                                                }, void 0, true),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: '8px',
                                                        paddingTop: '8px',
                                                        borderTop: '1px solid #f1f5f9'
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            style: {
                                                                fontSize: '13px',
                                                                color: 'var(--color-text-secondary)',
                                                                fontWeight: '600'
                                                            },
                                                            children: "Dispatch Document"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/SamplesView.jsx",
                                                            lineNumber: 660,
                                                            columnNumber: 21
                                                        }, this),
                                                        dispatchDoc ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            style: {
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                gap: '6px'
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    style: {
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '6px',
                                                                        fontSize: '13px',
                                                                        color: 'var(--color-text-primary)'
                                                                    },
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            children: "📄"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/components/SamplesView.jsx",
                                                                            lineNumber: 664,
                                                                            columnNumber: 27
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            style: {
                                                                                fontFamily: 'monospace',
                                                                                fontWeight: 'bold'
                                                                            },
                                                                            children: getDocFilename(dispatchDoc, sample.id)
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/components/SamplesView.jsx",
                                                                            lineNumber: 665,
                                                                            columnNumber: 27
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/components/SamplesView.jsx",
                                                                    lineNumber: 663,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    style: {
                                                                        display: 'flex',
                                                                        gap: '8px'
                                                                    },
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                            type: "button",
                                                                            onClick: ()=>showDispatchDocument(dispatchDoc, sample.id),
                                                                            style: {
                                                                                display: 'inline-flex',
                                                                                alignItems: 'center',
                                                                                gap: '4px',
                                                                                background: '#eff6ff',
                                                                                border: '1px solid #bfdbfe',
                                                                                borderRadius: '6px',
                                                                                padding: '6px 12px',
                                                                                fontSize: '12px',
                                                                                fontWeight: '700',
                                                                                color: '#1d4ed8',
                                                                                cursor: 'pointer'
                                                                            },
                                                                            children: "👁 Preview"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/components/SamplesView.jsx",
                                                                            lineNumber: 668,
                                                                            columnNumber: 27
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                            type: "button",
                                                                            onClick: ()=>downloadDispatchDocument(dispatchDoc, sample.id),
                                                                            style: {
                                                                                display: 'inline-flex',
                                                                                alignItems: 'center',
                                                                                gap: '4px',
                                                                                background: '#f0fdf4',
                                                                                border: '1px solid #bbf7d0',
                                                                                borderRadius: '6px',
                                                                                padding: '6px 12px',
                                                                                fontSize: '12px',
                                                                                fontWeight: '700',
                                                                                color: '#15803d',
                                                                                cursor: 'pointer'
                                                                            },
                                                                            children: "⬇ Download"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/components/SamplesView.jsx",
                                                                            lineNumber: 675,
                                                                            columnNumber: 27
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                                            href: dispatchDoc,
                                                                            target: "_blank",
                                                                            rel: "noopener noreferrer",
                                                                            style: {
                                                                                display: 'inline-flex',
                                                                                alignItems: 'center',
                                                                                gap: '4px',
                                                                                background: '#F5FAFE',
                                                                                border: '1px solid #d1d5db',
                                                                                borderRadius: '6px',
                                                                                padding: '6px 12px',
                                                                                fontSize: '12px',
                                                                                fontWeight: '700',
                                                                                color: '#374151',
                                                                                cursor: 'pointer',
                                                                                textDecoration: 'none'
                                                                            },
                                                                            children: "↗ Open in New Tab"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/components/SamplesView.jsx",
                                                                            lineNumber: 682,
                                                                            columnNumber: 27
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/components/SamplesView.jsx",
                                                                    lineNumber: 667,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/components/SamplesView.jsx",
                                                            lineNumber: 662,
                                                            columnNumber: 23
                                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            style: {
                                                                fontSize: '13px',
                                                                color: 'var(--color-text-muted)',
                                                                fontStyle: 'italic'
                                                            },
                                                            children: "No document uploaded."
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/SamplesView.jsx",
                                                            lineNumber: 693,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/SamplesView.jsx",
                                                    lineNumber: 659,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/SamplesView.jsx",
                                            lineNumber: 636,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/SamplesView.jsx",
                                    lineNumber: 631,
                                    columnNumber: 15
                                }, this),
                                dispatchStatus === 'Delivered' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        background: '#ffffff',
                                        border: '1px solid #86efac',
                                        borderRadius: '12px',
                                        padding: '16px 20px',
                                        boxShadow: '0 2px 4px rgba(22, 163, 74, 0.06)'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            style: {
                                                fontSize: '14px',
                                                fontWeight: '800',
                                                color: '#15803d',
                                                margin: '0 0 14px 0',
                                                borderBottom: '1px solid #bbf7d0',
                                                paddingBottom: '8px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                                                    size: 16,
                                                    color: "#16a34a"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/SamplesView.jsx",
                                                    lineNumber: 704,
                                                    columnNumber: 19
                                                }, this),
                                                " Proof of Delivery (POD Verified)"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/SamplesView.jsx",
                                            lineNumber: 703,
                                            columnNumber: 17
                                        }, this),
                                        podImage ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '10px'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    onClick: ()=>showPodPopup(sample),
                                                    style: {
                                                        border: '2px dashed #86efac',
                                                        borderRadius: '10px',
                                                        padding: '12px',
                                                        background: '#f0fdf4',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        minHeight: '160px'
                                                    },
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                        src: podImage,
                                                        alt: "Proof of Delivery",
                                                        style: {
                                                            maxWidth: '100%',
                                                            maxHeight: '200px',
                                                            objectFit: 'contain',
                                                            borderRadius: '8px'
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/SamplesView.jsx",
                                                        lineNumber: 722,
                                                        columnNumber: 23
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/components/SamplesView.jsx",
                                                    lineNumber: 708,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    style: {
                                                        fontSize: '11.5px',
                                                        color: '#166534',
                                                        margin: 0,
                                                        textAlign: 'center',
                                                        fontWeight: '600'
                                                    },
                                                    children: "Click image to enlarge verification signature"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/SamplesView.jsx",
                                                    lineNumber: 728,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/SamplesView.jsx",
                                            lineNumber: 707,
                                            columnNumber: 19
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                padding: '20px',
                                                background: '#f0fdf4',
                                                borderRadius: '8px',
                                                border: '1px dashed #86efac',
                                                textAlign: 'center',
                                                color: '#15803d',
                                                fontWeight: 'bold'
                                            },
                                            children: "✓ Verified Signed Delivery Slip Recorded"
                                        }, void 0, false, {
                                            fileName: "[project]/components/SamplesView.jsx",
                                            lineNumber: 731,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/SamplesView.jsx",
                                    lineNumber: 702,
                                    columnNumber: 15
                                }, this),
                                sample.retrievalStatus && sample.retrievalStatus !== 'None' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        background: '#F5FAFE',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: '12px',
                                        padding: '16px 20px'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            style: {
                                                fontSize: '14px',
                                                fontWeight: '800',
                                                color: 'var(--color-text-primary)',
                                                margin: '0 0 14px 0',
                                                borderBottom: '1px solid #DCE5F0',
                                                paddingBottom: '8px'
                                            },
                                            children: "Return Logistics Ledger"
                                        }, void 0, false, {
                                            fileName: "[project]/components/SamplesView.jsx",
                                            lineNumber: 741,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                fontSize: '12.5px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '8px',
                                                color: 'var(--color-text-primary)'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        "Status: ",
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                            style: {
                                                                color: sample.retrievalStatus === 'Retrieved' ? '#16a34a' : sample.retrievalStatus === 'In Transit' ? '#2563eb' : '#ea580c'
                                                            },
                                                            children: sample.retrievalStatus === 'Requested' ? 'Awaiting Pick-up' : sample.retrievalStatus === 'In Transit' ? 'In Return Transit' : 'Returned to plant'
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/SamplesView.jsx",
                                                            lineNumber: 745,
                                                            columnNumber: 32
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/SamplesView.jsx",
                                                    lineNumber: 745,
                                                    columnNumber: 19
                                                }, this),
                                                sample.retrievalDetails && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            children: [
                                                                "Driver: ",
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                    children: [
                                                                        sample.retrievalDetails.driverName,
                                                                        " (",
                                                                        sample.retrievalDetails.driverMobile,
                                                                        ")"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/components/SamplesView.jsx",
                                                                    lineNumber: 748,
                                                                    columnNumber: 36
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/components/SamplesView.jsx",
                                                            lineNumber: 748,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            children: [
                                                                "Vehicle: ",
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                    children: sample.retrievalDetails.vehicleNo
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/SamplesView.jsx",
                                                                    lineNumber: 749,
                                                                    columnNumber: 37
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/components/SamplesView.jsx",
                                                            lineNumber: 749,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            children: [
                                                                "Pick-up Date: ",
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                    children: sample.retrievalDetails.pickupDate
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/SamplesView.jsx",
                                                                    lineNumber: 750,
                                                                    columnNumber: 42
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/components/SamplesView.jsx",
                                                            lineNumber: 750,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true),
                                                sample.retrievalStatus === 'Retrieved' && ((_sample_retrievalDetails = sample.retrievalDetails) === null || _sample_retrievalDetails === void 0 ? void 0 : _sample_retrievalDetails.returnPod) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                    src: sample.retrievalDetails.returnPod,
                                                    alt: "Proof of Return",
                                                    style: {
                                                        width: '100px',
                                                        height: '72px',
                                                        objectFit: 'contain',
                                                        borderRadius: '8px',
                                                        border: '1px solid #D6E2F0',
                                                        background: '#fff',
                                                        cursor: 'pointer',
                                                        marginTop: '6px'
                                                    },
                                                    onClick: ()=>{
                                                        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
                                                            imageUrl: sample.retrievalDetails.returnPod,
                                                            imageAlt: 'Proof of Return',
                                                            title: "Return Proof — ".concat(formatSampleId(sample.id)),
                                                            confirmButtonText: 'Close',
                                                            customClass: {
                                                                popup: 'swal-premium-popup',
                                                                title: 'swal-premium-title',
                                                                confirmButton: 'swal-premium-confirm-btn'
                                                            },
                                                            buttonsStyling: false
                                                        });
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/components/SamplesView.jsx",
                                                    lineNumber: 754,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/SamplesView.jsx",
                                            lineNumber: 744,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/SamplesView.jsx",
                                    lineNumber: 740,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/SamplesView.jsx",
                            lineNumber: 602,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '20px'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        background: '#F5FAFE',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: '12px',
                                        padding: '16px 20px'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            style: {
                                                fontSize: '14px',
                                                fontWeight: '800',
                                                color: 'var(--color-text-primary)',
                                                margin: '0 0 14px 0',
                                                borderBottom: '1px solid #DCE5F0',
                                                paddingBottom: '8px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__["Clock"], {
                                                    size: 16,
                                                    color: "#3b82f6"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/SamplesView.jsx",
                                                    lineNumber: 780,
                                                    columnNumber: 17
                                                }, this),
                                                "⚡ Testing Track Status"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/SamplesView.jsx",
                                            lineNumber: 779,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                marginBottom: '14px'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: getStatusBadge(sample.status),
                                                    style: {
                                                        padding: '4px 10px',
                                                        borderRadius: '6px',
                                                        fontSize: '12.5px',
                                                        fontWeight: 'bold'
                                                    },
                                                    children: sample.status
                                                }, void 0, false, {
                                                    fileName: "[project]/components/SamplesView.jsx",
                                                    lineNumber: 785,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    style: {
                                                        fontSize: '12.5px',
                                                        color: 'var(--color-text-secondary)'
                                                    },
                                                    children: [
                                                        "Expiry Date: ",
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                            style: {
                                                                color: 'var(--color-text-primary)'
                                                            },
                                                            children: formatDateClean(exactInfo.expDateStr)
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/SamplesView.jsx",
                                                            lineNumber: 789,
                                                            columnNumber: 32
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/SamplesView.jsx",
                                                    lineNumber: 788,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/SamplesView.jsx",
                                            lineNumber: 784,
                                            columnNumber: 15
                                        }, this),
                                        dispatchStatus === 'Delivered' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '8px',
                                                marginBottom: '16px',
                                                background: '#ffffff',
                                                padding: '12px 14px',
                                                borderRadius: '8px',
                                                border: '1px solid #DCE5F0',
                                                boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        fontSize: '13px'
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            style: {
                                                                color: 'var(--color-text-secondary)'
                                                            },
                                                            children: "Delivered :"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/SamplesView.jsx",
                                                            lineNumber: 797,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                            style: {
                                                                color: 'var(--color-text-primary)'
                                                            },
                                                            children: formatDateClean(sample.deliveredDate || sample.deliveredAt || sample.deliveryDate || sample.dispatchDate)
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/SamplesView.jsx",
                                                            lineNumber: 798,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/SamplesView.jsx",
                                                    lineNumber: 796,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        fontSize: '13px'
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            style: {
                                                                color: 'var(--color-text-secondary)'
                                                            },
                                                            children: "Testing Ends :"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/SamplesView.jsx",
                                                            lineNumber: 801,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                            style: {
                                                                color: 'var(--color-text-primary)'
                                                            },
                                                            children: formatDateClean(exactInfo.expDateStr)
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/SamplesView.jsx",
                                                            lineNumber: 802,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/SamplesView.jsx",
                                                    lineNumber: 800,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        fontSize: '13px',
                                                        borderTop: '1px solid #f1f5f9',
                                                        paddingTop: '8px',
                                                        alignItems: 'center'
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            style: {
                                                                color: 'var(--color-text-secondary)'
                                                            },
                                                            children: "Remaining"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/SamplesView.jsx",
                                                            lineNumber: 805,
                                                            columnNumber: 21
                                                        }, this),
                                                        exactInfo.isExpired ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "badge badge-danger",
                                                            style: {
                                                                padding: '4px 10px',
                                                                borderRadius: '6px',
                                                                fontWeight: 'bold'
                                                            },
                                                            children: "Testing Period Expired"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/SamplesView.jsx",
                                                            lineNumber: 807,
                                                            columnNumber: 23
                                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            style: {
                                                                display: 'flex',
                                                                gap: '8px',
                                                                fontWeight: '800',
                                                                color: '#1e293b'
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    children: [
                                                                        exactInfo.days,
                                                                        " Days"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/components/SamplesView.jsx",
                                                                    lineNumber: 810,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    children: [
                                                                        exactInfo.hours,
                                                                        " Hours"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/components/SamplesView.jsx",
                                                                    lineNumber: 811,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    children: [
                                                                        exactInfo.minutes,
                                                                        " Minutes"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/components/SamplesView.jsx",
                                                                    lineNumber: 812,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/components/SamplesView.jsx",
                                                            lineNumber: 809,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/SamplesView.jsx",
                                                    lineNumber: 804,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/SamplesView.jsx",
                                            lineNumber: 795,
                                            columnNumber: 17
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                padding: '12px',
                                                background: '#fef9c3',
                                                border: '1px solid #fde047',
                                                borderRadius: '8px',
                                                color: '#854d0e',
                                                fontSize: '12.5px',
                                                fontWeight: '600',
                                                marginBottom: '16px',
                                                textAlign: 'center'
                                            },
                                            children: "⏳ 20-Day testing window will start strictly after sample delivery is confirmed."
                                        }, void 0, false, {
                                            fileName: "[project]/components/SamplesView.jsx",
                                            lineNumber: 818,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                marginBottom: '20px'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        marginBottom: '6px',
                                                        fontSize: '12.5px',
                                                        fontWeight: '700'
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            style: {
                                                                color: 'var(--color-text-secondary)'
                                                            },
                                                            children: "Remaining Validity"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/SamplesView.jsx",
                                                            lineNumber: 826,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                            style: {
                                                                color: exactInfo.days >= 11 ? '#16a34a' : exactInfo.days >= 6 ? '#ca8a04' : '#dc2626'
                                                            },
                                                            children: exactInfo.isExpired ? '0 Days Left' : "".concat(exactInfo.days, " / 20 Days Remaining")
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/SamplesView.jsx",
                                                            lineNumber: 827,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/SamplesView.jsx",
                                                    lineNumber: 825,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        width: '100%',
                                                        height: '10px',
                                                        background: '#D6E2F0',
                                                        borderRadius: '9999px',
                                                        overflow: 'hidden'
                                                    },
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            width: "".concat(exactInfo.percent, "%"),
                                                            height: '100%',
                                                            background: exactInfo.days >= 11 ? '#22c55e' : exactInfo.days >= 6 ? '#eab308' : exactInfo.days >= 2 ? '#f97316' : '#ef4444',
                                                            borderRadius: '9999px',
                                                            transition: 'width 0.5s ease-in-out'
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/SamplesView.jsx",
                                                        lineNumber: 832,
                                                        columnNumber: 19
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/components/SamplesView.jsx",
                                                    lineNumber: 831,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        marginTop: '4px',
                                                        fontSize: '10px',
                                                        color: 'var(--color-text-muted)',
                                                        fontWeight: 'bold'
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            children: "20 Days"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/SamplesView.jsx",
                                                            lineNumber: 843,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            children: "14-8 Days"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/SamplesView.jsx",
                                                            lineNumber: 844,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            children: "0 Days"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/SamplesView.jsx",
                                                            lineNumber: 845,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/SamplesView.jsx",
                                                    lineNumber: 842,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/SamplesView.jsx",
                                            lineNumber: 824,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    style: {
                                                        fontSize: '12px',
                                                        fontWeight: '800',
                                                        textTransform: 'uppercase',
                                                        color: 'var(--color-text-secondary)',
                                                        display: 'block',
                                                        marginBottom: '10px'
                                                    },
                                                    children: "Sample Lifecycle Timeline"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/SamplesView.jsx",
                                                    lineNumber: 851,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: '0'
                                                    },
                                                    children: timelineMilestones.map((milestone, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            style: {
                                                                display: 'flex',
                                                                gap: '12px'
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    style: {
                                                                        display: 'flex',
                                                                        flexDirection: 'column',
                                                                        alignItems: 'center',
                                                                        width: '24px',
                                                                        flexShrink: 0
                                                                    },
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            style: {
                                                                                width: '20px',
                                                                                height: '20px',
                                                                                borderRadius: '50%',
                                                                                background: milestone.active ? '#dcfce7' : '#f1f5f9',
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'center',
                                                                                color: milestone.active ? '#16a34a' : 'var(--color-text-secondary)',
                                                                                fontWeight: 'bold',
                                                                                fontSize: '11px',
                                                                                flexShrink: 0
                                                                            },
                                                                            children: milestone.active ? '✓' : '○'
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/components/SamplesView.jsx",
                                                                            lineNumber: 858,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        idx < timelineMilestones.length - 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            style: {
                                                                                width: '2px',
                                                                                flex: 1,
                                                                                minHeight: '16px',
                                                                                background: milestone.active ? '#86efac' : '#DCE5F0',
                                                                                margin: '4px 0'
                                                                            }
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/components/SamplesView.jsx",
                                                                            lineNumber: 874,
                                                                            columnNumber: 27
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/components/SamplesView.jsx",
                                                                    lineNumber: 857,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    style: {
                                                                        paddingBottom: idx < timelineMilestones.length - 1 ? '14px' : '0',
                                                                        flex: 1
                                                                    },
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        style: {
                                                                            fontSize: '13px',
                                                                            color: milestone.active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                                                                            fontWeight: milestone.active ? '700' : 'normal'
                                                                        },
                                                                        children: milestone.label
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/components/SamplesView.jsx",
                                                                        lineNumber: 878,
                                                                        columnNumber: 25
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/SamplesView.jsx",
                                                                    lineNumber: 877,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, milestone.label, true, {
                                                            fileName: "[project]/components/SamplesView.jsx",
                                                            lineNumber: 856,
                                                            columnNumber: 21
                                                        }, this))
                                                }, void 0, false, {
                                                    fileName: "[project]/components/SamplesView.jsx",
                                                    lineNumber: 854,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/SamplesView.jsx",
                                            lineNumber: 850,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/SamplesView.jsx",
                                    lineNumber: 778,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        background: '#F5FAFE',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: '12px',
                                        padding: '16px 20px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '14px'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                            style: {
                                                fontSize: '13.5px',
                                                fontWeight: '800',
                                                color: 'var(--color-text-secondary)',
                                                margin: 0
                                            },
                                            children: "Operations Control"
                                        }, void 0, false, {
                                            fileName: "[project]/components/SamplesView.jsx",
                                            lineNumber: 894,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                                gap: '10px'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    className: "btn-small",
                                                    disabled: dispatchStatus === 'Pending Dispatch',
                                                    onClick: ()=>{
                                                        if (dispatchStatus !== 'Pending Dispatch') {
                                                            var _dispatchDetailsRef_current;
                                                            (_dispatchDetailsRef_current = dispatchDetailsRef.current) === null || _dispatchDetailsRef_current === void 0 ? void 0 : _dispatchDetailsRef_current.scrollIntoView({
                                                                behavior: 'smooth',
                                                                block: 'start'
                                                            });
                                                        }
                                                    },
                                                    style: {
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '6px',
                                                        background: dispatchStatus !== 'Pending Dispatch' ? '#2563eb' : '#DCE5F0',
                                                        color: dispatchStatus !== 'Pending Dispatch' ? '#fff' : '#8893A7',
                                                        border: 'none',
                                                        padding: '8px 12px',
                                                        borderRadius: '8px',
                                                        fontWeight: 'bold',
                                                        cursor: dispatchStatus !== 'Pending Dispatch' ? 'pointer' : 'not-allowed',
                                                        width: '100%'
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$truck$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Truck$3e$__["Truck"], {
                                                            size: 13
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/SamplesView.jsx",
                                                            lineNumber: 916,
                                                            columnNumber: 19
                                                        }, this),
                                                        " View Dispatch Details"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/SamplesView.jsx",
                                                    lineNumber: 898,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    className: "btn-small",
                                                    onClick: ()=>{
                                                        if (dispatchDoc) {
                                                            showDispatchDocument(dispatchDoc, sample.id);
                                                        } else {
                                                            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
                                                                icon: 'warning',
                                                                title: 'Missing Document',
                                                                text: 'No dispatch document uploaded for this sample.'
                                                            });
                                                        }
                                                    },
                                                    style: {
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '6px',
                                                        background: dispatchDoc ? '#1d4ed8' : '#DCE5F0',
                                                        color: dispatchDoc ? '#fff' : '#8893A7',
                                                        border: 'none',
                                                        padding: '8px 12px',
                                                        borderRadius: '8px',
                                                        fontWeight: 'bold',
                                                        cursor: 'pointer',
                                                        width: '100%'
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"], {
                                                            size: 13
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/SamplesView.jsx",
                                                            lineNumber: 937,
                                                            columnNumber: 19
                                                        }, this),
                                                        " View Dispatch Document"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/SamplesView.jsx",
                                                    lineNumber: 919,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    className: "btn-small",
                                                    onClick: ()=>{
                                                        if (dispatchDoc && getDocType(dispatchDoc) === 'image') {
                                                            showDispatchDocument(dispatchDoc, sample.id);
                                                        } else if (dispatchDoc) {
                                                            showDispatchDocument(dispatchDoc, sample.id);
                                                        } else {
                                                            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
                                                                icon: 'warning',
                                                                title: 'No Image Found',
                                                                text: 'No dispatch image uploaded for this sample.'
                                                            });
                                                        }
                                                    },
                                                    style: {
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '6px',
                                                        background: dispatchDoc && getDocType(dispatchDoc) === 'image' ? '#0284c7' : '#DCE5F0',
                                                        color: dispatchDoc && getDocType(dispatchDoc) === 'image' ? '#fff' : '#8893A7',
                                                        border: 'none',
                                                        padding: '8px 12px',
                                                        borderRadius: '8px',
                                                        fontWeight: 'bold',
                                                        cursor: dispatchDoc && getDocType(dispatchDoc) === 'image' ? 'pointer' : 'not-allowed',
                                                        width: '100%'
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"], {
                                                            size: 13
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/SamplesView.jsx",
                                                            lineNumber: 961,
                                                            columnNumber: 19
                                                        }, this),
                                                        " View Dispatch Image"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/SamplesView.jsx",
                                                    lineNumber: 940,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    className: "btn-small",
                                                    disabled: !podImage,
                                                    onClick: ()=>showPodPopup(sample),
                                                    style: {
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '6px',
                                                        background: podImage ? '#0f766e' : '#DCE5F0',
                                                        color: podImage ? '#fff' : '#8893A7',
                                                        border: 'none',
                                                        padding: '8px 12px',
                                                        borderRadius: '8px',
                                                        fontWeight: 'bold',
                                                        cursor: podImage ? 'pointer' : 'not-allowed',
                                                        width: '100%'
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"], {
                                                            size: 13
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/SamplesView.jsx",
                                                            lineNumber: 978,
                                                            columnNumber: 19
                                                        }, this),
                                                        " View POD"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/SamplesView.jsx",
                                                    lineNumber: 964,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    className: "btn-small",
                                                    onClick: ()=>{
                                                        var _document_getElementById;
                                                        (_document_getElementById = document.getElementById('live-transit-route')) === null || _document_getElementById === void 0 ? void 0 : _document_getElementById.scrollIntoView({
                                                            behavior: 'smooth',
                                                            block: 'start'
                                                        });
                                                    },
                                                    style: {
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '6px',
                                                        background: '#4f46e5',
                                                        color: '#fff',
                                                        border: 'none',
                                                        padding: '8px 12px',
                                                        borderRadius: '8px',
                                                        fontWeight: 'bold',
                                                        cursor: 'pointer',
                                                        width: '100%'
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__["MapPin"], {
                                                            size: 13
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/SamplesView.jsx",
                                                            lineNumber: 995,
                                                            columnNumber: 19
                                                        }, this),
                                                        " Track Shipment Route"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/SamplesView.jsx",
                                                    lineNumber: 981,
                                                    columnNumber: 17
                                                }, this),
                                                (exactInfo.isExpired || exactInfo.days <= 0 || sample.status === 'Return Due' || sample.status === 'Return Requested' || sample.status === 'Return In Transit' || sample.status === 'Returned') && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    className: "btn-small",
                                                    onClick: ()=>handleRequestReturn(sample.id),
                                                    style: {
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '6px',
                                                        background: '#ef4444',
                                                        color: '#fff',
                                                        border: 'none',
                                                        padding: '8px 12px',
                                                        borderRadius: '8px',
                                                        fontWeight: 'bold',
                                                        cursor: 'pointer',
                                                        width: '100%'
                                                    },
                                                    children: "🔄 Return Sample"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/SamplesView.jsx",
                                                    lineNumber: 999,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/SamplesView.jsx",
                                            lineNumber: 897,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("hr", {
                                            style: {
                                                border: '0',
                                                borderTop: '1px solid #D6E2F0',
                                                margin: '6px 0'
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/components/SamplesView.jsx",
                                            lineNumber: 1016,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '8px'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    style: {
                                                        fontSize: '13px',
                                                        fontWeight: '800',
                                                        color: 'var(--color-text-secondary)'
                                                    },
                                                    children: "Testing Status"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/SamplesView.jsx",
                                                    lineNumber: 1020,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        display: 'flex',
                                                        gap: '16px',
                                                        flexWrap: 'wrap'
                                                    },
                                                    children: [
                                                        {
                                                            label: 'Pending',
                                                            status: 'Sent',
                                                            color: '#3b82f6'
                                                        },
                                                        {
                                                            label: 'Passed',
                                                            status: 'Testing Passed',
                                                            color: '#22c55e'
                                                        },
                                                        {
                                                            label: 'Failed',
                                                            status: 'Lost',
                                                            color: '#ef4444'
                                                        }
                                                    ].map((opt)=>{
                                                        const isCurrent = sample.status === opt.status || opt.status === 'Sent' && sample.status === 'Dispatched';
                                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                            style: {
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '6px',
                                                                fontSize: '13.5px',
                                                                cursor: 'pointer',
                                                                fontWeight: isCurrent ? 'bold' : 'normal'
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                    type: "radio",
                                                                    name: "testingStatus",
                                                                    checked: isCurrent,
                                                                    onChange: ()=>handleUpdateStatusClick(sample.id, opt.status, "Set Testing Status to ".concat(opt.label)),
                                                                    style: {
                                                                        accentColor: opt.color
                                                                    }
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/SamplesView.jsx",
                                                                    lineNumber: 1030,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    style: {
                                                                        color: opt.color
                                                                    },
                                                                    children: "●"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/SamplesView.jsx",
                                                                    lineNumber: 1037,
                                                                    columnNumber: 25
                                                                }, this),
                                                                " ",
                                                                opt.label
                                                            ]
                                                        }, opt.label, true, {
                                                            fileName: "[project]/components/SamplesView.jsx",
                                                            lineNumber: 1029,
                                                            columnNumber: 23
                                                        }, this);
                                                    })
                                                }, void 0, false, {
                                                    fileName: "[project]/components/SamplesView.jsx",
                                                    lineNumber: 1021,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/SamplesView.jsx",
                                            lineNumber: 1019,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("hr", {
                                            style: {
                                                border: '0',
                                                borderTop: '1px solid #D6E2F0',
                                                margin: '6px 0'
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/components/SamplesView.jsx",
                                            lineNumber: 1044,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '10px'
                                            },
                                            children: [
                                                sample.testingStatus === 'PASSED' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    className: "btn-small",
                                                    onClick: ()=>handleCreateQuotationClick(sample),
                                                    style: {
                                                        width: '100%',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '6px',
                                                        background: '#22c55e',
                                                        color: '#fff',
                                                        border: 'none',
                                                        padding: '10px 14px',
                                                        borderRadius: '8px',
                                                        fontWeight: 'bold',
                                                        cursor: 'pointer'
                                                    },
                                                    children: [
                                                        "🟢 Create Quotation ",
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__["ArrowRight"], {
                                                            size: 14
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/SamplesView.jsx",
                                                            lineNumber: 1060,
                                                            columnNumber: 41
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/SamplesView.jsx",
                                                    lineNumber: 1049,
                                                    columnNumber: 19
                                                }, this),
                                                sample.testingStatus === 'FAILED' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: '8px',
                                                        width: '100%'
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            type: "button",
                                                            className: "btn-small",
                                                            onClick: ()=>handleCreateReplacementSample(sample),
                                                            style: {
                                                                width: '100%',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                gap: '6px',
                                                                background: '#ef4444',
                                                                color: '#fff',
                                                                border: 'none',
                                                                padding: '10px 14px',
                                                                borderRadius: '8px',
                                                                fontWeight: 'bold',
                                                                cursor: 'pointer'
                                                            },
                                                            children: "🔴 Create Replacement Sample"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/SamplesView.jsx",
                                                            lineNumber: 1066,
                                                            columnNumber: 21
                                                        }, this),
                                                        (!sample.retrievalStatus || sample.retrievalStatus === 'None') && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            className: "btn-small",
                                                            onClick: ()=>handleRequestRetrievalClick(sample.id),
                                                            style: {
                                                                width: '100%',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                gap: '6px',
                                                                background: '#ea580c',
                                                                color: '#fff',
                                                                border: 'none',
                                                                padding: '10px 14px',
                                                                borderRadius: '8px',
                                                                fontWeight: 'bold',
                                                                cursor: 'pointer'
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$truck$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Truck$3e$__["Truck"], {
                                                                    size: 12
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/SamplesView.jsx",
                                                                    lineNumber: 1098,
                                                                    columnNumber: 25
                                                                }, this),
                                                                " Take Back Sample"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/components/SamplesView.jsx",
                                                            lineNumber: 1080,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/SamplesView.jsx",
                                                    lineNumber: 1065,
                                                    columnNumber: 19
                                                }, this),
                                                sample.testingStatus === 'PENDING' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    style: {
                                                        fontSize: '12px',
                                                        color: 'var(--color-text-muted)',
                                                        fontStyle: 'italic',
                                                        textAlign: 'center'
                                                    },
                                                    children: "Set status to Passed to enable quotation creation."
                                                }, void 0, false, {
                                                    fileName: "[project]/components/SamplesView.jsx",
                                                    lineNumber: 1105,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/SamplesView.jsx",
                                            lineNumber: 1047,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/SamplesView.jsx",
                                    lineNumber: 893,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/SamplesView.jsx",
                            lineNumber: 776,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/SamplesView.jsx",
                    lineNumber: 600,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        marginTop: '24px',
                        background: '#F5FAFE',
                        border: '1px solid var(--color-border)',
                        borderRadius: '12px',
                        padding: '20px'
                    },
                    children: sample.retrievalStatus && sample.retrievalStatus !== 'None' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                style: {
                                    fontSize: '14.5px',
                                    fontWeight: '800',
                                    color: 'var(--color-text-primary)',
                                    margin: '0 0 16px 0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__["MapPin"], {
                                        size: 16,
                                        color: "#ea580c"
                                    }, void 0, false, {
                                        fileName: "[project]/components/SamplesView.jsx",
                                        lineNumber: 1120,
                                        columnNumber: 17
                                    }, this),
                                    "📍 Live Sample Retrieval Route (Return Journey)"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/SamplesView.jsx",
                                lineNumber: 1119,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '20px'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            position: 'relative',
                                            height: '60px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '0 40px',
                                            background: '#ffffff',
                                            borderRadius: '10px',
                                            border: '1px dashed #D6E2F0'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    zIndex: 1
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            width: '12px',
                                                            height: '12px',
                                                            borderRadius: '50%',
                                                            background: '#16a34a'
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/SamplesView.jsx",
                                                        lineNumber: 1127,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            fontSize: '11px',
                                                            fontWeight: 'bold',
                                                            marginTop: '4px',
                                                            color: 'var(--color-text-primary)'
                                                        },
                                                        children: [
                                                            sample.leadName,
                                                            " (Client)"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/SamplesView.jsx",
                                                        lineNumber: 1128,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/SamplesView.jsx",
                                                lineNumber: 1126,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    flex: 1,
                                                    position: 'relative',
                                                    margin: '0 16px'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            borderBottom: '2px dotted #8893A7',
                                                            width: '100%',
                                                            position: 'absolute',
                                                            top: '50%',
                                                            transform: 'translateY(-50%)'
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/SamplesView.jsx",
                                                        lineNumber: 1132,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            position: 'absolute',
                                                            top: '50%',
                                                            left: sample.retrievalStatus === 'Retrieved' ? '100%' : sample.retrievalStatus === 'In Transit' ? '50%' : '0%',
                                                            transform: 'translate(-50%, -50%)',
                                                            background: '#ea580c',
                                                            padding: '4px 8px',
                                                            borderRadius: '6px',
                                                            boxShadow: 'var(--shadow-soft)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            animation: sample.retrievalStatus === 'In Transit' ? 'truck-bounce 0.8s infinite alternate ease-in-out' : 'none'
                                                        },
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$truck$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Truck$3e$__["Truck"], {
                                                            size: 14,
                                                            color: "#fff"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/SamplesView.jsx",
                                                            lineNumber: 1148,
                                                            columnNumber: 23
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/SamplesView.jsx",
                                                        lineNumber: 1133,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/SamplesView.jsx",
                                                lineNumber: 1131,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    zIndex: 1
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            width: '12px',
                                                            height: '12px',
                                                            borderRadius: '50%',
                                                            background: sample.retrievalStatus === 'Retrieved' ? '#16a34a' : '#8893A7'
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/SamplesView.jsx",
                                                        lineNumber: 1153,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            fontSize: '11px',
                                                            fontWeight: 'bold',
                                                            marginTop: '4px',
                                                            color: 'var(--color-text-primary)'
                                                        },
                                                        children: "Haridwar Factory"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/SamplesView.jsx",
                                                        lineNumber: 1154,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/SamplesView.jsx",
                                                lineNumber: 1152,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/SamplesView.jsx",
                                        lineNumber: 1125,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                            gap: '12px'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    padding: '10px 14px',
                                                    background: '#ffffff',
                                                    borderRadius: '8px',
                                                    border: '1px solid #DCE5F0'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            fontSize: '10px',
                                                            color: 'var(--color-text-muted)',
                                                            fontWeight: 'bold'
                                                        },
                                                        children: "Retrieval Request"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/SamplesView.jsx",
                                                        lineNumber: 1161,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            fontSize: '12px',
                                                            fontWeight: '700',
                                                            color: 'var(--color-text-primary)',
                                                            marginTop: '2px'
                                                        },
                                                        children: "Initiated by Sales"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/SamplesView.jsx",
                                                        lineNumber: 1162,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            fontSize: '11px',
                                                            color: '#16a34a'
                                                        },
                                                        children: "✓ Logged on client deal failure"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/SamplesView.jsx",
                                                        lineNumber: 1163,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/SamplesView.jsx",
                                                lineNumber: 1160,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    padding: '10px 14px',
                                                    background: '#ffffff',
                                                    borderRadius: '8px',
                                                    border: '1px solid #DCE5F0'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            fontSize: '10px',
                                                            color: 'var(--color-text-muted)',
                                                            fontWeight: 'bold'
                                                        },
                                                        children: "Return Collection"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/SamplesView.jsx",
                                                        lineNumber: 1166,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            fontSize: '12px',
                                                            fontWeight: '700',
                                                            color: 'var(--color-text-primary)',
                                                            marginTop: '2px'
                                                        },
                                                        children: sample.retrievalStatus === 'Requested' ? 'Awaiting Dispatch Booking' : "En Route via ".concat((_sample_retrievalDetails1 = sample.retrievalDetails) === null || _sample_retrievalDetails1 === void 0 ? void 0 : _sample_retrievalDetails1.vehicleNo)
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/SamplesView.jsx",
                                                        lineNumber: 1167,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            fontSize: '11px',
                                                            color: sample.retrievalStatus === 'Requested' ? '#ea580c' : '#16a34a'
                                                        },
                                                        children: sample.retrievalStatus === 'Requested' ? '⚡ Dispatch pending' : "✓ Driver: ".concat((_sample_retrievalDetails2 = sample.retrievalDetails) === null || _sample_retrievalDetails2 === void 0 ? void 0 : _sample_retrievalDetails2.driverName)
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/SamplesView.jsx",
                                                        lineNumber: 1170,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/SamplesView.jsx",
                                                lineNumber: 1165,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    padding: '10px 14px',
                                                    background: '#ffffff',
                                                    borderRadius: '8px',
                                                    border: '1px solid #DCE5F0'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            fontSize: '10px',
                                                            color: 'var(--color-text-muted)',
                                                            fontWeight: 'bold'
                                                        },
                                                        children: "Plant Receipt"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/SamplesView.jsx",
                                                        lineNumber: 1175,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            fontSize: '12px',
                                                            fontWeight: '700',
                                                            color: 'var(--color-text-primary)',
                                                            marginTop: '2px'
                                                        },
                                                        children: "Warehouse verify & log"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/SamplesView.jsx",
                                                        lineNumber: 1176,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            fontSize: '11px',
                                                            color: sample.retrievalStatus === 'Retrieved' ? '#16a34a' : '#2563eb'
                                                        },
                                                        children: sample.retrievalStatus === 'Retrieved' ? '✓ Received at plant' : '⚡ Awaiting return cargo'
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/SamplesView.jsx",
                                                        lineNumber: 1177,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/SamplesView.jsx",
                                                lineNumber: 1174,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/SamplesView.jsx",
                                        lineNumber: 1159,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/SamplesView.jsx",
                                lineNumber: 1124,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                id: "live-transit-route",
                                style: {
                                    fontSize: '14.5px',
                                    fontWeight: '800',
                                    color: 'var(--color-text-primary)',
                                    margin: '0 0 16px 0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__["MapPin"], {
                                        size: 16,
                                        color: "#ef4444"
                                    }, void 0, false, {
                                        fileName: "[project]/components/SamplesView.jsx",
                                        lineNumber: 1187,
                                        columnNumber: 17
                                    }, this),
                                    "📍 Live Sample Transit Route & Milestones"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/SamplesView.jsx",
                                lineNumber: 1186,
                                columnNumber: 15
                            }, this),
                            sample.dispatchDate ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '22px'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            position: 'relative',
                                            height: '60px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '0 40px',
                                            background: '#ffffff',
                                            borderRadius: '10px',
                                            border: '1px dashed #D6E2F0'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    zIndex: 1
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            width: '12px',
                                                            height: '12px',
                                                            borderRadius: '50%',
                                                            background: '#16a34a'
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/SamplesView.jsx",
                                                        lineNumber: 1195,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            fontSize: '11px',
                                                            fontWeight: 'bold',
                                                            marginTop: '4px',
                                                            color: 'var(--color-text-primary)'
                                                        },
                                                        children: "Haridwar Factory"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/SamplesView.jsx",
                                                        lineNumber: 1196,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/SamplesView.jsx",
                                                lineNumber: 1194,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    flex: 1,
                                                    position: 'relative',
                                                    margin: '0 16px'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            borderBottom: '2px dotted #8893A7',
                                                            width: '100%',
                                                            position: 'absolute',
                                                            top: '50%',
                                                            transform: 'translateY(-50%)'
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/SamplesView.jsx",
                                                        lineNumber: 1200,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            position: 'absolute',
                                                            top: '50%',
                                                            left: dispatchStatus === 'Delivered' ? '100%' : '50%',
                                                            transform: 'translate(-50%, -50%)',
                                                            background: 'var(--color-primary)',
                                                            padding: '4px 8px',
                                                            borderRadius: '6px',
                                                            boxShadow: 'var(--shadow-soft)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            animation: dispatchStatus !== 'Delivered' ? 'truck-bounce 0.8s infinite alternate ease-in-out' : 'none'
                                                        },
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$truck$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Truck$3e$__["Truck"], {
                                                            size: 14,
                                                            color: "#fff"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/SamplesView.jsx",
                                                            lineNumber: 1216,
                                                            columnNumber: 25
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/SamplesView.jsx",
                                                        lineNumber: 1201,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/SamplesView.jsx",
                                                lineNumber: 1199,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    zIndex: 1
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            width: '12px',
                                                            height: '12px',
                                                            borderRadius: '50%',
                                                            background: dispatchStatus === 'Delivered' ? '#16a34a' : '#8893A7'
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/SamplesView.jsx",
                                                        lineNumber: 1221,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            fontSize: '11px',
                                                            fontWeight: 'bold',
                                                            marginTop: '4px',
                                                            color: 'var(--color-text-primary)'
                                                        },
                                                        children: sample.leadName
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/SamplesView.jsx",
                                                        lineNumber: 1222,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/SamplesView.jsx",
                                                lineNumber: 1220,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/SamplesView.jsx",
                                        lineNumber: 1193,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                                            gap: '12px'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    padding: '12px 14px',
                                                    background: '#ffffff',
                                                    borderRadius: '10px',
                                                    border: '1px solid #86efac',
                                                    borderLeft: '4px solid #16a34a'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            fontSize: '10.5px',
                                                            color: 'var(--color-text-secondary)',
                                                            fontWeight: '800',
                                                            textTransform: 'uppercase'
                                                        },
                                                        children: "Step 1: Packed"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/SamplesView.jsx",
                                                        lineNumber: 1229,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            fontSize: '13px',
                                                            fontWeight: '700',
                                                            color: 'var(--color-text-primary)',
                                                            marginTop: '3px'
                                                        },
                                                        children: "🏭 Haridwar Factory"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/SamplesView.jsx",
                                                        lineNumber: 1230,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            fontSize: '11px',
                                                            color: '#16a34a',
                                                            marginTop: '4px',
                                                            fontWeight: '600'
                                                        },
                                                        children: [
                                                            "✓ 09:15 AM (",
                                                            formatDateClean(sample.dispatchDate),
                                                            ")"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/SamplesView.jsx",
                                                        lineNumber: 1231,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/SamplesView.jsx",
                                                lineNumber: 1228,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    padding: '12px 14px',
                                                    background: '#ffffff',
                                                    borderRadius: '10px',
                                                    border: '1px solid #86efac',
                                                    borderLeft: '4px solid #16a34a'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            fontSize: '10.5px',
                                                            color: 'var(--color-text-secondary)',
                                                            fontWeight: '800',
                                                            textTransform: 'uppercase'
                                                        },
                                                        children: "Step 2: Loaded"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/SamplesView.jsx",
                                                        lineNumber: 1235,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            fontSize: '13px',
                                                            fontWeight: '700',
                                                            color: 'var(--color-text-primary)',
                                                            marginTop: '3px'
                                                        },
                                                        children: "🚚 Vehicle Assigned"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/SamplesView.jsx",
                                                        lineNumber: 1236,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            fontSize: '11px',
                                                            color: '#16a34a',
                                                            marginTop: '4px',
                                                            fontWeight: '600'
                                                        },
                                                        children: [
                                                            "✓ 10:20 AM (",
                                                            sample.vehicleNo || sample.vehicle_no || 'Own Fleet',
                                                            ")"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/SamplesView.jsx",
                                                        lineNumber: 1237,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/SamplesView.jsx",
                                                lineNumber: 1234,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    padding: '12px 14px',
                                                    background: '#ffffff',
                                                    borderRadius: '10px',
                                                    border: '1px solid #86efac',
                                                    borderLeft: '4px solid #16a34a'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            fontSize: '10.5px',
                                                            color: 'var(--color-text-secondary)',
                                                            fontWeight: '800',
                                                            textTransform: 'uppercase'
                                                        },
                                                        children: "Step 3: Dispatched"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/SamplesView.jsx",
                                                        lineNumber: 1241,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            fontSize: '13px',
                                                            fontWeight: '700',
                                                            color: 'var(--color-text-primary)',
                                                            marginTop: '3px'
                                                        },
                                                        children: "🚛 Left Factory Gate"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/SamplesView.jsx",
                                                        lineNumber: 1242,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            fontSize: '11px',
                                                            color: '#16a34a',
                                                            marginTop: '4px',
                                                            fontWeight: '600'
                                                        },
                                                        children: [
                                                            "✓ 10:45 AM (",
                                                            formatDateClean(sample.dispatchDate),
                                                            ")"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/SamplesView.jsx",
                                                        lineNumber: 1243,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/SamplesView.jsx",
                                                lineNumber: 1240,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    padding: '12px 14px',
                                                    background: '#ffffff',
                                                    borderRadius: '10px',
                                                    border: '1px solid #bfdbfe',
                                                    borderLeft: '4px solid #3b82f6'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            fontSize: '10.5px',
                                                            color: 'var(--color-text-secondary)',
                                                            fontWeight: '800',
                                                            textTransform: 'uppercase'
                                                        },
                                                        children: "Step 4: Transit"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/SamplesView.jsx",
                                                        lineNumber: 1247,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            fontSize: '13px',
                                                            fontWeight: '700',
                                                            color: 'var(--color-text-primary)',
                                                            marginTop: '3px'
                                                        },
                                                        children: "📍 En Route via Highway"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/SamplesView.jsx",
                                                        lineNumber: 1248,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            fontSize: '11px',
                                                            color: '#2563eb',
                                                            marginTop: '4px',
                                                            fontWeight: '600'
                                                        },
                                                        children: [
                                                            "✓ 02:10 PM (Driver: ",
                                                            sample.driverName || 'Ramesh',
                                                            ")"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/SamplesView.jsx",
                                                        lineNumber: 1249,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/SamplesView.jsx",
                                                lineNumber: 1246,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    padding: '12px 14px',
                                                    background: '#ffffff',
                                                    borderRadius: '10px',
                                                    border: dispatchStatus === 'Delivered' ? '1px solid #86efac' : '1px solid #fde047',
                                                    borderLeft: dispatchStatus === 'Delivered' ? '4px solid #16a34a' : '4px solid #ca8a04'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            fontSize: '10.5px',
                                                            color: 'var(--color-text-secondary)',
                                                            fontWeight: '800',
                                                            textTransform: 'uppercase'
                                                        },
                                                        children: "Step 5: Hub Arrival"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/SamplesView.jsx",
                                                        lineNumber: 1253,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            fontSize: '13px',
                                                            fontWeight: '700',
                                                            color: 'var(--color-text-primary)',
                                                            marginTop: '3px'
                                                        },
                                                        children: "📍 Reached Customer Hub"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/SamplesView.jsx",
                                                        lineNumber: 1254,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            fontSize: '11px',
                                                            color: dispatchStatus === 'Delivered' ? '#16a34a' : '#ca8a04',
                                                            marginTop: '4px',
                                                            fontWeight: '600'
                                                        },
                                                        children: dispatchStatus === 'Delivered' ? '✓ 05:55 PM (Arrived)' : '⚡ In final sorting transit'
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/SamplesView.jsx",
                                                        lineNumber: 1255,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/SamplesView.jsx",
                                                lineNumber: 1252,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    padding: '12px 14px',
                                                    background: '#ffffff',
                                                    borderRadius: '10px',
                                                    border: dispatchStatus === 'Delivered' ? '1px solid #86efac' : '1px solid #DCE5F0',
                                                    borderLeft: dispatchStatus === 'Delivered' ? '4px solid #16a34a' : '4px solid #8893A7'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            fontSize: '10.5px',
                                                            color: 'var(--color-text-secondary)',
                                                            fontWeight: '800',
                                                            textTransform: 'uppercase'
                                                        },
                                                        children: "Step 6: Delivery"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/SamplesView.jsx",
                                                        lineNumber: 1261,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            fontSize: '13px',
                                                            fontWeight: '700',
                                                            color: dispatchStatus === 'Delivered' ? '#15803d' : 'var(--color-text-secondary)',
                                                            marginTop: '3px'
                                                        },
                                                        children: "✅ Delivery Confirmed"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/SamplesView.jsx",
                                                        lineNumber: 1262,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            fontSize: '11px',
                                                            color: dispatchStatus === 'Delivered' ? '#16a34a' : 'var(--color-text-muted)',
                                                            marginTop: '4px',
                                                            fontWeight: '600'
                                                        },
                                                        children: dispatchStatus === 'Delivered' ? "✓ ".concat(sample.deliveredTime || '06:07 PM', " (").concat(sample.receiverName || 'Signed', ")") : '○ Awaiting POD signature'
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/SamplesView.jsx",
                                                        lineNumber: 1265,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/SamplesView.jsx",
                                                lineNumber: 1260,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/SamplesView.jsx",
                                        lineNumber: 1227,
                                        columnNumber: 19
                                    }, this),
                                    dispatchDoc && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            marginTop: '10px',
                                            background: '#ffffff',
                                            border: '1px solid #D6E2F0',
                                            borderRadius: '12px',
                                            padding: '16px 20px'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                style: {
                                                    fontSize: '13.5px',
                                                    fontWeight: '800',
                                                    color: 'var(--color-text-primary)',
                                                    margin: '0 0 12px 0',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px'
                                                },
                                                children: "📄 Dispatch Uploaded Proof / Document"
                                            }, void 0, false, {
                                                fileName: "[project]/components/SamplesView.jsx",
                                                lineNumber: 1274,
                                                columnNumber: 23
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    border: '1px solid #DCE5F0',
                                                    borderRadius: '10px',
                                                    padding: '14px',
                                                    background: '#F5FAFE',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    gap: '12px'
                                                },
                                                children: [
                                                    getDocType(dispatchDoc) === 'image' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                        src: dispatchDoc,
                                                        alt: "Dispatch Uploaded Image",
                                                        style: {
                                                            maxWidth: '100%',
                                                            maxHeight: '350px',
                                                            objectFit: 'contain',
                                                            borderRadius: '8px',
                                                            cursor: 'pointer',
                                                            border: '1px solid #D6E2F0',
                                                            background: '#fff'
                                                        },
                                                        onClick: ()=>showDispatchDocument(dispatchDoc, sample.id)
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/SamplesView.jsx",
                                                        lineNumber: 1279,
                                                        columnNumber: 27
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '10px',
                                                            background: '#eff6ff',
                                                            padding: '14px 20px',
                                                            borderRadius: '8px',
                                                            border: '1px solid #bfdbfe',
                                                            width: '100%',
                                                            justifyContent: 'space-between'
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '12px'
                                                                },
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        style: {
                                                                            fontSize: '28px'
                                                                        },
                                                                        children: "📄"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/components/SamplesView.jsx",
                                                                        lineNumber: 1288,
                                                                        columnNumber: 31
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        style: {
                                                                            display: 'flex',
                                                                            flexDirection: 'column'
                                                                        },
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                                style: {
                                                                                    fontSize: '13.5px',
                                                                                    color: '#1e3a8a'
                                                                                },
                                                                                children: "Dispatch Document"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/components/SamplesView.jsx",
                                                                                lineNumber: 1290,
                                                                                columnNumber: 33
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                style: {
                                                                                    fontSize: '12px',
                                                                                    color: '#3b82f6',
                                                                                    fontFamily: 'monospace'
                                                                                },
                                                                                children: getDocFilename(dispatchDoc, sample.id)
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/components/SamplesView.jsx",
                                                                                lineNumber: 1291,
                                                                                columnNumber: 33
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/components/SamplesView.jsx",
                                                                        lineNumber: 1289,
                                                                        columnNumber: 31
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/components/SamplesView.jsx",
                                                                lineNumber: 1287,
                                                                columnNumber: 29
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    display: 'flex',
                                                                    gap: '8px'
                                                                },
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                        type: "button",
                                                                        onClick: ()=>showDispatchDocument(dispatchDoc, sample.id),
                                                                        className: "btn-small",
                                                                        style: {
                                                                            background: '#2563eb',
                                                                            color: '#fff',
                                                                            border: 'none',
                                                                            padding: '6px 14px',
                                                                            borderRadius: '6px',
                                                                            fontWeight: 'bold'
                                                                        },
                                                                        children: "Preview"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/components/SamplesView.jsx",
                                                                        lineNumber: 1295,
                                                                        columnNumber: 31
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                        type: "button",
                                                                        onClick: ()=>downloadDispatchDocument(dispatchDoc, sample.id),
                                                                        className: "btn-small",
                                                                        style: {
                                                                            background: '#fff',
                                                                            border: '1px solid #D6E2F0',
                                                                            padding: '6px 14px',
                                                                            borderRadius: '6px',
                                                                            fontWeight: 'bold'
                                                                        },
                                                                        children: "Download"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/components/SamplesView.jsx",
                                                                        lineNumber: 1296,
                                                                        columnNumber: 31
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/components/SamplesView.jsx",
                                                                lineNumber: 1294,
                                                                columnNumber: 29
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/SamplesView.jsx",
                                                        lineNumber: 1286,
                                                        columnNumber: 27
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            width: '100%',
                                                            fontSize: '12px',
                                                            color: 'var(--color-text-secondary)',
                                                            borderTop: '1px solid #DCE5F0',
                                                            paddingTop: '10px',
                                                            flexWrap: 'wrap',
                                                            gap: '8px'
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                children: [
                                                                    "Uploaded By: ",
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                        style: {
                                                                            color: 'var(--color-text-primary)'
                                                                        },
                                                                        children: "Dispatch Department"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/components/SamplesView.jsx",
                                                                        lineNumber: 1301,
                                                                        columnNumber: 45
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/components/SamplesView.jsx",
                                                                lineNumber: 1301,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                children: [
                                                                    "Uploaded On: ",
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                        style: {
                                                                            color: 'var(--color-text-primary)'
                                                                        },
                                                                        children: formatDateClean(sample.dispatchDate || new Date().toISOString())
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/components/SamplesView.jsx",
                                                                        lineNumber: 1302,
                                                                        columnNumber: 45
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/components/SamplesView.jsx",
                                                                lineNumber: 1302,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                children: [
                                                                    "Vehicle: ",
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                        style: {
                                                                            color: 'var(--color-text-primary)'
                                                                        },
                                                                        children: sample.vehicleNo || sample.vehicle_no || 'Own Fleet'
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/components/SamplesView.jsx",
                                                                        lineNumber: 1303,
                                                                        columnNumber: 41
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/components/SamplesView.jsx",
                                                                lineNumber: 1303,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/SamplesView.jsx",
                                                        lineNumber: 1300,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/SamplesView.jsx",
                                                lineNumber: 1277,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/SamplesView.jsx",
                                        lineNumber: 1273,
                                        columnNumber: 21
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/SamplesView.jsx",
                                lineNumber: 1192,
                                columnNumber: 17
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    textAlign: 'center',
                                    padding: '24px',
                                    color: 'var(--color-text-muted)',
                                    fontSize: '13px'
                                },
                                children: "ℹ️ Delivery tracking route will initialize as soon as the dispatch team ships this sample."
                            }, void 0, false, {
                                fileName: "[project]/components/SamplesView.jsx",
                                lineNumber: 1310,
                                columnNumber: 17
                            }, this)
                        ]
                    }, void 0, true)
                }, void 0, false, {
                    fileName: "[project]/components/SamplesView.jsx",
                    lineNumber: 1116,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/SamplesView.jsx",
            lineNumber: 508,
            columnNumber: 7
        }, this);
    }
    // Otherwise, render main Samples list view
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "app-card",
        style: {
            flex: 1
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "module-header-row",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "module-title",
                                style: {
                                    margin: 0
                                },
                                children: "Sample Dispatch & Testing Status"
                            }, void 0, false, {
                                fileName: "[project]/components/SamplesView.jsx",
                                lineNumber: 1329,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    fontSize: '12.5px',
                                    color: 'var(--color-text-secondary)',
                                    marginTop: '4px',
                                    display: 'inline-block'
                                },
                                children: "Track and manage outgoing testing samples"
                            }, void 0, false, {
                                fileName: "[project]/components/SamplesView.jsx",
                                lineNumber: 1330,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/SamplesView.jsx",
                        lineNumber: 1328,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "module-actions",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "tab-filters-row",
                                style: {
                                    background: '#f1f3f5'
                                },
                                children: [
                                    'All',
                                    'Pending',
                                    'Sent',
                                    'Approved',
                                    'Lost'
                                ].map((st)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: "filter-pill ".concat(filter === st ? 'active' : ''),
                                        onClick: ()=>setFilter(st),
                                        style: {
                                            color: filter === st ? 'var(--color-text-primary)' : 'var(--color-text-secondary)'
                                        },
                                        children: st === 'All' ? 'All Statuses' : st
                                    }, st, false, {
                                        fileName: "[project]/components/SamplesView.jsx",
                                        lineNumber: 1339,
                                        columnNumber: 15
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/components/SamplesView.jsx",
                                lineNumber: 1337,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "search-box",
                                style: {
                                    background: '#f1f3f5',
                                    border: '1px solid #D6E2F0'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                        size: 14,
                                        style: {
                                            color: 'var(--color-text-secondary)'
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/components/SamplesView.jsx",
                                        lineNumber: 1351,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "text",
                                        placeholder: "Search samples by customer, ID, product...",
                                        value: search,
                                        onChange: (e)=>setSearch(e.target.value),
                                        style: {
                                            color: 'var(--color-text-primary)'
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/components/SamplesView.jsx",
                                        lineNumber: 1352,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/SamplesView.jsx",
                                lineNumber: 1350,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "btn-small btn-primary-small",
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    whiteSpace: 'nowrap'
                                },
                                onClick: ()=>{
                                    if (onCreateQuotationClick) {
                                        onCreateQuotationClick();
                                    } else {
                                        navigate.push('/sales/create-quotation');
                                    }
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                                        size: 14
                                    }, void 0, false, {
                                        fileName: "[project]/components/SamplesView.jsx",
                                        lineNumber: 1371,
                                        columnNumber: 13
                                    }, this),
                                    " Create Quotation"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/SamplesView.jsx",
                                lineNumber: 1360,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/SamplesView.jsx",
                        lineNumber: 1335,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/SamplesView.jsx",
                lineNumber: 1327,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    fontSize: '12.5px',
                    color: '#1e40af',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flask$2d$conical$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FlaskConical$3e$__["FlaskConical"], {
                        size: 16
                    }, void 0, false, {
                        fileName: "[project]/components/SamplesView.jsx",
                        lineNumber: 1378,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: "Testing Timeline Rule:"
                            }, void 0, false, {
                                fileName: "[project]/components/SamplesView.jsx",
                                lineNumber: 1379,
                                columnNumber: 15
                            }, this),
                            " Samples are valid for a strict 20-day client evaluation window after despatch."
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/SamplesView.jsx",
                        lineNumber: 1379,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/SamplesView.jsx",
                lineNumber: 1377,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "crm-table-container",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                    className: "crm-table responsive-table flat-table",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("colgroup", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("col", {
                                    style: {
                                        width: '10%'
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/components/SamplesView.jsx",
                                    lineNumber: 1386,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("col", {
                                    style: {
                                        width: '25%'
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/components/SamplesView.jsx",
                                    lineNumber: 1387,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("col", {
                                    style: {
                                        width: '25%'
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/components/SamplesView.jsx",
                                    lineNumber: 1388,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("col", {
                                    style: {
                                        width: '15%'
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/components/SamplesView.jsx",
                                    lineNumber: 1389,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("col", {
                                    style: {
                                        width: '13%'
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/components/SamplesView.jsx",
                                    lineNumber: 1390,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("col", {
                                    style: {
                                        width: '12%'
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/components/SamplesView.jsx",
                                    lineNumber: 1391,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/SamplesView.jsx",
                            lineNumber: 1385,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        children: "ID"
                                    }, void 0, false, {
                                        fileName: "[project]/components/SamplesView.jsx",
                                        lineNumber: 1395,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        children: "Customer"
                                    }, void 0, false, {
                                        fileName: "[project]/components/SamplesView.jsx",
                                        lineNumber: 1396,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        children: "Product"
                                    }, void 0, false, {
                                        fileName: "[project]/components/SamplesView.jsx",
                                        lineNumber: 1397,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        children: "Days Left"
                                    }, void 0, false, {
                                        fileName: "[project]/components/SamplesView.jsx",
                                        lineNumber: 1398,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        children: "Status"
                                    }, void 0, false, {
                                        fileName: "[project]/components/SamplesView.jsx",
                                        lineNumber: 1399,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        style: {
                                            textAlign: 'center'
                                        },
                                        children: "Actions"
                                    }, void 0, false, {
                                        fileName: "[project]/components/SamplesView.jsx",
                                        lineNumber: 1400,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/SamplesView.jsx",
                                lineNumber: 1394,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/SamplesView.jsx",
                            lineNumber: 1393,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                            children: filteredSamples.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    colSpan: "6",
                                    style: {
                                        textAlign: 'center',
                                        padding: '30px',
                                        color: 'var(--color-text-muted)'
                                    },
                                    children: "No matching sample requests logged."
                                }, void 0, false, {
                                    fileName: "[project]/components/SamplesView.jsx",
                                    lineNumber: 1407,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/SamplesView.jsx",
                                lineNumber: 1406,
                                columnNumber: 15
                            }, this) : displayedSamples.map((sample)=>{
                                const exactInfo = getExactCountdown(sample);
                                const ds = getDispatchStatus(sample);
                                const isDeliveredOrActive = ds === 'Delivered' || [
                                    'Evaluation Active',
                                    'Client Testing',
                                    'Testing',
                                    'Returned',
                                    'Approved'
                                ].includes(sample.status);
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            "data-label": "ID",
                                            style: {
                                                fontWeight: '700'
                                            },
                                            children: formatSampleId(sample.id)
                                        }, void 0, false, {
                                            fileName: "[project]/components/SamplesView.jsx",
                                            lineNumber: 1419,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            "data-label": "Customer",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '2px'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            fontWeight: '700',
                                                            color: 'var(--color-text-primary)'
                                                        },
                                                        children: sample.leadName
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/SamplesView.jsx",
                                                        lineNumber: 1424,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            fontSize: '11px',
                                                            color: 'var(--color-text-secondary)'
                                                        },
                                                        children: [
                                                            "Lead: ",
                                                            formatLeadId(sample.leadId)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/SamplesView.jsx",
                                                        lineNumber: 1425,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/SamplesView.jsx",
                                                lineNumber: 1423,
                                                columnNumber: 23
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/components/SamplesView.jsx",
                                            lineNumber: 1422,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            "data-label": "Product",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '2px'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            fontWeight: '600',
                                                            color: 'var(--color-text-primary)'
                                                        },
                                                        children: sample.product
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/SamplesView.jsx",
                                                        lineNumber: 1430,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            fontSize: '11px',
                                                            color: 'var(--color-text-secondary)'
                                                        },
                                                        children: [
                                                            "Qty: ",
                                                            sample.quantity,
                                                            " Pcs"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/SamplesView.jsx",
                                                        lineNumber: 1431,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/SamplesView.jsx",
                                                lineNumber: 1429,
                                                columnNumber: 23
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/components/SamplesView.jsx",
                                            lineNumber: 1428,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            "data-label": "Days Left",
                                            children: (()=>{
                                                if (sample.status === 'Returned' || sample.retrievalStatus === 'Retrieved') {
                                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            gap: '2px'
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                style: {
                                                                    fontWeight: '700',
                                                                    color: '#166534'
                                                                },
                                                                children: "Evaluation Completed"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/SamplesView.jsx",
                                                                lineNumber: 1439,
                                                                columnNumber: 31
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                style: {
                                                                    fontSize: '11px',
                                                                    color: '#15803d'
                                                                },
                                                                children: [
                                                                    "Returned on ",
                                                                    sample.returnedDate ? sample.returnedDate.split('T')[0] : formatDateClean(sample.updatedAt || new Date().toISOString())
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/components/SamplesView.jsx",
                                                                lineNumber: 1440,
                                                                columnNumber: 31
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/SamplesView.jsx",
                                                        lineNumber: 1438,
                                                        columnNumber: 29
                                                    }, this);
                                                }
                                                if (isDeliveredOrActive) {
                                                    if (exactInfo.isExpired) {
                                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "badge badge-danger",
                                                            style: {
                                                                padding: '4px 10px',
                                                                borderRadius: '999px',
                                                                fontWeight: '700',
                                                                display: 'inline-block'
                                                            },
                                                            children: "Return Due (0d Left)"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/SamplesView.jsx",
                                                            lineNumber: 1446,
                                                            columnNumber: 36
                                                        }, this);
                                                    }
                                                    if (exactInfo.days > 5) {
                                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "badge badge-success",
                                                            style: {
                                                                padding: '4px 10px',
                                                                borderRadius: '999px',
                                                                fontWeight: '700',
                                                                display: 'inline-block'
                                                            },
                                                            children: [
                                                                exactInfo.days,
                                                                " Days Left (",
                                                                exactInfo.hours,
                                                                "h)"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/components/SamplesView.jsx",
                                                            lineNumber: 1449,
                                                            columnNumber: 36
                                                        }, this);
                                                    }
                                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "badge badge-warning",
                                                        style: {
                                                            padding: '4px 10px',
                                                            borderRadius: '999px',
                                                            fontWeight: '700',
                                                            display: 'inline-block'
                                                        },
                                                        children: [
                                                            exactInfo.days,
                                                            " Days Left (",
                                                            exactInfo.hours,
                                                            "h)"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/SamplesView.jsx",
                                                        lineNumber: 1451,
                                                        columnNumber: 34
                                                    }, this);
                                                }
                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: '2px'
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            style: {
                                                                fontSize: '12px',
                                                                fontWeight: '600',
                                                                color: 'var(--color-text-secondary)'
                                                            },
                                                            children: "20 Days Window"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/SamplesView.jsx",
                                                            lineNumber: 1455,
                                                            columnNumber: 29
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            style: {
                                                                fontSize: '11px',
                                                                color: '#3b82f6',
                                                                fontWeight: '700'
                                                            },
                                                            children: "⏳ Starts on Delivery"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/SamplesView.jsx",
                                                            lineNumber: 1456,
                                                            columnNumber: 29
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/SamplesView.jsx",
                                                    lineNumber: 1454,
                                                    columnNumber: 27
                                                }, this);
                                            })()
                                        }, void 0, false, {
                                            fileName: "[project]/components/SamplesView.jsx",
                                            lineNumber: 1434,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            "data-label": "Status",
                                            children: (()=>{
                                                if (sample.status === 'Returned' || sample.retrievalStatus === 'Retrieved') {
                                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "badge badge-returned",
                                                        children: "✓ Sample Returned"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/SamplesView.jsx",
                                                        lineNumber: 1464,
                                                        columnNumber: 34
                                                    }, this);
                                                }
                                                if (sample.status === 'Sample Back Requested' || sample.status === 'Return Requested' || sample.retrievalStatus === 'Requested') {
                                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "badge badge-sample-back",
                                                        children: "↩ Sample Back"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/SamplesView.jsx",
                                                        lineNumber: 1467,
                                                        columnNumber: 34
                                                    }, this);
                                                }
                                                if (isDeliveredOrActive) {
                                                    if (exactInfo.isExpired) {
                                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "badge badge-danger",
                                                            children: "Return Due"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/SamplesView.jsx",
                                                            lineNumber: 1471,
                                                            columnNumber: 36
                                                        }, this);
                                                    }
                                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "badge badge-success",
                                                        style: {
                                                            padding: '4px 10px',
                                                            borderRadius: '6px',
                                                            fontWeight: 'bold'
                                                        },
                                                        children: [
                                                            "Delivered (",
                                                            exactInfo.days,
                                                            "d Left)"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/SamplesView.jsx",
                                                        lineNumber: 1473,
                                                        columnNumber: 34
                                                    }, this);
                                                }
                                                const displayStatus = sample.status || ds;
                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: getStatusBadge(displayStatus),
                                                    children: displayStatus
                                                }, void 0, false, {
                                                    fileName: "[project]/components/SamplesView.jsx",
                                                    lineNumber: 1476,
                                                    columnNumber: 32
                                                }, this);
                                            })()
                                        }, void 0, false, {
                                            fileName: "[project]/components/SamplesView.jsx",
                                            lineNumber: 1461,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            "data-label": "Actions",
                                            style: {
                                                textAlign: 'center',
                                                whiteSpace: 'nowrap'
                                            },
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "action-btn-group",
                                                style: {
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    justifyContent: 'center',
                                                    flexWrap: 'nowrap',
                                                    whiteSpace: 'nowrap'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        title: "View Details",
                                                        onClick: ()=>setSelectedSample(sample),
                                                        style: {
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            width: '32px',
                                                            height: '32px',
                                                            background: '#ffffff',
                                                            border: '1px solid #D6E2F0',
                                                            borderRadius: '8px',
                                                            cursor: 'pointer',
                                                            color: '#475569',
                                                            flexShrink: 0
                                                        },
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"], {
                                                            size: 14
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/SamplesView.jsx",
                                                            lineNumber: 1492,
                                                            columnNumber: 27
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/SamplesView.jsx",
                                                        lineNumber: 1481,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        title: "Edit Sample",
                                                        onClick: ()=>navigate.push("/sales/edit-sample/".concat(sample.id)),
                                                        style: {
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            width: '32px',
                                                            height: '32px',
                                                            background: '#ffffff',
                                                            border: '1px solid #D6E2F0',
                                                            borderRadius: '8px',
                                                            cursor: 'pointer',
                                                            color: '#475569',
                                                            flexShrink: 0
                                                        },
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2d$pen$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Edit$3e$__["Edit"], {
                                                            size: 14
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/SamplesView.jsx",
                                                            lineNumber: 1506,
                                                            columnNumber: 27
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/SamplesView.jsx",
                                                        lineNumber: 1495,
                                                        columnNumber: 25
                                                    }, this),
                                                    isDeliveredOrActive && sample.status !== 'Sample Back Requested' && sample.status !== 'Return Requested' && sample.status !== 'Return In Transit' && sample.status !== 'Returned' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        type: "button",
                                                        onClick: ()=>handleRequestReturn(sample.id),
                                                        style: {
                                                            background: '#ea580c',
                                                            color: '#fff',
                                                            border: 'none',
                                                            padding: '6px 12px',
                                                            borderRadius: '7px',
                                                            fontWeight: '800',
                                                            fontSize: '11.5px',
                                                            cursor: 'pointer',
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '4px',
                                                            whiteSpace: 'nowrap',
                                                            flexShrink: 0,
                                                            boxShadow: '0 1px 2px rgba(234,88,12,0.2)'
                                                        },
                                                        children: "↩ Sample Back"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/SamplesView.jsx",
                                                        lineNumber: 1510,
                                                        columnNumber: 27
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        type: "button",
                                                        onClick: ()=>handleCreateQuotation(sample),
                                                        style: {
                                                            background: '#2F4375',
                                                            color: '#ffffff',
                                                            border: '1px solid #2F4375',
                                                            padding: '6px 12px',
                                                            borderRadius: '8px',
                                                            fontWeight: '800',
                                                            fontSize: '11.5px',
                                                            cursor: 'pointer',
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '4px',
                                                            whiteSpace: 'nowrap',
                                                            flexShrink: 0,
                                                            boxShadow: '0 1px 4px rgba(47,67,117,0.3)'
                                                        },
                                                        children: "Create Quotation →"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/SamplesView.jsx",
                                                        lineNumber: 1534,
                                                        columnNumber: 25
                                                    }, this),
                                                    (sample.status === 'Sample Back Requested' || sample.status === 'Return Requested') && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "badge badge-sample-back",
                                                        style: {
                                                            whiteSpace: 'nowrap',
                                                            flexShrink: 0
                                                        },
                                                        children: "↩ Sample Back"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/SamplesView.jsx",
                                                        lineNumber: 1558,
                                                        columnNumber: 27
                                                    }, this),
                                                    sample.status === 'Return In Transit' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            fontSize: '11px',
                                                            color: '#7e22ce',
                                                            fontWeight: 'bold',
                                                            background: '#f3e8ff',
                                                            border: '1px solid #d8b4fe',
                                                            padding: '4px 8px',
                                                            borderRadius: '6px',
                                                            whiteSpace: 'nowrap',
                                                            flexShrink: 0
                                                        },
                                                        children: "Return In Transit"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/SamplesView.jsx",
                                                        lineNumber: 1561,
                                                        columnNumber: 27
                                                    }, this),
                                                    (sample.status === 'Returned' || sample.retrievalStatus === 'Retrieved') && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "badge badge-returned",
                                                        style: {
                                                            whiteSpace: 'nowrap',
                                                            flexShrink: 0
                                                        },
                                                        children: "✓ Returned"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/SamplesView.jsx",
                                                        lineNumber: 1564,
                                                        columnNumber: 27
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/SamplesView.jsx",
                                                lineNumber: 1480,
                                                columnNumber: 23
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/components/SamplesView.jsx",
                                            lineNumber: 1479,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, sample.id, true, {
                                    fileName: "[project]/components/SamplesView.jsx",
                                    lineNumber: 1418,
                                    columnNumber: 19
                                }, this);
                            })
                        }, void 0, false, {
                            fileName: "[project]/components/SamplesView.jsx",
                            lineNumber: 1404,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/SamplesView.jsx",
                    lineNumber: 1384,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/SamplesView.jsx",
                lineNumber: 1383,
                columnNumber: 7
            }, this),
            !flat && totalPages > 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '20px',
                    borderTop: '1px solid var(--color-border)',
                    paddingTop: '16px'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            fontSize: '13px',
                            color: 'var(--color-text-secondary)'
                        },
                        children: [
                            "Showing page ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: currentPage
                            }, void 0, false, {
                                fileName: "[project]/components/SamplesView.jsx",
                                lineNumber: 1580,
                                columnNumber: 26
                            }, this),
                            " of ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: totalPages
                            }, void 0, false, {
                                fileName: "[project]/components/SamplesView.jsx",
                                lineNumber: 1580,
                                columnNumber: 60
                            }, this),
                            " (",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: filteredSamples.length
                            }, void 0, false, {
                                fileName: "[project]/components/SamplesView.jsx",
                                lineNumber: 1580,
                                columnNumber: 91
                            }, this),
                            " total samples)"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/SamplesView.jsx",
                        lineNumber: 1579,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            gap: '8px'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                disabled: currentPage === 1,
                                onClick: ()=>setCurrentPage((p)=>Math.max(1, p - 1)),
                                className: "btn-small btn-outline-small",
                                style: {
                                    margin: 0,
                                    padding: '6px 12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    opacity: currentPage === 1 ? 0.5 : 1,
                                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__["ChevronLeft"], {
                                        size: 14
                                    }, void 0, false, {
                                        fileName: "[project]/components/SamplesView.jsx",
                                        lineNumber: 1589,
                                        columnNumber: 15
                                    }, this),
                                    " Previous"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/SamplesView.jsx",
                                lineNumber: 1583,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                disabled: currentPage === totalPages,
                                onClick: ()=>setCurrentPage((p)=>Math.min(totalPages, p + 1)),
                                className: "btn-small btn-outline-small",
                                style: {
                                    margin: 0,
                                    padding: '6px 12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    opacity: currentPage === totalPages ? 0.5 : 1,
                                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                                },
                                children: [
                                    "Next ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                                        size: 14
                                    }, void 0, false, {
                                        fileName: "[project]/components/SamplesView.jsx",
                                        lineNumber: 1597,
                                        columnNumber: 20
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/SamplesView.jsx",
                                lineNumber: 1591,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/SamplesView.jsx",
                        lineNumber: 1582,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/SamplesView.jsx",
                lineNumber: 1578,
                columnNumber: 9
            }, this),
            selectedSample && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(15,23,42,0.6)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999,
                    padding: '20px'
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        background: '#fff',
                        borderRadius: '16px',
                        maxWidth: '700px',
                        width: '100%',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        padding: '24px',
                        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)',
                        border: '1px solid #DCE5F0'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                borderBottom: '1px solid #DCE5F0',
                                paddingBottom: '14px',
                                marginBottom: '16px'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            style: {
                                                margin: 0,
                                                fontSize: '18px',
                                                fontWeight: '800',
                                                color: '#24345C'
                                            },
                                            children: [
                                                "Sample SMP-",
                                                String(selectedSample.id).padStart(3, '0'),
                                                " Details & History"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/SamplesView.jsx",
                                            lineNumber: 1609,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                fontSize: '12px',
                                                color: '#5E6B82'
                                            },
                                            children: [
                                                "Customer: ",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                    children: selectedSample.leadName || selectedSample.customer
                                                }, void 0, false, {
                                                    fileName: "[project]/components/SamplesView.jsx",
                                                    lineNumber: 1612,
                                                    columnNumber: 80
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/SamplesView.jsx",
                                            lineNumber: 1612,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/SamplesView.jsx",
                                    lineNumber: 1608,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: ()=>setSelectedSample(null),
                                    style: {
                                        background: '#f1f5f9',
                                        border: 'none',
                                        padding: '6px 12px',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold',
                                        fontSize: '13px'
                                    },
                                    children: "✕ Close"
                                }, void 0, false, {
                                    fileName: "[project]/components/SamplesView.jsx",
                                    lineNumber: 1614,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/SamplesView.jsx",
                            lineNumber: 1607,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '12px',
                                background: '#F5FAFE',
                                padding: '14px',
                                borderRadius: '10px',
                                fontSize: '13px',
                                marginBottom: '20px'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                color: '#5E6B82'
                                            },
                                            children: "Product:"
                                        }, void 0, false, {
                                            fileName: "[project]/components/SamplesView.jsx",
                                            lineNumber: 1625,
                                            columnNumber: 20
                                        }, this),
                                        " ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                            children: selectedSample.product
                                        }, void 0, false, {
                                            fileName: "[project]/components/SamplesView.jsx",
                                            lineNumber: 1625,
                                            columnNumber: 71
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/SamplesView.jsx",
                                    lineNumber: 1625,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                color: '#5E6B82'
                                            },
                                            children: "Quantity:"
                                        }, void 0, false, {
                                            fileName: "[project]/components/SamplesView.jsx",
                                            lineNumber: 1626,
                                            columnNumber: 20
                                        }, this),
                                        " ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                            children: [
                                                selectedSample.quantity,
                                                " Pcs"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/SamplesView.jsx",
                                            lineNumber: 1626,
                                            columnNumber: 72
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/SamplesView.jsx",
                                    lineNumber: 1626,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                color: '#5E6B82'
                                            },
                                            children: "Status:"
                                        }, void 0, false, {
                                            fileName: "[project]/components/SamplesView.jsx",
                                            lineNumber: 1627,
                                            columnNumber: 20
                                        }, this),
                                        " ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                            style: {
                                                color: '#2563eb'
                                            },
                                            children: selectedSample.status
                                        }, void 0, false, {
                                            fileName: "[project]/components/SamplesView.jsx",
                                            lineNumber: 1627,
                                            columnNumber: 70
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/SamplesView.jsx",
                                    lineNumber: 1627,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                color: '#5E6B82'
                                            },
                                            children: "Dispatch Status:"
                                        }, void 0, false, {
                                            fileName: "[project]/components/SamplesView.jsx",
                                            lineNumber: 1628,
                                            columnNumber: 20
                                        }, this),
                                        " ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                            children: selectedSample.dispatchStatus || selectedSample.dispatch_status || 'Pending'
                                        }, void 0, false, {
                                            fileName: "[project]/components/SamplesView.jsx",
                                            lineNumber: 1628,
                                            columnNumber: 79
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/SamplesView.jsx",
                                    lineNumber: 1628,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                color: '#5E6B82'
                                            },
                                            children: "Transport Cost:"
                                        }, void 0, false, {
                                            fileName: "[project]/components/SamplesView.jsx",
                                            lineNumber: 1629,
                                            columnNumber: 20
                                        }, this),
                                        " ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                            style: {
                                                color: '#16a34a'
                                            },
                                            children: [
                                                "₹",
                                                Number(selectedSample.transportationCost || selectedSample.transportCost || 0).toLocaleString()
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/SamplesView.jsx",
                                            lineNumber: 1629,
                                            columnNumber: 78
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/SamplesView.jsx",
                                    lineNumber: 1629,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                color: '#5E6B82'
                                            },
                                            children: "Delivered Date:"
                                        }, void 0, false, {
                                            fileName: "[project]/components/SamplesView.jsx",
                                            lineNumber: 1630,
                                            columnNumber: 20
                                        }, this),
                                        " ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                            children: selectedSample.deliveredDate ? selectedSample.deliveredDate.split('T')[0] : '—'
                                        }, void 0, false, {
                                            fileName: "[project]/components/SamplesView.jsx",
                                            lineNumber: 1630,
                                            columnNumber: 78
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/SamplesView.jsx",
                                    lineNumber: 1630,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/SamplesView.jsx",
                            lineNumber: 1624,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                            style: {
                                margin: '0 0 12px 0',
                                fontSize: '14px',
                                fontWeight: '800',
                                color: '#1e293b',
                                borderBottom: '1px solid #f1f5f9',
                                paddingBottom: '6px'
                            },
                            children: "📜 Status & Audit History Logs"
                        }, void 0, false, {
                            fileName: "[project]/components/SamplesView.jsx",
                            lineNumber: 1634,
                            columnNumber: 13
                        }, this),
                        !selectedSample.history || selectedSample.history.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                textAlign: 'center',
                                padding: '24px',
                                background: '#F5FAFE',
                                borderRadius: '8px',
                                color: '#5E6B82',
                                fontSize: '13px'
                            },
                            children: "No historical events logged yet for this sample."
                        }, void 0, false, {
                            fileName: "[project]/components/SamplesView.jsx",
                            lineNumber: 1639,
                            columnNumber: 15
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '10px'
                            },
                            children: selectedSample.history.map((log, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        background: '#ffffff',
                                        border: '1px solid #DCE5F0',
                                        borderRadius: '10px',
                                        padding: '12px',
                                        fontSize: '12.5px',
                                        borderLeft: '4px solid #2563eb'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                marginBottom: '4px'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                    style: {
                                                        color: '#24345C'
                                                    },
                                                    children: log.status || log.event || 'Status Changed'
                                                }, void 0, false, {
                                                    fileName: "[project]/components/SamplesView.jsx",
                                                    lineNumber: 1647,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    style: {
                                                        fontSize: '11px',
                                                        color: '#8893A7'
                                                    },
                                                    children: log.timestamp ? new Date(log.timestamp).toLocaleString() : '—'
                                                }, void 0, false, {
                                                    fileName: "[project]/components/SamplesView.jsx",
                                                    lineNumber: 1648,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/SamplesView.jsx",
                                            lineNumber: 1646,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                color: '#475569',
                                                margin: '2px 0'
                                            },
                                            children: log.action || log.notes
                                        }, void 0, false, {
                                            fileName: "[project]/components/SamplesView.jsx",
                                            lineNumber: 1650,
                                            columnNumber: 21
                                        }, this),
                                        log.updatedBy && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                fontSize: '11px',
                                                color: '#5E6B82'
                                            },
                                            children: [
                                                "Updated by: ",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                    children: log.updatedBy || log.actor
                                                }, void 0, false, {
                                                    fileName: "[project]/components/SamplesView.jsx",
                                                    lineNumber: 1651,
                                                    columnNumber: 103
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/SamplesView.jsx",
                                            lineNumber: 1651,
                                            columnNumber: 39
                                        }, this),
                                        log.remarks && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                fontSize: '11.5px',
                                                color: '#059669',
                                                fontStyle: 'italic',
                                                marginTop: '4px'
                                            },
                                            children: [
                                                'Remarks: "',
                                                log.remarks,
                                                '"'
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/SamplesView.jsx",
                                            lineNumber: 1652,
                                            columnNumber: 37
                                        }, this)
                                    ]
                                }, log.id || idx, true, {
                                    fileName: "[project]/components/SamplesView.jsx",
                                    lineNumber: 1645,
                                    columnNumber: 19
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/components/SamplesView.jsx",
                            lineNumber: 1643,
                            columnNumber: 15
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/SamplesView.jsx",
                    lineNumber: 1606,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/SamplesView.jsx",
                lineNumber: 1605,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/SamplesView.jsx",
        lineNumber: 1325,
        columnNumber: 5
    }, this);
}
_s(SamplesView, "Ok72CcltjmO/Rg/KPfFqzeBpFeQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$context$2f$ERPContext$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useERP"]
    ];
});
_c = SamplesView;
var _c;
__turbopack_context__.k.register(_c, "SamplesView");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=components_SamplesView_jsx_36185ed0._.js.map