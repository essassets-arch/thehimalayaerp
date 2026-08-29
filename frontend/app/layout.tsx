import type { Metadata } from 'next'
import './globals.css'
import '../components/CustomerComplaints.css'
import '../components/SalesDashboardResponsive.css'
import '../components/PlantHeadCommandDashboard.css'
import '../components/PlantHeadLegacyOverrides.css'
import '../components/PlantHeadProductPie.css'
import '../components/PlantHeadDashboardTheme.css'
import '../components/ProductionOperationsDashboard.css'
import '../components/payroll/PayrollWorkflowView.css'
import '../components/BackOfficeResponsive.css'
import '../components/erp-premium-ui.css'
import { cn } from "@/lib/utils";
import Providers from './providers';

const geist = { variable: '--font-sans', className: '' };
const poppins = { variable: '--font-main', className: '' };

export const metadata: Metadata = {
  title: 'Himalaya ERP V2',
  description: 'Enterprise Resource Planning Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)} suppressHydrationWarning>
      <body className={poppins.variable} suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
