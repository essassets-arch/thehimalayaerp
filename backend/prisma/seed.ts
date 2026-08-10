import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// ─── Helpers ─────────────────────────────────────────────────────────────────

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function generateSku(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .substring(0, 50);
}

// ─── Product Data Interface ──────────────────────────────────────────────────

interface ProductSeedData {
  name: string;
  brand?: string;
  category: string;
  productType?: string;
  subCategory?: string;
  hsnCode?: string;
  weight?: number | null;
  unit: string;
  unitPrice: number;
  description: string;
  dispatchCategory?: string;
  sku?: string;
  minimumStock?: number;
}

// Manufacturing Products - FRP Covers
const manufacturingProducts: ProductSeedData[] = [
  // FRP MHC Square Covers
  { name: 'HIMALAYA FRP MHC 300X300 ELD', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 300x300mm - Extra Light Duty' },
  { name: 'HIMALAYA FRP MHC 300X300 LD', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 300x300mm - Light Duty' },
  { name: 'HIMALAYA FRP MHC 300X300 B125', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 300x300mm - B125 Class' },
  { name: 'HIMALAYA FRP MHC 300X300 C250', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 300x300mm - C250 Class' },
  { name: 'HIMALAYA FRP MHC 300X300 D400', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 300x300mm - D400 Class' },
  
  { name: 'HIMALAYA FRP MHC 450X450 ELD', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 450x450mm - Extra Light Duty' },
  { name: 'HIMALAYA FRP MHC 450X450 LD', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 450x450mm - Light Duty' },
  { name: 'HIMALAYA FRP MHC 450X450 B125', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 450x450mm - B125 Class' },
  { name: 'HIMALAYA FRP MHC 450X450 C250', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 450x450mm - C250 Class' },
  { name: 'HIMALAYA FRP MHC 450X450 D400', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 450x450mm - D400 Class' },
  
  { name: 'HIMALAYA FRP MHC 600X600 ELD', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 600x600mm - Extra Light Duty' },
  { name: 'HIMALAYA FRP MHC 600X600 LD', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 600x600mm - Light Duty' },
  { name: 'HIMALAYA FRP MHC 600X600 B125', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 600x600mm - B125 Class' },
  { name: 'HIMALAYA FRP MHC 600X600 C250', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 600x600mm - C250 Class' },
  { name: 'HIMALAYA FRP MHC 600X600 D400', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 600x600mm - D400 Class' },
  
  { name: 'HIMALAYA FRP MHC 750X750 ELD', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 750x750mm - Extra Light Duty' },
  { name: 'HIMALAYA FRP MHC 750X750 LD', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 750x750mm - Light Duty' },
  { name: 'HIMALAYA FRP MHC 750X750 B125', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 750x750mm - B125 Class' },
  { name: 'HIMALAYA FRP MHC 750X750 C250', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 750x750mm - C250 Class' },
  { name: 'HIMALAYA FRP MHC 750X750 D400', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 750x750mm - D400 Class' },
  
  { name: 'HIMALAYA FRP MHC 900X900 ELD', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 900x900mm - Extra Light Duty' },
  { name: 'HIMALAYA FRP MHC 900X900 LD', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 900x900mm - Light Duty' },
  { name: 'HIMALAYA FRP MHC 900X900 B125', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 900x900mm - B125 Class' },
  { name: 'HIMALAYA FRP MHC 900X900 C250', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 900x900mm - C250 Class' },
  { name: 'HIMALAYA FRP MHC 900X900 D400', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 900x900mm - D400 Class' },
  
  { name: 'HIMALAYA FRP MHC 1000X1000 ELD', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 1000x1000mm - Extra Light Duty' },
  { name: 'HIMALAYA FRP MHC 1000X1000 LD', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 1000x1000mm - Light Duty' },
  { name: 'HIMALAYA FRP MHC 1000X1000 B125', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 1000x1000mm - B125 Class' },
  { name: 'HIMALAYA FRP MHC 1000X1000 C250', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 1000x1000mm - C250 Class' },
  { name: 'HIMALAYA FRP MHC 1000X1000 D400', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 1000x1000mm - D400 Class' },
  
  { name: 'HIMALAYA FRP MHC 1200X1200 ELD', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 1200x1200mm - Extra Light Duty' },
  { name: 'HIMALAYA FRP MHC 1200X1200 LD', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 1200x1200mm - Light Duty' },
  { name: 'HIMALAYA FRP MHC 1200X1200 B125', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 1200x1200mm - B125 Class' },
  { name: 'HIMALAYA FRP MHC 1200X1200 C250', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 1200x1200mm - C250 Class' },
  { name: 'HIMALAYA FRP MHC 1200X1200 D400', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 1200x1200mm - D400 Class' },
  
  { name: 'HIMALAYA FRP MHC 1500X1500 ELD', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 1500x1500mm - Extra Light Duty' },
  { name: 'HIMALAYA FRP MHC 1500X1500 LD', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 1500x1500mm - Light Duty' },
  { name: 'HIMALAYA FRP MHC 1500X1500 B125', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 1500x1500mm - B125 Class' },
  { name: 'HIMALAYA FRP MHC 1500X1500 C250', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 1500x1500mm - C250 Class' },
  { name: 'HIMALAYA FRP MHC 1500X1500 D400', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 1500x1500mm - D400 Class' },
  
  { name: 'HIMALAYA FRP MHC 1800X1800 ELD', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 1800x1800mm - Extra Light Duty' },
  { name: 'HIMALAYA FRP MHC 1800X1800 LD', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 1800x1800mm - Light Duty' },
  { name: 'HIMALAYA FRP MHC 1800X1800 B125', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 1800x1800mm - B125 Class' },
  { name: 'HIMALAYA FRP MHC 1800X1800 C250', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 1800x1800mm - C250 Class' },
  { name: 'HIMALAYA FRP MHC 1800X1800 D400', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 1800x1800mm - D400 Class' },
  
  // FRP MHC Rectangular
  { name: 'HIMALAYA FRP MHC 450X600 ELD', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 450x600mm - Extra Light Duty' },
  { name: 'HIMALAYA FRP MHC 450X600 LD', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 450x600mm - Light Duty' },
  { name: 'HIMALAYA FRP MHC 450X600 B125', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 450x600mm - B125 Class' },
  { name: 'HIMALAYA FRP MHC 450X600 C250', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 450x600mm - C250 Class' },
  { name: 'HIMALAYA FRP MHC 450X600 D400', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 450x600mm - D400 Class' },
  
  { name: 'HIMALAYA FRP MHC 450X900 ELD', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 450x900mm - Extra Light Duty' },
  { name: 'HIMALAYA FRP MHC 450X900 LD', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 450x900mm - Light Duty' },
  { name: 'HIMALAYA FRP MHC 450X900 B125', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 450x900mm - B125 Class' },
  { name: 'HIMALAYA FRP MHC 450X900 C250', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 450x900mm - C250 Class' },
  { name: 'HIMALAYA FRP MHC 450X900 D400', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 450x900mm - D400 Class' },
  
  { name: 'HIMALAYA FRP MHC 600X900 ELD', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 600x900mm - Extra Light Duty' },
  { name: 'HIMALAYA FRP MHC 600X900 LD', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 600x900mm - Light Duty' },
  { name: 'HIMALAYA FRP MHC 600X900 B125', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 600x900mm - B125 Class' },
  { name: 'HIMALAYA FRP MHC 600X900 C250', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 600x900mm - C250 Class' },
  { name: 'HIMALAYA FRP MHC 600X900 D400', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 600x900mm - D400 Class' },
  
  { name: 'HIMALAYA FRP MHC 600X1200 ELD', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 600x1200mm - Extra Light Duty' },
  { name: 'HIMALAYA FRP MHC 600X1200 LD', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 600x1200mm - Light Duty' },
  { name: 'HIMALAYA FRP MHC 600X1200 B125', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 600x1200mm - B125 Class' },
  { name: 'HIMALAYA FRP MHC 600X1200 C250', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 600x1200mm - C250 Class' },
  { name: 'HIMALAYA FRP MHC 600X1200 D400', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 600x1200mm - D400 Class' },
  
  { name: 'HIMALAYA FRP MHC 900X1200 ELD', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 900x1200mm - Extra Light Duty' },
  { name: 'HIMALAYA FRP MHC 900X1200 LD', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 900x1200mm - Light Duty' },
  { name: 'HIMALAYA FRP MHC 900X1200 B125', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 900x1200mm - B125 Class' },
  { name: 'HIMALAYA FRP MHC 900X1200 C250', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 900x1200mm - C250 Class' },
  { name: 'HIMALAYA FRP MHC 900X1200 D400', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 900x1200mm - D400 Class' },
  
  // FRP MHC Round
  { name: 'HIMALAYA FRPMHC 560MM DIA ELD', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 560mm Dia - Extra Light Duty' },
  { name: 'HIMALAYA FRPMHC 560MM DIA LD', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 560mm Dia - Light Duty' },
  { name: 'HIMALAYA FRPMHC 560MM DIA B125', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 560mm Dia - B125 Class' },
  { name: 'HIMALAYA FRPMHC 560MM DIA C250', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 560mm Dia - C250 Class' },
  { name: 'HIMALAYA FRPMHC 560MM DIA D400', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 560mm Dia - D400 Class' },
  
  { name: 'HIMALAYA FRPMHC 600MM DIA ELD', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 600mm Dia - Extra Light Duty' },
  { name: 'HIMALAYA FRPMHC 600MM DIA LD', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 600mm Dia - Light Duty' },
  { name: 'HIMALAYA FRPMHC 600MM DIA B125', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 600mm Dia - B125 Class' },
  { name: 'HIMALAYA FRPMHC 600MM DIA C250', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 600mm Dia - C250 Class' },
  { name: 'HIMALAYA FRPMHC 600MM DIA D400', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 600mm Dia - D400 Class' },
  
  { name: 'HIMALAYA FRPMHC 900MM DIA ELD', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 900mm Dia - Extra Light Duty' },
  { name: 'HIMALAYA FRPMHC 900MM DIA LD', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 900mm Dia - Light Duty' },
  { name: 'HIMALAYA FRPMHC 900MM DIA B125', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 900mm Dia - B125 Class' },
  { name: 'HIMALAYA FRPMHC 900MM DIA C250', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 900mm Dia - C250 Class' },
  { name: 'HIMALAYA FRPMHC 900MM DIA D400', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Manhole Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover 900mm Dia - D400 Class' },
  
  // FRP RCS (Round Cover Square Frame)
  { name: 'HIMALAYA FRP RCS 300X300 ELD', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Round Cover Square Frame', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Round Cover Square Frame 300x300mm - Extra Light Duty' },
  { name: 'HIMALAYA FRP RCS 300X300 LD', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Round Cover Square Frame', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Round Cover Square Frame 300x300mm - Light Duty' },
  { name: 'HIMALAYA FRP RCS 300X300 B125', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Round Cover Square Frame', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Round Cover Square Frame 300x300mm - B125 Class' },
  { name: 'HIMALAYA FRP RCS 300X300 C250', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Round Cover Square Frame', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Round Cover Square Frame 300x300mm - C250 Class' },
  { name: 'HIMALAYA FRP RCS 300X300 D400', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Round Cover Square Frame', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Round Cover Square Frame 300x300mm - D400 Class' },
  
  { name: 'HIMALAYA FRP RCS 450X450 ELD', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Round Cover Square Frame', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Round Cover Square Frame 450x450mm - Extra Light Duty' },
  { name: 'HIMALAYA FRP RCS 450X450 LD', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Round Cover Square Frame', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Round Cover Square Frame 450x450mm - Light Duty' },
  { name: 'HIMALAYA FRP RCS 450X450 B125', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Round Cover Square Frame', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Round Cover Square Frame 450x450mm - B125 Class' },
  { name: 'HIMALAYA FRP RCS 450X450 C250', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Round Cover Square Frame', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Round Cover Square Frame 450x450mm - C250 Class' },
  { name: 'HIMALAYA FRP RCS 450X450 D400', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Round Cover Square Frame', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Round Cover Square Frame 450x450mm - D400 Class' },
  
  { name: 'HIMALAYA FRP RCS 600X600 ELD', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Round Cover Square Frame', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Round Cover Square Frame 600x600mm - Extra Light Duty' },
  { name: 'HIMALAYA FRP RCS 600X600 LD', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Round Cover Square Frame', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Round Cover Square Frame 600x600mm - Light Duty' },
  { name: 'HIMALAYA FRP RCS 600X600 B125', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Round Cover Square Frame', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Round Cover Square Frame 600x600mm - B125 Class' },
  { name: 'HIMALAYA FRP RCS 600X600 C250', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Round Cover Square Frame', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Round Cover Square Frame 600x600mm - C250 Class' },
  { name: 'HIMALAYA FRP RCS 600X600 D400', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Round Cover Square Frame', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Round Cover Square Frame 600x600mm - D400 Class' },
  
  { name: 'HIMALAYA FRP RCS 750X750 ELD', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Round Cover Square Frame', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Round Cover Square Frame 750x750mm - Extra Light Duty' },
  { name: 'HIMALAYA FRP RCS 750X750 LD', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Round Cover Square Frame', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Round Cover Square Frame 750x750mm - Light Duty' },
  { name: 'HIMALAYA FRP RCS 750X750 B125', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Round Cover Square Frame', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Round Cover Square Frame 750x750mm - B125 Class' },
  { name: 'HIMALAYA FRP RCS 750X750 C250', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Round Cover Square Frame', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Round Cover Square Frame 750x750mm - C250 Class' },
  { name: 'HIMALAYA FRP RCS 750X750 D400', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Round Cover Square Frame', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Round Cover Square Frame 750x750mm - D400 Class' },
  
  { name: 'HIMALAYA FRP RCS 900X900 ELD', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Round Cover Square Frame', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Round Cover Square Frame 900x900mm - Extra Light Duty' },
  { name: 'HIMALAYA FRP RCS 900X900 LD', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Round Cover Square Frame', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Round Cover Square Frame 900x900mm - Light Duty' },
  { name: 'HIMALAYA FRP RCS 900X900 B125', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Round Cover Square Frame', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Round Cover Square Frame 900x900mm - B125 Class' },
  { name: 'HIMALAYA FRP RCS 900X900 C250', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Round Cover Square Frame', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Round Cover Square Frame 900x900mm - C250 Class' },
  { name: 'HIMALAYA FRP RCS 900X900 D400', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Round Cover Square Frame', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Round Cover Square Frame 900x900mm - D400 Class' },
  
  { name: 'HIMALAYA FRP RCS 600X450 ELD', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Round Cover Square Frame', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Round Cover Square Frame 600x450mm - Extra Light Duty' },
  { name: 'HIMALAYA FRP RCS 600X450 LD', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Round Cover Square Frame', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Round Cover Square Frame 600x450mm - Light Duty' },
  { name: 'HIMALAYA FRP RCS 600X450 B125', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Round Cover Square Frame', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Round Cover Square Frame 600x450mm - B125 Class' },
  { name: 'HIMALAYA FRP RCS 600X450 C250', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Round Cover Square Frame', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Round Cover Square Frame 600x450mm - C250 Class' },
  { name: 'HIMALAYA FRP RCS 600X450 D400', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'Round Cover Square Frame', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Round Cover Square Frame 600x450mm - D400 Class' },
  
  // FRP WGC (With Grate Cover)
  { name: 'HIMALAYA FRP WGC 300X300 ELD', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'With Grate Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP With Grate Cover 300x300mm - Extra Light Duty' },
  { name: 'HIMALAYA FRP WGC 300X300 LD', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'With Grate Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP With Grate Cover 300x300mm - Light Duty' },
  { name: 'HIMALAYA FRP WGC 300X300 B125', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'With Grate Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP With Grate Cover 300x300mm - B125 Class' },
  { name: 'HIMALAYA FRP WGC 300X300 C250', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'With Grate Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP With Grate Cover 300x300mm - C250 Class' },
  { name: 'HIMALAYA FRP WGC 300X300 D400', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'With Grate Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP With Grate Cover 300x300mm - D400 Class' },
  
  { name: 'HIMALAYA FRP WGC 450X450 ELD', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'With Grate Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP With Grate Cover 450x450mm - Extra Light Duty' },
  { name: 'HIMALAYA FRP WGC 450X450 LD', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'With Grate Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP With Grate Cover 450x450mm - Light Duty' },
  { name: 'HIMALAYA FRP WGC 450X450 B125', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'With Grate Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP With Grate Cover 450x450mm - B125 Class' },
  { name: 'HIMALAYA FRP WGC 450X450 C250', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'With Grate Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP With Grate Cover 450x450mm - C250 Class' },
  { name: 'HIMALAYA FRP WGC 450X450 D400', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'With Grate Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP With Grate Cover 450x450mm - D400 Class' },
  
  { name: 'HIMALAYA FRP WGC 600X600 ELD', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'With Grate Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP With Grate Cover 600x600mm - Extra Light Duty' },
  { name: 'HIMALAYA FRP WGC 600X600 LD', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'With Grate Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP With Grate Cover 600x600mm - Light Duty' },
  { name: 'HIMALAYA FRP WGC 600X600 B125', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'With Grate Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP With Grate Cover 600x600mm - B125 Class' },
  { name: 'HIMALAYA FRP WGC 600X600 C250', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'With Grate Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP With Grate Cover 600x600mm - C250 Class' },
  { name: 'HIMALAYA FRP WGC 600X600 D400', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'With Grate Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP With Grate Cover 600x600mm - D400 Class' },
  
  { name: 'HIMALAYA FRP WGC 300X700 ELD', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'With Grate Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP With Grate Cover 300x700mm - Extra Light Duty' },
  { name: 'HIMALAYA FRP WGC 300X700 LD', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'With Grate Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP With Grate Cover 300x700mm - Light Duty' },
  { name: 'HIMALAYA FRP WGC 300X700 B125', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'With Grate Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP With Grate Cover 300x700mm - B125 Class' },
  { name: 'HIMALAYA FRP WGC 300X700 C250', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'With Grate Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP With Grate Cover 300x700mm - C250 Class' },
  { name: 'HIMALAYA FRP WGC 300X700 D400', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'With Grate Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP With Grate Cover 300x700mm - D400 Class' },
  
  // FRP ONGC (Oil and Natural Gas Corporation)
  { name: 'HIMALAYA FRPONGC 300X700 ELD', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'ONGC Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP ONGC Cover 300x700mm - Extra Light Duty' },
  { name: 'HIMALAYA FRPONGC 300X700 LD', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'ONGC Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP ONGC Cover 300x700mm - Light Duty' },
  { name: 'HIMALAYA FRPONGC 300X700 B125', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'ONGC Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP ONGC Cover 300x700mm - B125 Class' },
  { name: 'HIMALAYA FRPONGC 300X700 C250', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'ONGC Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP ONGC Cover 300x700mm - C250 Class' },
  { name: 'HIMALAYA FRPONGC 300X700 D400', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'ONGC Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP ONGC Cover 300x700mm - D400 Class' },
  
  { name: 'HIMALAYA FRPONGC 385X700 ELD', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'ONGC Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP ONGC Cover 385x700mm - Extra Light Duty' },
  { name: 'HIMALAYA FRPONGC 385X700 LD', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'ONGC Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP ONGC Cover 385x700mm - Light Duty' },
  { name: 'HIMALAYA FRPONGC 385X700 B125', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'ONGC Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP ONGC Cover 385x700mm - B125 Class' },
  { name: 'HIMALAYA FRPONGC 385X700 C250', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'ONGC Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP ONGC Cover 385x700mm - C250 Class' },
  { name: 'HIMALAYA FRPONGC 385X700 D400', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'ONGC Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP ONGC Cover 385x700mm - D400 Class' },
  
  { name: 'HIMALAYA FRPONGC 450X600 ELD', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'ONGC Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP ONGC Cover 450x600mm - Extra Light Duty' },
  { name: 'HIMALAYA FRPONGC 450X600 LD', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'ONGC Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP ONGC Cover 450x600mm - Light Duty' },
  { name: 'HIMALAYA FRPONGC 450X600 B125', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'ONGC Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP ONGC Cover 450x600mm - B125 Class' },
  { name: 'HIMALAYA FRPONGC 450X600 C250', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'ONGC Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP ONGC Cover 450x600mm - C250 Class' },
  { name: 'HIMALAYA FRPONGC 450X600 D400', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'ONGC Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP ONGC Cover 450x600mm - D400 Class' },
  
  { name: 'HIMALAYA FRPONGC 600X900 ELD', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'ONGC Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP ONGC Cover 600x900mm - Extra Light Duty' },
  { name: 'HIMALAYA FRPONGC 600X900 LD', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'ONGC Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP ONGC Cover 600x900mm - Light Duty' },
  { name: 'HIMALAYA FRPONGC 600X900 B125', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'ONGC Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP ONGC Cover 600x900mm - B125 Class' },
  { name: 'HIMALAYA FRPONGC 600X900 C250', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'ONGC Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP ONGC Cover 600x900mm - C250 Class' },
  { name: 'HIMALAYA FRPONGC 600X900 D400', brand: 'HIMALAYA', category: 'FRP COVERS', subCategory: 'ONGC Cover', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP ONGC Cover 600x900mm - D400 Class' },
  
  // FRP Moulded Grating
  { name: 'FRP MOULDED GRATING 25MM', brand: 'HIMALAYA', category: 'FRP GRATINGS', subCategory: 'Moulded Grating', hsnCode: '39259090', unit: 'SQM', unitPrice: 0, description: 'FRP Moulded Grating 25mm thickness' },
  { name: 'FRP MOULDED GRATING 30MM', brand: 'HIMALAYA', category: 'FRP GRATINGS', subCategory: 'Moulded Grating', hsnCode: '39259090', unit: 'SQM', unitPrice: 0, description: 'FRP Moulded Grating 30mm thickness' },
  { name: 'FRP MOULDED GRATING 38MM', brand: 'HIMALAYA', category: 'FRP GRATINGS', subCategory: 'Moulded Grating', hsnCode: '39259090', unit: 'SQM', unitPrice: 0, description: 'FRP Moulded Grating 38mm thickness' },
  { name: 'FRP MOULDED FRATINGS 50MM', brand: 'HIMALAYA', category: 'FRP GRATINGS', subCategory: 'Moulded Grating', hsnCode: '39259090', unit: 'SQM', unitPrice: 0, description: 'FRP Moulded Grating 50mm thickness' },
  // FRP Covers Basic (FRPMHCELD)
  { name: 'FRPMHCELD 10X10', brand: 'HIMALAYA', category: 'FRP COVER', subCategory: 'Manhole Cover Basic ELD', dispatchCategory: 'D1', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover Extra Light Duty 10x10' },
  { name: 'FRPMHCELD 12X12', brand: 'HIMALAYA', category: 'FRP COVER', subCategory: 'Manhole Cover Basic ELD', dispatchCategory: 'D1', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover Extra Light Duty 12x12' },
  { name: 'FRPMHCELD 15X15', brand: 'HIMALAYA', category: 'FRP COVER', subCategory: 'Manhole Cover Basic ELD', dispatchCategory: 'D1', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover Extra Light Duty 15x15' },
  { name: 'FRPMHCELD 18X18', brand: 'HIMALAYA', category: 'FRP COVER', subCategory: 'Manhole Cover Basic ELD', dispatchCategory: 'D1', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover Extra Light Duty 18x18' },
  { name: 'FRPMHCELD 18X24', brand: 'HIMALAYA', category: 'FRP COVER', subCategory: 'Manhole Cover Basic ELD', dispatchCategory: 'D1', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover Extra Light Duty 18x24' },
  { name: 'FRPMHCELD 21X21', brand: 'HIMALAYA', category: 'FRP COVER', subCategory: 'Manhole Cover Basic ELD', dispatchCategory: 'D1', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover Extra Light Duty 21x21' },
  { name: 'FRPMHCELD 24X24', brand: 'HIMALAYA', category: 'FRP COVER', subCategory: 'Manhole Cover Basic ELD', dispatchCategory: 'D1', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover Extra Light Duty 24x24' },
  { name: 'FRPMHCELD 28X28', brand: 'HIMALAYA', category: 'FRP COVER', subCategory: 'Manhole Cover Basic ELD', dispatchCategory: 'D1', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover Extra Light Duty 28x28' },
  { name: 'FRPMHCELD 30X30', brand: 'HIMALAYA', category: 'FRP COVER', subCategory: 'Manhole Cover Basic ELD', dispatchCategory: 'D1', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover Extra Light Duty 30x30' },
  { name: 'FRPMHCELD 36X36', brand: 'HIMALAYA', category: 'FRP COVER', subCategory: 'Manhole Cover Basic ELD', dispatchCategory: 'D1', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover Extra Light Duty 36x36' },
  { name: 'FRPMHCLD 1800X1800', brand: 'HIMALAYA', category: 'FRP COVER', subCategory: 'Manhole Cover Basic LD', dispatchCategory: 'D1', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover Light Duty 1800x1800' },
  { name: 'FRPMHCELD 1800X1800', brand: 'HIMALAYA', category: 'FRP COVER', subCategory: 'Manhole Cover Basic ELD', dispatchCategory: 'D1', hsnCode: '39259090', unit: 'SET', unitPrice: 0, description: 'FRP Manhole Cover Extra Light Duty 1800x1800' },
];

// Trading Products - Coverblocks
const coverblockProducts: ProductSeedData[] = [
  // Wire Coverblocks (WCB)
  { name: 'WCB 20MM', brand: 'HIMALAYA', category: 'COVERBLOCK', subCategory: 'Wire Coverblock', hsnCode: '68109990', unit: 'PCS', unitPrice: 0, description: 'COVERBLOCK WIRE 20MM' },
  { name: 'WCB 25MM', brand: 'HIMALAYA', category: 'COVERBLOCK', subCategory: 'Wire Coverblock', hsnCode: '68109990', unit: 'PCS', unitPrice: 0, description: 'COVERBLOCK WIRE 25MM' },
  { name: 'WCB 30MM', brand: 'HIMALAYA', category: 'COVERBLOCK', subCategory: 'Wire Coverblock', hsnCode: '68109990', unit: 'PCS', unitPrice: 0, description: 'COVERBLOCK WIRE 30MM' },
  { name: 'WCB 40MM', brand: 'HIMALAYA', category: 'COVERBLOCK', subCategory: 'Wire Coverblock', hsnCode: '68109990', unit: 'PCS', unitPrice: 0, description: 'COVERBLOCK WIRE 40 MM' },
  { name: 'WCB 50MM', brand: 'HIMALAYA', category: 'COVERBLOCK', subCategory: 'Wire Coverblock', hsnCode: '68109990', unit: 'PCS', unitPrice: 0, description: 'COVERBLOCK WIRE 50 MM' },
  { name: 'WCB MULTIPLE', brand: 'HIMALAYA', category: 'COVERBLOCK', subCategory: 'Wire Coverblock', hsnCode: '68109990', unit: 'SET', unitPrice: 0, description: 'COVERBLOCK WIRE 20X25X40X50' },
  
  // Pilling Coverblocks (PCB)
  { name: 'PCB 20MM', brand: 'HIMALAYA', category: 'COVERBLOCK', subCategory: 'Pilling Coverblock', hsnCode: '68109990', unit: 'PCS', unitPrice: 0, description: 'COVERBLOCK PILLING 20 MM' },
  { name: 'PCB 25MM', brand: 'HIMALAYA', category: 'COVERBLOCK', subCategory: 'Pilling Coverblock', hsnCode: '68109990', unit: 'PCS', unitPrice: 0, description: 'COVERBLOCK PILLING 25 MM' },
  { name: 'PCB 30MM', brand: 'HIMALAYA', category: 'COVERBLOCK', subCategory: 'Pilling Coverblock', hsnCode: '68109990', unit: 'PCS', unitPrice: 0, description: 'COVERBLOCK PILLING 30 MM' },
  { name: 'PCB 40 MM', brand: 'HIMALAYA', category: 'COVERBLOCK', subCategory: 'Pilling Coverblock', hsnCode: '68109990', unit: 'PCS', unitPrice: 0, description: 'COVERBLOCK PILLING 40 MM' },
  { name: 'PileCB 40 MM', brand: 'HIMALAYA', category: 'COVERBLOCK', subCategory: 'Pilling Coverblock', hsnCode: '68109990', unit: 'PCS', unitPrice: 0, description: 'COVERBLOCK PILLING 40 MM' },
  { name: 'PCB 50 MM', brand: 'HIMALAYA', category: 'COVERBLOCK', subCategory: 'Pilling Coverblock', hsnCode: '68109990', unit: 'PCS', unitPrice: 0, description: 'COVERBLOCK PILLING 50 MM' },
  { name: 'PCB 75MM', brand: 'HIMALAYA', category: 'COVERBLOCK', subCategory: 'Pilling Coverblock', hsnCode: '68109990', unit: 'PCS', unitPrice: 0, description: 'COVERBLOCK PILLING 75 MM' },
  
  // Tower Coverblocks (HTCB)
  { name: 'HTCB 40 MM', brand: 'HIMALAYA', category: 'COVERBLOCK', subCategory: 'Tower Coverblock', hsnCode: '68109990', unit: 'PCS', unitPrice: 0, description: 'COVERBLOCK TOWER 40 MM' },
  { name: 'HTCB 50 MM', brand: 'HIMALAYA', category: 'COVERBLOCK', subCategory: 'Tower Coverblock', hsnCode: '68109990', unit: 'PCS', unitPrice: 0, description: 'COVERBLOCK TOWER 50 MM' },
  { name: 'HTCB 75 MM', brand: 'HIMALAYA', category: 'COVERBLOCK', subCategory: 'Tower Coverblock', hsnCode: '68109990', unit: 'PCS', unitPrice: 0, description: 'COVERBLOCK TOWER 75 MM' },
  
  // DT / BTCB Coverblocks (DTCB / BTCB)
  { name: 'BTCB 20-25MM', brand: 'HIMALAYA', category: 'COVERBLOCK', subCategory: 'DT Coverblock', hsnCode: '68109990', unit: 'PCS', unitPrice: 0, description: 'COVERBLOCK BTCB 20-25MM' },
  { name: 'BTCB 40-50MM', brand: 'HIMALAYA', category: 'COVERBLOCK', subCategory: 'DT Coverblock', hsnCode: '68109990', unit: 'PCS', unitPrice: 0, description: 'COVERBLOCK BTCB 40-50MM' },
  { name: 'DTCB 20MM', brand: 'HIMALAYA', category: 'COVERBLOCK', subCategory: 'DT Coverblock', hsnCode: '68109990', unit: 'PCS', unitPrice: 0, description: 'COVERBLOCK DT 20 MM' },
  { name: 'DTCB 25MM', brand: 'HIMALAYA', category: 'COVERBLOCK', subCategory: 'DT Coverblock', hsnCode: '68109990', unit: 'PCS', unitPrice: 0, description: 'COVERBLOCK DT 25 MM' },
  { name: 'DTCB 30MM', brand: 'HIMALAYA', category: 'COVERBLOCK', subCategory: 'DT Coverblock', hsnCode: '68109990', unit: 'PCS', unitPrice: 0, description: 'COVERBLOCK DT 30 MM' },
  { name: 'DTCB 40MM', brand: 'HIMALAYA', category: 'COVERBLOCK', subCategory: 'DT Coverblock', hsnCode: '68109990', unit: 'PCS', unitPrice: 0, description: 'COVERBLOCK DT 40 MM' },
  { name: 'DTCB 50MM', brand: 'HIMALAYA', category: 'COVERBLOCK', subCategory: 'DT Coverblock', hsnCode: '68109990', unit: 'PCS', unitPrice: 0, description: 'COVERBLOCK DT 50 MM' },
  { name: 'DTCB 60MM', brand: 'HIMALAYA', category: 'COVERBLOCK', subCategory: 'DT Coverblock', hsnCode: '68109990', unit: 'PCS', unitPrice: 0, description: 'COVERBLOCK DT 60 MM' },
  { name: 'DTCB 75MM', brand: 'HIMALAYA', category: 'COVERBLOCK', subCategory: 'DT Coverblock', hsnCode: '68109990', unit: 'PCS', unitPrice: 0, description: 'COVERBLOCK DT 75 MM' },
  { name: 'DTCB 100MM', brand: 'HIMALAYA', category: 'COVERBLOCK', subCategory: 'DT Coverblock', hsnCode: '68109990', unit: 'PCS', unitPrice: 0, description: 'COVERBLOCK DT 100 MM' },

  // MCB Coverblocks
  { name: 'MCB 30X40MM', brand: 'HIMALAYA', category: 'COVERBLOCK', subCategory: 'MCB Coverblock', hsnCode: '68109990', unit: 'PCS', unitPrice: 0, description: 'COVERBLOCK MCB 30X40MM' },
  { name: 'MCB 35X40X45MM', brand: 'HIMALAYA', category: 'COVERBLOCK', subCategory: 'MCB Coverblock', hsnCode: '68109990', unit: 'PCS', unitPrice: 0, description: 'COVERBLOCK MCB 35X40X45MM' },
  { name: 'MCB 20X25X40X50MM', brand: 'HIMALAYA', category: 'COVERBLOCK', subCategory: 'MCB Coverblock', hsnCode: '68109990', unit: 'PCS', unitPrice: 0, description: 'COVERBLOCK MCB 20X25X40X50MM' },
];

// Trading Products - RCC Pipes
const rccPipeProducts: ProductSeedData[] = [
  { name: 'RCC HUME PIPE NP2 CLASS', brand: 'HIMALAYA', category: 'RCC PIPE', subCategory: 'Hume Pipe', hsnCode: '68109100', unit: 'MTR', unitPrice: 0, description: 'RCC Hume Pipe NP2 Class - Standard Quality' },
  { name: 'RCC HUME PIPE NP3 CLASS', brand: 'HIMALAYA', category: 'RCC PIPE', subCategory: 'Hume Pipe', hsnCode: '68109100', unit: 'MTR', unitPrice: 0, description: 'RCC Hume Pipe NP3 Class - Medium Quality' },
  { name: 'RCC HUME PIPE NP4 CLASS', brand: 'HIMALAYA', category: 'RCC PIPE', subCategory: 'Hume Pipe', hsnCode: '68109100', unit: 'MTR', unitPrice: 0, description: 'RCC Hume Pipe NP4 Class - Heavy Quality' },
];

// Trading Products - FRC Covers (Square Round Cover)
const frcSquareRoundProducts: ProductSeedData[] = [
  { name: 'FRCSQRC24x24 LD3', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Round Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 59, description: 'FRC SQ. Frame & RO. Cover\nClear Opening : 412 mm dia\nCover Size : 40 mm\nCover Thickness : 500 mm dia\nFrame Size : 600 x 600 mm\nFrame Thickness : 75 mm\nCapacity : LD-3' },
  { name: 'FRCSQRC24x24 LD5', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Round Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 70, description: 'FRC SQ. Frame & RO. Cover\nClear Opening : 412 mm dia\nCover Size : 50 mm\nCover Thickness : 500 mm dia\nFrame Size : 600 x 600 mm\nFrame Thickness : 100 mm\nCapacity : LD-5' },
  { name: 'FRCSQRC24x24 MD10', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Round Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 93, description: 'FRC SQ. Frame & RO. Cover\nClear Opening : 412 mm dia\nCover Size : 70 mm\nCover Thickness : 500 mm dia\nFrame Size : 600 x 600 mm\nFrame Thickness : 120 mm\nCapacity : MD-10' },
  
  { name: 'FRCSQRC30x30 LD5', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Round Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 122, description: 'FRC SQ. Frame & RO. Cover\nClear Opening : 500 mm dia\nCover Size : 600 mm dia\nCover Thickness : 50 mm\nFrame Size : 750 x 750 mm\nFrame Thickness : 100 mm\nCapacity : LD- 5' },
  { name: 'FRCSQRC30x30 MD10', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Round Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 147, description: 'FRC SQ. Frame & RO. Cover\nClear Opening : 500 mm dia\nCover Size : 600 mm dia\nCover Thickness : 70 mm\nFrame Size : 750 x 750 mm\nFrame Thickness : 120 mm\nCapacity : MD- 10' },
  { name: 'FRCSQRC30x30 HD20', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Round Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 170, description: 'FRC SQ. Frame & RO. Cover\nClear Opening : 500 mm dia\nCover Size : 600 mm dia\nCover Thickness : 90 mm\nFrame Size : 750 x 750 mm\nFrame Thickness : 150 mm\nCapacity : HD- 20' },
  
  { name: 'FRCSQRC33x33 HD20', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Round Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 234, description: 'FRC SQ. Frame & RO. Cover\nClear Opening : 550 mm dia\nCover Size : 670 mm dia\nCover Thickness : 75 mm\nFrame Size : 825 x 825 mm\nFrame Thickness : 150 mm\nCapacity : HD- 20' },
  
  { name: 'FRCSQRC34x34 LD5', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Round Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 159, description: 'FRC SQ. Frame & RO. Cover\nClear Opening : 550 mm dia\nCover Size : 700 mm dia\nCover Thickness : 50 mm\nFrame Size : 850 x 850 mm\nFrame Thickness : 100 mm\nCapacity : LD 5' },
  { name: 'FRCSQRC34x34 HD20', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Round Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 264, description: 'FRC SQ. Frame & RO. Cover\nClear Opening : 550 mm dia\nCover Size : 700 mm dia\nCover Thickness : 90 mm\nFrame Size : 850 x 850 mm\nFrame Thickness : 165 mm\nCapacity : HD 20' },
  { name: 'FRCSQRC34x34 EHD35', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Round Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 281, description: 'FRC SQ. Frame & RO. Cover\nClear Opening : 550 mm dia\nCover Size : 700 mm dia\nCover Thickness : 100 mm\nFrame Size : 850 x 850 mm\nFrame Thickness : 175 mm\nCapacity : EHD 35' },
  
  { name: 'FRCSQRC36x36 LD5', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Round Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 173, description: 'FRC SQ. Frame & RO. Cover\nClear Opening : 600 mm dia\nCover Size : 750 mm dia\nCover Thickness : 50 mm\nFrame Size : 900 x 900 mm\nFrame Thickness : 100 mm\nCapacity : LD 5' },
  { name: 'FRCSQRC36x36 MD10', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Round Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 210, description: 'FRC SQ. Frame & RO. Cover\nClear Opening : 600 mm dia\nCover Size : 750 mm dia\nCover Thickness : 70 mm\nFrame Size : 900 x 900 mm\nFrame Thickness : 120 mm\nCapacity : MD 10' },
  { name: 'FRCSQRC36x36 HD20', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Round Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 285, description: 'FRC SQ. Frame & RO. Cover\nClear Opening : 600 mm dia\nCover Size : 750 mm dia\nCover Thickness : 90 mm\nFrame Size : 900 x 900 mm\nFrame Thickness : 165 mm\nCapacity : HD 20' },
  { name: 'FRCSQRC36x36 EHD35', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Round Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 314, description: 'FRC SQ. Frame & RO. Cover\nClear Opening : 600 mm dia\nCover Size : 750 mm dia\nCover Thickness : 100 mm\nFrame Size : 900 x 900 mm\nFrame Thickness : 175 mm\nCapacity : EHD 35' },
  
  { name: 'FRCSQRC42x42 LD5', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Round Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 237, description: 'FRC SQ. Frame & RO. Cover\nClear Opening : 750 mm dia\nCover Size : 900 mm dia\nCover Thickness : 50 mm\nFrame Size : 1050 x 1050 mm\nFrame Thickness : 100 mm\nCapacity : LD 5' },
  { name: 'FRCSQRC42x42 HD20', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Round Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 385, description: 'FRC SQ. Frame & RO. Cover\nClear Opening : 750 mm dia\nCover Size : 900 mm dia\nCover Thickness : 90 mm\nFrame Size : 1050 x 1050 mm\nFrame Thickness : 165 mm\nCapacity : HD 20' },
  { name: 'FRCSQRC42x42 EHD35', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Round Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 410, description: 'FRC SQ. Frame & RO. Cover\nClear Opening : 750 mm dia\nCover Size : 900 mm dia\nCover Thickness : 100 mm\nFrame Size : 1050 x 1050 mm\nFrame Thickness : 175 mm\nCapacity : EHD 35' },
  
  { name: 'FRCSQRC48x48 LD5', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Round Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 272, description: 'FRC SQ. Frame & RO. Cover\nClear Opening : 900 mm dia\nCover Size : 1050 mm dia\nCover Thickness : 50 mm\nFrame Size : 1200 x 1200 mm \nFrame Thickness : 100 mm\nCapacity : LD 5' },
  { name: 'FRCSQRC48x48 HD20', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Round Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 566, description: 'FRC SQ. Frame & RO. Cover\nClear Opening : 900 mm dia\nCover Size : 1050 mm dia\nCover Thickness : 100 mm\nFrame Size : 1200 x 1200 mm \nFrame Thickness : 175 mm\nCapacity : HD 20' },
  { name: 'FRCSQRC48x48 EHD35', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Round Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 573, description: 'FRC SQ. Frame & RO. Cover\nClear Opening : 900 mm dia\nCover Size : 1050 mm dia\nCover Thickness : 100 mm\nFrame Size : 1200 x 1200 mm \nFrame Thickness : 175 mm\nCapacity : EHD 35' },
];

// Trading Products - FRC Rectangular Covers
const frcRectangularProducts: ProductSeedData[] = [
  { name: 'FRCRFRC24x18 LD1', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Rectangular Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 33, description: 'FRC Frame & Cover\nClear Opening : 450 x 300 mm \nCover Size : 525 x 375 mm \nCover Thickness : 40 mm\nFrame Size : 600 x 450 mm\nFrame Thickness : 70 mm\nCapacity : LD 1' },
  { name: 'FRCRFRC28x22 LD2', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Rectangular Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 53, description: 'FRC Frame & Cover\nClear Opening : 525 x 375 mm\nCover Size : 600 x 450 mm\nCover Thickness : 40 mm\nFrame Size : 700 x 550 mm\nFrame Thickness : 85 mm \nCapacity : LD 2' },
  { name: 'FRCRFRC28x22 LD5', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Rectangular Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 70, description: 'FRC Frame & Cover\nClear Opening : 525 x 375 mm\nCover Size : 600 x 450 mm\nCover Thickness : 50 mm\nFrame Size : 700 x 550 mm\nFrame Thickness : 100 mm \nCapacity : LD 5' },
  { name: 'FRCRFRC28x22 MD10', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Rectangular Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 95, description: 'FRC Frame & Cover\nClear Opening : 525 x 375 mm\nCover Size : 600 x 450 mm\nCover Thickness : 70 mm\nFrame Size : 700 x 550 mm\nFrame Thickness : 125 mm \nCapacity : MD 10' },
  
  { name: 'FRCRFRC30x24 LD3', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Rectangular Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 61, description: 'FRC Frame & Cover\nClear Opening : 565 x 412 mm\nCover Size : 650 x 500 mm\nCover Thickness : 40 mm\nFrame Size : 750 x 600 mm\nFrame Thickness : 80 mm\nCapacity : LD 3' },
  
  { name: 'FRCRFRC32x26 LD5', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Rectangular Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 102, description: 'FRC Frame & Cover\nClear Opening : 600 x 450 mm\nCover Size : 700 x 550 mm\nCover Thickness : 50 mm\nFrame Size : 800 x 650 mm\nFrame Thickness : 100 mm\nCapacity : LD 5' },
  { name: 'FRCRFRC32x26 MD10', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Rectangular Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 124, description: 'FRC Frame & Cover\nClear Opening : 600 x 450 mm\nCover Size : 700 x 550 mm\nCover Thickness : 70 mm\nFrame Size : 800 x 650 mm\nFrame Thickness : 120 mm\nCapacity : MD 10' },
  { name: 'FRCRFRC32x26 HD20', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Rectangular Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 159, description: 'FRC Frame & Cover\nClear Opening : 600 x 450 mm\nCover Size : 700 x 550 mm\nCover Thickness : 90 mm\nFrame Size : 800 x 650 mm\nFrame Thickness : 165 mm\nCapacity : HD 20' },
  
  { name: 'FRCRFRC36x24 MD10', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Rectangular Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 140, description: 'FRC Frame & Cover\nClear Opening : 700 x 400 mm\nCover Size : 800 x 500 mm\nCover Thickness : 75 mm\nFrame Size : 900 x 600 mm\nFrame Thickness : 125 mm\nCapacity : MD 10' },
  
  { name: 'FRCRFRC38x26 LD5', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Rectangular Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 120, description: 'FRC Frame & Cover\nClear Opening : 750 x 450 mm\nCover Size : 840 x 550 mm\nCover Thickness : 50 mm\nFrame Size : 950 x 650 mm\nFrame Thickness : 100 mm\nCapacity : LD 5' },
  
  { name: 'FRCRFRC44x26 LD5', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Rectangular Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 133, description: 'FRC Frame & Cover\nClear Opening : 900 x 450 mm\nCover Size : 990 x 540 mm\nCover Thickness : 50 mm\nFrame Size : 1100 x 650 mm\nFrame Thickness : 100 mm\nCapacity : LD 5' },
  
  { name: 'FRCRFRC38x32 MD10', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Rectangular Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 191, description: 'FRC Frame & Cover\nClear Opening : 750 x 600 mm\nCover Size : 850 x 700 mm\nCover Thickness : 70 mm\nFrame Size : 950 x 800 mm\nFrame Thickness : 120 mm\nCapacity : MD 10' },
  { name: 'FRCRFRC38x32 HD20', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Rectangular Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 242, description: 'FRC Frame & Cover\nClear Opening : 750 x 600 mm\nCover Size : 850 x 700 mm\nCover Thickness : 90 mm\nFrame Size : 950 x 800 mm\nFrame Thickness : 150 mm\nCapacity : HD 20' },
  
  { name: 'FRCRFRC41x35.5 EHD35', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Rectangular Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 361, description: 'FRC Frame & Cover\nClear Opening : 750 x 600 mm\nCover Size : 890 x 740 mm\nCover Thickness : 100 mm\nFrame Size : 1025 x 890 mm\nFrame Thickness : 175 mm\nCapacity : EHD 35' },
  
  { name: 'FRCRFRC44x26 MD10', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Rectangular Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 178, description: 'FRC Frame & Cover\nClear Opening : 900 x 450 mm\nCover Size : 1000 x 550 mm\nCover Thickness : 70 mm\nFrame Size : 1100 x 650 mm\nFrame Thickness : 120 mm\nCapacity : MD 10' },
  { name: 'FRCRFRC44x26 HD20', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Rectangular Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 275, description: 'FRC Frame & Cover\nClear Opening : 900 x 450 mm\nCover Size : 1000 x 550 mm\nCover Thickness : 90 mm\nFrame Size : 1100 x 650 mm\nFrame Thickness : 150 mm\nCapacity : HD 20' },
  
  { name: 'FRCRFRC44x34 MD10', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Rectangular Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 201, description: 'FRC Frame & Cover\nClear Opening : 900 x 600 mm\nCover Size : 1000 x 700 mm\nCover Thickness : 70 mm\nFrame Size : 1100 x 850 mm\nFrame Thickness : 120 mm\nCapacity : MD 10' },
  { name: 'FRCRFRC44x34 HD20', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Rectangular Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 309, description: 'FRC Frame & Cover\nClear Opening : 900 x 600 mm\nCover Size : 1000 x 700 mm\nCover Thickness : 90 mm\nFrame Size : 1100 x 850 mm\nFrame Thickness : 165 mm\nCapacity : HD 20' },
  
  { name: 'FRCRFRC42x48 HD20', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Rectangular Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 415, description: 'FRC Frame & Cover\nClear Opening : 900 x 750 mm\nCover Size : 1050 x 900 mm\nCover Thickness : 90 mm\nFrame Size : 1200 x 1050 mm\nFrame Thickness : 165 mm\nCapacity : HD 20' },
  
  { name: 'FRCRFRC48x44 HD20', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Rectangular Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 456, description: 'FRC Frame & Cover\nClear Opening : 900 x 800 mm\nCover Size : 1050 x 950 mm\nCover Thickness : 100 mm\nFrame Size : 1200 x 1100 mm\nFrame Thickness : 175 mm\nCapacity : HD 20' },
  
  { name: 'FRCRFRC52x42 EHD35', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Rectangular Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 485, description: 'FRC Frame & Cover\nClear Opening : 1000 x 750 mm\nCover Size : 1150 x 900 mm\nCover Thickness : 100 mm\nFrame Size : 1300 x 1050 mm\nFrame Thickness : 175 mm\nCapacity : EHD 35' },
  
  { name: 'FRCRFRC60x48 LD5', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Rectangular Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 335, description: 'FRC Frame & Cover\nClear Opening : 1200 x 900 mm\nCover Size : 1300 x 1000 mm\nCover Thickness : 50 mm\nFrame Size : 1500 x 1200 mm\nFrame Thickness : 100 mm\nCapacity : LD 5' },
  { name: 'FRCRFRC60x48 HD20', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Rectangular Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 604, description: 'FRC Frame & Cover\nClear Opening : 1200 x 900 mm\nCover Size : 1300 x 1000 mm\nCover Thickness : 100 mm\nFrame Size : 1500 x 1200 mm\nFrame Thickness : 175 mm\nCapacity : HD 20' },
  { name: 'FRCRFRC60x48 EHD35', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Rectangular Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 609, description: 'FRC Frame & Cover\nClear Opening : 1200 x 900 mm\nCover Size : 1300 x 1000 mm\nCover Thickness : 100 mm\nFrame Size : 1500 x 1200 mm\nFrame Thickness : 175 mm\nCapacity : EHD 35' },
];

// Trading Products - FRC Square Frame Square Cover
const frcSquareFrameProducts: ProductSeedData[] = [
  { name: 'FRCSFSC12x12', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Frame Square Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 11, description: 'FRC SQ. Frame & SQ. Cover\nClear Opening : 190 x 190 mm\nCover Size : 230 x 230 mm\nCover Thickness : 30 mm\nFrame Size : 300 x 300 mm\nFrame Thickness : 65 mm' },
  { name: 'FRCSFSC15x15', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Frame Square Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 18, description: 'FRC SQ. Frame & SQ. Cover\nClear Opening : 220 x 220 mm\nCover Size : 300 x 300 mm\nCover Thickness : 40 mm\nFrame Size : 375 x 375 mm\nFrame Thickness : 75 mm' },
  
  { name: 'FRCSFSC18x18 LD1', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Frame Square Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 26, description: 'FRC SQ. Frame & SQ. Cover\nClear Opening : 305 x 305 mm\nCover Size : 375 x 375 mm\nCover Thickness : 40 mm\nFrame Size : 450 x 450 mm\nFrame Thickness : 81 mm\nCapacity : LD 1' },
  { name: 'FRCSFSC18x18 MD10', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Frame Square Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 67, description: 'FRC SQ. Frame & SQ. Cover\nClear Opening : 305 x 305 mm\nCover Size : 375 x 375 mm\nCover Thickness : 90 mm\nFrame Size : 450 x 450 mm\nFrame Thickness : 150 mm\nCapacity : MD 10' },
  { name: 'FRCSFSC18x18 HD20', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Frame Square Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 67, description: 'FRC SQ. Frame & SQ. Cover\nClear Opening : 305 x 305 mm\nCover Size : 375 x 375 mm\nCover Thickness : 90 mm\nFrame Size : 450 x 450 mm\nFrame Thickness : 150 mm\nCapacity : HD 20' },
  
  { name: 'FRCSFSC24x24 LD2', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Frame Square Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 47, description: 'FRC SQ. Frame & SQ. Cover\nClear Opening : 425 x 425 mm\nCover Size : 500 x 500 mm\nCover Thickness : 40 mm\nFrame Size : 600 x 600 mm\nFrame Thickness : 75 mm\nCapacity : LD 2' },
  { name: 'FRCSFSC24x24 LD5', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Frame Square Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 71, description: 'FRC SQ. Frame & SQ. Cover\nClear Opening : 420 x 420 mm\nCover Size : 490 x 490 mm\nCover Thickness : 50 mm\nFrame Size : 600 x 600 mm\nFrame Thickness : 100 mm\nCapacity : LD 5' },
  { name: 'FRCSFSC24x24 HD20', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Frame Square Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 109, description: 'FRC SQ. Frame & SQ. Cover\nClear Opening : 420 x 420 mm\nCover Size : 490 x 490 mm\nCover Thickness : 90 mm\nFrame Size : 600 x 600 mm\nFrame Thickness : 150 mm\nCapacity : LD 5' },
  
  { name: 'FRCSFSC27x27 LD3', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Frame Square Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 64, description: 'FRC SQ. Frame & SQ. Cover\nClear Opening : 525 x 525 mm\nCover Size : 600 x 600 mm\nCover Thickness : 40 mm\nFrame Size : 675 x 675 mm\nFrame Thickness : 81 mm\nCapacity : HD 20' },
  
  { name: 'FRCSFSC30x30 LD5', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Frame Square Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 112, description: 'FRC SQ. Frame & SQ. Cover\nClear Opening : 500 x 500 mm\nCover Size : 600 x 600 mm\nCover Thickness : 50 mm\nFrame Size : 750 x 750 mm\nFrame Thickness : 100 mm\nCapacity : LD 5' },
  { name: 'FRCSFSC30x30 MD10', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Frame Square Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 152, description: 'FRC SQ. Frame & SQ. Cover\nClear Opening : 500 x 500 mm\nCover Size : 600 x 600 mm\nCover Thickness : 70 mm\nFrame Size : 750 x 750 mm\nFrame Thickness : 120 mm\nCapacity : MD 10' },
  { name: 'FRCSFSC30x30 HD20', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Frame Square Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 189, description: 'FRC SQ. Frame & SQ. Cover\nClear Opening : 500 x 500 mm\nCover Size : 600 x 600 mm\nCover Thickness : 90 mm\nFrame Size : 750 x 750 mm\nFrame Thickness : 165 mm\nCapacity : HD 20' },
  { name: 'FRCSFSC30x30 EHD35', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Frame Square Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 189, description: 'FRC SQ. Frame & SQ. Cover\nClear Opening : 500 x 500 mm\nCover Size : 600 x 600 mm\nCover Thickness : 90 mm\nFrame Size : 750 x 750 mm\nFrame Thickness : 165 mm\nCapacity : EHD 35' },
  
  { name: 'FRCSFSC32.5x32.5 LD5', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Frame Square Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 110, description: 'FRC SQ. Frame & SQ. Cover\nClear Opening : 600 x 600 mm\nCover Size : 700 x 700 mm\nCover Thickness : 50 mm\nFrame Size : 812 x 812 mm\nFrame Thickness : 100 mm\nCapacity : LD 5' },
  { name: 'FRCSFSC32.5x32.5 MD10', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Frame Square Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 172, description: 'FRC SQ. Frame & SQ. Cover\nClear Opening : 600 x 600 mm\nCover Size : 700 x 700 mm\nCover Thickness : 70 mm\nFrame Size : 812 x 812 mm\nFrame Thickness : 120 mm\nCapacity : MD 10' },
  
  { name: 'FRCSFSC36x36 HD20', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Frame Square Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 273, description: 'FRC SQ. Frame & SQ. Cover\nClear Opening : 600 x 600 mm\nCover Size : 750 x 750 mm\nCover Thickness : 90 mm\nFrame Size : 900 x 900 mm\nFrame Thickness : 165 mm\nCapacity : HD 20' },
  { name: 'FRCSFSC36x36 EHD35', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Frame Square Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 289, description: 'FRC SQ. Frame & SQ. Cover\nClear Opening : 600 x 600 mm\nCover Size : 750 x 750 mm\nCover Thickness : 100 mm\nFrame Size : 900 x 900 mm\nFrame Thickness : 175 mm\nCapacity : EHD 35' },
  
  { name: 'FRCSFSC38x38 LD5', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Frame Square Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 145, description: 'FRC SQ. Frame & SQ. Cover\nClear Opening : 750 x 750 mm\nCover Size : 850 x 850 mm\nCover Thickness : 50 mm\nFrame Size : 950 x 950 mm\nFrame Thickness : 100 mm\nCapacity : LD 5' },
  
  { name: 'FRCSFSC42x42 MD10', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Frame Square Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 282, description: 'FRC SQ. Frame & SQ. Cover\nClear Opening : 750 x 750 mm\nCover Size : 900 x 900 mm\nCover Thickness : 75 mm\nFrame Size : 1050 x 1050 mm\nFrame Thickness : 125 mm\nCapacity : MD 10' },
  { name: 'FRCSFSC42x42 HD20', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Frame Square Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 374, description: 'FRC SQ. Frame & SQ. Cover\nClear Opening : 750 x 750 mm\nCover Size : 900 x 900 mm\nCover Thickness : 100 mm\nFrame Size : 1050 x 1050 mm\nFrame Thickness : 175 mm\nCapacity : HD 20' },
  { name: 'FRCSFSC42x42 EHD35', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Frame Square Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 384, description: 'FRC SQ. Frame & SQ. Cover\nClear Opening : 750 x 750 mm\nCover Size : 900 x 900 mm\nCover Thickness : 100 mm\nFrame Size : 1050 x 1050 mm\nFrame Thickness : 175 mm\nCapacity : EHD 35' },
  
  { name: 'FRCSFSC48x48 HD20', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Frame Square Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 493, description: 'FRC SQ. Frame & SQ. Cover\nClear Opening : 900 x 900 mm\nCover Size : 1050 x 1050 mm\nCover Thickness : 100 mm\nFrame Size : 1200 x 1200 mm\nFrame Thickness : 175 mm\nCapacity : HD 20' },
  { name: 'FRCSFSC48x48 EHD35', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Frame Square Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 501, description: 'FRC SQ. Frame & SQ. Cover\nClear Opening : 900 x 900 mm\nCover Size : 1050 x 1050 mm\nCover Thickness : 100 mm\nFrame Size : 1200 x 1200 mm\nFrame Thickness : 175 mm\nCapacity : EHD 35' },
  
  { name: 'FRCSFSC55x55 HD20', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Frame Square Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 825, description: 'FRC SQ. Frame & SQ. Cover\nClear Opening : 1000 x 1000 mm\nCover Size : 1200 x 1200 mm\nCover Thickness : 125 mm\nFrame Size : 1400 x 1400 mm\nFrame Thickness : 200 mm\nCapacity : HD 20' },
  { name: 'FRCSFSC55x55 EHD35', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Frame Square Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 825, description: 'FRC SQ. Frame & SQ. Cover\nClear Opening : 1000 x 1000 mm\nCover Size : 1200 x 1200 mm\nCover Thickness : 125 mm\nFrame Size : 1400 x 1400 mm\nFrame Thickness : 200 mm\nCapacity : EHD 35' },
  
  { name: 'FRCSFSC63x63 HD20', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Frame Square Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 990, description: 'FRC SQ. Frame & SQ. Cover\nClear Opening : 1200 x 1200 mm\nCover Size : 1400 x 1400 mm\nCover Thickness : 125 mm\nFrame Size : 1600 x 1600 mm\nFrame Thickness : 200 mm\nCapacity : HD 20' },
  { name: 'FRCSFSC63x63 EHD35', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Frame Square Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 990, description: 'FRC SQ. Frame & SQ. Cover\nClear Opening : 1200 x 1200 mm\nCover Size : 1400 x 1400 mm\nCover Thickness : 125 mm\nFrame Size : 1600 x 1600 mm\nFrame Thickness : 200 mm\nCapacity : EHD 35' },
  
  { name: 'FRCSFSC67x67 HD20', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Frame Square Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 990, description: 'FRC SQ. Frame & SQ. Cover\nClear Opening : 1300 x 1300 mm\nCover Size : 1400 x 1400 mm\nCover Thickness : 125 mm\nFrame Size : 1700 x 1700 mm\nFrame Thickness : 200 mm\nCapacity : HD 20' },
  { name: 'FRCSFSC67x67 EHD35', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Frame Square Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 990, description: 'FRC SQ. Frame & SQ. Cover\nClear Opening : 1300 x 1300 mm\nCover Size : 1400 x 1400 mm\nCover Thickness : 125 mm\nFrame Size : 1700 x 1700 mm\nFrame Thickness : 200 mm\nCapacity : EHD 35' },
];

// Trading Products - FRC Round Frame Round Cover
const frcRoundFrameProducts: ProductSeedData[] = [
  { name: 'FRCROFROC30 dia MD10', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Round Frame Round Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 109, description: 'FRC RO. Frame & RO. Cover\nClear Opening : 500 mm dia\nCover Size : 600 mm dia\nCover Thickness : 70 mm\nFrame Size : 750 mm dia\nFrame Thickness : 120 mm\nCapacity : MD 10' },
  { name: 'FRCROFROC30 dia HD20', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Round Frame Round Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 143, description: 'FRC RO. Frame & RO. Cover\nClear Opening : 500 mm dia\nCover Size : 600 mm dia\nCover Thickness : 90 mm\nFrame Size : 750 mm dia\nFrame Thickness : 150 mm\nCapacity : HD 20' },
  
  { name: 'FRCROFROC31.5 dia HD20', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Round Frame Round Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 173, description: 'FRC RO. Frame & RO. Cover\nClear Opening : 500 mm dia\nCover Size : 650 mm dia\nCover Thickness : 90 mm\nFrame Size : 800 mm dia\nFrame Thickness : 165 mm\nCapacity : HD 20' },
  { name: 'FRCROFROC31.5 dia EHD35', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Round Frame Round Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 189, description: 'FRC RO. Frame & RO. Cover\nClear Opening : 500 mm dia\nCover Size : 650 mm dia\nCover Thickness : 100 mm\nFrame Size : 800 mm dia\nFrame Thickness : 175 mm\nCapacity : EHD 35' },
  
  { name: 'FRCROFROC33 dia HD20', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Round Frame Round Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 164, description: 'FRC RO. Frame & RO. Cover\nClear Opening : 560 mm dia\nCover Size : 670 mm dia\nCover Thickness : 81 mm\nFrame Size : 825 mm dia\nFrame Thickness : 150 mm\nCapacity : HD 20' },
  
  { name: 'FRCROFROC34 dia HD20', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Round Frame Round Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 205, description: 'FRC RO. Frame & RO. Cover\nClear Opening : 560 mm dia\nCover Size : 700 mm dia\nCover Thickness : 90 mm\nFrame Size : 850 mm dia\nFrame Thickness : 150 mm\nCapacity : HD 20' },
  { name: 'FRCROFROC34 dia EHD35', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Round Frame Round Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 228, description: 'FRC RO. Frame & RO. Cover\nClear Opening : 560 mm dia\nCover Size : 700 mm dia\nCover Thickness : 100 mm\nFrame Size : 850 mm dia\nFrame Thickness : 175 mm\nCapacity : EHD 35' },
  
  { name: 'FRCROFROC34 dia HD20 - 600mm', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Round Frame Round Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 211, description: 'FRC RO. Frame & RO. Cover\nClear Opening : 600 mm dia\nCover Size : 750 mm dia\nCover Thickness : 90 mm\nFrame Size : 900 mm dia\nFrame Thickness : 165 mm\nCapacity : HD 20' },
  { name: 'FRCROFROC34 dia EHD35 - 600mm', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Round Frame Round Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 225, description: 'FRC RO. Frame & RO. Cover\nClear Opening : 600 mm dia\nCover Size : 750 mm dia\nCover Thickness : 100 mm\nFrame Size : 900 mm dia\nFrame Thickness : 175 mm\nCapacity : EHD 35' },
];

// Trading Products - Catchpit Covers
const frcCatchpitProducts: ProductSeedData[] = [
  { name: 'FRCCP24x24 LD5', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Catchpit Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 68, description: 'FRC Catachpit\nClear Opening : 412 x 412 mm\nCover Size : 490 x 490 mm\nCover Thickness : 50 mm\nFrame Size : 600 x 600 mm\nFrame Thickness : 100 mm\nCapacity : LD 5' },
  { name: 'FRCCP24x24 HD20', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Catchpit Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 109, description: 'FRC Catachpit\nClear Opening : 418 x 418 mm\nCover Size : 490 x 490 mm\nCover Thickness : 90 mm\nFrame Size : 600 x 600 mm\nFrame Thickness : 150 mm\nCapacity : HD 20' },
  
  { name: 'FRCCP28x22 MD10', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Catchpit Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 95, description: 'FRC Catachpit\nClear Opening : 525 x 375 mm\nCover Size : 600 x 450 mm\nCover Thickness : 70 mm\nFrame Size : 700 x 550 mm\nFrame Thickness : 125 mm\nCapacity : MD 10' },
  
  { name: 'FRCCP30x30 LD5', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Catchpit Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 110, description: 'FRC Catachpit\nClear Opening : 490 x 490 mm\nCover Size : 600 x 600 mm\nCover Thickness : 50 mm\nFrame Size : 750 x 750 mm\nFrame Thickness : 100 mm\nCapacity : LD 5' },
  { name: 'FRCCP30x30 MD10', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Catchpit Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 144, description: 'FRC Catachpit\nClear Opening : 450 x 450 mm\nCover Size : 600 x 600 mm\nCover Thickness : 75 mm\nFrame Size : 750 x 750 mm\nFrame Thickness : 125 mm\nCapacity : MD 10' },
  { name: 'FRCCP30x30 HD20', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Catchpit Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 187, description: 'FRC Catachpit\nClear Opening : 450 x 450 mm\nCover Size : 600 x 600 mm\nCover Thickness : 75 mm\nFrame Size : 750 x 750 mm\nFrame Thickness : 150 mm\nCapacity : HD 20' },
  
  { name: 'FRCCP32x26 LD5', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Catchpit Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 102, description: 'FRC Catachpit\nClear Opening : 600 x 450 mm\nCover Size : 700 x 550 mm\nCover Thickness : 50 mm\nFrame Size : 800 x 650 mm\nFrame Thickness : 100 mm\nCapacity : LD 5' },
  { name: 'FRCCP32x26 MD10', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Catchpit Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 124, description: 'FRC Catachpit\nClear Opening : 600 x 450 mm\nCover Size : 700 x 550 mm\nCover Thickness : 70 mm\nFrame Size : 800 x 650 mm\nFrame Thickness : 120 mm\nCapacity : MD 10' },
  { name: 'FRCCP32x26 HD20', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Catchpit Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 159, description: 'FRC Catachpit\nClear Opening : 600 x 450 mm\nCover Size : 700 x 550 mm\nCover Thickness : 90 mm\nFrame Size : 800 x 650 mm\nFrame Thickness : 165 mm\nCapacity : HD 20' },
  
  { name: 'FRCCP32.5x32.5 LD5', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Catchpit Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 110, description: 'FRC Catachpit\nClear Opening : 600 X 600 mm\nCover Size : 700 x 700 mm\nCover Thickness : 50 mm\nFrame Size : 812 x 812 mm\nFrame Thickness : 100 mm\nCapacity : LD 5' },
  { name: 'FRCCP32.5x32.5 MD10', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Catchpit Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 177, description: 'FRC Catachpit\nClear Opening : 600 X 600 mm\nCover Size : 700 x 700 mm\nCover Thickness : 70 mm\nFrame Size : 812 x 812 mm\nFrame Thickness : 120 mm\nCapacity : MD 10' },
  
  { name: 'FRCCP36x36 HD20', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Catchpit Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 255, description: 'FRC Catachpit\nClear Opening : 600 X 600 mm\nCover Size : 750 x 750 mm\nCover Thickness : 90 mm\nFrame Size : 900 x 900 mm\nFrame Thickness : 165 mm\nCapacity : HD 20' },
  { name: 'FRCCP36x36 EHD35', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Catchpit Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 276, description: 'FRC Catachpit\nClear Opening : 600 X 600 mm\nCover Size : 750 x 750 mm\nCover Thickness : 100 mm\nFrame Size : 900 x 900 mm\nFrame Thickness : 175 mm\nCapacity : EHD 35' },
  
  { name: 'FRCCP42x42 MD10', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Catchpit Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 282, description: 'FRC Catachpit\nClear Opening : 750 x 750 mm\nCover Size : 900 x 900 mm\nCover Thickness : 75 mm\nFrame Size : 1050 x 1050 mm\nFrame Thickness : 125 mm\nCapacity : MD 10' },
  { name: 'FRCCP42x42 HD20', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Catchpit Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 334, description: 'FRC Catachpit\nClear Opening : 750 x 750 mm\nCover Size : 900 x 900 mm\nCover Thickness : 100 mm\nFrame Size : 1050 x 1050 mm\nFrame Thickness : 175 mm\nCapacity : HD 20' },
  { name: 'FRCCP42x42 EHD35', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Catchpit Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 344, description: 'FRC Catachpit\nClear Opening : 750 x 750 mm\nCover Size : 900 x 900 mm\nCover Thickness : 100 mm\nFrame Size : 1050 x 1050 mm\nFrame Thickness : 175 mm\nCapacity : EHD 35' },
  
  { name: 'FRCCP44x34 MD10', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Catchpit Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 201, description: 'FRC Catachpit\nClear Opening : 900 x 600 mm\nCover Size : 1000 x 700 mm\nCover Thickness : 70 mm\nFrame Size : 1100 x 850 mm\nFrame Thickness : 120 mm\nCapacity : MD 10' },
  { name: 'FRCCP44x34 HD20', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Catchpit Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 303, description: 'FRC Catachpit\nClear Opening : 900 x 600 mm\nCover Size : 1000 x 700 mm\nCover Thickness : 90 mm\nFrame Size : 1100 x 850 mm\nFrame Thickness : 165 mm\nCapacity : HD 20' },
  
  { name: 'FRCCP48x48 HD20', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Catchpit Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 476, description: 'FRC Catachpit\nClear Opening : 900 x 900 mm\nCover Size : 1050 x 1050 mm\nCover Thickness : 100 mm\nFrame Size : 1200 x 1200 mm\nFrame Thickness : 175 mm\nCapacity : HD 20' },
  { name: 'FRCCP48x48 EHD35', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Catchpit Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 486, description: 'FRC Catachpit\nClear Opening : 900 x 900 mm\nCover Size : 1050 x 1050 mm\nCover Thickness : 100 mm\nFrame Size : 1200 x 1200 mm\nFrame Thickness : 175 mm\nCapacity : EHD 35' },
  
  { name: 'FRCCP60x48 HD20', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Catchpit Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 609, description: 'FRC Catachpit\nClear Opening : 1200 x 900 mm\nCover Size : 1300 x 1000 mm\nCover Thickness : 100 mm\nFrame Size : 1500 x 1200 mm\nFrame Thickness : 175 mm\nCapacity : HD 20' },
  { name: 'FRCCP60x48 EHD35', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Catchpit Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 609, description: 'FRC Catachpit\nClear Opening : 1200 x 900 mm\nCover Size : 1300 x 1000 mm\nCover Thickness : 100 mm\nFrame Size : 1500 x 1200 mm\nFrame Thickness : 175 mm\nCapacity : EHD 35' },
];

// Trading Products - Others
const otherProducts: ProductSeedData[] = [
  // GT Covers
  { name: 'FRCGT ONLY CO12x12', brand: 'HIMALAYA', category: 'OTHERS', subCategory: 'GT Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 2, description: 'FRC GT COVER - ONLY COVER\nCover Size : 8.5 mm dia' },
  { name: 'FRCGT FC 12x12', brand: 'HIMALAYA', category: 'OTHERS', subCategory: 'GT Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 9, description: 'FRC GT COVER \nCover Size : 8.5 mm dia\nFrame Size : 12 x 12' },
  
  // Trench Covers
  { name: 'FRCTSOC 24 x 12x2', brand: 'HIMALAYA', category: 'OTHERS', subCategory: 'Trench Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 23, description: 'FRC Trench Cover\n600 x 300 x 50 mm' },
  { name: 'FRCTSOC 28 x 12x2', brand: 'HIMALAYA', category: 'OTHERS', subCategory: 'Trench Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 27, description: 'FRC Trench Cover\n700 x 300 x 50 mm' },
  { name: 'FRCTSOC 24 x 18x2', brand: 'HIMALAYA', category: 'OTHERS', subCategory: 'Trench Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 32, description: 'FRC Trench Cover\n600 x 450 x 50 mm' },
  { name: 'FRCTSOC 24 x 24x2R', brand: 'HIMALAYA', category: 'OTHERS', subCategory: 'Trench Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 45, description: 'FRC Trench Cover\n600 x 600 x 50 mm' },
  { name: 'FRCTSOC 36 x 18x2', brand: 'HIMALAYA', category: 'OTHERS', subCategory: 'Trench Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 100, description: 'FRC Trench Cover\n900 x 450 x 100 mm' },
  { name: 'FRCTSOC 36 x 24x2R', brand: 'HIMALAYA', category: 'OTHERS', subCategory: 'Trench Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 74, description: 'FRC Trench Cover\n900 x 600 x 50 mm' },
  { name: 'FRCTSOC 36 x 24x4R', brand: 'HIMALAYA', category: 'OTHERS', subCategory: 'Trench Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 148, description: 'FRC Trench Cover\n900 x 600 x 100 mm' },
  
  // Perforated Trench Covers
  { name: 'FRCTPEC 24 x 12x2', brand: 'HIMALAYA', category: 'OTHERS', subCategory: 'Perforated Trench Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 23, description: 'FRC Perforated Trench Cover\n600 x 300 x 50 mm' },
  { name: 'FRCTPEC 24 x 16x2', brand: 'HIMALAYA', category: 'OTHERS', subCategory: 'Perforated Trench Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 33, description: 'FRC Perforated Trench Cover\n600 x 400 x 50 mm' },
  { name: 'FRCTPEC 24 x 18x2', brand: 'HIMALAYA', category: 'OTHERS', subCategory: 'Perforated Trench Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 32, description: 'FRC Perforated Trench Cover\n600 x 450 x 50 mm' },
  { name: 'FRCTPEC 30 x 24x2', brand: 'HIMALAYA', category: 'OTHERS', subCategory: 'Perforated Trench Cover', hsnCode: '68109990', unit: 'SET', unitPrice: 0, weight: 56, description: 'FRC Perforated Trench Cover\n750 x 600 x 50 mm' },
];

// 136 Store Hardware & Raw Material Items
const hardwareItemsRaw = [
  { srNo: 1, itemName: 'WATER PAPER 60', code: 'HCPPL001', unit: 'ROLL', balance: 1, category: 'Hardware', minStock: 20 },
  { srNo: 2, itemName: 'WATER PAPER 80', code: 'HCPPL002', unit: 'PCS', balance: 1890, category: 'Hardware', minStock: 20 },
  { srNo: 3, itemName: 'WATER PAPER 120', code: 'HCPPL003', unit: 'PCS', balance: 32, category: 'Hardware', minStock: 20 },
  { srNo: 4, itemName: 'WATER PAPER 150', code: 'HCPPL004', unit: 'PCS', balance: 850, category: 'Hardware', minStock: 20 },
  { srNo: 5, itemName: 'WATER PAPER 220', code: 'HCPPL005', unit: 'PCS', balance: 145, category: 'Hardware', minStock: 20 },
  { srNo: 6, itemName: 'WATER PAPER 320', code: 'HCPPL006', unit: 'PCS', balance: 450, category: 'Hardware', minStock: 20 },
  { srNo: 7, itemName: 'WATER PAPER 400', code: 'HCPPL007', unit: 'PCS', balance: 1572, category: 'Hardware', minStock: 20 },
  { srNo: 8, itemName: 'WATER PAPER 600', code: 'HCPPL008', unit: 'PCS', balance: 114, category: 'Hardware', minStock: 20 },
  { srNo: 9, itemName: 'WATER PAPER 800', code: 'HCPPL009', unit: 'PCS', balance: 200, category: 'Hardware', minStock: 20 },
  { srNo: 10, itemName: 'WATER PAPER 1000', code: 'HCPPL010', unit: 'PCS', balance: 707, category: 'Hardware', minStock: 20 },
  { srNo: 11, itemName: 'WATER PAPER 1200', code: 'HCPPL011', unit: 'PCS', balance: 0, category: 'Hardware', minStock: 20 },
  { srNo: 12, itemName: 'WATER PAPER 1500', code: 'HCPPL012', unit: 'PCS', balance: 100, category: 'Hardware', minStock: 20 },
  { srNo: 13, itemName: 'BLUE PIGMENT', code: 'HCPPL013', unit: 'KG', balance: 52, category: 'Raw Material', minStock: 2 },
  { srNo: 14, itemName: 'LIGHT GREY PIGMENT', code: 'HCPPL014', unit: 'KG', balance: 123, category: 'Raw Material', minStock: 10 },
  { srNo: 15, itemName: 'RED PIGMENT', code: 'HCPPL015', unit: 'KG', balance: 59, category: 'Raw Material', minStock: 10 },
  { srNo: 16, itemName: 'BLACK PIGMENT', code: 'HCPPL016', unit: 'KG', balance: 200, category: 'Raw Material', minStock: 25 },
  { srNo: 17, itemName: 'WHITE PIGMENT', code: 'HCPPL017', unit: 'KG', balance: 18, category: 'Raw Material', minStock: 2 },
  { srNo: 18, itemName: 'BENJO WAX POLISH', code: 'HCPPL018', unit: 'KG', balance: 20, category: 'Raw Material', minStock: 5 },
  { srNo: 19, itemName: 'WHITE WAX POLISH', code: 'HCPPL019', unit: 'KG', balance: 45, category: 'Raw Material', minStock: 40 },
  { srNo: 20, itemName: 'BRUSH 25 MM', code: 'HCPPL020', unit: 'PCS', balance: 20, category: 'Hardware', minStock: 5 },
  { srNo: 21, itemName: 'BRUSH 38 MM', code: 'HCPPL021', unit: 'PCS', balance: 78, category: 'Hardware', minStock: 5 },
  { srNo: 22, itemName: 'BRUSH 50 MM', code: 'HCPPL022', unit: 'PCS', balance: 227, category: 'Hardware', minStock: 5 },
  { srNo: 23, itemName: 'BRUSH 75 MM', code: 'HCPPL023', unit: 'PCS', balance: 9, category: 'Hardware', minStock: 5 },
  { srNo: 24, itemName: 'BRUSH 100 MM', code: 'HCPPL024', unit: 'PCS', balance: 20, category: 'Hardware', minStock: 5 },
  { srNo: 25, itemName: 'FIBER CUTTING DISH (DIAMOND CUTTER)', code: 'HCPPL025', unit: 'PCS', balance: 0, category: 'Hardware', minStock: 20 },
  { srNo: 26, itemName: 'GC WHEEL', code: 'HCPPL026', unit: 'PCS', balance: 0, category: 'Hardware', minStock: 20 },
  { srNo: 27, itemName: 'BEAR DIS 36', code: 'HCPPL027', unit: 'PCS', balance: 20, category: 'Hardware', minStock: 10 },
  { srNo: 28, itemName: 'BEAR DIS 60', code: 'HCPPL028', unit: 'PCS', balance: 200, category: 'Hardware', minStock: 10 },
  { srNo: 29, itemName: 'BEAR DIS 80', code: 'HCPPL029', unit: 'PCS', balance: 100, category: 'Hardware', minStock: 10 },
  { srNo: 30, itemName: 'BEAR DIS 120', code: 'HCPPL030', unit: 'PCS', balance: 50, category: 'Hardware', minStock: 10 },
  { srNo: 31, itemName: 'WELCOR PAPER 80', code: 'HCPPL031', unit: 'PCS', balance: 0, category: 'Hardware', minStock: 5 },
  { srNo: 32, itemName: 'WELCOR PAPER 120', code: 'HCPPL032', unit: 'PCS', balance: 27, category: 'Hardware', minStock: 5 },
  { srNo: 33, itemName: 'WELCOR PAPER 180', code: 'HCPPL033', unit: 'PCS', balance: 0, category: 'Hardware', minStock: 5 },
  { srNo: 34, itemName: 'WELCOR PAPER 220', code: 'HCPPL034', unit: 'PCS', balance: 51, category: 'Hardware', minStock: 5 },
  { srNo: 35, itemName: 'WELCOR PAPER 320', code: 'HCPPL035', unit: 'PCS', balance: 9, category: 'Hardware', minStock: 5 },
  { srNo: 36, itemName: 'WELCOR PAPER 400', code: 'HCPPL036', unit: 'PCS', balance: 38, category: 'Hardware', minStock: 5 },
  { srNo: 37, itemName: 'WELCOR PAPER 600', code: 'HCPPL037', unit: 'PCS', balance: 0, category: 'Hardware', minStock: 5 },
  { srNo: 38, itemName: 'IRON CUTTING DISK', code: 'HCPPL038', unit: 'PCS', balance: 271, category: 'Hardware', minStock: 10 },
  { srNo: 39, itemName: 'SANDING MACHINE', code: 'HCPPL039', unit: 'PCS', balance: 0, category: 'Electric', minStock: 1 },
  { srNo: 40, itemName: 'FEVICKIK', code: 'HCPPL040', unit: 'PCS', balance: 38, category: 'Hardware', minStock: 10 },
  { srNo: 41, itemName: 'GRIDER WASHER (LOOK NUT)', code: 'HCPPL041', unit: 'PCS', balance: 58, category: 'Hardware', minStock: 10 },
  { srNo: 42, itemName: 'C CLAMP 4 INCH', code: 'HCPPL042', unit: 'PCS', balance: 2, category: 'Hardware', minStock: 2 },
  { srNo: 43, itemName: 'C CLAMP 6 INCH', code: 'HCPPL043', unit: 'PCS', balance: 6, category: 'Hardware', minStock: 2 },
  { srNo: 44, itemName: 'HAKSAW BLADE', code: 'HCPPL044', unit: 'PCS', balance: 461, category: 'Hardware', minStock: 20 },
  { srNo: 45, itemName: 'GEAR OIL', code: 'HCPPL045', unit: 'LTR', balance: 2, category: 'Raw Material', minStock: 1 },
  { srNo: 46, itemName: 'PLASTIC HAMMER', code: 'HCPPL046', unit: 'PCS', balance: 3, category: 'Hardware', minStock: 1 },
  { srNo: 47, itemName: 'HAMMER 1.5', code: 'HCPPL047', unit: 'PCS', balance: 2, category: 'Hardware', minStock: 1 },
  { srNo: 48, itemName: 'DRILL BIT 3MM', code: 'HCPPL048', unit: 'PCS', balance: 24, category: 'Hardware', minStock: 5 },
  { srNo: 49, itemName: 'DRILL BIT 4MM', code: 'HCPPL049', unit: 'PCS', balance: 10, category: 'Hardware', minStock: 5 },
  { srNo: 50, itemName: 'DRILL BIT 6MM', code: 'HCPPL050', unit: 'PCS', balance: 6, category: 'Hardware', minStock: 5 },
  { srNo: 51, itemName: 'DRILL BIT 210*6MM', code: 'HCPPL051', unit: 'PCS', balance: 28, category: 'Hardware', minStock: 5 },
  { srNo: 52, itemName: 'DRILL BIT 8MM', code: 'HCPPL052', unit: 'PCS', balance: 27, category: 'Hardware', minStock: 5 },
  { srNo: 53, itemName: 'DRILL BIT 10MM', code: 'HCPPL053', unit: 'PCS', balance: 12, category: 'Hardware', minStock: 5 },
  { srNo: 54, itemName: 'DRILL BIT 12MM', code: 'HCPPL054', unit: 'PCS', balance: 26, category: 'Hardware', minStock: 5 },
  { srNo: 55, itemName: 'THAPPI 6MM', code: 'HCPPL055', unit: 'PCS', balance: 17, category: 'Hardware', minStock: 5 },
  { srNo: 56, itemName: 'THAPPI 8MM', code: 'HCPPL056', unit: 'PCS', balance: 59, category: 'Hardware', minStock: 5 },
  { srNo: 57, itemName: 'THAPPI 10MM', code: 'HCPPL057', unit: 'PCS', balance: 45, category: 'Hardware', minStock: 5 },
  { srNo: 58, itemName: 'THAPPI 12MM', code: 'HCPPL058', unit: 'PCS', balance: 41, category: 'Hardware', minStock: 5 },
  { srNo: 59, itemName: 'THAPPI SMALL', code: 'HCPPL059', unit: 'PCS', balance: 89, category: 'Hardware', minStock: 5 },
  { srNo: 60, itemName: 'FLAT CHISEL 25', code: 'HCPPL060', unit: 'PCS', balance: 37, category: 'Hardware', minStock: 5 },
  { srNo: 61, itemName: 'FLAT CHISEL 32', code: 'HCPPL061', unit: 'PCS', balance: 39, category: 'Hardware', minStock: 5 },
  { srNo: 62, itemName: 'FLAT CHISEL 40', code: 'HCPPL062', unit: 'PCS', balance: 48, category: 'Hardware', minStock: 5 },
  { srNo: 63, itemName: 'FLAT CHISEL 50', code: 'HCPPL063', unit: 'PCS', balance: 57, category: 'Hardware', minStock: 5 },
  { srNo: 64, itemName: 'PVC FLAT CHISEL HANDLE', code: 'HCPPL064', unit: 'PCS', balance: 27, category: 'Hardware', minStock: 5 },
  { srNo: 65, itemName: 'SCREW DRIVER 18 INCH', code: 'HCPPL065', unit: 'PCS', balance: 17, category: 'Hardware', minStock: 2 },
  { srNo: 66, itemName: 'SCREW DRIVER SMALL REGULAR', code: 'HCPPL066', unit: 'PCS', balance: 3, category: 'Hardware', minStock: 2 },
  { srNo: 67, itemName: 'A-11 MOUNTAIN WHEEL (STONE BIT)', code: 'HCPPL067', unit: 'PKT', balance: 5, category: 'Hardware', minStock: 1 },
  { srNo: 68, itemName: 'STERER 8MM', code: 'HCPPL068', unit: 'PCS', balance: 1, category: 'Hardware', minStock: 2 },
  { srNo: 69, itemName: 'STERER 12MM', code: 'HCPPL069', unit: 'PCS', balance: 12, category: 'Hardware', minStock: 2 },
  { srNo: 70, itemName: 'PILERS (PAKKD)', code: 'HCPPL070', unit: 'PCS', balance: 2, category: 'Hardware', minStock: 1 },
  { srNo: 71, itemName: 'FILE (ROUND, FLAT, THANDER)', code: 'HCPPL071', unit: 'PCS', balance: 1, category: 'Hardware', minStock: 1 },
  { srNo: 72, itemName: 'PERMENENT MARKER', code: 'HCPPL072', unit: 'PCS', balance: 59, category: 'Hardware', minStock: 10 },
  { srNo: 73, itemName: 'BOARD MARKER', code: 'HCPPL073', unit: 'PCS', balance: 20, category: 'Hardware', minStock: 9 },
  { srNo: 74, itemName: 'PENCIL', code: 'HCPPL074', unit: 'PCS', balance: 9, category: 'Hardware', minStock: 1 },
  { srNo: 75, itemName: 'PEN', code: 'HCPPL075', unit: 'PCS', balance: 0, category: 'Hardware', minStock: 1 },
  { srNo: 76, itemName: 'MASKING TAPE', code: 'HCPPL076', unit: 'PKT', balance: 48, category: 'Hardware', minStock: 1 },
  { srNo: 77, itemName: 'STICH FLIM (RAPING ROLL)', code: 'HCPPL077', unit: 'ROLL', balance: 36, category: 'Hardware', minStock: 1 },
  { srNo: 78, itemName: 'AUTO FINCH GREY COLOUR', code: 'HCPPL078', unit: 'CAN', balance: 12, category: 'Hardware', minStock: 1 },
  { srNo: 79, itemName: 'AUTO FINCH BLACK COLOUR', code: 'HCPPL079', unit: 'CAN', balance: 7, category: 'Hardware', minStock: 1 },
  { srNo: 80, itemName: 'AUTO FINCH BLUE COLOUR', code: 'HCPPL080', unit: 'CAN', balance: 2, category: 'Hardware', minStock: 1 },
  { srNo: 81, itemName: 'SCALE 18 INCH', code: 'HCPPL081', unit: 'PCS', balance: 3, category: 'Hardware', minStock: 1 },
  { srNo: 82, itemName: 'SCALE 24 INCH', code: 'HCPPL082', unit: 'PCS', balance: 4, category: 'Hardware', minStock: 1 },
  { srNo: 83, itemName: 'SCALE 40 INCH', code: 'HCPPL083', unit: 'PCS', balance: 2, category: 'Hardware', minStock: 1 },
  { srNo: 84, itemName: 'MEASURING TAPE 3M', code: 'HCPPL084', unit: 'PCS', balance: 3, category: 'Hardware', minStock: 2 },
  { srNo: 85, itemName: 'MEASURING TAPE 5M', code: 'HCPPL085', unit: 'PCS', balance: 1, category: 'Hardware', minStock: 1 },
  { srNo: 86, itemName: 'BUCKET 5', code: 'HCPPL086', unit: 'PCS', balance: 24, category: 'Hardware', minStock: 5 },
  { srNo: 87, itemName: 'BUCKET 10', code: 'HCPPL087', unit: 'PCS', balance: 59, category: 'Hardware', minStock: 5 },
  { srNo: 88, itemName: 'BUCKET 13', code: 'HCPPL088', unit: 'PCS', balance: 23, category: 'Hardware', minStock: 5 },
  { srNo: 89, itemName: 'BUCKET 20', code: 'HCPPL089', unit: 'PCS', balance: 6, category: 'Hardware', minStock: 5 },
  { srNo: 90, itemName: 'GHAMELA 8', code: 'HCPPL090', unit: 'PCS', balance: 27, category: 'Hardware', minStock: 3 },
  { srNo: 91, itemName: 'GHAMELA 10', code: 'HCPPL091', unit: 'PCS', balance: 23, category: 'Hardware', minStock: 3 },
  { srNo: 92, itemName: 'GHAMELA 12', code: 'HCPPL092', unit: 'PCS', balance: 0, category: 'Hardware', minStock: 3 },
  { srNo: 93, itemName: 'GHAMELA 14', code: 'HCPPL093', unit: 'PCS', balance: 61, category: 'Hardware', minStock: 3 },
  { srNo: 94, itemName: 'GHAMELA 19', code: 'HCPPL094', unit: 'PCS', balance: 51, category: 'Hardware', minStock: 3 },
  { srNo: 95, itemName: 'MUGGA', code: 'HCPPL095', unit: 'PCS', balance: 56, category: 'Hardware', minStock: 5 },
  { srNo: 96, itemName: 'WIRE TAPE', code: 'HCPPL096', unit: 'PCS', balance: 60, category: 'Hardware', minStock: 10 },
  { srNo: 97, itemName: 'GRINDER CORBON (6-100)', code: 'HCPPL097', unit: 'PCS', balance: 0, category: 'Hardware', minStock: 10 },
  { srNo: 98, itemName: 'MIXURE CORBON', code: 'HCPPL098', unit: 'PCS', balance: 60, category: 'Hardware', minStock: 10 },
  { srNo: 99, itemName: 'PVA', code: 'HCPPL099', unit: 'LTR', balance: 0, category: 'Raw Material', minStock: 2 },
  { srNo: 100, itemName: 'CLEAR RESIN', code: 'HCPPL100', unit: 'BARREL', balance: 59, category: 'Raw Material', minStock: 5 },
  { srNo: 101, itemName: 'ISO RESIN', code: 'HCPPL101', unit: 'BARREL', balance: 46, category: 'Raw Material', minStock: 2 },
  { srNo: 102, itemName: 'ISO GEL-COAT', code: 'HCPPL102', unit: 'BARREL', balance: 0, category: 'Raw Material', minStock: 0 },
  { srNo: 103, itemName: 'SURFACE TISSUE MAT (30GSM)', code: 'HCPPL103', unit: 'ROLL', balance: 0, category: 'Raw Material', minStock: 1 },
  { srNo: 104, itemName: 'FGM MAT 225 GSM', code: 'HCPPL104', unit: 'ROLL', balance: 37, category: 'Raw Material', minStock: 1 },
  { srNo: 105, itemName: 'FGM MAT 450 GSM', code: 'HCPPL105', unit: 'ROLL', balance: 0, category: 'Raw Material', minStock: 5 },
  { srNo: 106, itemName: 'FGM MATT 1230 GSM', code: 'HCPPL106', unit: 'ROLL', balance: 30, category: 'Raw Material', minStock: 5 },
  { srNo: 107, itemName: 'WOVEN ROVING 610 GSM', code: 'HCPPL107', unit: 'ROLL', balance: 57, category: 'Raw Material', minStock: 5 },
  { srNo: 108, itemName: 'MEKP (CATALYST)', code: 'HCPPL108', unit: 'CAN', balance: 28, category: 'Raw Material', minStock: 1 },
  { srNo: 109, itemName: 'COBALT OCTOATE', code: 'HCPPL109', unit: 'CAN', balance: 29, category: 'Raw Material', minStock: 1 },
  { srNo: 110, itemName: 'THINNER', code: 'HCPPL110', unit: 'LTR', balance: 0, category: 'Raw Material', minStock: 50 },
  { srNo: 111, itemName: 'QUARTZ BIG', code: 'HCPPL111', unit: 'BAG', balance: 0, category: 'Raw Material', minStock: 10 },
  { srNo: 112, itemName: 'QUARTZ MEDIUM', code: 'HCPPL112', unit: 'BAG', balance: 0, category: 'Raw Material', minStock: 10 },
  { srNo: 113, itemName: 'QUARTZ SMALL', code: 'HCPPL113', unit: 'BAG', balance: 0, category: 'Raw Material', minStock: 10 },
  { srNo: 114, itemName: 'DOLOMITE POWDER', code: 'HCPPL114', unit: 'BAG', balance: 420, category: 'Raw Material', minStock: 10 },
  { srNo: 115, itemName: 'GEL COAT POWDER', code: 'HCPPL115', unit: 'BAG', balance: 0, category: 'Raw Material', minStock: 0 },
  { srNo: 116, itemName: 'ELECTRIC ZIGSAW MACHINE', code: 'HCPPL116', unit: 'PCS', balance: 0, category: 'Electric', minStock: 1 },
  { srNo: 117, itemName: 'HAND MIXTURE MACHINE', code: 'HCPPL117', unit: 'PCS', balance: 0, category: 'Electric', minStock: 1 },
  { srNo: 118, itemName: 'ANGLE GRINDER', code: 'HCPPL118', unit: 'PCS', balance: 0, category: 'Electric', minStock: 2 },
  { srNo: 119, itemName: 'DRILL MACHINE', code: 'HCPPL119', unit: 'PCS', balance: 0, category: 'Electric', minStock: 2 },
  { srNo: 120, itemName: 'BUFING MACHINE', code: 'HCPPL120', unit: 'PCS', balance: 0, category: 'Electric', minStock: 1 },
  { srNo: 121, itemName: 'SANDING MACHINE', code: 'HCPPL121', unit: 'PCS', balance: 0, category: 'Electric', minStock: 1 },
  { srNo: 122, itemName: 'POP (PLASTER OF PARIS)', code: 'HCPPL122', unit: 'BAG', balance: 0, category: 'Hardware', minStock: 2 },
  { srNo: 123, itemName: 'PLY WOOD 4MM', code: 'HCPPL123', unit: 'PCS', balance: 0, category: 'Hardware', minStock: 2 },
  { srNo: 124, itemName: 'PLY WOOD 6MM', code: 'HCPPL124', unit: 'PCS', balance: 0, category: 'Hardware', minStock: 2 },
  { srNo: 125, itemName: 'PLY WOOD 12MM', code: 'HCPPL125', unit: 'PCS', balance: 0, category: 'Hardware', minStock: 2 },
  { srNo: 126, itemName: 'PLY WOOD 18MM', code: 'HCPPL126', unit: 'PCS', balance: 0, category: 'Hardware', minStock: 2 },
  { srNo: 127, itemName: 'ZIGSAW BLADE', code: 'HCPPL127', unit: 'PCS', balance: 98, category: 'Hardware', minStock: 5 },
  { srNo: 128, itemName: 'WASTE CLOTH', code: 'HCPPL128', unit: 'KG', balance: 0, category: 'Hardware', minStock: 5 },
  { srNo: 129, itemName: 'BELCHA (SEWAL)', code: 'HCPPL129', unit: 'PCS', balance: 2, category: 'Hardware', minStock: 1 },
  { srNo: 130, itemName: 'SHARPNER', code: 'HCPPL130', unit: 'PCS', balance: 0, category: 'Hardware', minStock: 2 },
  { srNo: 131, itemName: 'ERASER', code: 'HCPPL131', unit: 'PCS', balance: 0, category: 'Hardware', minStock: 2 },
  { srNo: 132, itemName: 'HYDROLIC OIL', code: 'HCPPL132', unit: 'LTR', balance: 0, category: 'Hardware', minStock: 20 },
  { srNo: 133, itemName: 'GRISH', code: 'HCPPL133', unit: 'KG', balance: 0, category: 'Hardware', minStock: 20 },
  { srNo: 134, itemName: 'WELDING RODE', code: 'HCPPL134', unit: 'PCS', balance: 0, category: 'Hardware', minStock: 1 },
  { srNo: 135, itemName: 'NYLON BLACK PATTY', code: 'HCPPL135', unit: 'PCS', balance: 0, category: 'Hardware', minStock: 1 },
  { srNo: 136, itemName: 'GREY GLOVES', code: 'HCPPL136', unit: 'PCS', balance: 0, category: 'Hardware', minStock: 10 },
];

const hardwareProducts: ProductSeedData[] = hardwareItemsRaw.map(item => ({
  name: item.itemName,
  brand: 'HIMALAYA',
  category: item.category,
  subCategory: item.category,
  sku: item.code,
  unit: item.unit,
  unitPrice: 0,
  minimumStock: item.minStock,
  description: `${item.itemName} (${item.code})`,
}));

// Combine all products (230 seedbackup + 136 hardware = 366 items total)
let allProducts: ProductSeedData[] = [
  ...manufacturingProducts,
  ...coverblockProducts,
  ...rccPipeProducts,
  ...frcSquareRoundProducts,
  ...frcRectangularProducts,
  ...frcSquareFrameProducts,
  ...frcRoundFrameProducts,
  ...frcCatchpitProducts,
  ...otherProducts,
  ...hardwareProducts,
];

// ─── Main ─────────────────────────────────────────────────────────────────────

// ─── 136 Authoritative Raw Inventory Items Master Seed ───────────────────────

const rawInventoryItemsSeed = [
  { srNo: 1, name: "WATER PAPER 60", code: "HCPPL001", unit: "ROLL", balance: 1, category: "Hardware", minStock: 20 },
  { srNo: 2, name: "WATER PAPER 80", code: "HCPPL002", unit: "PCS", balance: 1890, category: "Hardware", minStock: 20 },
  { srNo: 3, name: "WATER PAPER 120", code: "HCPPL003", unit: "PCS", balance: 32, category: "Hardware", minStock: 20 },
  { srNo: 4, name: "WATER PAPER 150", code: "HCPPL004", unit: "PCS", balance: 850, category: "Hardware", minStock: 20 },
  { srNo: 5, name: "WATER PAPER 220", code: "HCPPL005", unit: "PCS", balance: 145, category: "Hardware", minStock: 20 },
  { srNo: 6, name: "WATER PAPER 320", code: "HCPPL006", unit: "PCS", balance: 450, category: "Hardware", minStock: 20 },
  { srNo: 7, name: "WATER PAPER 400", code: "HCPPL007", unit: "PCS", balance: 1572, category: "Hardware", minStock: 20 },
  { srNo: 8, name: "WATER PAPER 600", code: "HCPPL008", unit: "PCS", balance: 114, category: "Hardware", minStock: 20 },
  { srNo: 9, name: "WATER PAPER 800", code: "HCPPL009", unit: "PCS", balance: 200, category: "Hardware", minStock: 20 },
  { srNo: 10, name: "WATER PAPER 1000", code: "HCPPL010", unit: "PCS", balance: 707, category: "Hardware", minStock: 20 },
  { srNo: 11, name: "WATER PAPER 1200", code: "HCPPL011", unit: "PCS", balance: 0, category: "Hardware", minStock: 20 },
  { srNo: 12, name: "WATER PAPER 1500", code: "HCPPL012", unit: "PCS", balance: 100, category: "Hardware", minStock: 20 },
  { srNo: 13, name: "BLUE PIGMENT", code: "HCPPL013", unit: "KG", balance: 52, category: "Raw Material", minStock: 2 },
  { srNo: 14, name: "LIGHT GREY PIGMENT", code: "HCPPL014", unit: "KG", balance: 123, category: "Raw Material", minStock: 10 },
  { srNo: 15, name: "RED PIGMENT", code: "HCPPL015", unit: "KG", balance: 59, category: "Raw Material", minStock: 10 },
  { srNo: 16, name: "BLACK PIGMENT", code: "HCPPL016", unit: "KG", balance: 200, category: "Raw Material", minStock: 25 },
  { srNo: 17, name: "WHITE PIGMENT", code: "HCPPL017", unit: "KG", balance: 18, category: "Raw Material", minStock: 2 },
  { srNo: 18, name: "BENJO WAX POLISH", code: "HCPPL018", unit: "KG", balance: 20, category: "Raw Material", minStock: 5 },
  { srNo: 19, name: "WHITE WAX POLISH", code: "HCPPL019", unit: "KG", balance: 45, category: "Raw Material", minStock: 40 },
  { srNo: 20, name: "BRUSH 25 MM", code: "HCPPL020", unit: "PCS", balance: 20, category: "Hardware", minStock: 5 },
  { srNo: 21, name: "BRUSH 38 MM", code: "HCPPL021", unit: "PCS", balance: 78, category: "Hardware", minStock: 5 },
  { srNo: 22, name: "BRUSH 50 MM", code: "HCPPL022", unit: "PCS", balance: 227, category: "Hardware", minStock: 5 },
  { srNo: 23, name: "BRUSH 75 MM", code: "HCPPL023", unit: "PCS", balance: 9, category: "Hardware", minStock: 5 },
  { srNo: 24, name: "BRUSH 100 MM", code: "HCPPL024", unit: "PCS", balance: 20, category: "Hardware", minStock: 5 },
  { srNo: 25, name: "FIBER CUTTING DISH (DIAMOND CUTTER)", code: "HCPPL025", unit: "PCS", balance: 0, category: "Hardware", minStock: 20 },
  { srNo: 26, name: "GC WHEEL", code: "HCPPL026", unit: "PCS", balance: 0, category: "Hardware", minStock: 20 },
  { srNo: 27, name: "BEAR DIS 36", code: "HCPPL027", unit: "PCS", balance: 20, category: "Hardware", minStock: 10 },
  { srNo: 28, name: "BEAR DIS 60", code: "HCPPL028", unit: "PCS", balance: 200, category: "Hardware", minStock: 10 },
  { srNo: 29, name: "BEAR DIS 80", code: "HCPPL029", unit: "PCS", balance: 100, category: "Hardware", minStock: 10 },
  { srNo: 30, name: "BEAR DIS 120", code: "HCPPL030", unit: "PCS", balance: 50, category: "Hardware", minStock: 10 },
  { srNo: 31, name: "WELCOR PAPER 80", code: "HCPPL031", unit: "PCS", balance: 0, category: "Hardware", minStock: 5 },
  { srNo: 32, name: "WELCOR PAPER 120", code: "HCPPL032", unit: "PCS", balance: 27, category: "Hardware", minStock: 5 },
  { srNo: 33, name: "WELCOR PAPER 180", code: "HCPPL033", unit: "PCS", balance: 0, category: "Hardware", minStock: 5 },
  { srNo: 34, name: "WELCOR PAPER 220", code: "HCPPL034", unit: "PCS", balance: 51, category: "Hardware", minStock: 5 },
  { srNo: 35, name: "WELCOR PAPER 320", code: "HCPPL035", unit: "PCS", balance: 9, category: "Hardware", minStock: 5 },
  { srNo: 36, name: "WELCOR PAPER 400", code: "HCPPL036", unit: "PCS", balance: 38, category: "Hardware", minStock: 5 },
  { srNo: 37, name: "WELCOR PAPER 600", code: "HCPPL037", unit: "PCS", balance: 0, category: "Hardware", minStock: 5 },
  { srNo: 38, name: "IRON CUTTING DISK", code: "HCPPL038", unit: "PCS", balance: 271, category: "Hardware", minStock: 10 },
  { srNo: 39, name: "SANDING MACHINE", code: "HCPPL039", unit: "PCS", balance: 0, category: "Electric", minStock: 1 },
  { srNo: 40, name: "FEVICKIK", code: "HCPPL040", unit: "PCS", balance: 38, category: "Hardware", minStock: 10 },
  { srNo: 41, name: "GRIDER WASHER (LOOK NUT)", code: "HCPPL041", unit: "PCS", balance: 58, category: "Hardware", minStock: 10 },
  { srNo: 42, name: "C CLAMP 4 INCH", code: "HCPPL042", unit: "PCS", balance: 2, category: "Hardware", minStock: 2 },
  { srNo: 43, name: "C CLAMP 6 INCH", code: "HCPPL043", unit: "PCS", balance: 6, category: "Hardware", minStock: 2 },
  { srNo: 44, name: "HAKSAW BLADE", code: "HCPPL044", unit: "PCS", balance: 461, category: "Hardware", minStock: 20 },
  { srNo: 45, name: "GEAR OIL", code: "HCPPL045", unit: "LTR", balance: 2, category: "Raw Material", minStock: 1 },
  { srNo: 46, name: "PLASTIC HAMMER", code: "HCPPL046", unit: "PCS", balance: 3, category: "Hardware", minStock: 1 },
  { srNo: 47, name: "HAMMER 1.5", code: "HCPPL047", unit: "PCS", balance: 2, category: "Hardware", minStock: 1 },
  { srNo: 48, name: "DRILL BIT 3MM", code: "HCPPL048", unit: "PCS", balance: 24, category: "Hardware", minStock: 5 },
  { srNo: 49, name: "DRILL BIT 4MM", code: "HCPPL049", unit: "PCS", balance: 10, category: "Hardware", minStock: 5 },
  { srNo: 50, name: "DRILL BIT 6MM", code: "HCPPL050", unit: "PCS", balance: 6, category: "Hardware", minStock: 5 },
  { srNo: 51, name: "DRILL BIT 210*6MM", code: "HCPPL051", unit: "PCS", balance: 28, category: "Hardware", minStock: 5 },
  { srNo: 52, name: "DRILL BIT 8MM", code: "HCPPL052", unit: "PCS", balance: 27, category: "Hardware", minStock: 5 },
  { srNo: 53, name: "DRILL BIT 10MM", code: "HCPPL053", unit: "PCS", balance: 12, category: "Hardware", minStock: 5 },
  { srNo: 54, name: "DRILL BIT 12MM", code: "HCPPL054", unit: "PCS", balance: 26, category: "Hardware", minStock: 5 },
  { srNo: 55, name: "THAPPI 6MM", code: "HCPPL055", unit: "PCS", balance: 17, category: "Hardware", minStock: 5 },
  { srNo: 56, name: "THAPPI 8MM", code: "HCPPL056", unit: "PCS", balance: 59, category: "Hardware", minStock: 5 },
  { srNo: 57, name: "THAPPI 10MM", code: "HCPPL057", unit: "PCS", balance: 45, category: "Hardware", minStock: 5 },
  { srNo: 58, name: "THAPPI 12MM", code: "HCPPL058", unit: "PCS", balance: 41, category: "Hardware", minStock: 5 },
  { srNo: 59, name: "THAPPI SMALL", code: "HCPPL059", unit: "PCS", balance: 89, category: "Hardware", minStock: 5 },
  { srNo: 60, name: "FLAT CHISEL 25", code: "HCPPL060", unit: "PCS", balance: 37, category: "Hardware", minStock: 5 },
  { srNo: 61, name: "FLAT CHISEL 32", code: "HCPPL061", unit: "PCS", balance: 39, category: "Hardware", minStock: 5 },
  { srNo: 62, name: "FLAT CHISEL 40", code: "HCPPL062", unit: "PCS", balance: 48, category: "Hardware", minStock: 5 },
  { srNo: 63, name: "FLAT CHISEL 50", code: "HCPPL063", unit: "PCS", balance: 57, category: "Hardware", minStock: 5 },
  { srNo: 64, name: "PVC FLAT CHISEL HANDLE", code: "HCPPL064", unit: "PCS", balance: 27, category: "Hardware", minStock: 5 },
  { srNo: 65, name: "SCREW DRIVER 18 INCH", code: "HCPPL065", unit: "PCS", balance: 17, category: "Hardware", minStock: 2 },
  { srNo: 66, name: "SCREW DRIVER SMALL REGULAR", code: "HCPPL066", unit: "PCS", balance: 3, category: "Hardware", minStock: 2 },
  { srNo: 67, name: "A-11 MOUNTAIN WHEEL (STONE BIT)", code: "HCPPL067", unit: "PKT", balance: 5, category: "Hardware", minStock: 1 },
  { srNo: 68, name: "STERER 8MM", code: "HCPPL068", unit: "PCS", balance: 1, category: "Hardware", minStock: 2 },
  { srNo: 69, name: "STERER 12MM", code: "HCPPL069", unit: "PCS", balance: 12, category: "Hardware", minStock: 2 },
  { srNo: 70, name: "PILERS (PAKKD)", code: "HCPPL070", unit: "PCS", balance: 2, category: "Hardware", minStock: 1 },
  { srNo: 71, name: "FILE (ROUND, FLAT, THANDER)", code: "HCPPL071", unit: "PCS", balance: 1, category: "Hardware", minStock: 1 },
  { srNo: 72, name: "PERMENENT MARKER", code: "HCPPL072", unit: "PCS", balance: 59, category: "Hardware", minStock: 10 },
  { srNo: 73, name: "BOARD MARKER", code: "HCPPL073", unit: "PCS", balance: 20, category: "Hardware", minStock: 9 },
  { srNo: 74, name: "PENCIL", code: "HCPPL074", unit: "PCS", balance: 9, category: "Hardware", minStock: 1 },
  { srNo: 75, name: "PEN", code: "HCPPL075", unit: "PCS", balance: 0, category: "Hardware", minStock: 1 },
  { srNo: 76, name: "MASKING TAPE", code: "HCPPL076", unit: "PKT", balance: 48, category: "Hardware", minStock: 1 },
  { srNo: 77, name: "STICH FLIM (RAPING ROLL)", code: "HCPPL077", unit: "ROLL", balance: 36, category: "Hardware", minStock: 1 },
  { srNo: 78, name: "AUTO FINCH GREY COLOUR", code: "HCPPL078", unit: "CAN", balance: 12, category: "Hardware", minStock: 1 },
  { srNo: 79, name: "AUTO FINCH BLACK COLOUR", code: "HCPPL079", unit: "CAN", balance: 7, category: "Hardware", minStock: 1 },
  { srNo: 80, name: "AUTO FINCH BLUE COLOUR", code: "HCPPL080", unit: "CAN", balance: 2, category: "Hardware", minStock: 1 },
  { srNo: 81, name: "SCALE 18 INCH", code: "HCPPL081", unit: "PCS", balance: 3, category: "Hardware", minStock: 1 },
  { srNo: 82, name: "SCALE 24 INCH", code: "HCPPL082", unit: "PCS", balance: 4, category: "Hardware", minStock: 1 },
  { srNo: 83, name: "SCALE 40 INCH", code: "HCPPL083", unit: "PCS", balance: 2, category: "Hardware", minStock: 1 },
  { srNo: 84, name: "MEASURING TAPE 3M", code: "HCPPL084", unit: "PCS", balance: 3, category: "Hardware", minStock: 2 },
  { srNo: 85, name: "MEASURING TAPE 5M", code: "HCPPL085", unit: "PCS", balance: 1, category: "Hardware", minStock: 1 },
  { srNo: 86, name: "BUCKET 5", code: "HCPPL086", unit: "PCS", balance: 24, category: "Hardware", minStock: 5 },
  { srNo: 87, name: "BUCKET 10", code: "HCPPL087", unit: "PCS", balance: 59, category: "Hardware", minStock: 5 },
  { srNo: 88, name: "BUCKET 13", code: "HCPPL088", unit: "PCS", balance: 23, category: "Hardware", minStock: 5 },
  { srNo: 89, name: "BUCKET 20", code: "HCPPL089", unit: "PCS", balance: 6, category: "Hardware", minStock: 5 },
  { srNo: 90, name: "GHAMELA 8", code: "HCPPL090", unit: "PCS", balance: 27, category: "Hardware", minStock: 3 },
  { srNo: 91, name: "GHAMELA 10", code: "HCPPL091", unit: "PCS", balance: 23, category: "Hardware", minStock: 3 },
  { srNo: 92, name: "GHAMELA 12", code: "HCPPL092", unit: "PCS", balance: 0, category: "Hardware", minStock: 3 },
  { srNo: 93, name: "GHAMELA 14", code: "HCPPL093", unit: "PCS", balance: 61, category: "Hardware", minStock: 3 },
  { srNo: 94, name: "GHAMELA 19", code: "HCPPL094", unit: "PCS", balance: 51, category: "Hardware", minStock: 3 },
  { srNo: 95, name: "MUGGA", code: "HCPPL095", unit: "PCS", balance: 56, category: "Hardware", minStock: 5 },
  { srNo: 96, name: "WIRE TAPE", code: "HCPPL096", unit: "PCS", balance: 60, category: "Hardware", minStock: 10 },
  { srNo: 97, name: "GRINDER CORBON (6-100)", code: "HCPPL097", unit: "PCS", balance: 0, category: "Hardware", minStock: 10 },
  { srNo: 98, name: "MIXURE CORBON", code: "HCPPL098", unit: "PCS", balance: 60, category: "Hardware", minStock: 10 },
  { srNo: 99, name: "PVA", code: "HCPPL099", unit: "LTR", balance: 0, category: "Raw Material", minStock: 2 },
  { srNo: 100, name: "CLEAR RESIN", code: "HCPPL100", unit: "BARREL", balance: 59, category: "Raw Material", minStock: 5 },
  { srNo: 101, name: "ISO RESIN", code: "HCPPL101", unit: "BARREL", balance: 46, category: "Raw Material", minStock: 2 },
  { srNo: 102, name: "ISO GEL-COAT", code: "HCPPL102", unit: "BARREL", balance: 0, category: "Raw Material", minStock: 0 },
  { srNo: 103, name: "SURFACE TISSUE MAT (30GSM)", code: "HCPPL103", unit: "ROLL", balance: 0, category: "Raw Material", minStock: 1 },
  { srNo: 104, name: "FGM MAT 225 GSM", code: "HCPPL104", unit: "ROLL", balance: 37, category: "Raw Material", minStock: 1 },
  { srNo: 105, name: "FGM MAT 450 GSM", code: "HCPPL105", unit: "ROLL", balance: 0, category: "Raw Material", minStock: 5 },
  { srNo: 106, name: "FGM MATT 1230 GSM", code: "HCPPL106", unit: "ROLL", balance: 30, category: "Raw Material", minStock: 5 },
  { srNo: 107, name: "WOVEN ROVING 610 GSM", code: "HCPPL107", unit: "ROLL", balance: 57, category: "Raw Material", minStock: 5 },
  { srNo: 108, name: "MEKP (CATALYST)", code: "HCPPL108", unit: "CAN", balance: 28, category: "Raw Material", minStock: 1 },
  { srNo: 109, name: "COBALT OCTOATE", code: "HCPPL109", unit: "CAN", balance: 29, category: "Raw Material", minStock: 1 },
  { srNo: 110, name: "THINNER", code: "HCPPL110", unit: "LTR", balance: 0, category: "Raw Material", minStock: 50 },
  { srNo: 111, name: "QUARTZ BIG", code: "HCPPL111", unit: "BAG", balance: 0, category: "Raw Material", minStock: 10 },
  { srNo: 112, name: "QUARTZ MEDIUM", code: "HCPPL112", unit: "BAG", balance: 0, category: "Raw Material", minStock: 10 },
  { srNo: 113, name: "QUARTZ SMALL", code: "HCPPL113", unit: "BAG", balance: 0, category: "Raw Material", minStock: 10 },
  { srNo: 114, name: "DOLOMITE POWDER", code: "HCPPL114", unit: "BAG", balance: 420, category: "Raw Material", minStock: 10 },
  { srNo: 115, name: "GEL COAT POWDER", code: "HCPPL115", unit: "BAG", balance: 0, category: "Raw Material", minStock: 0 },
  { srNo: 116, name: "ELECTRIC ZIGSAW MACHINE", code: "HCPPL116", unit: "PCS", balance: 0, category: "Electric", minStock: 1 },
  { srNo: 117, name: "HAND MIXTURE MACHINE", code: "HCPPL117", unit: "PCS", balance: 0, category: "Electric", minStock: 1 },
  { srNo: 118, name: "ANGLE GRINDER", code: "HCPPL118", unit: "PCS", balance: 0, category: "Electric", minStock: 2 },
  { srNo: 119, name: "DRILL MACHINE", code: "HCPPL119", unit: "PCS", balance: 0, category: "Electric", minStock: 2 },
  { srNo: 120, name: "BUFING MACHINE", code: "HCPPL120", unit: "PCS", balance: 0, category: "Electric", minStock: 1 },
  { srNo: 121, name: "SANDING MACHINE", code: "HCPPL121", unit: "PCS", balance: 0, category: "Electric", minStock: 1 },
  { srNo: 122, name: "POP (PLASTER OF PARIS)", code: "HCPPL122", unit: "BAG", balance: 0, category: "Hardware", minStock: 2 },
  { srNo: 123, name: "PLY WOOD 4MM", code: "HCPPL123", unit: "PCS", balance: 0, category: "Hardware", minStock: 2 },
  { srNo: 124, name: "PLY WOOD 6MM", code: "HCPPL124", unit: "PCS", balance: 0, category: "Hardware", minStock: 2 },
  { srNo: 125, name: "PLY WOOD 12MM", code: "HCPPL125", unit: "PCS", balance: 0, category: "Hardware", minStock: 2 },
  { srNo: 126, name: "PLY WOOD 18MM", code: "HCPPL126", unit: "PCS", balance: 0, category: "Hardware", minStock: 2 },
  { srNo: 127, name: "ZIGSAW BLADE", code: "HCPPL127", unit: "PCS", balance: 98, category: "Hardware", minStock: 5 },
  { srNo: 128, name: "WASTE CLOTH", code: "HCPPL128", unit: "KG", balance: 0, category: "Hardware", minStock: 5 },
  { srNo: 129, name: "BELCHA (SEWAL)", code: "HCPPL129", unit: "PCS", balance: 2, category: "Hardware", minStock: 1 },
  { srNo: 130, name: "SHARPNER", code: "HCPPL130", unit: "PCS", balance: 0, category: "Hardware", minStock: 2 },
  { srNo: 131, name: "ERASER", code: "HCPPL131", unit: "PCS", balance: 0, category: "Hardware", minStock: 2 },
  { srNo: 132, name: "HYDROLIC OIL", code: "HCPPL132", unit: "LTR", balance: 0, category: "Hardware", minStock: 20 },
  { srNo: 133, name: "GRISH", code: "HCPPL133", unit: "KG", balance: 0, category: "Hardware", minStock: 20 },
  { srNo: 134, name: "WELDING RODE", code: "HCPPL134", unit: "PCS", balance: 0, category: "Hardware", minStock: 1 },
  { srNo: 135, name: "NYLON BLACK PATTY", code: "HCPPL135", unit: "PCS", balance: 0, category: "Hardware", minStock: 1 },
  { srNo: 136, name: "GREY GLOVES", code: "HCPPL136", unit: "PCS", balance: 0, category: "Hardware", minStock: 10 },
];

async function seed136RawMaterials(prisma: PrismaClient, companyId: string) {
  // Empty NO-OP: RawMaterial table is kept 100% clean for manual user data entry
  return;
}

async function main() {
  console.log('🌱 Starting ERP seed...\n');

  // ── 1. Roles ────────────────────────────────────────────────────────────────
  console.log('📋 Seeding roles...');
  const roleDefinitions = [
    { code: 'SUPER_ADMIN',          name: 'Super Admin' },
    { code: 'ADMIN',                name: 'Admin' },
    { code: 'SUPER_SALES',          name: 'SuperSales' },
    { code: 'SALES_EXECUTIVE',      name: 'Sales Executive' },
    { code: 'SALES_MANAGER',        name: 'Sales Manager' },
    { code: 'PLANT_HEAD',           name: 'Plant Head' },
    { code: 'PRODUCTION_PLANNER',   name: 'Production Planner' },
    { code: 'PRODUCTION_OPERATOR',  name: 'Production Operator' },
    { code: 'QC_INSPECTOR',         name: 'QC Inspector' },
    { code: 'DISPATCH_EXECUTIVE',   name: 'Dispatch Executive' },
    { code: 'DISPATCH_2',           name: 'Dispatch 2' },
    { code: 'FINANCE_EXECUTIVE',    name: 'Finance Executive' },
    { code: 'FINANCE_MANAGER',      name: 'Finance Manager' },
    { code: 'STORE_MANAGER',        name: 'Store Manager' },
    { code: 'HR',                   name: 'HR' },
  ];

  for (const r of roleDefinitions) {
    await prisma.role.upsert({
      where: { code: r.code },
      update: { name: r.name },
      create: { publicId: `ROLE-${r.code}`, name: r.name, code: r.code },
    });
  }

  // ── 2. Permissions ──────────────────────────────────────────────────────────
  console.log('🔑 Seeding permissions...');
  const permissionCodes = [
    'sales.customers.read', 'sales.customers.create', 'sales.customers.update',
    'sales.leads.read', 'sales.leads.create', 'sales.leads.update', 'sales.leads.delete', 'sales.leads.convert',
    'sales.dashboard.read',
    'sales.orders.approve', 'sales.orders.create', 'sales.orders.read', 'sales.orders.update',

    'crm.quotation.create', 'crm.quotation.read', 'crm.quotation.update',
    'crm.quotations.read', 'crm.quotations.create', 'crm.quotations.update', 'crm.quotations.send', 'crm.quotations.accept', 'crm.quotations.convert', 'crm.quotations.delete',
    'dispatch.create', 'dispatch.read', 'dispatch.update',
    'logistics.dispatches.read', 'logistics.dispatches.create', 'logistics.dispatches.start-delivery', 'logistics.dispatches.confirm-delivery',
    'finance.invoice.read', 'finance.invoice.update',
    'finance.ledger.read',
    'finance.payment.create', 'finance.payment.read', 'finance.payment.update',
    'procurement.indents.create', 'procurement.indents.read', 'procurement.indents.update', 'procurement.indents.submit', 'procurement.indents.resubmit', 'procurement.indents.approve', 'procurement.indents.return', 'procurement.indents.reject', 'procurement.indents.cancel',
    'procurement.purchase_orders.create', 'procurement.purchase_orders.read', 'procurement.purchase_orders.update', 'procurement.purchase_orders.submit', 'procurement.purchase_orders.approve', 'procurement.purchase_orders.return', 'procurement.purchase_orders.reject', 'procurement.purchase_orders.issue', 'procurement.purchase_orders.vendor_status', 'procurement.purchase_orders.dispatch', 'procurement.purchase_orders.delivery_read', 'procurement.purchase_orders.closure_read', 'procurement.purchase_orders.close',
    'procurement.grns.create', 'procurement.grns.read', 'procurement.grns.update', 'procurement.grns.submit', 'procurement.grns.resubmit', 'procurement.grns.audit', 'procurement.grns.return',
    'procurement.vendor_invoices.create', 'procurement.vendor_invoices.read', 'procurement.vendor_invoices.update', 'procurement.vendor_invoices.submit', 'procurement.vendor_invoices.match', 'procurement.vendor_invoices.verify', 'procurement.vendor_invoices.request_payment', 'procurement.vendor_invoices.resolve_exception', 'procurement.vendor_invoices.cancel',
    'procurement.vendor_payments.create', 'procurement.vendor_payments.read', 'procurement.vendor_payments.update', 'procurement.vendor_payments.submit', 'procurement.vendor_payments.approve', 'procurement.vendor_payments.process', 'procurement.vendor_payments.complete', 'procurement.vendor_payments.fail', 'procurement.vendor_payments.cancel', 'procurement.audit.read', 'inventory.receipts.post', 'vendors.read', 'suppliers.read', 'products.read', 'warehouses.read', 'inventory.stock.read',
    'production.plan.approve', 'production.plan.create', 'production.plan.read', 'production.plan.release',
    'production.workorder.complete', 'production.workorder.read', 'production.workorder.start', 'production.workorder.update',
    'qc.inspection.approve', 'qc.inspection.read',

    // Original CRM / Sales
    'sample.read', 'sample.create', 'sample.dispatch', 'sample.update',
    'quotation.read', 'quotation.create', 'quotation.update', 'quotation.send', 'quotation.accept',
    'salesorder.confirm', 'salesorder.send_to_plant', 'salesorder.cancel',
    'salesorder.amend', 'salesorder.credit_override',
    // Original Production
    'production.qc.read', 'production.qc.inspect', 'production.qc.approve', 'production.qc.reject',
    // Original Dispatch
    'dispatch.confirm',
    // Original Finance
    'invoice.read', 'invoice.create', 'invoice.post', 'invoice.void',
    'payment.read', 'payment.create', 'payment.verify', 'payment.reject',
    'creditnote.read', 'creditnote.create',
    // Original After Sales
    'return.read', 'return.create', 'return.approve', 'return.reject',
    'replacement.read', 'replacement.create', 'replacement.approve',
    'complaint.read', 'complaint.create', 'complaint.resolve',
    // Original Admin
    'user.read', 'user.create', 'user.update', 'user.deactivate',
    'role.read', 'role.assign',
    'approval.approve', 'approval.reject',
    'attachment.upload', 'attachment.delete',
    'notification.read', 'comment.create', 'comment.read',
    'reports.sales', 'reports.production', 'reports.finance',
    'hr.recruitment.requests.create',
    'hr.recruitment.requests.read.own',
    'hr.recruitment.requests.read.all',
    'hr.recruitment.requests.update.own',
    'hr.recruitment.requests.withdraw',
    'hr.recruitment.requests.process',
    'hr.recruitment.requests.return',
    'hr.recruitment.requests.reject',
    'hr.recruitment.requests.fulfil',
    'hr.recruitment.candidates.create',
    'hr.recruitment.candidates.update',
    'hr.recruitment.interviews.create',
    'hr.recruitment.interviews.update',
    'hr.employees.read',
    'hr.employees.create',
    'hr.employees.update',
    'hr.employees.status.update',
    'hr.employees.documents.read',
    'hr.employees.documents.upload',
    'hr.employees.documents.delete',
    'hr.employees.sensitive.read',
    'hr.departments.read',
    'hr.locations.read',
    'hr.payroll.read',
    'hr.payroll.prepare',
    'hr.payroll.update',
    'hr.payroll.submit',
    'superadmin.payroll.read',
    'superadmin.payroll.approve',
    'superadmin.payroll.reject',
    'superadmin.payroll.hold',
    'superadmin.payroll.send_to_finance',
    'finance.payroll.read',
    'finance.payroll.process',
    'finance.payroll.pay',
    'finance.payroll.history',
    'salary_slips.read_own',
    'salary_slips.read_all',
    'salary_slips.download',
    'salary_slips.share',
    'salary_slips.revoke_share',

    // SOD Override Permissions
    'procurement.indents.override',
    'procurement.po.override',
    'procurement.grn.override',
    'finance.invoices.override',
    'finance.payments.override',
    'qc.override',
    'hr.recruitment.requests.override',
    'hr.payroll.override',

    // Sales Analytics Canonical Permissions
    'finance.sales-analytics.read',
    'finance.sales-analytics.activity.read',
    'finance.sales-analytics.receivables.read',
    'finance.sales-analytics.export',

    // Controller specific aliases & domain permissions
    'admin.attachments.read', 'admin.attachments.create', 'admin.attachments.delete',
    'admin.auth.read', 'admin.users.unlock',
    'store.brand-analysis.create', 'store.brand-analysis.read', 'super-admin.brand-analysis.read', 'finance.brand-analysis.read',
    'super-admin.brand-analysis.approve', 'super-admin.brand-analysis.reject', 'finance.brand-analysis.start', 'finance.brand-analysis.complete',
    'admin.comments.read', 'admin.comments.create', 'admin.comments.delete',
    'sales.customercomplaints.create', 'sales.customercomplaints.read', 'sales.customercomplaints.update', 'sales.customercomplaints.delete',
    'sales.customercomplaints.submit', 'sales.customercomplaints.approve', 'sales.customercomplaints.reject',
    'inventory.inventory.create', 'inventory.inventory.read',
    'admin.materialrequests.read', 'admin.materialrequests.create', 'admin.materialrequests.approve', 'admin.materialrequests.reject', 'admin.materialrequests.update',
    'admin.notifications.read', 'admin.notifications.update',
    'admin.planthead.read', 'admin.planthead.create',
    'procurement.procurement.read', 'procurement.procurement.create', 'procurement.procurement.reject',
    'production.productiontesting.read', 'production.productiontesting.create', 'production.productiontesting.update', 'production.productiontesting.delete',
    'production.floor.read', 'production.productionworkflow.read', 'production.floor.create', 'production.floor.start', 'production.floor.complete', 'production.floor.rework',
    'plant-head.qc-failures.read',
    'admin.products.create', 'admin.products.read', 'admin.products.update',
    'hr.recruitment.read',
    'admin.replacements.create', 'admin.replacements.read', 'admin.replacements.approve', 'admin.replacements.reject', 'admin.replacements.update',
    'sales.salesreports.read', 'sales.salesreturns.create', 'sales.salesreturns.read', 'sales.salesreturns.approve', 'sales.salesreturns.reject', 'sales.salesreturns.update',
    'sales.targets.create', 'sales.targets.read', 'sales.targets.update', 'sales.targets.delete',
    'admin.samples.create', 'admin.samples.read', 'admin.samples.update',
    'admin.storereports.read', 'procurement.suppliers.read',
    'inventory.warehouses.create', 'inventory.warehouses.read', 'inventory.warehouses.update', 'admin.workflow.read',
  ];

  for (const code of permissionCodes) {
    await prisma.permission.upsert({
      where: { code },
      update: {},
      create: { publicId: uid('PERM'), name: code, code },
    });
  }

  // ── 3. Company ──────────────────────────────────────────────────────────────
  console.log('🏢 Seeding company...');
  const company = await prisma.company.upsert({
    where: { publicId: 'COMP-000001' },
    update: {},
    create: { publicId: 'COMP-000001', name: 'Himalaya Wellness Pvt. Ltd.' },
  });

  // Keep RawMaterial and InventoryTransaction completely clear for user manual data entry
  await prisma.inventoryTransaction.deleteMany({});
  await prisma.rawMaterial.deleteMany({});

  // ── 4. Assign all permissions to SUPER_ADMIN and ADMIN ─────────────────────
  console.log('🔗 Assigning permissions to admin roles...');
  const adminRoles = await prisma.role.findMany({
    where: { code: { in: ['SUPER_ADMIN', 'ADMIN', 'SUPER_SALES'] } },
  });
  const allPerms = await prisma.permission.findMany();

  for (const role of adminRoles) {
    for (const perm of allPerms) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: perm.id } },
        update: {},
        create: { roleId: role.id, permissionId: perm.id },
      });
    }
  }

  // ── Sales Analytics Specific Assignments ──
  const readPerms = await prisma.permission.findMany({
    where: {
      code: {
        in: [
          'finance.sales-analytics.read',
          'finance.sales-analytics.activity.read',
          'finance.sales-analytics.receivables.read',
        ],
      },
    },
  });

  const exportPerms = await prisma.permission.findMany({
    where: { code: 'finance.sales-analytics.export' },
  });

  // Finance Executive, Finance Lead, Finance
  const execRoles = await prisma.role.findMany({
    where: {
      OR: [
        { code: { in: ['FINANCE_EXECUTIVE', 'FINANCE_LEAD', 'FINANCE'] } },
        { name: { in: ['Finance Executive', 'Finance Lead', 'Finance', 'FINANCE_EXECUTIVE', 'FINANCE_LEAD', 'FINANCE'] } },
      ],
    },
  });
  for (const role of execRoles) {
    for (const perm of readPerms) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: perm.id } },
        update: {},
        create: { roleId: role.id, permissionId: perm.id },
      });
    }
  }

  // Finance Manager
  const mgrRoles = await prisma.role.findMany({
    where: {
      OR: [
        { code: { in: ['FINANCE_MANAGER'] } },
        { name: { in: ['Finance Manager', 'FINANCE_MANAGER'] } },
      ],
    },
  });
  for (const role of mgrRoles) {
    for (const perm of [...readPerms, ...exportPerms]) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: perm.id } },
        update: {},
        create: { roleId: role.id, permissionId: perm.id },
      });
    }
  }

  // ── Dispatch Executive and Dispatch 2 Roles ───────────────────────────────
  const dispatchExecRole = await prisma.role.findFirst({ where: { code: 'DISPATCH_EXECUTIVE' } });
  const dispatch2Role = await prisma.role.findFirst({ where: { code: 'DISPATCH_2' } });

  if (dispatchExecRole && dispatch2Role) {
    const dispatchExecPerms = await prisma.rolePermission.findMany({
      where: { roleId: dispatchExecRole.id },
    });
    for (const rp of dispatchExecPerms) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: dispatch2Role.id, permissionId: rp.permissionId } },
        update: {},
        create: { roleId: dispatch2Role.id, permissionId: rp.permissionId },
      });
    }
  }

  // ── 5. Users (one per role) ─────────────────────────────────────────────────
  console.log('👤 Seeding users...');
  const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || 'admin123';
  const hashedPassword = await bcrypt.hash(adminPassword, 12);
  const allRoles = await prisma.role.findMany();

  for (const role of allRoles) {
    const emailSlug = role.code.toLowerCase().replace(/_/g, '.');
    let email = (role.code === 'SUPER_ADMIN' && process.env.INITIAL_ADMIN_EMAIL)
      ? process.env.INITIAL_ADMIN_EMAIL
      : `${emailSlug}@himalayaerp.com`;
    if (role.code === 'DISPATCH_2') email = 'dispatch2@himalayaerp.com';

    await prisma.user.upsert({
      where: { email },
      update: {
        password: hashedPassword,
        roleId: role.id,
        name: role.name,
        isActive: true,
        deletedAt: null,
      },
      create: {
        publicId: uid('USR'),
        email,
        password: hashedPassword,
        name: role.name,
        roleId: role.id,
        companyId: company.id,
      },
    });
  }

  // Seeding requested Finance Manager account (Sahad Accounts)
  const sahadPassword = await bcrypt.hash('Hcpp1@5253', 12);
  const finManagerRole = allRoles.find((r) => r.code === 'FINANCE_MANAGER');
  if (finManagerRole) {
    await prisma.user.upsert({
      where: { email: 'sahad.accounts@himalayaerp.com' },
      update: {
        password: sahadPassword,
        roleId: finManagerRole.id,
        isActive: true,
      },
      create: {
        publicId: uid('USR'),
        email: 'sahad.accounts@himalayaerp.com',
        password: sahadPassword,
        name: 'Sahad Accounts',
        roleId: finManagerRole.id,
        companyId: company.id,
        isActive: true,
      },
    });
  }

  const dispatch2RoleAlias = allRoles.find((r) => r.code === 'DISPATCH_2');
  if (dispatch2RoleAlias) {
    await prisma.user.upsert({
      where: { email: 'dispatch.2@himalayaerp.com' },
      update: {
        password: hashedPassword,
        roleId: dispatch2RoleAlias.id,
        isActive: true,
      },
      create: {
        publicId: uid('USR'),
        email: 'dispatch.2@himalayaerp.com',
        password: hashedPassword,
        name: 'Dispatch 2',
        roleId: dispatch2RoleAlias.id,
        companyId: company.id,
        isActive: true,
      },
    });
  }

  // ── 6. Document Sequences ───────────────────────────────────────────────────
  console.log('🔢 Seeding document sequences...');
  const currentYear = new Date().getFullYear();

  const sequences = [
    { documentType: 'LEAD',   prefix: 'LEAD' },
    { documentType: 'SAMPLE', prefix: 'SAMP' },
    { documentType: 'QT',     prefix: 'QT'   },
    { documentType: 'SO',     prefix: 'SO'   },
    { documentType: 'PP',     prefix: 'PP'   },
    { documentType: 'WO',     prefix: 'WO'   },
    { documentType: 'BATCH',  prefix: 'BATCH'},
    { documentType: 'QC',     prefix: 'QC'   },
    { documentType: 'DISP',   prefix: 'DISP' },
    { documentType: 'INV',    prefix: 'INV'  },
    { documentType: 'PAY',    prefix: 'PAY'  },
    { documentType: 'RET',    prefix: 'RET'  },
    { documentType: 'REPL',   prefix: 'REPL' },
    { documentType: 'COMP',   prefix: 'COMP' },
    { documentType: 'PO',     prefix: 'PO'   },
    { documentType: 'GRN',    prefix: 'GRN'  },
    { documentType: 'AMEND',  prefix: 'AMD'  },
  ];

  for (const seq of sequences) {
    await prisma.documentSequence.upsert({
      where: { companyId_documentType_year: { companyId: company.id, documentType: seq.documentType, year: currentYear } },
      update: {},
      create: {
        companyId: company.id,
        documentType: seq.documentType,
        prefix: seq.prefix,
        year: currentYear,
        currentNumber: 0,
      },
    });
  }

  // ── 7. SEED PRODUCTS (366 Total Products: 230 Enterprise + 136 Hardware) ────
  console.log('🧹 Purging legacy demo products and unneeded categories...');
  const legacyWhere = {
    OR: [
      { category: { in: ['Oral Care', 'Bulk', 'Personal Care', 'General', 'Skincare'] } },
      { name: { in: ['Sand Fine Grade', 'Item (100 Qty)', 'Item (1 Qty)', 'Ayurvedic Toothpaste 200g', 'Organic Neem Face Wash 150ml', 'Herbal Shampoo 500ml'] } },
      { sku: { in: ['RM001', 'SKU-ITEM100', 'SKU-ITEM1', 'SKU-ATP200', 'SKU-NFW150', 'SKU-HS500'] } },
    ],
  };

  try {
    const deletedLegacy = await prisma.product.deleteMany({ where: legacyWhere });
    console.log(`  ✓ Removed ${deletedLegacy.count} legacy demo products.`);
  } catch (_err) {
    const deactivated = await prisma.product.updateMany({
      where: legacyWhere,
      data: { isActive: false },
    });
    console.log(`  ✓ Deactivated ${deactivated.count} legacy demo products with linked transactions.`);
  }

  console.log(`📦 Seeding ${allProducts.length} products with productType across all companies...`);
  
  let createdCount = 0;
  let skippedCount = 0;

  const targetCompanies = await prisma.company.findMany();

  for (const targetCompany of targetCompanies) {
    for (const productData of allProducts) {
      try {
        const sku = productData.sku || generateSku(productData.name);
        const pType = productData.productType || (
          ['FRP COVER', 'FRP COVERS', 'FRP GRATING', 'FRP GRATINGS'].includes(productData.category) ? 'MANUFACTURING' :
          ['COVERBLOCK', 'RCC PIPE', 'FRC COVER', 'OTHERS'].includes(productData.category) ? 'TRADING' :
          productData.category === 'Raw Material' ? 'RAW_MATERIAL' : 'HARDWARE'
        );
        
        const existing = await prisma.product.findFirst({
          where: {
            companyId: targetCompany.id,
            OR: [
              { sku: sku },
              { name: productData.name },
            ],
          },
        });

        if (!existing) {
          await prisma.product.create({
            data: {
              companyId: targetCompany.id,
              publicId: uid('PROD'),
              name: productData.name,
              sku: sku,
              description: productData.description,
              category: productData.category,
              productType: pType,
              brand: productData.brand || 'HIMALAYA',
              unit: productData.unit,
              unitPrice: productData.unitPrice,
              minimumStock: productData.minimumStock ?? 0,
              isActive: true,
            },
          });
          createdCount++;
        } else {
          await prisma.product.update({
            where: { id: existing.id },
            data: {
              category: productData.category,
              productType: pType,
              brand: productData.brand || existing.brand || 'HIMALAYA',
              isActive: true,
            },
          });
          skippedCount++;
        }
      } catch (error) {
        console.error(`  ✗ Failed to create product for company ${targetCompany.name}: ${productData.name}`, error);
      }
    }
  }

  console.log(`  ✅ ${createdCount} products created, ${skippedCount} skipped/updated across all companies`);

  // ── 8. Workflow Definitions ─────────────────────────────────────────────────
  console.log('⚙️  Seeding workflow definitions...');

  const workflows = [
    {
      code: 'LEAD',
      name: 'Lead Workflow',
      states: [
        { code: 'NEW',                    name: 'New',                    sequence: 1, isInitial: true },
        { code: 'CONTACTED',              name: 'Contacted',              sequence: 2 },
        { code: 'REQUIREMENT_IDENTIFIED', name: 'Requirement Identified', sequence: 3 },
        { code: 'QUOTATION_SENT',         name: 'Quotation Sent',         sequence: 4 },
        { code: 'NEGOTIATION',            name: 'Negotiation',            sequence: 5 },
        { code: 'WON',                    name: 'Won',                    sequence: 6, isFinal: true },
        { code: 'LOST',                   name: 'Lost',                   sequence: 7, isFinal: true },
      ],
      transitions: [
        { from: 'NEW',                    to: 'CONTACTED',              actionName: 'CONTACT',      actionLabel: 'Mark Contacted' },
        { from: 'CONTACTED',              to: 'REQUIREMENT_IDENTIFIED', actionName: 'IDENTIFY_REQ', actionLabel: 'Identify Req' },
        { from: 'REQUIREMENT_IDENTIFIED', to: 'QUOTATION_SENT',         actionName: 'SEND_QUOTE',   actionLabel: 'Send Quote' },
        { from: 'QUOTATION_SENT',         to: 'NEGOTIATION',            actionName: 'NEGOTIATE',    actionLabel: 'Start Negotiation' },
        { from: 'NEGOTIATION',            to: 'WON',                    actionName: 'WON',          actionLabel: 'Mark Won' },
        { from: 'NEW',                    to: 'LOST',                   actionName: 'LOST',         actionLabel: 'Mark Lost' },
        { from: 'CONTACTED',              to: 'LOST',                   actionName: 'LOST',         actionLabel: 'Mark Lost' },
        { from: 'REQUIREMENT_IDENTIFIED', to: 'LOST',                   actionName: 'LOST',         actionLabel: 'Mark Lost' },
        { from: 'QUOTATION_SENT',         to: 'LOST',                   actionName: 'LOST',         actionLabel: 'Mark Lost' },
        { from: 'NEGOTIATION',            to: 'LOST',                   actionName: 'LOST',         actionLabel: 'Mark Lost' },
      ],
    },
    {
      code: 'QUOTATION',
      name: 'Quotation Workflow',
      states: [
        { code: 'NEW',              name: 'New',               sequence: 0, isInitial: true },
        { code: 'DRAFT',            name: 'Draft',             sequence: 1, isInitial: true },
        { code: 'INTERNAL_REVIEW',  name: 'Internal Review',   sequence: 2 },
        { code: 'SENT',             name: 'Sent',              sequence: 3 },
        { code: 'NEGOTIATION',      name: 'Negotiation',       sequence: 4 },
        { code: 'APPROVED',         name: 'Approved',          sequence: 5 },
        { code: 'CONVERTED_TO_SO',  name: 'Converted to SO',   sequence: 6, isFinal: true },
        { code: 'REJECTED',         name: 'Rejected',          sequence: 7, isFinal: true },
        { code: 'EXPIRED',          name: 'Expired',           sequence: 8, isFinal: true },
        { code: 'CANCELLED',        name: 'Cancelled',         sequence: 9, isFinal: true },
        { code: 'SUPERSEDED',       name: 'Superseded',        sequence: 10, isFinal: true },
      ],
      transitions: [
        { from: 'NEW',               to: 'SENT',              actionName: 'SEND',          actionLabel: 'Send directly to Customer' },
        { from: 'NEW',               to: 'INTERNAL_REVIEW',   actionName: 'SUBMIT_REVIEW', actionLabel: 'Submit for Review' },
        { from: 'NEW',               to: 'APPROVED',          actionName: 'APPROVE',       actionLabel: 'Approve' },
        { from: 'NEW',               to: 'CANCELLED',         actionName: 'CANCEL',        actionLabel: 'Cancel' },
        { from: 'DRAFT',             to: 'INTERNAL_REVIEW',   actionName: 'SUBMIT_REVIEW', actionLabel: 'Submit for Review' },
        { from: 'INTERNAL_REVIEW',   to: 'SENT',              actionName: 'SEND',          actionLabel: 'Send to Customer' },
        { from: 'DRAFT',             to: 'SENT',              actionName: 'SEND',          actionLabel: 'Send directly to Customer' },
        { from: 'SENT',              to: 'NEGOTIATION',       actionName: 'NEGOTIATE',     actionLabel: 'Start Negotiation' },
        { from: 'SENT',              to: 'APPROVED',          actionName: 'APPROVE',       actionLabel: 'Approve' },
        { from: 'NEGOTIATION',       to: 'APPROVED',          actionName: 'APPROVE',       actionLabel: 'Approve' },
        { from: 'APPROVED',          to: 'CONVERTED_TO_SO',   actionName: 'CONVERT',       actionLabel: 'Convert to Sales Order' },
        { from: 'INTERNAL_REVIEW',   to: 'REJECTED',          actionName: 'REJECT',        actionLabel: 'Reject' },
        { from: 'SENT',              to: 'REJECTED',          actionName: 'REJECT',        actionLabel: 'Reject' },
        { from: 'NEGOTIATION',       to: 'REJECTED',          actionName: 'REJECT',        actionLabel: 'Reject' },
        { from: 'DRAFT',             to: 'CANCELLED',         actionName: 'CANCEL',        actionLabel: 'Cancel' },
        { from: 'SENT',              to: 'EXPIRED',           actionName: 'EXPIRE',        actionLabel: 'Mark Expired' },
      ],
    },
    {
      code: 'SALES_ORDER',
      name: 'Sales Order Workflow',
      states: [
        { code: 'DRAFT',              name: 'Draft',              sequence: 1,  isInitial: true },
        { code: 'PENDING_APPROVAL',   name: 'Pending Approval',   sequence: 2 },
        { code: 'CONFIRMED',          name: 'Confirmed',          sequence: 3 },
        { code: 'SENT_TO_PLANT',      name: 'Sent to Plant',      sequence: 4 },
        { code: 'PLANT_APPROVED',     name: 'Plant Approved',     sequence: 5 },
        { code: 'READY_FOR_PRODUCTION', name: 'Ready for Production', sequence: 6 },
        { code: 'IN_PRODUCTION',      name: 'In Production',      sequence: 7 },
        { code: 'READY_FOR_DISPATCH', name: 'Ready for Dispatch', sequence: 8 },
        { code: 'COMPLETED',          name: 'Completed',          sequence: 9,  isFinal: true },
        { code: 'CANCELLED',          name: 'Cancelled',          sequence: 10, isFinal: true },
      ],
      transitions: [
        { from: 'DRAFT',               to: 'PENDING_APPROVAL',    actionName: 'SUBMIT',          actionLabel: 'Submit for Approval',   requiredRole: 'SALES_EXECUTIVE' },
        { from: 'PENDING_APPROVAL',    to: 'CONFIRMED',           actionName: 'CONFIRM',         actionLabel: 'Confirm Order',         requiredRole: 'SALES_MANAGER', requiresApproval: true },
        { from: 'CONFIRMED',           to: 'SENT_TO_PLANT',       actionName: 'SEND_TO_PLANT',   actionLabel: 'Send to Plant Head',    requiredRole: 'SALES_MANAGER' },
        { from: 'SENT_TO_PLANT',       to: 'PLANT_APPROVED',      actionName: 'PLANT_APPROVE',   actionLabel: 'Approve at Plant',      requiredRole: 'PLANT_HEAD', requiresApproval: true },
        { from: 'PLANT_APPROVED',      to: 'READY_FOR_PRODUCTION',actionName: 'PLAN_PRODUCTION', actionLabel: 'Mark Ready for Prod.',  requiredRole: 'PRODUCTION_PLANNER' },
        { from: 'READY_FOR_PRODUCTION',to: 'IN_PRODUCTION',       actionName: 'START_PRODUCTION',actionLabel: 'Start Production',      requiredRole: 'PRODUCTION_PLANNER' },
        { from: 'IN_PRODUCTION',       to: 'READY_FOR_DISPATCH',  actionName: 'MARK_READY',      actionLabel: 'Mark Ready for Dispatch',requiredRole: 'QC_INSPECTOR' },
        { from: 'READY_FOR_DISPATCH',  to: 'COMPLETED',           actionName: 'COMPLETE',        actionLabel: 'Close Order',           requiredRole: 'FINANCE_MANAGER' },
        { from: 'DRAFT',               to: 'CANCELLED',           actionName: 'CANCEL',          actionLabel: 'Cancel Order',          requiredRole: 'SALES_MANAGER' },
        { from: 'PENDING_APPROVAL',    to: 'CANCELLED',           actionName: 'CANCEL',          actionLabel: 'Cancel Order',          requiredRole: 'SALES_MANAGER' },
      ],
    },
    {
      code: 'PRODUCTION_PLAN',
      name: 'Production Plan Workflow',
      states: [
        { code: 'DRAFT',       name: 'Draft',        sequence: 1, isInitial: true },
        { code: 'UNDER_REVIEW',name: 'Under Review', sequence: 2 },
        { code: 'APPROVED',    name: 'Approved',     sequence: 3 },
        { code: 'RELEASED',    name: 'Released',     sequence: 4 },
        { code: 'IN_PROGRESS', name: 'In Progress',  sequence: 5 },
        { code: 'COMPLETED',   name: 'Completed',    sequence: 6, isFinal: true },
        { code: 'CANCELLED',   name: 'Cancelled',    sequence: 7, isFinal: true },
      ],
      transitions: [
        { from: 'DRAFT',        to: 'UNDER_REVIEW', actionName: 'SUBMIT',   actionLabel: 'Submit for Review',  requiredRole: 'PRODUCTION_PLANNER' },
        { from: 'UNDER_REVIEW', to: 'APPROVED',     actionName: 'APPROVE',  actionLabel: 'Approve Plan',       requiredRole: 'PLANT_HEAD', requiresApproval: true },
        { from: 'APPROVED',     to: 'RELEASED',     actionName: 'RELEASE',  actionLabel: 'Release to Floor',   requiredRole: 'PLANT_HEAD' },
        { from: 'RELEASED',     to: 'IN_PROGRESS',  actionName: 'START',    actionLabel: 'Start Production',   requiredRole: 'PRODUCTION_OPERATOR' },
        { from: 'IN_PROGRESS',  to: 'COMPLETED',    actionName: 'COMPLETE', actionLabel: 'Mark Completed',     requiredRole: 'PRODUCTION_PLANNER' },
        { from: 'DRAFT',        to: 'CANCELLED',    actionName: 'CANCEL',   actionLabel: 'Cancel Plan',        requiredRole: 'PLANT_HEAD' },
        { from: 'UNDER_REVIEW', to: 'CANCELLED',    actionName: 'REJECT',   actionLabel: 'Reject Plan',        requiredRole: 'PLANT_HEAD' },
      ],
    },
    {
      code: 'WORK_ORDER',
      name: 'Work Order Workflow',
      states: [
        { code: 'CREATED',          name: 'Created',           sequence: 1, isInitial: true },
        { code: 'MATERIAL_PENDING', name: 'Material Pending',  sequence: 2 },
        { code: 'READY',            name: 'Ready',             sequence: 3 },
        { code: 'STARTED',          name: 'Started',           sequence: 4 },
        { code: 'PARTIALLY_COMPLETED', name: 'Partially Completed', sequence: 5 },
        { code: 'COMPLETED',        name: 'Completed',         sequence: 6, isFinal: true },
        { code: 'CANCELLED',        name: 'Cancelled',         sequence: 7, isFinal: true },
      ],
      transitions: [
        { from: 'CREATED',          to: 'READY',            actionName: 'ACCEPT',            actionLabel: 'Accept Work Order', requiredRole: 'PRODUCTION_PLANNER' },
        { from: 'CREATED',          to: 'CANCELLED',        actionName: 'REJECT',            actionLabel: 'Reject Work Order', requiredRole: 'PRODUCTION_PLANNER', allowReject: true },
        { from: 'CREATED',          to: 'MATERIAL_PENDING', actionName: 'REQUEST_MATERIALS', actionLabel: 'Request Materials', requiredRole: 'PRODUCTION_OPERATOR' },
        { from: 'MATERIAL_PENDING', to: 'READY',            actionName: 'ISSUE_MATERIALS',   actionLabel: 'Issue Materials',   requiredRole: 'STORE_MANAGER' },
        { from: 'READY',            to: 'STARTED',          actionName: 'START',             actionLabel: 'Start Job',         requiredRole: 'PRODUCTION_OPERATOR' },
        { from: 'STARTED',          to: 'PARTIALLY_COMPLETED', actionName: 'LOG_BATCH',      actionLabel: 'Log Batch',         requiredRole: 'PRODUCTION_OPERATOR' },
        { from: 'PARTIALLY_COMPLETED', to: 'PARTIALLY_COMPLETED', actionName: 'LOG_BATCH',   actionLabel: 'Log Additional Batch', requiredRole: 'PRODUCTION_OPERATOR' },
        { from: 'STARTED',          to: 'COMPLETED',        actionName: 'COMPLETE',          actionLabel: 'Complete Job',      requiredRole: 'PRODUCTION_OPERATOR' },
        { from: 'PARTIALLY_COMPLETED', to: 'COMPLETED',     actionName: 'COMPLETE',          actionLabel: 'Complete Job',      requiredRole: 'PRODUCTION_OPERATOR' },
      ],
    },
    {
      code: 'QC_INSPECTION',
      name: 'QC Inspection Workflow',
      states: [
        { code: 'PENDING',         name: 'Pending',         sequence: 1, isInitial: true },
        { code: 'IN_PROGRESS',     name: 'In Progress',     sequence: 2 },
        { code: 'APPROVED',        name: 'Approved',        sequence: 3, isFinal: true },
        { code: 'REJECTED',        name: 'Rejected',        sequence: 4, isFinal: true },
        { code: 'REWORK_REQUIRED', name: 'Rework Required', sequence: 5, isFinal: true },
      ],
      transitions: [
        { from: 'PENDING',     to: 'IN_PROGRESS',     actionName: 'START',   actionLabel: 'Start Inspection', requiredRole: 'QC_INSPECTOR' },
        { from: 'IN_PROGRESS', to: 'APPROVED',        actionName: 'APPROVE', actionLabel: 'Approve',          requiredRole: 'QC_INSPECTOR' },
        { from: 'IN_PROGRESS', to: 'REJECTED',        actionName: 'REJECT',  actionLabel: 'Reject',           requiredRole: 'QC_INSPECTOR', allowReject: true },
        { from: 'IN_PROGRESS', to: 'REWORK_REQUIRED', actionName: 'REWORK',  actionLabel: 'Send to Rework',   requiredRole: 'QC_INSPECTOR' },
      ],
    },
    {
      code: 'DISPATCH',
      name: 'Dispatch Workflow',
      states: [
        { code: 'CREATED',            name: 'Created',            sequence: 1, isInitial: true },
        { code: 'READY',              name: 'Ready',              sequence: 2 },
        { code: 'IN_TRANSIT',         name: 'In Transit',         sequence: 3 },
        { code: 'PARTIALLY_DELIVERED',name: 'Partially Delivered',sequence: 4 },
        { code: 'DELIVERED',          name: 'Delivered',          sequence: 5 },
        { code: 'COMPLETED',          name: 'Completed',          sequence: 6, isFinal: true },
      ],
      transitions: [
        { from: 'CREATED',             to: 'READY',               actionName: 'READY_FOR_DISPATCH', actionLabel: 'Mark Ready',         requiredRole: 'DISPATCH_EXECUTIVE' },
        { from: 'READY',               to: 'IN_TRANSIT',          actionName: 'DISPATCH',           actionLabel: 'Dispatch',           requiredRole: 'DISPATCH_EXECUTIVE' },
        { from: 'IN_TRANSIT',          to: 'PARTIALLY_DELIVERED', actionName: 'PARTIAL_DELIVERY',   actionLabel: 'Partial Delivery' },
        { from: 'IN_TRANSIT',          to: 'DELIVERED',           actionName: 'DELIVER',            actionLabel: 'Confirm Delivery' },
        { from: 'PARTIALLY_DELIVERED', to: 'DELIVERED',           actionName: 'DELIVER',            actionLabel: 'Confirm Full Delivery' },
        { from: 'DELIVERED',           to: 'COMPLETED',           actionName: 'COMPLETE',           actionLabel: 'Close Dispatch' },
      ],
    },
    {
      code: 'INVOICE',
      name: 'Invoice Workflow',
      states: [
        { code: 'DRAFT',          name: 'Draft',           sequence: 1, isInitial: true },
        { code: 'POSTED',         name: 'Posted',          sequence: 2 },
        { code: 'PARTIALLY_PAID', name: 'Partially Paid',  sequence: 3 },
        { code: 'PAID',           name: 'Paid',            sequence: 4, isFinal: true },
        { code: 'VOID',           name: 'Void',            sequence: 5, isFinal: true },
        { code: 'CANCELLED',      name: 'Cancelled',       sequence: 6, isFinal: true },
      ],
      transitions: [
        { from: 'DRAFT',          to: 'POSTED',         actionName: 'POST',    actionLabel: 'Post Invoice',       requiredRole: 'FINANCE_EXECUTIVE' },
        { from: 'POSTED',         to: 'PARTIALLY_PAID', actionName: 'PARTIAL', actionLabel: 'Record Partial Pay' },
        { from: 'PARTIALLY_PAID', to: 'PARTIALLY_PAID', actionName: 'PARTIAL', actionLabel: 'Record More Payment' },
        { from: 'POSTED',         to: 'PAID',           actionName: 'PAY',     actionLabel: 'Mark Fully Paid' },
        { from: 'PARTIALLY_PAID', to: 'PAID',           actionName: 'PAY',     actionLabel: 'Mark Fully Paid' },
        { from: 'DRAFT',          to: 'CANCELLED',      actionName: 'CANCEL',  actionLabel: 'Cancel Invoice',     requiredRole: 'FINANCE_MANAGER' },
        { from: 'POSTED',         to: 'VOID',           actionName: 'VOID',    actionLabel: 'Void Invoice',       requiredRole: 'FINANCE_MANAGER', requiresApproval: true },
      ],
    },
    {
      code: 'CUSTOMER_PAYMENT',
      name: 'Customer Payment Workflow',
      states: [
        { code: 'RECEIVED',                     name: 'Received',                     sequence: 1, isInitial: true },
        { code: 'FINANCE_VERIFICATION_PENDING', name: 'Finance Verification Pending', sequence: 2 },
        { code: 'FINANCE_VERIFIED',             name: 'Finance Verified',             sequence: 3 },
        { code: 'PARTIALLY_ALLOCATED',          name: 'Partially Allocated',          sequence: 4 },
        { code: 'ALLOCATED',                    name: 'Allocated',                    sequence: 5, isFinal: true },
        { code: 'BOUNCED',                      name: 'Bounced',                      sequence: 6, isFinal: true },
      ],
      transitions: [
        { from: 'RECEIVED',                     to: 'FINANCE_VERIFICATION_PENDING', actionName: 'SUBMIT_VERIFICATION', actionLabel: 'Submit for Verification', requiredRole: 'SALES_EXECUTIVE' },
        { from: 'FINANCE_VERIFICATION_PENDING', to: 'FINANCE_VERIFIED',             actionName: 'VERIFY',              actionLabel: 'Verify Payment',         requiredRole: 'FINANCE_EXECUTIVE', requiresApproval: true },
        { from: 'FINANCE_VERIFIED',             to: 'PARTIALLY_ALLOCATED',          actionName: 'ALLOCATE',            actionLabel: 'Allocate Funds',         requiredRole: 'FINANCE_EXECUTIVE' },
        { from: 'PARTIALLY_ALLOCATED', to: 'PARTIALLY_ALLOCATED', actionName: 'ALLOCATE',      actionLabel: 'Allocate More',      requiredRole: 'FINANCE_EXECUTIVE' },
        { from: 'FINANCE_VERIFIED',    to: 'ALLOCATED',           actionName: 'ALLOCATE_FULL', actionLabel: 'Fully Allocate',     requiredRole: 'FINANCE_EXECUTIVE' },
        { from: 'PARTIALLY_ALLOCATED', to: 'ALLOCATED',           actionName: 'ALLOCATE_FULL', actionLabel: 'Fully Allocate',     requiredRole: 'FINANCE_EXECUTIVE' },
        { from: 'RECEIVED',            to: 'BOUNCED',             actionName: 'MARK_BOUNCED',  actionLabel: 'Mark as Bounced',    requiredRole: 'FINANCE_MANAGER', requiresApproval: true },
        { from: 'FINANCE_VERIFICATION_PENDING', to: 'BOUNCED',    actionName: 'MARK_BOUNCED',  actionLabel: 'Reject/Bounce',      requiredRole: 'FINANCE_MANAGER', requiresApproval: true },
        { from: 'FINANCE_VERIFIED',    to: 'BOUNCED',             actionName: 'MARK_BOUNCED',  actionLabel: 'Mark as Bounced',    requiredRole: 'FINANCE_MANAGER', requiresApproval: true },
      ],
    },
  ];

  for (const wf of workflows) {
    const workflow = await prisma.workflowDefinition.upsert({
      where: { code: wf.code },
      update: { name: wf.name },
      create: { code: wf.code, name: wf.name },
    });

    const stateMap: Record<string, string> = {};
    for (const s of wf.states) {
      const existing = await prisma.workflowState.findFirst({
        where: { workflowId: workflow.id, code: s.code },
      });
      const state = existing
        ? await prisma.workflowState.update({
            where: { id: existing.id },
            data: { name: s.name, sequence: s.sequence, isInitial: s.isInitial ?? false, isFinal: s.isFinal ?? false },
          })
        : await prisma.workflowState.create({
            data: {
              workflowId: workflow.id,
              code: s.code,
              name: s.name,
              sequence: s.sequence,
              isInitial: s.isInitial ?? false,
              isFinal: s.isFinal ?? false,
            },
          });
      stateMap[s.code] = state.id;
    }

    for (const t of wf.transitions) {
      await prisma.workflowTransition.upsert({
        where: {
          id: (await prisma.workflowTransition.findFirst({
            where: {
              workflowId: workflow.id,
              fromStateId: stateMap[t.from],
              toStateId: stateMap[t.to],
            },
          }))?.id ?? 'nonexistent',
        },
        update: {},
        create: {
          workflowId: workflow.id,
          fromStateId: stateMap[t.from],
          toStateId: stateMap[t.to],
          actionName: t.actionName,
          actionLabel: t.actionLabel,
          requiredRole: t.requiredRole,
          requiresApproval: (t as any).requiresApproval ?? false,
          allowReject: false,
        },
      });
    }

    console.log(`  ✓ ${wf.name}`);
  }

  // Seeding initial machines
  console.log('⚙️ Seeding machines...');
  const initialMachines = [
    { machineId: 'HM001', machineName: 'Hydraulic Machine 1', machineType: 'Hydraulic Press', location: 'Section A' },
    { machineId: 'HM002', machineName: 'Hydraulic Machine 2', machineType: 'Hydraulic Press', location: 'Section A' },
    { machineId: 'HM003', machineName: 'Hydraulic Machine 3', machineType: 'Hydraulic Press', location: 'Section B' },
    { machineId: 'HM004', machineName: 'Hydraulic Machine 4', machineType: 'Hydraulic Press', location: 'Section B' },
    { machineId: 'HM005', machineName: 'Hydraulic Machine 5', machineType: 'Hydraulic Press', location: 'Section C' },
    { machineId: 'HM006', machineName: 'Hydraulic Machine 6', machineType: 'Hydraulic Press', location: 'Section C' },
  ];
  for (const m of initialMachines) {
    await prisma.machine.upsert({
      where: { machineId: m.machineId },
      update: { machineName: m.machineName, machineType: m.machineType, location: m.location, isActive: true },
      create: { machineId: m.machineId, machineName: m.machineName, machineType: m.machineType, location: m.location, isActive: true },
    });
  }

  console.log('\n✅ Seed complete!');
  console.log(`\n🏢 Company: Himalaya Wellness Pvt. Ltd.`);
  console.log(`📦 Products: ${createdCount} created, ${skippedCount} skipped`);
  console.log(`👥 Users seeded (password: admin123):`);
  for (const r of roleDefinitions) {
    const slug = r.code.toLowerCase().replace(/_/g, '.');
    console.log(`   ${slug}@himalayaerp.com  →  ${r.name}`);
  }
  console.log(`\n📋 Workflow definitions: ${workflows.map(w => w.code).join(', ')}`);
  console.log(`🔢 Document sequences: ${sequences.map(s => s.prefix).join(', ')}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
