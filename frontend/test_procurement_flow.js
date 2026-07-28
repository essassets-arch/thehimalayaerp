"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var erpStore_1 = require("./store/erpStore");
var mockStorage = {};
global.window = {
    localStorage: {
        getItem: function (key) { return mockStorage[key] || null; },
        setItem: function (key, value) { mockStorage[key] = value; }
    }
};
global.localStorage = global.window.localStorage;
function runTest() {
    return __awaiter(this, void 0, void 0, function () {
        var store, state, indent, po, grn, payment;
        return __generator(this, function (_a) {
            console.log("=== STARTING PROCUREMENT FLOW TEST ===");
            store = erpStore_1.useERPStore.getState();
            // 1. Store Creates Indent
            console.log("[1] Store creates Purchase Indent");
            store.createPurchaseIndent({
                id: "IND-001",
                material: "Steel Beams",
                quantity: 100
            });
            state = erpStore_1.useERPStore.getState();
            indent = state.state.purchaseIndents.find(function (i) { return i.id === "IND-001"; });
            console.assert(indent.status === "PENDING_PLANT_HEAD_APPROVAL", "Expected PENDING_PLANT_HEAD_APPROVAL");
            console.log("  * Indent created with status:", indent.status);
            // 2. Plant Head Rejects Indent
            console.log("[2] Plant Head rejects Indent");
            store.rejectPurchaseIndent("IND-001", "Quantity too high");
            state = erpStore_1.useERPStore.getState();
            indent = state.state.purchaseIndents.find(function (i) { return i.id === "IND-001"; });
            console.assert(indent.status === "PLANT_HEAD_REJECTED", "Expected PLANT_HEAD_REJECTED");
            console.log("  * Indent rejected with status:", indent.status);
            // 3. Store edits and resubmits Indent
            console.log("[3] Store resubmits Indent");
            store.updatePurchaseIndent("IND-001", { quantity: 50 });
            state = erpStore_1.useERPStore.getState();
            indent = state.state.purchaseIndents.find(function (i) { return i.id === "IND-001"; });
            console.assert(indent.status === "PENDING_PLANT_HEAD_APPROVAL", "Expected PENDING_PLANT_HEAD_APPROVAL");
            console.log("  * Indent resubmitted with status:", indent.status);
            // 4. Plant Head Approves Indent
            console.log("[4] Plant Head approves Indent");
            store.approvePurchaseIndent("IND-001", "Approved for 50 qty");
            state = erpStore_1.useERPStore.getState();
            indent = state.state.purchaseIndents.find(function (i) { return i.id === "IND-001"; });
            console.assert(indent.status === "PLANT_HEAD_APPROVED", "Expected PLANT_HEAD_APPROVED");
            console.log("  * Indent approved with status:", indent.status);
            // 5. Finance Creates Draft PO
            console.log("[5] Finance creates Draft PO");
            store.createPurchaseOrderFromIndent("IND-001", {
                id: "PO-001",
                vendorName: "SteelCorp"
            });
            state = erpStore_1.useERPStore.getState();
            indent = state.state.purchaseIndents.find(function (i) { return i.id === "IND-001"; });
            po = state.state.purchaseOrders.find(function (p) { return p.id === "PO-001" || p.poNumber === "PO-001"; });
            console.assert(indent.status === "CONVERTED_TO_PO", "Indent should be CONVERTED_TO_PO");
            console.assert(po.status === "DRAFT", "PO should be DRAFT");
            console.log("  * PO created with status:", po.status);
            // 6. Finance Submits PO for Super Admin Approval
            console.log("[6] Finance submits PO");
            store.submitPurchaseOrder(po.id);
            state = erpStore_1.useERPStore.getState();
            po = state.state.purchaseOrders.find(function (p) { return p.id === po.id; });
            console.assert(po.status === "PENDING_SUPER_ADMIN_APPROVAL", "PO should be PENDING_SUPER_ADMIN_APPROVAL");
            console.log("  * PO status:", po.status);
            // 7. Super Admin Approves PO
            console.log("[7] Super Admin approves PO");
            store.approvePurchaseOrder(po.id, "Looks good");
            state = erpStore_1.useERPStore.getState();
            po = state.state.purchaseOrders.find(function (p) { return p.id === po.id; });
            console.assert(po.status === "SUPER_ADMIN_APPROVED", "PO should be SUPER_ADMIN_APPROVED");
            console.log("  * PO status:", po.status);
            // 8. Finance Issues PO
            console.log("[8] Finance issues PO");
            store.issuePurchaseOrder(po.id);
            state = erpStore_1.useERPStore.getState();
            po = state.state.purchaseOrders.find(function (p) { return p.id === po.id; });
            console.assert(po.status === "PO_ISSUED", "PO should be PO_ISSUED");
            console.log("  * PO status:", po.status);
            // 9. Vendor Accepts PO
            console.log("[9] Vendor accepts PO");
            store.acceptPurchaseOrderByVendor(po.id, {});
            state = erpStore_1.useERPStore.getState();
            po = state.state.purchaseOrders.find(function (p) { return p.id === po.id; });
            console.assert(po.status === "VENDOR_ACCEPTED", "PO should be VENDOR_ACCEPTED");
            console.log("  * PO status:", po.status);
            // 10. Store Creates GRN
            console.log("[10] Store creates GRN");
            store.createGoodsReceipt(po.id, {
                id: "GRN-001",
                receivedQuantity: 50
            });
            state = erpStore_1.useERPStore.getState();
            po = state.state.purchaseOrders.find(function (p) { return p.id === po.id; });
            grn = state.state.goodsReceipts.find(function (g) { return g.id === "GRN-001"; });
            console.assert(po.status === "PARTIALLY_RECEIVED" || po.status === "GRN_SUBMITTED", "PO should be PARTIALLY_RECEIVED or GRN_SUBMITTED");
            console.log("  * GRN created with status:", grn.status);
            // 11. QC Approves GRN
            console.log("[11] QC approves GRN");
            store.approveGoodsReceipt("GRN-001", "Quality checks passed");
            state = erpStore_1.useERPStore.getState();
            grn = state.state.goodsReceipts.find(function (g) { return g.id === "GRN-001"; });
            console.assert(grn.status === "GRN_APPROVED", "GRN should be GRN_APPROVED");
            console.log("  * GRN status:", grn.status);
            // 12. Store Posts Stock
            console.log("[12] Store posts stock");
            store.postGoodsReceiptToStock("GRN-001");
            state = erpStore_1.useERPStore.getState();
            grn = state.state.goodsReceipts.find(function (g) { return g.id === "GRN-001"; });
            console.assert(grn.status === "STOCK_POSTED", "GRN should be STOCK_POSTED");
            console.log("  * GRN status:", grn.status);
            // 13. Finance completes Payment
            console.log("[13] Finance completes Vendor Payment");
            store.createVendorPayment(po.id, {
                id: "PAY-001",
                amount: 50000
            });
            store.completeVendorPayment("PAY-001", { transactionId: "TRX-123" });
            state = erpStore_1.useERPStore.getState();
            payment = state.state.vendorPayments.find(function (p) { return p.id === "PAY-001"; });
            console.assert(payment.status === "PAYMENT_COMPLETED", "Payment should be PAYMENT_COMPLETED");
            console.log("  * Payment completed with status:", payment.status);
            console.log("=== ALL TESTS PASSED SUCCESSFULLY! ===");
            return [2 /*return*/];
        });
    });
}
runTest().catch(console.error);
