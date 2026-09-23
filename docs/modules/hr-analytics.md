# Super-admin HR analytics

The report endpoint is read-only. It does not seed departments or change employee assignments. Every query is company-scoped; empty employee selections remain empty for attendance, leave, payroll and expense claims.

Dates use Asia/Kolkata with validated inclusive date ranges. All Time removes the record date restriction. The directory and workforce counts describe current employee records. ACTIVE, ON_PROBATION, CONFIRMED and ON_LEAVE count as employed; other statuses are shown separately from that total.

Today's attendance is queried independently of historical report dates. It never substitutes the latest available attendance day. Absence requires an ABSENT record. The present rate divides recorded present statuses (including half days and missing punch-outs) by recorded present, absent and leave statuses. Holidays, weekly offs and unpunched records are excluded. This is a headcount rate, not payable-day attendance. Missing attendance is displayed separately. Trend days come from recorded attendance only; punch times use India time.

Payroll includes full periods overlapping the selected dates, without prorating, and excludes rejected/cancelled records. Prepared records are included in recorded payroll, which is not a paid-salary total. Employee counts are distinct across periods. Expenses use the ExpenseClaim workflow and its real approval statuses, not the legacy Expense table. Expense charts group recorded names rather than guessed categories.

Leave breakdowns show full requested days for approved requests overlapping the range; the calendar shows approved requests within the range. Leave entitlements and remaining balances are unavailable because no policy ledger is present. Recruitment is a current snapshot filtered by department and employment type; employee and work-location selections do not apply. Open vacancies exclude filled positions and non-hiring requisition states.

No exit dates, notice periods or clearance ledger exist in the employee model. Those metrics and period attrition remain unavailable. Employee status alone is not an exit date. Birthdays and anniversaries use actual occurrence years across year boundaries. Under All Time, celebrations show the current calendar year, labeled on the page.

Filters use database IDs and recorded options. Fetch failures are shown explicitly, and older responses cannot replace newer selections. CSV uses the displayed report snapshot and includes period, filters and payroll scope. The directory no longer silently drops records after the first ten employees.

Verification: eight isolated HR tests cover read-only behavior, unavailable values, current/historical attendance separation, company and empty-selection scoping, payroll and expense totals, recruitment vacancies, invalid dates, All Time, database failures and cross-year celebrations. Frontend JSX syntax and undefined-variable checks pass. Live-data reconciliation and deployment have not been performed.
