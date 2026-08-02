import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Prisma } from '@prisma/client';
import { isRestrictedRole } from '../../common/utils/rbac.util';

@Injectable()
export class SalesReportsService {
  constructor(private prisma: PrismaService) {}

  async getSalesSummary(
    dateFrom: string,
    dateTo: string,
    userId?: string,
    role?: string,
  ) {
    const from = new Date(dateFrom);
    const to = new Date(dateTo);
    to.setHours(23, 59, 59, 999);

    const userFilter =
      isRestrictedRole(role) && userId
        ? Prisma.sql`AND "createdById" = ${userId}`
        : Prisma.empty;

    const result = await this.prisma.$queryRaw`
      SELECT
        TO_CHAR("orderDate", 'YYYY-MM') as month,
        COUNT(id)::int as order_count,
        COUNT(DISTINCT "customerId")::int as unique_customers,
        COALESCE(SUM("totalAmount"), 0)::numeric as total_revenue,
        COALESCE(AVG("totalAmount"), 0)::numeric as avg_order_value,
        COALESCE(SUM(CASE WHEN status = 'COMPLETED' THEN "totalAmount" ELSE 0 END), 0)::numeric as closed_revenue,
        COALESCE(SUM(CASE WHEN status NOT IN ('COMPLETED', 'CANCELLED', 'DRAFT') THEN "totalAmount" ELSE 0 END), 0)::numeric as pending_revenue,
        COALESCE(SUM(CASE WHEN status = 'CANCELLED' THEN "totalAmount" ELSE 0 END), 0)::numeric as cancelled_revenue
      FROM "SalesOrder"
      WHERE "orderDate" >= ${from} AND "orderDate" <= ${to} ${userFilter}
      GROUP BY TO_CHAR("orderDate", 'YYYY-MM')
      ORDER BY month DESC
    `;

    return result;
  }

  async getTopProducts(
    dateFrom: string,
    dateTo: string,
    limit: number,
    userId?: string,
    role?: string,
  ) {
    const from = new Date(dateFrom);
    const to = new Date(dateTo);
    to.setHours(23, 59, 59, 999);

    const userFilter =
      isRestrictedRole(role) && userId
        ? Prisma.sql`AND o."createdById" = ${userId}`
        : Prisma.empty;

    const result = await this.prisma.$queryRaw`
      SELECT 
        p.id,
        p.name as product_name,
        p.sku as product_code,
        p.unit as unit_of_measure,
        COALESCE(SUM(i."orderedQuantity"), 0)::numeric as total_quantity,
        COALESCE(SUM(i."lineTotal"), 0)::numeric as total_revenue
      FROM "SalesOrderItem" i
      JOIN "SalesOrder" o ON i."salesOrderId" = o.id
      JOIN "Product" p ON i."productId" = p.id
      WHERE o."orderDate" >= ${from} AND o."orderDate" <= ${to} ${userFilter}
      GROUP BY p.id, p.name, p.sku, p.unit
      ORDER BY total_revenue DESC
      LIMIT ${limit}
    `;

    return result;
  }

  async getCustomerPerformance(
    dateFrom: string,
    dateTo: string,
    userId?: string,
    role?: string,
  ) {
    const from = new Date(dateFrom);
    const to = new Date(dateTo);
    to.setHours(23, 59, 59, 999);

    const userFilter =
      isRestrictedRole(role) && userId
        ? Prisma.sql`AND o."createdById" = ${userId}`
        : Prisma.empty;

    const result = await this.prisma.$queryRaw`
      SELECT 
        c.id,
        c."companyName" as customer_name,
        c."customerCode" as customer_code,
        c."billingAddress"->>'city' as city,
        c."billingAddress"->>'state' as state,
        c."gstin" as gstin,
        COUNT(o.id)::int as order_count,
        COUNT(CASE WHEN o.status = 'COMPLETED' THEN 1 END)::int as completed_orders,
        COALESCE(SUM(o."totalAmount"), 0)::numeric as total_spent,
        MAX(o."orderDate") as last_order_date
      FROM "SalesOrder" o
      JOIN "Customer" c ON o."customerId" = c.id
      WHERE o."orderDate" >= ${from} AND o."orderDate" <= ${to} ${userFilter}
      GROUP BY c.id, c."companyName", c."customerCode", c."billingAddress", c."gstin"
      ORDER BY total_spent DESC
    `;

    return result;
  }
}
