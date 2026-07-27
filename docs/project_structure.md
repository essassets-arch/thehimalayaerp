# Project Structure

`
+--- .codex-dev-3000.err.log
+--- .codex-dev-3000.out.log
+--- .codex-dev-3001.err.log
+--- .codex-dev-3001.out.log
+--- .codex-payroll-e2e.err.log
+--- .codex-payroll-e2e.out.log
+--- .codex-salary-ui-2.err.log
+--- .codex-salary-ui-2.out.log
+--- .codex-salary-ui.err.log
+--- .codex-salary-ui.out.log
+--- .gitignore
+--- .next-build
|   +--- app-build-manifest.json
|   +--- build
|   |   \--- chunks
|   |       +--- node_modules_fe693df6._.js
|   |       +--- node_modules_fe693df6._.js.map
|   |       +--- [root-of-the-server]__51225daf._.js
|   |       +--- [root-of-the-server]__51225daf._.js.map
|   |       +--- [root-of-the-server]__974941ed._.js
|   |       +--- [root-of-the-server]__974941ed._.js.map
|   |       +--- [turbopack-node]_transforms_postcss_ts_5260e9fa._.js
|   |       +--- [turbopack-node]_transforms_postcss_ts_5260e9fa._.js.map
|   |       +--- [turbopack]_runtime.js
|   |       \--- [turbopack]_runtime.js.map
|   +--- build-manifest.json
|   +--- cache
|   |   +--- .previewinfo
|   |   +--- .rscinfo
|   |   +--- images
|   |   |   \--- dqtkAnPMcezO6NCczGGGk5DhHB9wt-7D1aZdO_OjmvA
|   |   |       \--- 60.1785133382461.fI8GDVInoqk8nm736jiALjUv8x8ud8PO0lDWPnpsOQ0.Vy8iN2I3MzYtMTlmYTIxNTY2NTUi.webp
|   |   \--- next-devtools-config.json
|   +--- diagnostics
|   |   +--- build-diagnostics.json
|   |   \--- framework.json
|   +--- fallback-build-manifest.json
|   +--- package.json
|   +--- postcss.js
|   +--- postcss.js.map
|   +--- prerender-manifest.json
|   +--- routes-manifest.json
|   +--- server
|   |   +--- app
|   |   |   +--- (dashboard)
|   |   |   |   +--- plant-head
|   |   |   |   |   +--- finished-goods
|   |   |   |   |   |   +--- page
|   |   |   |   |   |   |   +--- app-build-manifest.json
|   |   |   |   |   |   |   +--- app-paths-manifest.json
|   |   |   |   |   |   |   +--- build-manifest.json
|   |   |   |   |   |   |   +--- next-font-manifest.json
|   |   |   |   |   |   |   +--- react-loadable-manifest.json
|   |   |   |   |   |   |   \--- server-reference-manifest.json
|   |   |   |   |   |   +--- page.js
|   |   |   |   |   |   +--- page.js.map
|   |   |   |   |   |   \--- page_client-reference-manifest.js
|   |   |   |   |   +--- planning
|   |   |   |   |   |   +--- page
|   |   |   |   |   |   |   +--- app-build-manifest.json
|   |   |   |   |   |   |   +--- app-paths-manifest.json
|   |   |   |   |   |   |   +--- build-manifest.json
|   |   |   |   |   |   |   +--- next-font-manifest.json
|   |   |   |   |   |   |   +--- react-loadable-manifest.json
|   |   |   |   |   |   |   \--- server-reference-manifest.json
|   |   |   |   |   |   +--- page.js
|   |   |   |   |   |   +--- page.js.map
|   |   |   |   |   |   \--- page_client-reference-manifest.js
|   |   |   |   |   +--- recruitment-request
|   |   |   |   |   |   +--- page
|   |   |   |   |   |   |   +--- app-build-manifest.json
|   |   |   |   |   |   |   +--- app-paths-manifest.json
|   |   |   |   |   |   |   +--- build-manifest.json
|   |   |   |   |   |   |   +--- next-font-manifest.json
|   |   |   |   |   |   |   +--- react-loadable-manifest.json
|   |   |   |   |   |   |   \--- server-reference-manifest.json
|   |   |   |   |   |   +--- page.js
|   |   |   |   |   |   +--- page.js.map
|   |   |   |   |   |   \--- page_client-reference-manifest.js
|   |   |   |   |   \--- [[...slug]]
|   |   |   |   |       +--- page
|   |   |   |   |       |   +--- app-build-manifest.json
|   |   |   |   |       |   +--- app-paths-manifest.json
|   |   |   |   |       |   +--- build-manifest.json
|   |   |   |   |       |   +--- next-font-manifest.json
|   |   |   |   |       |   +--- react-loadable-manifest.json
|   |   |   |   |       |   \--- server-reference-manifest.json
|   |   |   |   |       +--- page.js
|   |   |   |   |       +--- page.js.map
|   |   |   |   |       \--- page_client-reference-manifest.js
|   |   |   |   +--- sales
|   |   |   |   |   +--- dashboard
|   |   |   |   |   |   +--- page
|   |   |   |   |   |   |   +--- app-build-manifest.json
|   |   |   |   |   |   |   +--- app-paths-manifest.json
|   |   |   |   |   |   |   +--- build-manifest.json
|   |   |   |   |   |   |   +--- next-font-manifest.json
|   |   |   |   |   |   |   +--- react-loadable-manifest.json
|   |   |   |   |   |   |   \--- server-reference-manifest.json
|   |   |   |   |   |   \--- page_client-reference-manifest.js
|   |   |   |   |   +--- leads
|   |   |   |   |   |   +--- page
|   |   |   |   |   |   |   +--- app-build-manifest.json
|   |   |   |   |   |   |   +--- app-paths-manifest.json
|   |   |   |   |   |   |   +--- build-manifest.json
|   |   |   |   |   |   |   +--- next-font-manifest.json
|   |   |   |   |   |   |   +--- react-loadable-manifest.json
|   |   |   |   |   |   |   \--- server-reference-manifest.json
|   |   |   |   |   |   \--- page_client-reference-manifest.js
|   |   |   |   |   +--- quotations
|   |   |   |   |   |   +--- page
|   |   |   |   |   |   |   +--- app-build-manifest.json
|   |   |   |   |   |   |   +--- app-paths-manifest.json
|   |   |   |   |   |   |   +--- build-manifest.json
|   |   |   |   |   |   |   +--- next-font-manifest.json
|   |   |   |   |   |   |   +--- react-loadable-manifest.json
|   |   |   |   |   |   |   \--- server-reference-manifest.json
|   |   |   |   |   |   \--- page_client-reference-manifest.js
|   |   |   |   |   \--- [[...slug]]
|   |   |   |   |       +--- page
|   |   |   |   |       |   +--- app-build-manifest.json
|   |   |   |   |       |   +--- app-paths-manifest.json
|   |   |   |   |       |   +--- build-manifest.json
|   |   |   |   |       |   +--- next-font-manifest.json
|   |   |   |   |       |   +--- react-loadable-manifest.json
|   |   |   |   |       |   \--- server-reference-manifest.json
|   |   |   |   |       +--- page.js
|   |   |   |   |       +--- page.js.map
|   |   |   |   |       \--- page_client-reference-manifest.js
|   |   |   |   \--- store
|   |   |   |       \--- [[...slug]]
|   |   |   |           +--- page
|   |   |   |           |   +--- app-build-manifest.json
|   |   |   |           |   +--- app-paths-manifest.json
|   |   |   |           |   +--- build-manifest.json
|   |   |   |           |   +--- next-font-manifest.json
|   |   |   |           |   +--- react-loadable-manifest.json
|   |   |   |           |   \--- server-reference-manifest.json
|   |   |   |           +--- page.js
|   |   |   |           +--- page.js.map
|   |   |   |           \--- page_client-reference-manifest.js
|   |   |   +--- favicon.ico
|   |   |   |   +--- route
|   |   |   |   |   +--- app-build-manifest.json
|   |   |   |   |   +--- app-paths-manifest.json
|   |   |   |   |   \--- build-manifest.json
|   |   |   |   +--- route.js
|   |   |   |   \--- route.js.map
|   |   |   \--- login
|   |   |       +--- page
|   |   |       |   +--- app-build-manifest.json
|   |   |       |   +--- app-paths-manifest.json
|   |   |       |   +--- build-manifest.json
|   |   |       |   +--- next-font-manifest.json
|   |   |       |   +--- react-loadable-manifest.json
|   |   |       |   \--- server-reference-manifest.json
|   |   |       +--- page.js
|   |   |       +--- page.js.map
|   |   |       \--- page_client-reference-manifest.js
|   |   +--- app-paths-manifest.json
|   |   +--- chunks
|   |   |   +--- node_modules_next_1284232b._.js
|   |   |   +--- node_modules_next_1284232b._.js.map
|   |   |   +--- ssr
|   |   |   |   +--- app_(dashboard)_layout_tsx_3fcfbfb4._.js
|   |   |   |   +--- app_(dashboard)_layout_tsx_3fcfbfb4._.js.map
|   |   |   |   +--- app_0ef037c1._.js
|   |   |   |   +--- app_0ef037c1._.js.map
|   |   |   |   +--- components_70abee6f._.js
|   |   |   |   +--- components_70abee6f._.js.map
|   |   |   |   +--- components_c4389ecb._.js
|   |   |   |   +--- components_c4389ecb._.js.map
|   |   |   |   +--- components_CreateLead_jsx_2c1d1f3b._.js
|   |   |   |   +--- components_CreateLead_jsx_2c1d1f3b._.js.map
|   |   |   |   +--- components_CreateQuotation_jsx_ef08937c._.js
|   |   |   |   +--- components_CreateQuotation_jsx_ef08937c._.js.map
|   |   |   |   +--- components_CustomerComplaintManagement_jsx_558792c6._.js
|   |   |   |   +--- components_CustomerComplaintManagement_jsx_558792c6._.js.map
|   |   |   |   +--- components_DashboardView_jsx_7032f158._.js
|   |   |   |   +--- components_DashboardView_jsx_7032f158._.js.map
|   |   |   |   +--- components_f40254cc._.js
|   |   |   |   +--- components_f40254cc._.js.map
|   |   |   |   +--- components_LeadsView_jsx_45fcb096._.js
|   |   |   |   +--- components_LeadsView_jsx_45fcb096._.js.map
|   |   |   |   +--- components_OrdersView_jsx_22338531._.js
|   |   |   |   +--- components_OrdersView_jsx_22338531._.js.map
|   |   |   |   +--- components_PaymentFollowupERPView_jsx_82f26340._.js
|   |   |   |   +--- components_PaymentFollowupERPView_jsx_82f26340._.js.map
|   |   |   |   +--- components_PaymentsView_jsx_76de36e5._.js
|   |   |   |   +--- components_PaymentsView_jsx_76de36e5._.js.map
|   |   |   |   +--- components_QuotationsView_jsx_723f3ebf._.js
|   |   |   |   +--- components_QuotationsView_jsx_723f3ebf._.js.map
|   |   |   |   +--- components_ReportsView_jsx_b4f9545b._.js
|   |   |   |   +--- components_ReportsView_jsx_b4f9545b._.js.map
|   |   |   |   +--- components_SamplesView_jsx_6e136f3d._.js
|   |   |   |   +--- components_SamplesView_jsx_6e136f3d._.js.map
|   |   |   |   +--- modules_plant-head_pages_09b4da4a._.js
|   |   |   |   +--- modules_plant-head_pages_09b4da4a._.js.map
|   |   |   |   +--- modules_plant-head_pages_PlantHeadPortal_jsx_91fb2cdc._.js
|   |   |   |   +--- modules_plant-head_pages_PlantHeadPortal_jsx_91fb2cdc._.js.map
|   |   |   |   +--- modules_procurement_536d9534._.js
|   |   |   |   +--- modules_procurement_536d9534._.js.map
|   |   |   |   +--- modules_procurement_add4e632._.js
|   |   |   |   +--- modules_procurement_add4e632._.js.map
|   |   |   |   +--- modules_purchase_71860d23._.js
|   |   |   |   +--- modules_purchase_71860d23._.js.map
|   |   |   |   +--- modules_sales_4a68cd4a._.js
|   |   |   |   +--- modules_sales_4a68cd4a._.js.map
|   |   |   |   +--- modules_store_b6dd6aab._.js
|   |   |   |   +--- modules_store_b6dd6aab._.js.map
|   |   |   |   +--- node_modules_26fb353c._.js
|   |   |   |   +--- node_modules_26fb353c._.js.map
|   |   |   |   +--- node_modules_3a71ccce._.js
|   |   |   |   +--- node_modules_3a71ccce._.js.map
|   |   |   |   +--- node_modules_40009a3c._.js
|   |   |   |   +--- node_modules_40009a3c._.js.map
|   |   |   |   +--- node_modules_5f2d4120._.js
|   |   |   |   +--- node_modules_5f2d4120._.js.map
|   |   |   |   +--- node_modules_6245af32._.js
|   |   |   |   +--- node_modules_6245af32._.js.map
|   |   |   |   +--- node_modules_6e7364eb._.js
|   |   |   |   +--- node_modules_6e7364eb._.js.map
|   |   |   |   +--- node_modules_95ebfc22._.js
|   |   |   |   +--- node_modules_95ebfc22._.js.map
|   |   |   |   +--- node_modules_a2c5e593._.js
|   |   |   |   +--- node_modules_a2c5e593._.js.map
|   |   |   |   +--- node_modules_axios_lib_30e2b835._.js
|   |   |   |   +--- node_modules_axios_lib_30e2b835._.js.map
|   |   |   |   +--- node_modules_b0c1cb93._.js
|   |   |   |   +--- node_modules_b0c1cb93._.js.map
|   |   |   |   +--- node_modules_bd5d257b._.js
|   |   |   |   +--- node_modules_bd5d257b._.js.map
|   |   |   |   +--- node_modules_canvg_lib_index_cjs_5860bc3b._.js
|   |   |   |   +--- node_modules_canvg_lib_index_cjs_5860bc3b._.js.map
|   |   |   |   +--- node_modules_core-js_32675ca5._.js
|   |   |   |   +--- node_modules_core-js_32675ca5._.js.map
|   |   |   |   +--- node_modules_es-toolkit_dist_4bfef410._.js
|   |   |   |   +--- node_modules_es-toolkit_dist_4bfef410._.js.map
|   |   |   |   +--- node_modules_html2canvas_dist_html2canvas_esm_cd3010df.js
|   |   |   |   +--- node_modules_html2canvas_dist_html2canvas_esm_cd3010df.js.map
|   |   |   |   +--- node_modules_jspdf_dist_jspdf_node_min_ce6eb4cc.js
|   |   |   |   +--- node_modules_jspdf_dist_jspdf_node_min_ce6eb4cc.js.map
|   |   |   |   +--- node_modules_lucide-react_dist_esm_652cd72e._.js
|   |   |   |   +--- node_modules_lucide-react_dist_esm_652cd72e._.js.map
|   |   |   |   +--- node_modules_lucide-react_dist_esm_icons_4d1fdfee._.js
|   |   |   |   +--- node_modules_lucide-react_dist_esm_icons_4d1fdfee._.js.map
|   |   |   |   +--- node_modules_lucide-react_dist_esm_icons_index_mjs_a6e66b9e._.js
|   |   |   |   +--- node_modules_lucide-react_dist_esm_icons_index_mjs_a6e66b9e._.js.map
|   |   |   |   +--- node_modules_lucide-react_dist_esm_lucide-react_mjs_5bb2f3c3._.js
|   |   |   |   +--- node_modules_lucide-react_dist_esm_lucide-react_mjs_5bb2f3c3._.js.map
|   |   |   |   +--- node_modules_mime-db_54e42dbe._.js
|   |   |   |   +--- node_modules_mime-db_54e42dbe._.js.map
|   |   |   |   +--- node_modules_next_069facb3._.js
|   |   |   |   +--- node_modules_next_069facb3._.js.map
|   |   |   |   +--- node_modules_next_dist_130bb1e7._.js
|   |   |   |   +--- node_modules_next_dist_130bb1e7._.js.map
|   |   |   |   +--- node_modules_next_dist_3f1523e3._.js
|   |   |   |   +--- node_modules_next_dist_3f1523e3._.js.map
|   |   |   |   +--- node_modules_next_dist_5c639199._.js
|   |   |   |   +--- node_modules_next_dist_5c639199._.js.map
|   |   |   |   +--- node_modules_next_dist_607f726a._.js
|   |   |   |   +--- node_modules_next_dist_607f726a._.js.map
|   |   |   |   +--- node_modules_next_dist_8cdb4704._.js
|   |   |   |   +--- node_modules_next_dist_8cdb4704._.js.map
|   |   |   |   +--- node_modules_next_dist_b1845fee._.js
|   |   |   |   +--- node_modules_next_dist_b1845fee._.js.map
|   |   |   |   +--- node_modules_next_dist_c166e963._.js
|   |   |   |   +--- node_modules_next_dist_c166e963._.js.map
|   |   |   |   +--- node_modules_next_dist_client_bdd5648e._.js
|   |   |   |   +--- node_modules_next_dist_client_bdd5648e._.js.map
|   |   |   |   +--- node_modules_next_dist_client_components_9774470f._.js
|   |   |   |   +--- node_modules_next_dist_client_components_9774470f._.js.map
|   |   |   |   +--- node_modules_next_dist_client_components_builtin_forbidden_45780354.js
|   |   |   |   +--- node_modules_next_dist_client_components_builtin_forbidden_45780354.js.map
|   |   |   |   +--- node_modules_next_dist_client_components_builtin_global-error_ece394eb.js
|   |   |   |   +--- node_modules_next_dist_client_components_builtin_global-error_ece394eb.js.map
|   |   |   |   +--- node_modules_next_dist_client_components_builtin_unauthorized_15817684.js
|   |   |   |   +--- node_modules_next_dist_client_components_builtin_unauthorized_15817684.js.map
|   |   |   |   +--- node_modules_next_dist_compiled_6c3ad287._.js
|   |   |   |   +--- node_modules_next_dist_compiled_6c3ad287._.js.map
|   |   |   |   +--- node_modules_next_dist_compiled_next-devtools_index_a19313bf.js
|   |   |   |   +--- node_modules_next_dist_compiled_next-devtools_index_a19313bf.js.map
|   |   |   |   +--- node_modules_next_dist_ede1a5ec._.js
|   |   |   |   +--- node_modules_next_dist_ede1a5ec._.js.map
|   |   |   |   +--- node_modules_next_dist_esm_968ff1ee._.js
|   |   |   |   +--- node_modules_next_dist_esm_968ff1ee._.js.map
|   |   |   |   +--- node_modules_next_dist_server_route-modules_app-page_f354387c._.js
|   |   |   |   +--- node_modules_next_dist_server_route-modules_app-page_f354387c._.js.map
|   |   |   |   +--- node_modules_next_f71b9665._.js
|   |   |   |   +--- node_modules_next_f71b9665._.js.map
|   |   |   |   +--- node_modules_pako_dist_pako_esm_mjs_9e9258e5._.js
|   |   |   |   +--- node_modules_pako_dist_pako_esm_mjs_9e9258e5._.js.map
|   |   |   |   +--- node_modules_recharts_es6_230cdeb0._.js
|   |   |   |   +--- node_modules_recharts_es6_230cdeb0._.js.map
|   |   |   |   +--- node_modules_recharts_es6_7fcb25cb._.js
|   |   |   |   +--- node_modules_recharts_es6_7fcb25cb._.js.map
|   |   |   |   +--- node_modules_recharts_es6_cartesian_2c0eb712._.js
|   |   |   |   +--- node_modules_recharts_es6_cartesian_2c0eb712._.js.map
|   |   |   |   +--- node_modules_recharts_es6_cartesian_763fa755._.js
|   |   |   |   +--- node_modules_recharts_es6_cartesian_763fa755._.js.map
|   |   |   |   +--- node_modules_recharts_es6_component_ade80130._.js
|   |   |   |   +--- node_modules_recharts_es6_component_ade80130._.js.map
|   |   |   |   +--- node_modules_recharts_es6_state_4b9b05ef._.js
|   |   |   |   +--- node_modules_recharts_es6_state_4b9b05ef._.js.map
|   |   |   |   +--- node_modules_recharts_es6_state_c7830115._.js
|   |   |   |   +--- node_modules_recharts_es6_state_c7830115._.js.map
|   |   |   |   +--- node_modules_recharts_es6_util_5a6d633c._.js
|   |   |   |   +--- node_modules_recharts_es6_util_5a6d633c._.js.map
|   |   |   |   +--- node_modules_recharts_es6_util_b61c3feb._.js
|   |   |   |   +--- node_modules_recharts_es6_util_b61c3feb._.js.map
|   |   |   |   +--- node_modules_sweetalert2_dist_sweetalert2_esm_all_8055e0e0.js
|   |   |   |   +--- node_modules_sweetalert2_dist_sweetalert2_esm_all_8055e0e0.js.map
|   |   |   |   +--- node_modules_sweetalert2_dist_sweetalert2_esm_all_d58679c2.js
|   |   |   |   +--- node_modules_sweetalert2_dist_sweetalert2_esm_all_d58679c2.js.map
|   |   |   |   +--- node_modules_tailwind-merge_dist_bundle-mjs_mjs_0b83d5d5._.js
|   |   |   |   +--- node_modules_tailwind-merge_dist_bundle-mjs_mjs_0b83d5d5._.js.map
|   |   |   |   +--- shared_83263edb._.js
|   |   |   |   +--- shared_83263edb._.js.map
|   |   |   |   +--- [externals]_next_dist_shared_lib_no-fallback-error_external_59b92b38.js
|   |   |   |   +--- [externals]_next_dist_shared_lib_no-fallback-error_external_59b92b38.js.map
|   |   |   |   +--- [root-of-the-server]__0bf23287._.js
|   |   |   |   +--- [root-of-the-server]__0bf23287._.js.map
|   |   |   |   +--- [root-of-the-server]__0d54b370._.js
|   |   |   |   +--- [root-of-the-server]__0d54b370._.js.map
|   |   |   |   +--- [root-of-the-server]__13c43cc1._.js
|   |   |   |   +--- [root-of-the-server]__48b35015._.js
|   |   |   |   +--- [root-of-the-server]__48b35015._.js.map
|   |   |   |   +--- [root-of-the-server]__5610fafe._.js
|   |   |   |   +--- [root-of-the-server]__5b49048b._.js
|   |   |   |   +--- [root-of-the-server]__5b49048b._.js.map
|   |   |   |   +--- [root-of-the-server]__6a7c7e43._.js
|   |   |   |   +--- [root-of-the-server]__6a7c7e43._.js.map
|   |   |   |   +--- [root-of-the-server]__70a73b34._.js
|   |   |   |   +--- [root-of-the-server]__70a73b34._.js.map
|   |   |   |   +--- [root-of-the-server]__76b4cbfc._.js
|   |   |   |   +--- [root-of-the-server]__76b4cbfc._.js.map
|   |   |   |   +--- [root-of-the-server]__785e965e._.js
|   |   |   |   +--- [root-of-the-server]__785e965e._.js.map
|   |   |   |   +--- [root-of-the-server]__8f2e6ae9._.js
|   |   |   |   +--- [root-of-the-server]__8f2e6ae9._.js.map
|   |   |   |   +--- [root-of-the-server]__a8ab9a0d._.js
|   |   |   |   +--- [root-of-the-server]__a8ab9a0d._.js.map
|   |   |   |   +--- [root-of-the-server]__aa7da2a0._.js
|   |   |   |   +--- [root-of-the-server]__aa7da2a0._.js.map
|   |   |   |   +--- [root-of-the-server]__c1d5d576._.js
|   |   |   |   +--- [root-of-the-server]__c1d5d576._.js.map
|   |   |   |   +--- [root-of-the-server]__c80f7c8f._.js
|   |   |   |   +--- [root-of-the-server]__c80f7c8f._.js.map
|   |   |   |   +--- [root-of-the-server]__deaa1130._.js
|   |   |   |   +--- [root-of-the-server]__deaa1130._.js.map
|   |   |   |   +--- [root-of-the-server]__e6a4d965._.js
|   |   |   |   +--- [root-of-the-server]__e6a4d965._.js.map
|   |   |   |   +--- [root-of-the-server]__e8a2741f._.js
|   |   |   |   +--- [root-of-the-server]__e8a2741f._.js.map
|   |   |   |   +--- [root-of-the-server]__f4b39a20._.js
|   |   |   |   +--- [root-of-the-server]__f4b39a20._.js.map
|   |   |   |   +--- [turbopack]_browser_dev_hmr-client_hmr-client_ts_818f0fdf._.js
|   |   |   |   +--- [turbopack]_browser_dev_hmr-client_hmr-client_ts_818f0fdf._.js.map
|   |   |   |   +--- [turbopack]_browser_dev_hmr-client_hmr-client_ts_89c5f8e8._.js
|   |   |   |   +--- [turbopack]_browser_dev_hmr-client_hmr-client_ts_89c5f8e8._.js.map
|   |   |   |   +--- [turbopack]_runtime.js
|   |   |   |   +--- [turbopack]_runtime.js.map
|   |   |   |   +--- _19838995._.js
|   |   |   |   +--- _19838995._.js.map
|   |   |   |   +--- _19e212d8._.js
|   |   |   |   +--- _19e212d8._.js.map
|   |   |   |   +--- _741e6f39._.js
|   |   |   |   +--- _741e6f39._.js.map
|   |   |   |   +--- _78370c9a._.js
|   |   |   |   +--- _78370c9a._.js.map
|   |   |   |   +--- _9656a2e4._.js
|   |   |   |   +--- _9656a2e4._.js.map
|   |   |   |   +--- _bbbc5781._.js
|   |   |   |   +--- _bbbc5781._.js.map
|   |   |   |   +--- _ed4e7719._.js
|   |   |   |   \--- _ed4e7719._.js.map
|   |   |   +--- [root-of-the-server]__503ad839._.js
|   |   |   +--- [root-of-the-server]__503ad839._.js.map
|   |   |   +--- [turbopack]_runtime.js
|   |   |   \--- [turbopack]_runtime.js.map
|   |   +--- interception-route-rewrite-manifest.js
|   |   +--- middleware-build-manifest.js
|   |   +--- middleware-manifest.json
|   |   +--- next-font-manifest.js
|   |   +--- next-font-manifest.json
|   |   +--- pages
|   |   |   +--- _app
|   |   |   |   +--- build-manifest.json
|   |   |   |   +--- client-build-manifest.json
|   |   |   |   +--- next-font-manifest.json
|   |   |   |   +--- pages-manifest.json
|   |   |   |   \--- react-loadable-manifest.json
|   |   |   +--- _app.js
|   |   |   +--- _app.js.map
|   |   |   +--- _document
|   |   |   |   +--- next-font-manifest.json
|   |   |   |   +--- pages-manifest.json
|   |   |   |   \--- react-loadable-manifest.json
|   |   |   +--- _document.js
|   |   |   +--- _document.js.map
|   |   |   +--- _error
|   |   |   |   +--- build-manifest.json
|   |   |   |   +--- client-build-manifest.json
|   |   |   |   +--- next-font-manifest.json
|   |   |   |   +--- pages-manifest.json
|   |   |   |   \--- react-loadable-manifest.json
|   |   |   +--- _error.js
|   |   |   \--- _error.js.map
|   |   +--- pages-manifest.json
|   |   +--- server-reference-manifest.js
|   |   \--- server-reference-manifest.json
|   +--- static
|   |   +--- 6k11sma1T2duaXTEm2UlK
|   |   +--- chunks
|   |   |   +--- app_(dashboard)_layout_tsx_85f92741._.js
|   |   |   +--- app_(dashboard)_plant-head_finished-goods_page_tsx_bba51402._.js
|   |   |   +--- app_(dashboard)_plant-head_planning_page_tsx_bba51402._.js
|   |   |   +--- app_(dashboard)_plant-head_recruitment-request_page_tsx_bba51402._.js
|   |   |   +--- app_(dashboard)_plant-head_[[___slug]]_page_tsx_bba51402._.js
|   |   |   +--- app_(dashboard)_sales_[[___slug]]_page_tsx_bba51402._.js
|   |   |   +--- app_(dashboard)_store_[[___slug]]_page_tsx_bba51402._.js
|   |   |   +--- app_favicon_ico_mjs_e98bdb63._.js
|   |   |   +--- app_globals_css_bad6b30c._.single.css
|   |   |   +--- app_globals_css_bad6b30c._.single.css.map
|   |   |   +--- app_layout_tsx_0a548d63._.js
|   |   |   +--- app_login_page_tsx_85f92741._.js
|   |   |   +--- components_46903dd1._.js
|   |   |   +--- components_46903dd1._.js.map
|   |   |   +--- components_bc2c56ea._.js
|   |   |   +--- components_bc2c56ea._.js.map
|   |   |   +--- components_ccaf498d._.js
|   |   |   +--- components_ccaf498d._.js.map
|   |   |   +--- components_CreateLead_jsx_5c92394d._.js
|   |   |   +--- components_CreateLead_jsx_5c92394d._.js.map
|   |   |   +--- components_CreateQuotation_jsx_eed69662._.js
|   |   |   +--- components_CreateQuotation_jsx_eed69662._.js.map
|   |   |   +--- components_CustomerComplaintManagement_jsx_494a749f._.js
|   |   |   +--- components_CustomerComplaintManagement_jsx_494a749f._.js.map
|   |   |   +--- components_CustomerComplaints_css_bad6b30c._.single.css
|   |   |   +--- components_CustomerComplaints_css_bad6b30c._.single.css.map
|   |   |   +--- components_DashboardView_jsx_07fbe990._.js
|   |   |   +--- components_DashboardView_jsx_07fbe990._.js.map
|   |   |   +--- components_erp-premium-ui_879be850.css
|   |   |   +--- components_erp-premium-ui_879be850.css.map
|   |   |   +--- components_LeadsView_jsx_81efc0de._.js
|   |   |   +--- components_LeadsView_jsx_81efc0de._.js.map
|   |   |   +--- components_OrdersView_jsx_3744d9be._.js
|   |   |   +--- components_OrdersView_jsx_3744d9be._.js.map
|   |   |   +--- components_PaymentFollowupERPView_jsx_76862465._.js
|   |   |   +--- components_PaymentFollowupERPView_jsx_76862465._.js.map
|   |   |   +--- components_PaymentsView_jsx_4b145c88._.js
|   |   |   +--- components_PaymentsView_jsx_4b145c88._.js.map
|   |   |   +--- components_payroll_PayrollWorkflowView_css_bad6b30c._.single.css
|   |   |   +--- components_payroll_PayrollWorkflowView_css_bad6b30c._.single.css.map
|   |   |   +--- components_PlantHeadCommandDashboard_css_bad6b30c._.single.css
|   |   |   +--- components_PlantHeadCommandDashboard_css_bad6b30c._.single.css.map
|   |   |   +--- components_PlantHeadDashboardTheme_css_bad6b30c._.single.css
|   |   |   +--- components_PlantHeadDashboardTheme_css_bad6b30c._.single.css.map
|   |   |   +--- components_PlantHeadLegacyOverrides_css_bad6b30c._.single.css
|   |   |   +--- components_PlantHeadLegacyOverrides_css_bad6b30c._.single.css.map
|   |   |   +--- components_PlantHeadProductPie_css_bad6b30c._.single.css
|   |   |   +--- components_PlantHeadProductPie_css_bad6b30c._.single.css.map
|   |   |   +--- components_ProductionOperationsDashboard_css_bad6b30c._.single.css
|   |   |   +--- components_ProductionOperationsDashboard_css_bad6b30c._.single.css.map
|   |   |   +--- components_QuotationsView_jsx_ebf9a2bb._.js
|   |   |   +--- components_QuotationsView_jsx_ebf9a2bb._.js.map
|   |   |   +--- components_ReportsView_jsx_52145a07._.js
|   |   |   +--- components_ReportsView_jsx_52145a07._.js.map
|   |   |   +--- components_SalesDashboardResponsive_css_bad6b30c._.single.css
|   |   |   +--- components_SalesDashboardResponsive_css_bad6b30c._.single.css.map
|   |   |   +--- components_SamplesView_jsx_36185ed0._.js
|   |   |   +--- components_SamplesView_jsx_36185ed0._.js.map
|   |   |   +--- modules_plant-head_pages_63eb6d74._.js
|   |   |   +--- modules_plant-head_pages_63eb6d74._.js.map
|   |   |   +--- modules_plant-head_pages_PlantHeadPortal_jsx_ab78f657._.js
|   |   |   +--- modules_plant-head_pages_PlantHeadPortal_jsx_ab78f657._.js.map
|   |   |   +--- modules_procurement_a09a21c1._.js
|   |   |   +--- modules_procurement_a09a21c1._.js.map
|   |   |   +--- modules_procurement_b64e54a9._.js
|   |   |   +--- modules_procurement_b64e54a9._.js.map
|   |   |   +--- modules_purchase_af711139._.js
|   |   |   +--- modules_purchase_af711139._.js.map
|   |   |   +--- modules_sales_8f0c4396._.js
|   |   |   +--- modules_sales_8f0c4396._.js.map
|   |   |   +--- modules_store_2c128947._.js
|   |   |   +--- modules_store_2c128947._.js.map
|   |   |   +--- node_modules_44dcbb22._.js
|   |   |   +--- node_modules_44dcbb22._.js.map
|   |   |   +--- node_modules_660762b6._.js
|   |   |   +--- node_modules_660762b6._.js.map
|   |   |   +--- node_modules_69103133._.js
|   |   |   +--- node_modules_69103133._.js.map
|   |   |   +--- node_modules_8232152d._.js
|   |   |   +--- node_modules_8232152d._.js.map
|   |   |   +--- node_modules_8b1abf4d._.js
|   |   |   +--- node_modules_8b1abf4d._.js.map
|   |   |   +--- node_modules_98c4e4db._.js
|   |   |   +--- node_modules_98c4e4db._.js.map
|   |   |   +--- node_modules_@swc_helpers_cjs_b3dc30d6._.js
|   |   |   +--- node_modules_@swc_helpers_cjs_b3dc30d6._.js.map
|   |   |   +--- node_modules_a0d41415._.js
|   |   |   +--- node_modules_a0d41415._.js.map
|   |   |   +--- node_modules_axios_lib_abd7c0de._.js
|   |   |   +--- node_modules_axios_lib_abd7c0de._.js.map
|   |   |   +--- node_modules_b73cf890._.js
|   |   |   +--- node_modules_b73cf890._.js.map
|   |   |   +--- node_modules_b7af7486._.js
|   |   |   +--- node_modules_b7af7486._.js.map
|   |   |   +--- node_modules_canvg_lib_index_es_0cb250ec.js
|   |   |   +--- node_modules_canvg_lib_index_es_3aa07e4c.js
|   |   |   +--- node_modules_canvg_lib_index_es_462dad3d.js
|   |   |   +--- node_modules_canvg_lib_index_es_f4aaf48f.js
|   |   |   +--- node_modules_db4bb196._.js
|   |   |   +--- node_modules_db4bb196._.js.map
|   |   |   +--- node_modules_dompurify_dist_purify_es_mjs_0cb250ec._.js
|   |   |   +--- node_modules_dompurify_dist_purify_es_mjs_3aa07e4c._.js
|   |   |   +--- node_modules_dompurify_dist_purify_es_mjs_462dad3d._.js
|   |   |   +--- node_modules_dompurify_dist_purify_es_mjs_61e0c95e._.js
|   |   |   +--- node_modules_dompurify_dist_purify_es_mjs_61e0c95e._.js.map
|   |   |   +--- node_modules_dompurify_dist_purify_es_mjs_f4aaf48f._.js
|   |   |   +--- node_modules_e8bdd402._.js
|   |   |   +--- node_modules_e8bdd402._.js.map
|   |   |   +--- node_modules_es-toolkit_dist_6457d2de._.js
|   |   |   +--- node_modules_es-toolkit_dist_6457d2de._.js.map
|   |   |   +--- node_modules_f475b131._.js
|   |   |   +--- node_modules_f475b131._.js.map
|   |   |   +--- node_modules_html2canvas_dist_html2canvas_0cb250ec.js
|   |   |   +--- node_modules_html2canvas_dist_html2canvas_3aa07e4c.js
|   |   |   +--- node_modules_html2canvas_dist_html2canvas_462dad3d.js
|   |   |   +--- node_modules_html2canvas_dist_html2canvas_6fe6250c.js
|   |   |   +--- node_modules_html2canvas_dist_html2canvas_6fe6250c.js.map
|   |   |   +--- node_modules_html2canvas_dist_html2canvas_f4aaf48f.js
|   |   |   +--- node_modules_jspdf_dist_jspdf_es_min_0d42d46a.js
|   |   |   +--- node_modules_jspdf_dist_jspdf_es_min_0d42d46a.js.map
|   |   |   +--- node_modules_lucide-react_dist_esm_db7822f8._.js
|   |   |   +--- node_modules_lucide-react_dist_esm_db7822f8._.js.map
|   |   |   +--- node_modules_lucide-react_dist_esm_icons_1d5b5362._.js
|   |   |   +--- node_modules_lucide-react_dist_esm_icons_1d5b5362._.js.map
|   |   |   +--- node_modules_lucide-react_dist_esm_icons_index_mjs_52d4b9ad._.js
|   |   |   +--- node_modules_lucide-react_dist_esm_icons_index_mjs_52d4b9ad._.js.map
|   |   |   +--- node_modules_lucide-react_dist_esm_lucide-react_mjs_72c31289._.js
|   |   |   +--- node_modules_lucide-react_dist_esm_lucide-react_mjs_72c31289._.js.map
|   |   |   +--- node_modules_next_8e52eda3._.js
|   |   |   +--- node_modules_next_8e52eda3._.js.map
|   |   |   +--- node_modules_next_app_72f3d36f.js
|   |   |   +--- node_modules_next_app_72f3d36f.js.map
|   |   |   +--- node_modules_next_dist_0cccb603._.js
|   |   |   +--- node_modules_next_dist_0cccb603._.js.map
|   |   |   +--- node_modules_next_dist_5b402162._.js
|   |   |   +--- node_modules_next_dist_5b402162._.js.map
|   |   |   +--- node_modules_next_dist_8db7fb1f._.js
|   |   |   +--- node_modules_next_dist_8db7fb1f._.js.map
|   |   |   +--- node_modules_next_dist_b0daae9a._.js
|   |   |   +--- node_modules_next_dist_b0daae9a._.js.map
|   |   |   +--- node_modules_next_dist_build_polyfills_polyfill-nomodule.js
|   |   |   +--- node_modules_next_dist_client_cf1d9188._.js
|   |   |   +--- node_modules_next_dist_client_cf1d9188._.js.map
|   |   |   +--- node_modules_next_dist_client_components_builtin_global-error_85f92741.js
|   |   |   +--- node_modules_next_dist_client_d0aa886c._.js
|   |   |   +--- node_modules_next_dist_client_d0aa886c._.js.map
|   |   |   +--- node_modules_next_dist_compiled_166120c5._.js
|   |   |   +--- node_modules_next_dist_compiled_166120c5._.js.map
|   |   |   +--- node_modules_next_dist_compiled_5150ccfd._.js
|   |   |   +--- node_modules_next_dist_compiled_5150ccfd._.js.map
|   |   |   +--- node_modules_next_dist_compiled_next-devtools_index_5277ebc8.js
|   |   |   +--- node_modules_next_dist_compiled_next-devtools_index_5277ebc8.js.map
|   |   |   +--- node_modules_next_dist_compiled_next-devtools_index_a9cb0712.js
|   |   |   +--- node_modules_next_dist_compiled_next-devtools_index_a9cb0712.js.map
|   |   |   +--- node_modules_next_dist_compiled_react-dom_1e674e59._.js
|   |   |   +--- node_modules_next_dist_compiled_react-dom_1e674e59._.js.map
|   |   |   +--- node_modules_next_dist_shared_lib_51ca0077._.js
|   |   |   +--- node_modules_next_dist_shared_lib_51ca0077._.js.map
|   |   |   +--- node_modules_next_dist_shared_lib_c54e23e3._.js
|   |   |   +--- node_modules_next_dist_shared_lib_c54e23e3._.js.map
|   |   |   +--- node_modules_next_error_1cfbb379.js
|   |   |   +--- node_modules_next_error_1cfbb379.js.map
|   |   |   +--- node_modules_pako_dist_pako_esm_mjs_367e3765._.js
|   |   |   +--- node_modules_pako_dist_pako_esm_mjs_367e3765._.js.map
|   |   |   +--- node_modules_react-dom_4411d9bd._.js
|   |   |   +--- node_modules_react-dom_4411d9bd._.js.map
|   |   |   +--- node_modules_recharts_es6_06a7ea21._.js
|   |   |   +--- node_modules_recharts_es6_06a7ea21._.js.map
|   |   |   +--- node_modules_recharts_es6_6b379ee2._.js
|   |   |   +--- node_modules_recharts_es6_6b379ee2._.js.map
|   |   |   +--- node_modules_recharts_es6_cartesian_8ffc85c2._.js
|   |   |   +--- node_modules_recharts_es6_cartesian_8ffc85c2._.js.map
|   |   |   +--- node_modules_recharts_es6_cartesian_a0660855._.js
|   |   |   +--- node_modules_recharts_es6_cartesian_a0660855._.js.map
|   |   |   +--- node_modules_recharts_es6_component_8e12cb58._.js
|   |   |   +--- node_modules_recharts_es6_component_8e12cb58._.js.map
|   |   |   +--- node_modules_recharts_es6_state_9c9dee92._.js
|   |   |   +--- node_modules_recharts_es6_state_9c9dee92._.js.map
|   |   |   +--- node_modules_recharts_es6_state_be111c22._.js
|   |   |   +--- node_modules_recharts_es6_state_be111c22._.js.map
|   |   |   +--- node_modules_recharts_es6_util_992f4f6a._.js
|   |   |   +--- node_modules_recharts_es6_util_992f4f6a._.js.map
|   |   |   +--- node_modules_recharts_es6_util_fea688b8._.js
|   |   |   +--- node_modules_recharts_es6_util_fea688b8._.js.map
|   |   |   +--- node_modules_sweetalert2_dist_sweetalert2_all_8244646a.js
|   |   |   +--- node_modules_sweetalert2_dist_sweetalert2_all_8244646a.js.map
|   |   |   +--- node_modules_tailwind-merge_dist_bundle-mjs_mjs_56b6fd65._.js
|   |   |   +--- node_modules_tailwind-merge_dist_bundle-mjs_mjs_56b6fd65._.js.map
|   |   |   +--- node_modules_zustand_esm_3858f565._.js
|   |   |   +--- node_modules_zustand_esm_3858f565._.js.map
|   |   |   +--- pages
|   |   |   |   +--- _app.js
|   |   |   |   \--- _error.js
|   |   |   +--- pages__app_2da965e7._.js
|   |   |   +--- pages__app_6961bd01._.js.map
|   |   |   +--- pages__error_2da965e7._.js
|   |   |   +--- pages__error_7280d4bb._.js.map
|   |   |   +--- shared_e428308c._.js
|   |   |   +--- shared_e428308c._.js.map
|   |   |   +--- turbopack-pages__app_6961bd01._.js
|   |   |   +--- turbopack-pages__error_7280d4bb._.js
|   |   |   +--- turbopack-_cdba956c._.js
|   |   |   +--- [next]_entry_page-loader_ts_43b523b5._.js
|   |   |   +--- [next]_entry_page-loader_ts_43b523b5._.js.map
|   |   |   +--- [next]_entry_page-loader_ts_742e4b53._.js
|   |   |   +--- [next]_entry_page-loader_ts_742e4b53._.js.map
|   |   |   +--- [next]_internal_font_google_poppins_9708046f_module_css_bad6b30c._.single.css
|   |   |   +--- [next]_internal_font_google_poppins_9708046f_module_css_bad6b30c._.single.css.map
|   |   |   +--- [root-of-the-server]__092393de._.js
|   |   |   +--- [root-of-the-server]__092393de._.js.map
|   |   |   +--- [root-of-the-server]__45f039c3._.js
|   |   |   +--- [root-of-the-server]__45f039c3._.js.map
|   |   |   +--- [root-of-the-server]__aecb6756._.css
|   |   |   +--- [root-of-the-server]__aecb6756._.css.map
|   |   |   +--- [turbopack]_browser_dev_hmr-client_hmr-client_ts_285433b7._.js
|   |   |   +--- [turbopack]_browser_dev_hmr-client_hmr-client_ts_57d40746._.js
|   |   |   +--- [turbopack]_browser_dev_hmr-client_hmr-client_ts_57d40746._.js.map
|   |   |   +--- [turbopack]_browser_dev_hmr-client_hmr-client_ts_c8c997ce._.js
|   |   |   +--- [turbopack]_browser_dev_hmr-client_hmr-client_ts_c8c997ce._.js.map
|   |   |   +--- _25d8b090._.js
|   |   |   +--- _25d8b090._.js.map
|   |   |   +--- _289d64f7._.js
|   |   |   +--- _289d64f7._.js.map
|   |   |   +--- _3eed6af2._.js
|   |   |   +--- _3eed6af2._.js.map
|   |   |   +--- _50484464._.js
|   |   |   +--- _50484464._.js.map
|   |   |   +--- _7bcb48b8._.js
|   |   |   +--- _7bcb48b8._.js.map
|   |   |   +--- _93608a02._.js
|   |   |   +--- _93608a02._.js.map
|   |   |   +--- _958ed777._.js
|   |   |   +--- _958ed777._.js.map
|   |   |   +--- _a0ff3932._.js
|   |   |   +--- _aeaa9069._.js
|   |   |   +--- _aeaa9069._.js.map
|   |   |   +--- _cdba956c._.js.map
|   |   |   +--- _dc09c137._.js
|   |   |   \--- _dc09c137._.js.map
|   |   +--- development
|   |   |   +--- _buildManifest.js
|   |   |   +--- _clientMiddlewareManifest.json
|   |   |   \--- _ssgManifest.js
|   |   \--- media
|   |       +--- 0a7740363b4d4863-s.95e4158a.woff2
|   |       +--- 0da9c7f357bd9d4d-s.b2288445.woff2
|   |       +--- 2094fb60fd9c8287-s.3ed55436.woff2
|   |       +--- 41e95f694c5c4549-s.666bad7d.woff2
|   |       +--- 47fe1b7cd6e6ed85-s.p.855a563b.woff2
|   |       +--- 5f9d24ebef5d5292-s.bd593fbe.woff2
|   |       +--- 6c55a692938ebbbc-s.0a77efb4.woff2
|   |       +--- 798ea22d9983e047-s.b460e02c.woff2
|   |       +--- 7e832ad540183e91-s.a2f18b1a.woff2
|   |       +--- 829ba4228c966254-s.p.a61bc753.woff2
|   |       +--- 8cf1ea7b03cdeb83-s.da3cbacd.woff2
|   |       +--- 8e6fa89aa22d24ec-s.p.3aec397d.woff2
|   |       +--- 99ce71e74c11bc20-s.1db2973a.woff2
|   |       +--- a218039a3287bcfd-s.p.4a23d71b.woff2
|   |       +--- b53057dbf91a7acf-s.c55744ae.woff2
|   |       +--- bdc7e24a509eb931-s.43b0b13e.woff2
|   |       +--- c875c6f5d3e977ac-s.p.80fc2c9e.woff2
|   |       +--- e2334d715941921e-s.p.d82a9aff.woff2
|   |       \--- favicon.0b3bf435.ico
|   +--- trace
|   +--- turbopack
|   \--- types
|       +--- routes.d.ts
|       \--- validator.ts
+--- app
|   +--- (dashboard)
|   |   +--- admin
|   |   |   \--- [[...slug]]
|   |   |       \--- page.tsx
|   |   +--- dispatch
|   |   |   +--- returns
|   |   |   |   \--- page.tsx
|   |   |   \--- [[...slug]]
|   |   |       \--- page.tsx
|   |   +--- employee
|   |   |   \--- payslips
|   |   |       \--- page.tsx
|   |   +--- finance
|   |   |   +--- invoices
|   |   |   |   \--- page.tsx
|   |   |   +--- ledger
|   |   |   |   \--- page.tsx
|   |   |   +--- payment-history
|   |   |   |   \--- page.tsx
|   |   |   +--- payment-verification
|   |   |   |   \--- page.tsx
|   |   |   +--- payments
|   |   |   |   \--- page.tsx
|   |   |   +--- purchase-orders
|   |   |   |   +--- page.tsx
|   |   |   |   \--- [id]
|   |   |   |       \--- close
|   |   |   |           \--- page.tsx
|   |   |   +--- reports
|   |   |   |   \--- page.tsx
|   |   |   +--- salary
|   |   |   |   +--- history
|   |   |   |   |   \--- page.tsx
|   |   |   |   +--- paid
|   |   |   |   |   \--- page.tsx
|   |   |   |   +--- pending
|   |   |   |   |   \--- page.tsx
|   |   |   |   \--- processing
|   |   |   |       \--- page.tsx
|   |   |   +--- salary-disbursement
|   |   |   |   \--- page.tsx
|   |   |   +--- salary-history
|   |   |   |   \--- page.tsx
|   |   |   +--- salary-verification
|   |   |   |   \--- page.tsx
|   |   |   \--- [[...slug]]
|   |   |       \--- page.tsx
|   |   +--- finance-executive
|   |   |   \--- [[...slug]]
|   |   |       \--- page.tsx
|   |   +--- hr
|   |   |   +--- recruitment
|   |   |   |   \--- page.tsx
|   |   |   +--- salary
|   |   |   |   +--- history
|   |   |   |   |   \--- page.tsx
|   |   |   |   +--- page.tsx
|   |   |   |   +--- payslips
|   |   |   |   |   \--- page.tsx
|   |   |   |   +--- prepare
|   |   |   |   |   \--- page.tsx
|   |   |   |   \--- status
|   |   |   |       \--- page.tsx
|   |   |   +--- salary-structure
|   |   |   |   \--- page.tsx
|   |   |   \--- [[...slug]]
|   |   |       \--- page.tsx
|   |   +--- layout.tsx
|   |   +--- orders
|   |   |   \--- [orderId]
|   |   |       \--- page.tsx
|   |   +--- plant-head
|   |   |   +--- finished-goods
|   |   |   |   \--- page.tsx
|   |   |   +--- incoming-orders
|   |   |   |   \--- page.tsx
|   |   |   +--- machine-allocation
|   |   |   |   \--- page.tsx
|   |   |   +--- planning
|   |   |   |   \--- page.tsx
|   |   |   +--- product-approval
|   |   |   |   \--- page.tsx
|   |   |   +--- recruitment-request
|   |   |   |   \--- page.tsx
|   |   |   +--- reports
|   |   |   |   \--- page.tsx
|   |   |   +--- work-orders
|   |   |   |   \--- page.tsx
|   |   |   \--- [[...slug]]
|   |   |       \--- page.tsx
|   |   +--- production
|   |   |   +--- active
|   |   |   |   \--- page.tsx
|   |   |   +--- completed
|   |   |   |   \--- page.tsx
|   |   |   +--- machine-log
|   |   |   |   \--- page.tsx
|   |   |   +--- reports
|   |   |   |   \--- page.tsx
|   |   |   +--- work-orders
|   |   |   |   \--- page.tsx
|   |   |   \--- [[...slug]]
|   |   |       \--- page.tsx
|   |   +--- qc
|   |   |   \--- [[...slug]]
|   |   |       \--- page.tsx
|   |   +--- sales
|   |   |   +--- create-payment
|   |   |   |   \--- page.tsx
|   |   |   +--- customers
|   |   |   |   \--- page.tsx
|   |   |   +--- dashboard
|   |   |   |   \--- page.tsx
|   |   |   +--- leads
|   |   |   |   +--- create
|   |   |   |   |   \--- page.tsx
|   |   |   |   +--- page.tsx
|   |   |   |   \--- [id]
|   |   |   |       \--- edit
|   |   |   |           \--- page.tsx
|   |   |   +--- orders
|   |   |   |   \--- page.tsx
|   |   |   +--- payment-followup
|   |   |   |   \--- page.tsx
|   |   |   +--- payment-history
|   |   |   |   \--- page.tsx
|   |   |   +--- quotations
|   |   |   |   +--- create
|   |   |   |   |   \--- page.tsx
|   |   |   |   \--- page.tsx
|   |   |   +--- reports
|   |   |   |   \--- page.tsx
|   |   |   +--- samples
|   |   |   |   \--- page.tsx
|   |   |   \--- [[...slug]]
|   |   |       \--- page.tsx
|   |   +--- store
|   |   |   +--- reports
|   |   |   |   \--- page.tsx
|   |   |   +--- vendor-master
|   |   |   |   \--- page.tsx
|   |   |   \--- [[...slug]]
|   |   |       \--- page.tsx
|   |   \--- super-admin
|   |       +--- payroll-analysis
|   |       |   \--- page.tsx
|   |       +--- po-requests
|   |       |   \--- page.tsx
|   |       +--- salary-approval
|   |       |   \--- page.tsx
|   |       +--- salary-approvals
|   |       |   \--- page.tsx
|   |       \--- [[...slug]]
|   |           +--- dashboard.css
|   |           \--- page.tsx
|   +--- api
|   |   +--- orders
|   |   |   +--- route.ts
|   |   |   \--- [id]
|   |   |       +--- route.ts
|   |   |       \--- [...action]
|   |   |           \--- route.ts
|   |   +--- production
|   |   |   \--- work-orders
|   |   |       \--- route.js
|   |   \--- qc
|   |       \--- pending
|   |           \--- route.js
|   +--- favicon.ico
|   +--- globals.css
|   +--- layout.tsx
|   +--- login
|   |   \--- page.tsx
|   \--- page.tsx
+--- append_export.js
+--- apply_clean_ui.js
+--- apply_store.js
+--- assets
|   +--- hero.png
|   +--- react.svg
|   \--- vite.svg
+--- components
|   +--- AccessDenied.tsx
|   +--- AddMemberModal.jsx
|   +--- AttendanceChart.jsx
|   +--- common
|   |   \--- ModulePlaceholder.jsx
|   +--- CountdownCard.jsx
|   +--- CreateLead.jsx
|   +--- CreateOrder.jsx
|   +--- CreatePayment.jsx
|   +--- CreateQuotation.jsx
|   +--- CreateSample.jsx
|   +--- CustomerComplaintManagement.jsx
|   +--- CustomerComplaints.css
|   +--- CustomersView.jsx
|   +--- DailyAgendaCalendar.jsx
|   +--- DailyTaskView.jsx
|   +--- DashboardView.jsx
|   +--- DispatchView.jsx
|   +--- EditSample.jsx
|   +--- erp-premium-ui.css
|   +--- GlobalUIComponents.tsx
|   +--- GrowthChart.jsx
|   +--- HeroBanner.jsx
|   +--- Layout
|   |   \--- MobileMenu.jsx
|   +--- LeadsView.jsx
|   +--- material-workflow
|   |   +--- PlantHeadMaterialApprovalView.jsx
|   |   +--- ProductionMaterialConsumptionView.jsx
|   |   +--- ProductionMaterialCreateView.jsx
|   |   +--- ProductionMaterialReceiptsView.jsx
|   |   +--- ProductionMaterialRequestsView.jsx
|   |   +--- ProductionMaterialReturnsView.jsx
|   |   +--- ProductionStoreReleasesView.jsx
|   |   +--- StoreMaterialIssueView.jsx
|   |   +--- StoreMaterialReturnVerificationView.jsx
|   |   \--- StoreReleasesView.jsx
|   +--- MockDataSeeder.tsx
|   +--- monitoring
|   |   \--- LeadSyncMonitor.jsx
|   +--- OrdersView.jsx
|   +--- OrderTimeline.jsx
|   +--- PaymentFollowupERPView.jsx
|   +--- PaymentsView.jsx
|   +--- payroll
|   |   +--- PayrollBatchSummary.tsx
|   |   +--- PayrollSummaryStats.tsx
|   |   +--- PayrollWorkflowView.css
|   |   +--- PayrollWorkflowView.tsx
|   |   +--- SalaryAdjustmentModal.tsx
|   |   +--- SalaryDetailsModal.tsx
|   |   +--- SalaryStatusBadge.tsx
|   |   \--- SalaryTimeline.tsx
|   +--- PlantHeadCommandDashboard.css
|   +--- PlantHeadCommandDashboard.jsx
|   +--- PlantHeadDashboardTheme.css
|   +--- PlantHeadLegacyOverrides.css
|   +--- PlantHeadProductPie.css
|   +--- ProductionOperationsDashboard.css
|   +--- ProductionOperationsDashboard.jsx
|   +--- ProductionView.jsx
|   +--- QuotationsView.jsx
|   +--- ReportsView.jsx
|   +--- SalesDashboardResponsive.css
|   +--- SalesFunnel.jsx
|   +--- SalesGraph.jsx
|   +--- SalesProductionStatusView.jsx
|   +--- SamplesView.jsx
|   +--- SharedPaymentTable.jsx
|   +--- SharedPaymentTable.tsx
|   +--- Sidebar.jsx
|   +--- store
|   |   \--- StoreBadgeUpdater.tsx
|   +--- SuccessRate.jsx
|   +--- tasks
|   |   \--- TaskCard.jsx
|   +--- ToastContainer.jsx
|   +--- TopTeachers.jsx
|   +--- ui
|   |   +--- avatar.tsx
|   |   +--- badge.tsx
|   |   +--- button.tsx
|   |   +--- card.tsx
|   |   +--- ConfirmDialog.jsx
|   |   +--- data-table.tsx
|   |   +--- ErrorBoundary.jsx
|   |   +--- input.tsx
|   |   +--- line-charts-9-demo.tsx
|   |   +--- line-charts-9.tsx
|   |   +--- LoadingOverlay.jsx
|   |   +--- LoadingSkeleton.jsx
|   |   +--- LoadingSpinner.jsx
|   |   +--- modal.tsx
|   |   +--- page-container.tsx
|   |   +--- page-header.tsx
|   |   +--- pie-chart-demo.tsx
|   |   +--- pie-chart.tsx
|   |   +--- select.tsx
|   |   +--- stat-card.tsx
|   |   +--- table.tsx
|   |   +--- textarea.tsx
|   |   \--- Toast.jsx
|   \--- UpcomingEvents.jsx
+--- config
|   +--- navigationConfig.js
|   +--- navigationHelpers.js
|   \--- routeConfig.js
+--- constants
|   +--- procurement.ts
|   +--- production.ts
|   +--- sales.ts
|   \--- systemModules.js
+--- docs
|   +--- ESS-O2C-Replacement-Return-Flow.md
|   +--- project-flows
|   |   +--- 1_sales_order_flow.md
|   |   +--- 2_material_request_flow.md
|   |   +--- 3_purchase_indent_flow.md
|   |   +--- 4_hr_salary_prep_flow.md
|   |   \--- README.md
|   \--- project_tree.txt
+--- engine
|   +--- actions
|   |   +--- dispatchActions.js
|   |   +--- financeActions.js
|   |   +--- orderActions.js
|   |   \--- productionActions.js
|   +--- database.js
|   +--- eventBus.js
|   +--- events.js
|   +--- orchestrators
|   |   +--- dispatchOrchestrator.js
|   |   +--- financeOrchestrator.js
|   |   +--- orderOrchestrator.js
|   |   +--- productionOrchestrator.js
|   |   \--- qcOrchestrator.js
|   +--- reducers
|   |   +--- financeReducer.js
|   |   +--- generalReducer.js
|   |   +--- index.js
|   |   +--- inventoryReducer.js
|   |   \--- orderReducer.js
|   +--- services
|   |   +--- auditService.js
|   |   +--- dispatch.service.ts
|   |   +--- finance.service.ts
|   |   +--- notificationService.js
|   |   +--- plant.service.ts
|   |   +--- production.service.ts
|   |   +--- qc.service.ts
|   |   \--- workflow.service.ts
|   +--- utils
|   |   +--- delay.js
|   |   +--- errors.js
|   |   +--- idGenerator.js
|   |   +--- stateGuard.js
|   |   \--- timeline.js
|   \--- workflow
|       \--- orderWorkflow.ts
+--- eslint.config.mjs
+--- fix-hooks.js
+--- fix-imports.js
+--- fix_alerts.js
+--- fix_api.js
+--- fix_autofill.js
+--- fix_autotable.js
+--- fix_bad_regex.js
+--- fix_comparisons.js
+--- fix_css.js
+--- fix_delivery_api.js
+--- fix_erp_context.js
+--- fix_errors.js
+--- fix_errors2.js
+--- fix_getmapped.js
+--- fix_history.js
+--- fix_leads.js
+--- fix_np.js
+--- fix_orderNo.js
+--- fix_payment_followup.js
+--- fix_pending_rows.js
+--- fix_plant_duplication.js
+--- fix_populate.js
+--- fix_product.js
+--- fix_rest.js
+--- fix_store.js
+--- fix_store_states.js
+--- fix_submit.js
+--- fix_summary.js
+--- fix_syntax.js
+--- fix_tabs.js
+--- fix_usestate.js
+--- fix_zustand_selectors.js
+--- Himalaya - Logo - Since 2004.png
+--- Himalaya-O2C-Repair-Plan.md
+--- himalaya_erp_architecture_doc.md
+--- hooks
|   +--- useLoading.js
|   \--- useMediaQuery.js
+--- implementation_plan.md
+--- inject_log.js
+--- inject_sales_store.js
+--- intercept_ui.js
+--- layouts
|   +--- AuthLayout.jsx
|   \--- MainLayout.jsx
+--- lib
|   +--- api.ts
|   +--- apiClient.js
|   +--- deepEqual.js
|   +--- delay.ts
|   +--- mockData.ts
|   +--- mockDB.ts
|   +--- mockStorage.ts
|   +--- navigationConfig.js
|   +--- routeConfig.js
|   \--- utils.ts
+--- light_theme.js
+--- local-sales-db.json
+--- map_ui_actions.js
+--- migrate-router.js
+--- modules
|   +--- admin
|   |   \--- pages
|   |       +--- AdminNewLead.jsx
|   |       +--- AdminNewQuotation.jsx
|   |       +--- AdminOpsPortal.jsx
|   |       \--- AdminPortal.jsx
|   +--- dispatch
|   |   +--- hooks
|   |   |   \--- useDispatch.ts
|   |   \--- pages
|   |       +--- DispatchPortal.jsx
|   |       \--- ReturnsPortal.jsx
|   +--- finance
|   |   +--- hooks
|   |   |   \--- useFinance.ts
|   |   \--- pages
|   |       +--- FinancePortal.jsx
|   |       \--- FinanceSalesConfirmationView.jsx
|   +--- finance-executive
|   |   +--- Customers
|   |   |   \--- CustomersView.jsx
|   |   +--- Dashboard
|   |   |   \--- DashboardView.jsx
|   |   +--- FinanceExecutivePortal.jsx
|   |   +--- Invoices
|   |   |   \--- InvoicesView.jsx
|   |   +--- Outstanding
|   |   |   \--- OutstandingView.jsx
|   |   +--- PaymentHistory
|   |   |   \--- PaymentHistoryView.jsx
|   |   +--- PaymentVerification
|   |   |   \--- PaymentVerificationView.jsx
|   |   +--- Receipts
|   |   |   \--- ReceiptsView.jsx
|   |   \--- Reports
|   |       \--- ReportsView.jsx
|   +--- hr
|   |   +--- employee
|   |   |   +--- components
|   |   |   |   \--- EmployeeRegistrationForm.tsx
|   |   |   +--- employee.db.ts
|   |   |   +--- employee.repository.ts
|   |   |   +--- employee.schema.ts
|   |   |   +--- employee.selectors.ts
|   |   |   +--- employee.service.ts
|   |   |   +--- employee.types.ts
|   |   |   \--- employee.utils.ts
|   |   \--- pages
|   |       \--- HRPortal.jsx
|   +--- notifications
|   |   \--- pages
|   |       \--- NotificationCenter.jsx
|   +--- orders
|   |   \--- repository
|   |       \--- order.repository.ts
|   +--- plant-head
|   |   +--- hooks
|   |   |   +--- useIncomingOrders.ts
|   |   |   +--- usePlanning.ts
|   |   |   \--- useWorkOrders.ts
|   |   \--- pages
|   |       +--- PlantHeadPortal.jsx
|   |       +--- ReplacementsView.jsx
|   |       \--- ReturnsView.jsx
|   +--- procurement
|   |   +--- components
|   |   |   +--- DeliveryDocumentUploader.jsx
|   |   |   +--- MaterialManifestTable.jsx
|   |   |   +--- ProcurementAuditTimeline.jsx
|   |   |   +--- ProcurementStatusBadge.jsx
|   |   |   +--- ProcurementTabs.jsx
|   |   |   +--- PurchaseOrderDetails.jsx
|   |   |   \--- QuantityReconciliation.jsx
|   |   +--- finance
|   |   |   +--- CreatePurchaseOrder.jsx
|   |   |   +--- DeliveryAudit.jsx
|   |   |   \--- RejectionManagement.jsx
|   |   +--- plant-head
|   |   |   \--- MaterialIndentApproval.jsx
|   |   +--- store
|   |   |   +--- CreateMaterialIndent.jsx
|   |   |   +--- ReceiveReplacement.jsx
|   |   |   \--- VerifyPODelivery.jsx
|   |   \--- super-admin
|   |       \--- PurchaseOrderApproval.jsx
|   +--- production
|   |   +--- components
|   |   |   +--- FinishedGoodsView.jsx
|   |   |   \--- qc
|   |   |       +--- QCDashboardView.jsx
|   |   |       +--- QCHistoryView.jsx
|   |   |       +--- QCInspectionDetailsModal.jsx
|   |   |       +--- QCInspectionModal.jsx
|   |   |       \--- QCPendingView.jsx
|   |   +--- hooks
|   |   |   +--- useActiveProduction.ts
|   |   |   \--- useProductionWorkOrders.ts
|   |   +--- pages
|   |   |   \--- ProductionPortal.jsx
|   |   \--- utils
|   |       \--- getProductionWorkOrders.ts
|   +--- purchase
|   |   +--- pages
|   |   |   +--- GoodsReceiptNote.jsx
|   |   |   +--- PurchaseOrderForm.jsx
|   |   |   +--- PurchaseOrderList.jsx
|   |   |   \--- VendorManagement.jsx
|   |   \--- services
|   |       \--- purchase.service.js
|   +--- salary
|   |   +--- components
|   |   |   +--- SalaryPageLayout.tsx
|   |   |   +--- SalaryTable.tsx
|   |   |   \--- SalaryTabs.tsx
|   |   \--- styles
|   |       \--- salary.css
|   +--- sales
|   |   +--- api
|   |   |   +--- reminders.repository.js
|   |   |   \--- sales.repository.js
|   |   +--- hooks
|   |   |   +--- useLeads.js
|   |   |   +--- useOrders.js
|   |   |   +--- useQuotations.js
|   |   |   +--- useReminders.js
|   |   |   \--- useSamples.js
|   |   +--- pages
|   |   |   +--- SalesOrdersView.jsx
|   |   |   \--- SalesPortal.jsx
|   |   \--- services
|   |       +--- leads.service.js
|   |       +--- orders.service.js
|   |       +--- quotations.service.js
|   |       +--- reminders.service.js
|   |       \--- samples.service.js
|   +--- sales-admin
|   |   +--- components
|   |   |   +--- ActivityLogsPanel.jsx
|   |   |   +--- AlertsCenter.jsx
|   |   |   +--- AnalyticsPanel.jsx
|   |   |   +--- DashboardControlTower.jsx
|   |   |   +--- LeadsIntelligence.jsx
|   |   |   +--- OrderPipelineControl.jsx
|   |   |   +--- PaymentsVisibility.jsx
|   |   |   +--- SalesAdminSettings.jsx
|   |   |   +--- TargetsManagement.jsx
|   |   |   +--- TeamPerformance.jsx
|   |   |   \--- UsersManagement.jsx
|   |   +--- pages
|   |   |   \--- SalesAdminPortal.jsx
|   |   \--- services
|   |       +--- alertService.js
|   |       \--- analyticsService.js
|   +--- store
|   |   +--- components
|   |   |   +--- IndentHistory.jsx
|   |   |   +--- MaterialRejections.jsx
|   |   |   \--- ProcurementForm.jsx
|   |   \--- pages
|   |       +--- StoreDashboard.jsx
|   |       \--- StorePortal.jsx
|   \--- super-admin
|       +--- components
|       |   +--- dashboard.css
|       |   +--- DashboardView.jsx
|       |   +--- DepartmentHeader.jsx
|       |   +--- DepartmentKPI.jsx
|       |   +--- EmployeeDetail.jsx
|       |   +--- EmployeeTable.jsx
|       |   +--- KPICard.jsx
|       |   +--- sales-analytics
|       |   |   +--- analytics
|       |   |   |   +--- ExecutiveKPIs.jsx
|       |   |   |   +--- HeatMap.jsx
|       |   |   |   +--- Leaderboards.jsx
|       |   |   |   +--- LeadFunnel.jsx
|       |   |   |   +--- OrderAnalytics.jsx
|       |   |   |   +--- PaymentAnalytics.jsx
|       |   |   |   +--- ProductAnalytics.jsx
|       |   |   |   +--- RegionalAnalytics.jsx
|       |   |   |   \--- RevenueCharts.jsx
|       |   |   +--- drawers
|       |   |   |   \--- EntityDrawer.jsx
|       |   |   +--- explorer
|       |   |   |   +--- DataExplorer.jsx
|       |   |   |   \--- DataTable.jsx
|       |   |   +--- layout
|       |   |   |   +--- SalesAnalyticsFilters.jsx
|       |   |   |   +--- SalesAnalyticsHeader.jsx
|       |   |   |   \--- SalesAnalyticsTabs.jsx
|       |   |   \--- shared
|       |   |       +--- ChartCard.jsx
|       |   |       \--- KPI.jsx
|       |   \--- SuperAdminAnalyticsFilter.jsx
|       +--- config
|       |   \--- tableColumns.jsx
|       +--- context
|       |   \--- SuperAdminFilterContext.jsx
|       +--- departments
|       |   +--- DispatchDept.jsx
|       |   +--- FinanceDept.jsx
|       |   +--- HRDept.jsx
|       |   +--- PlantDept.jsx
|       |   +--- ProductionDept.jsx
|       |   +--- QCDept.jsx
|       |   +--- SalesDept.jsx
|       |   \--- StoreDept.jsx
|       +--- hooks
|       |   +--- useCommandCenter.js
|       |   +--- useSalesAnalytics.js
|       |   +--- useSalesExport.js
|       |   +--- useSalesFilters.js
|       |   \--- useSuperAdminData.js
|       +--- pages
|       |   +--- AnalyticsTab.jsx
|       |   +--- DispatchCostAnalyticsPage.jsx
|       |   +--- FinanceAnalyticsPage.jsx
|       |   +--- HRAnalyticsPage.jsx
|       |   +--- InventoryCostAnalyticsPage.jsx
|       |   +--- ProductionAnalyticsPage.jsx
|       |   +--- ProfitabilityAnalyticsPage.jsx
|       |   +--- PurchaseIndentsView.jsx
|       |   +--- SalesAnalyticsPage.jsx
|       |   \--- SuperAdminPortal.jsx
|       +--- services
|       |   \--- salesAnalytics.service.js
|       \--- utils
|           +--- export.js
|           \--- financialCalculations.js
+--- next-env.d.ts
+--- next.config.ts
+--- old_erpStore.ts
+--- OrdersView_backup.txt
+--- package-lock.json
+--- package.json
+--- patch_orders_view.js
+--- patch_planthead.js
+--- PlantHeadPortal_backup.txt
+--- playwright-report
|   \--- index.html
+--- playwright.config.ts
+--- postcss.config.mjs
+--- public
|   +--- favicon.svg
|   +--- file.svg
|   +--- firebase-messaging-sw.js
|   +--- globe.svg
|   +--- himalaya-logo-mark.png
|   +--- himalaya-logo-trimmed.png
|   +--- himalaya-logo.png
|   +--- icons.svg
|   +--- next.svg
|   +--- vercel.svg
|   \--- window.svg
+--- README.md
+--- restore_plant_handlers.js
+--- rewire_ui.js
+--- rewrite_finance.js
+--- rewrite_indents_ui.js
+--- rewrite_plant.js
+--- rewrite_qc.js
+--- rewrite_store.js
+--- scaffold-routes.js
+--- script.js
+--- scripts
|   +--- audit-navigation-routes.js
|   +--- ESS-All-O2C-Flow-Test.ts
|   +--- migrate_erpStore.js
|   +--- test-complete-sales-o2c.ts
|   +--- test-erp-duplicate-prevention.ts
|   +--- test-finance-executive-payment-flow.ts
|   +--- test-harsh-o2c.ts
|   +--- test-iso-gel-coat-indent.ts
|   +--- test-material-indent-flow.ts
|   +--- test-payroll-workflow.ts
|   +--- test-sales-memory.ts
|   +--- test-sales.ts
|   +--- test-workflow.ts
|   +--- test_complete_purchase_flow.ts
|   +--- test_final_flow.ts
|   \--- test_procurement_flow.ts
+--- seed_end_to_end_po.js
+--- services
|   +--- admin.service.js
|   +--- dispatch.service.js
|   +--- export.service.js
|   +--- finance.service.js
|   +--- moduleServices.js
|   +--- product.service.js
|   +--- production.service.js
|   \--- sales.service.js
+--- shared
|   +--- api
|   |   +--- cache.js
|   |   +--- client.js
|   |   +--- endpoints.js
|   |   +--- errors.js
|   |   +--- index.js
|   |   +--- interceptors.js
|   |   +--- requestQueue.js
|   |   \--- upload.js
|   +--- auth
|   |   \--- auth.api.js
|   +--- components
|   |   +--- ApprovalHistory.jsx
|   |   +--- DataTable.jsx
|   |   +--- DispatchBillModal.jsx
|   |   +--- EnterpriseAlerts.jsx
|   |   +--- EnterpriseKPIDashboard.jsx
|   |   +--- GlobalOrderTracker.jsx
|   |   +--- O2PWorkflowBanner.tsx
|   |   +--- OrderDetailsModal.jsx
|   |   +--- PermissionGuard.jsx
|   |   +--- ProductMasterUI.jsx
|   |   +--- ProductPicker.jsx
|   |   +--- ReceivableFilters.jsx
|   |   +--- ReminderModal.jsx
|   |   +--- StatusBadge.jsx
|   |   +--- Timeline.jsx
|   |   \--- WorkflowHistory.tsx
|   +--- config
|   |   +--- env.js
|   |   \--- index.js
|   +--- constants.js
|   +--- context
|   |   +--- AbilityContext.jsx
|   |   +--- AuthContext.jsx
|   |   +--- BadgeContext.jsx
|   |   +--- ERPContext.jsx
|   |   +--- new_erp_context.jsx
|   |   +--- NotificationContext.jsx
|   |   \--- ToastContext.jsx
|   +--- firebase
|   |   +--- firebase.js
|   |   \--- messaging.js
|   +--- hooks
|   |   +--- useFormDraft.js
|   |   +--- useO2PWorkflow.ts
|   |   \--- useProductCatalog.js
|   +--- initialMaterials.js
|   +--- socket
|   |   \--- socketClient.js
|   \--- utils
|       \--- reminderUtils.js
+--- store
|   +--- analytics_selector.ts
|   +--- authStore.ts
|   +--- badgeStore.ts
|   +--- customerComplaintStore.ts
|   +--- domains
|   |   +--- dispatch
|   |   |   +--- dispatchActions.ts
|   |   |   \--- dispatchSelectors.ts
|   |   +--- production
|   |   |   \--- productionActions.ts
|   |   +--- sales
|   |   |   +--- salesActions.ts
|   |   |   +--- salesCalculations.ts
|   |   |   +--- salesSelectors.ts
|   |   |   +--- salesTransitions.ts
|   |   |   +--- salesTypes.ts
|   |   |   \--- salesValidation.ts
|   |   \--- shared
|   |       \--- workflowUtils.ts
|   +--- erpStore.ts
|   +--- idGenerator.ts
|   +--- materialFlow.ts
|   +--- materialRequestStore.ts
|   +--- new_procurement_store.ts
|   +--- notificationStore.ts
|   +--- payrollFlow.ts
|   +--- procurementActions.ts
|   +--- procurementDemoSeed.ts
|   +--- procurementSelectors.ts
|   \--- searchStore.ts
+--- storeportal_all_edits.json
+--- storeportal_edits.json
+--- storeportal_edits_utf8.json
+--- test-flow.ts
+--- test-results
|   \--- .last-run.json
+--- tests
|   +--- e2e
|   |   +--- after-sales-modal-ui.spec.ts
|   |   +--- clean-sales-state.spec.ts
|   |   +--- dispatch-queues-ui.spec.ts
|   |   +--- employee-registration-draft.spec.ts
|   |   +--- employee-registration-integration.spec.ts
|   |   +--- employee-registration-responsive.spec.ts
|   |   +--- employee-registration-validation.spec.ts
|   |   +--- harsh-o2c-ui.spec.ts
|   |   +--- procurement-ui-flow.spec.ts
|   |   +--- procurement-ui.spec.ts
|   |   \--- workflow-utils.spec.ts
|   +--- fixtures
|   |   \--- employees
|   |       +--- aadhaar-sample.png
|   |       +--- employee-photo.jpg
|   |       +--- pan-sample.png
|   |       \--- signature.png
|   \--- salary-workflow.spec.ts
+--- test_material_flow.js
+--- test_material_flow.ts
+--- test_procurement_flow.js
+--- test_procurement_flow.ts
+--- test_sales_flow.js
+--- test_sales_flow.ts
+--- tsconfig.json
+--- tsconfig.tsbuildinfo
+--- ts_errors.log
+--- types
|   \--- Order.ts
+--- update_filters.js
+--- update_finance.js
+--- update_finance_payments.js
+--- update_finance_portal.js
+--- update_plant.js
+--- update_qc.js
+--- update_store.js
+--- update_store_portal.js
+--- update_ui_filters.js
+--- utils
|   +--- featureToggle.js
|   +--- paymentTerms.ts
|   \--- taskEngine.js
+--- wire_create_sample.js
\--- wire_safe.js
`
