/**
 * Master Product Ingestion Script for Himalaya ERP
 * Supports:
 *   --dry-run   (Scans database and reports changes WITHOUT performing any database writes)
 *   --apply     (Applies upsert mutations across all active companies)
 */

const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

function generateSku(name) {
  return name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 50);
}

// ─── MASTER PRODUCT CATALOG DEFINITIONS ────────────────────────────────────────

const MASTER_PRODUCT_CATALOG = [
  // ---------------------------------------------------------------------------
  // SECTION 1: COVER BLOCK D2 (Concrete / Plastic Spacers)
  // Category: COVERBLOCK, SubCategory: Cover Block, DispatchCategory: D2, ProductType: TRADING, Unit: PCS
  // ---------------------------------------------------------------------------
  { name: 'WCB 20MM', category: 'COVERBLOCK', subCategory: 'Wire Coverblock', dispatchCategory: 'D2', unit: 'PCS', productType: 'TRADING', description: 'Cover Block Wire 20mm' },
  { name: 'WCB 25MM', category: 'COVERBLOCK', subCategory: 'Wire Coverblock', dispatchCategory: 'D2', unit: 'PCS', productType: 'TRADING', description: 'Cover Block Wire 25mm' },
  { name: 'WCB 30MM', category: 'COVERBLOCK', subCategory: 'Wire Coverblock', dispatchCategory: 'D2', unit: 'PCS', productType: 'TRADING', description: 'Cover Block Wire 30mm' },
  { name: 'WCB 40MM', category: 'COVERBLOCK', subCategory: 'Wire Coverblock', dispatchCategory: 'D2', unit: 'PCS', productType: 'TRADING', description: 'Cover Block Wire 40mm' },
  { name: 'WCB 50MM', category: 'COVERBLOCK', subCategory: 'Wire Coverblock', dispatchCategory: 'D2', unit: 'PCS', productType: 'TRADING', description: 'Cover Block Wire 50mm' },
  
  { name: 'PCB 40 MM', category: 'COVERBLOCK', subCategory: 'Pilling Coverblock', dispatchCategory: 'D2', unit: 'PCS', productType: 'TRADING', description: 'Cover Block Pilling 40mm' },
  { name: 'PCB 50 MM', category: 'COVERBLOCK', subCategory: 'Pilling Coverblock', dispatchCategory: 'D2', unit: 'PCS', productType: 'TRADING', description: 'Cover Block Pilling 50mm' },
  { name: 'PCB 75MM', category: 'COVERBLOCK', subCategory: 'Pilling Coverblock', dispatchCategory: 'D2', unit: 'PCS', productType: 'TRADING', description: 'Cover Block Pilling 75mm' },
  
  { name: 'HTCB 40 MM', category: 'COVERBLOCK', subCategory: 'Heavy Tower Coverblock', dispatchCategory: 'D2', unit: 'PCS', productType: 'TRADING', description: 'Cover Block Heavy Tower 40mm' },
  { name: 'HTCB 50 MM', category: 'COVERBLOCK', subCategory: 'Heavy Tower Coverblock', dispatchCategory: 'D2', unit: 'PCS', productType: 'TRADING', description: 'Cover Block Heavy Tower 50mm' },
  { name: 'HTCB 75 MM', category: 'COVERBLOCK', subCategory: 'Heavy Tower Coverblock', dispatchCategory: 'D2', unit: 'PCS', productType: 'TRADING', description: 'Cover Block Heavy Tower 75mm' },
  
  { name: 'DTCB 20MM', category: 'COVERBLOCK', subCategory: 'Double Tower Coverblock', dispatchCategory: 'D2', unit: 'PCS', productType: 'TRADING', description: 'Cover Block Double Tower 20mm' },
  { name: 'DTCB 25MM', category: 'COVERBLOCK', subCategory: 'Double Tower Coverblock', dispatchCategory: 'D2', unit: 'PCS', productType: 'TRADING', description: 'Cover Block Double Tower 25mm' },
  { name: 'DTCB 30MM', category: 'COVERBLOCK', subCategory: 'Double Tower Coverblock', dispatchCategory: 'D2', unit: 'PCS', productType: 'TRADING', description: 'Cover Block Double Tower 30mm' },
  { name: 'DTCB 40MM', category: 'COVERBLOCK', subCategory: 'Double Tower Coverblock', dispatchCategory: 'D2', unit: 'PCS', productType: 'TRADING', description: 'Cover Block Double Tower 40mm' },
  { name: 'DTCB 50MM', category: 'COVERBLOCK', subCategory: 'Double Tower Coverblock', dispatchCategory: 'D2', unit: 'PCS', productType: 'TRADING', description: 'Cover Block Double Tower 50mm' },
  { name: 'DTCB 60MM', category: 'COVERBLOCK', subCategory: 'Double Tower Coverblock', dispatchCategory: 'D2', unit: 'PCS', productType: 'TRADING', description: 'Cover Block Double Tower 60mm' },
  { name: 'DTCB 75MM', category: 'COVERBLOCK', subCategory: 'Double Tower Coverblock', dispatchCategory: 'D2', unit: 'PCS', productType: 'TRADING', description: 'Cover Block Double Tower 75mm' },
  { name: 'DTCB 100MM', category: 'COVERBLOCK', subCategory: 'Double Tower Coverblock', dispatchCategory: 'D2', unit: 'PCS', productType: 'TRADING', description: 'Cover Block Double Tower 100mm' },
  
  { name: 'MCB 30X40MM', category: 'COVERBLOCK', subCategory: 'Multi Coverblock', dispatchCategory: 'D2', unit: 'PCS', productType: 'TRADING', description: 'Multi Cover Block 30x40mm' },
  { name: 'MCB 35X40X45MM', category: 'COVERBLOCK', subCategory: 'Multi Coverblock', dispatchCategory: 'D2', unit: 'PCS', productType: 'TRADING', description: 'Multi Cover Block 35x40x45mm' },
  { name: 'MCB 20X25X40X50MM', category: 'COVERBLOCK', subCategory: 'Multi Coverblock', dispatchCategory: 'D2', unit: 'PCS', productType: 'TRADING', description: 'Multi Cover Block 20x25x40x50mm' },

  // ---------------------------------------------------------------------------
  // SECTION 2: FRP COVERS D1 (FRP Manhole Covers - Basic Short Codes)
  // Category: FRP COVER, SubCategory: Manhole Cover Basic, DispatchCategory: D1, ProductType: MANUFACTURING, Unit: SET
  // ---------------------------------------------------------------------------
  { name: 'FRPMHCLD 10X10', category: 'FRP COVER', subCategory: 'Manhole Cover Basic LD', dispatchCategory: 'D1', unit: 'SET', productType: 'MANUFACTURING', description: 'FRP Manhole Cover Light Duty 10x10' },
  { name: 'FRPMHCLD 12X12', category: 'FRP COVER', subCategory: 'Manhole Cover Basic LD', dispatchCategory: 'D1', unit: 'SET', productType: 'MANUFACTURING', description: 'FRP Manhole Cover Light Duty 12x12' },
  { name: 'FRPMHCLD 15X15', category: 'FRP COVER', subCategory: 'Manhole Cover Basic LD', dispatchCategory: 'D1', unit: 'SET', productType: 'MANUFACTURING', description: 'FRP Manhole Cover Light Duty 15x15' },
  { name: 'FRPMHCLD 18X18', category: 'FRP COVER', subCategory: 'Manhole Cover Basic LD', dispatchCategory: 'D1', unit: 'SET', productType: 'MANUFACTURING', description: 'FRP Manhole Cover Light Duty 18x18' },
  { name: 'FRPMHCLD 18X24', category: 'FRP COVER', subCategory: 'Manhole Cover Basic LD', dispatchCategory: 'D1', unit: 'SET', productType: 'MANUFACTURING', description: 'FRP Manhole Cover Light Duty 18x24' },
  { name: 'FRPMHCLD 21X21', category: 'FRP COVER', subCategory: 'Manhole Cover Basic LD', dispatchCategory: 'D1', unit: 'SET', productType: 'MANUFACTURING', description: 'FRP Manhole Cover Light Duty 21x21' },
  { name: 'FRPMHCLD 24X24', category: 'FRP COVER', subCategory: 'Manhole Cover Basic LD', dispatchCategory: 'D1', unit: 'SET', productType: 'MANUFACTURING', description: 'FRP Manhole Cover Light Duty 24x24' },
  { name: 'FRPMHCLD 28X28', category: 'FRP COVER', subCategory: 'Manhole Cover Basic LD', dispatchCategory: 'D1', unit: 'SET', productType: 'MANUFACTURING', description: 'FRP Manhole Cover Light Duty 28x28' },
  { name: 'FRPMHCLD 30X30', category: 'FRP COVER', subCategory: 'Manhole Cover Basic LD', dispatchCategory: 'D1', unit: 'SET', productType: 'MANUFACTURING', description: 'FRP Manhole Cover Light Duty 30x30' },
  { name: 'FRPMHCLD 36X36', category: 'FRP COVER', subCategory: 'Manhole Cover Basic LD', dispatchCategory: 'D1', unit: 'SET', productType: 'MANUFACTURING', description: 'FRP Manhole Cover Light Duty 36x36' },
  { name: 'FRPMHCLD 1800X1800', category: 'FRP COVER', subCategory: 'Manhole Cover Basic LD', dispatchCategory: 'D1', unit: 'SET', productType: 'MANUFACTURING', description: 'FRP Manhole Cover Light Duty 1800x1800' },

  { name: 'FRPMHCELD 10X10', category: 'FRP COVER', subCategory: 'Manhole Cover Basic ELD', dispatchCategory: 'D1', unit: 'SET', productType: 'MANUFACTURING', description: 'FRP Manhole Cover Extra Light Duty 10x10' },
  { name: 'FRPMHCELD 12X12', category: 'FRP COVER', subCategory: 'Manhole Cover Basic ELD', dispatchCategory: 'D1', unit: 'SET', productType: 'MANUFACTURING', description: 'FRP Manhole Cover Extra Light Duty 12x12' },
  { name: 'FRPMHCELD 15X15', category: 'FRP COVER', subCategory: 'Manhole Cover Basic ELD', dispatchCategory: 'D1', unit: 'SET', productType: 'MANUFACTURING', description: 'FRP Manhole Cover Extra Light Duty 15x15' },
  { name: 'FRPMHCELD 18X18', category: 'FRP COVER', subCategory: 'Manhole Cover Basic ELD', dispatchCategory: 'D1', unit: 'SET', productType: 'MANUFACTURING', description: 'FRP Manhole Cover Extra Light Duty 18x18' },
  { name: 'FRPMHCELD 18X24', category: 'FRP COVER', subCategory: 'Manhole Cover Basic ELD', dispatchCategory: 'D1', unit: 'SET', productType: 'MANUFACTURING', description: 'FRP Manhole Cover Extra Light Duty 18x24' },
  { name: 'FRPMHCELD 21X21', category: 'FRP COVER', subCategory: 'Manhole Cover Basic ELD', dispatchCategory: 'D1', unit: 'SET', productType: 'MANUFACTURING', description: 'FRP Manhole Cover Extra Light Duty 21x21' },
  { name: 'FRPMHCELD 24X24', category: 'FRP COVER', subCategory: 'Manhole Cover Basic ELD', dispatchCategory: 'D1', unit: 'SET', productType: 'MANUFACTURING', description: 'FRP Manhole Cover Extra Light Duty 24x24' },
  { name: 'FRPMHCELD 28X28', category: 'FRP COVER', subCategory: 'Manhole Cover Basic ELD', dispatchCategory: 'D1', unit: 'SET', productType: 'MANUFACTURING', description: 'FRP Manhole Cover Extra Light Duty 28x28' },
  { name: 'FRPMHCELD 30X30', category: 'FRP COVER', subCategory: 'Manhole Cover Basic ELD', dispatchCategory: 'D1', unit: 'SET', productType: 'MANUFACTURING', description: 'FRP Manhole Cover Extra Light Duty 30x30' },
  { name: 'FRPMHCELD 36X36', category: 'FRP COVER', subCategory: 'Manhole Cover Basic ELD', dispatchCategory: 'D1', unit: 'SET', productType: 'MANUFACTURING', description: 'FRP Manhole Cover Extra Light Duty 36x36' },
  { name: 'FRPMHCELD 1800X1800', category: 'FRP COVER', subCategory: 'Manhole Cover Basic ELD', dispatchCategory: 'D1', unit: 'SET', productType: 'MANUFACTURING', description: 'FRP Manhole Cover Extra Light Duty 1800x1800' },

  // ---------------------------------------------------------------------------
  // SECTION 3 & 4: FRP MHC (Square, Rectangular & Round with 7 Load Classes)
  // ---------------------------------------------------------------------------
  ...generateFRPCovers('MHC', 'Manhole Cover', [
    '300X300', '450X450', '450X600', '450X900', '450X1200',
    '600X600', '600X900', '600X1200', '750X450', '750X750', '750X1200',
    '900X900', '900X1200', '1000X1000', '1200X1200', '1500X1500', '1800X1800',
    '560MM DIA', '600MM DIA', '900MM DIA'
  ], true),

  // ---------------------------------------------------------------------------
  // SECTION 5: FRP RCS (Recessed Covers & Round Cover Square Frame)
  // ---------------------------------------------------------------------------
  ...generateFRPCovers('RCS', 'Round Cover Square Frame', [
    '300X300', '450X450', '450X600', '450X900', '450X1200',
    '600X600', '600X900', '600X1200', '750X450', '750X750', '750X1200',
    '900X900', '900X1200', '1000X1000', '1200X1200', '1500X1500', '1800X1800',
    '560MM DIA', '600MM DIA', '900MM DIA'
  ], true),

  // ---------------------------------------------------------------------------
  // SECTION 6: FRP WGC (Water/Gas Covers with Grate)
  // ---------------------------------------------------------------------------
  ...generateFRPCovers('WGC', 'With Grate Cover', [
    '300X300', '450X450', '450X600', '450X900', '450X1200',
    '600X600', '600X900', '600X1200', '750X750',
    '900X900', '900X1200', '1000X1000', '1200X1200'
  ], true),

  // ---------------------------------------------------------------------------
  // SECTION 7: FRP ONGC (Oil & Natural Gas Corporation Covers)
  // ---------------------------------------------------------------------------
  ...generateFRPCovers('ONGC', 'ONGC Cover', [
    '300X700', '385X700', '450X600', '600X600', '350X1000', '450X1000', '600X1000', '600X720', '600X900'
  ], true),

  // ---------------------------------------------------------------------------
  // SECTIONS 8-13: FRC COVERS D2 (Fiber Reinforced Concrete Covers)
  // ---------------------------------------------------------------------------
  // Section 8: FRC Square
  { name: 'FRCSQRC24x24 LD3', category: 'FRC COVER', subCategory: 'FRC Square Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Square Cover 24x24 - LD3' },
  { name: 'FRCSQRC24x24 LD5', category: 'FRC COVER', subCategory: 'FRC Square Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Square Cover 24x24 - LD5' },
  { name: 'FRCSQRC24x24 MD10', category: 'FRC COVER', subCategory: 'FRC Square Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Square Cover 24x24 - MD10' },
  { name: 'FRCSQRC30x30 LD5', category: 'FRC COVER', subCategory: 'FRC Square Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Square Cover 30x30 - LD5' },
  { name: 'FRCSQRC30x30 MD10', category: 'FRC COVER', subCategory: 'FRC Square Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Square Cover 30x30 - MD10' },
  { name: 'FRCSQRC30x30 HD20', category: 'FRC COVER', subCategory: 'FRC Square Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Square Cover 30x30 - HD20' },
  { name: 'FRCSQRC33x33 HD20', category: 'FRC COVER', subCategory: 'FRC Square Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Square Cover 33x33 - HD20' },
  { name: 'FRCSQRC34x34 LD5', category: 'FRC COVER', subCategory: 'FRC Square Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Square Cover 34x34 - LD5' },
  { name: 'FRCSQRC34x34 HD20', category: 'FRC COVER', subCategory: 'FRC Square Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Square Cover 34x34 - HD20' },
  { name: 'FRCSQRC34x34 EHD35', category: 'FRC COVER', subCategory: 'FRC Square Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Square Cover 34x34 - EHD35' },
  { name: 'FRCSQRC36x36 LD5', category: 'FRC COVER', subCategory: 'FRC Square Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Square Cover 36x36 - LD5' },
  { name: 'FRCSQRC36x36 MD10', category: 'FRC COVER', subCategory: 'FRC Square Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Square Cover 36x36 - MD10' },
  { name: 'FRCSQRC36x36 HD20', category: 'FRC COVER', subCategory: 'FRC Square Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Square Cover 36x36 - HD20' },
  { name: 'FRCSQRC36x36 EHD35', category: 'FRC COVER', subCategory: 'FRC Square Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Square Cover 36x36 - EHD35' },
  { name: 'FRCSQRC42x42 LD5', category: 'FRC COVER', subCategory: 'FRC Square Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Square Cover 42x42 - LD5' },
  { name: 'FRCSQRC42x42 HD20', category: 'FRC COVER', subCategory: 'FRC Square Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Square Cover 42x42 - HD20' },
  { name: 'FRCSQRC42x42 EHD35', category: 'FRC COVER', subCategory: 'FRC Square Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Square Cover 42x42 - EHD35' },
  { name: 'FRCSQRC48x48 LD5', category: 'FRC COVER', subCategory: 'FRC Square Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Square Cover 48x48 - LD5' },
  { name: 'FRCSQRC48x48 HD20', category: 'FRC COVER', subCategory: 'FRC Square Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Square Cover 48x48 - HD20' },
  { name: 'FRCSQRC48x48 EHD35', category: 'FRC COVER', subCategory: 'FRC Square Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Square Cover 48x48 - EHD35' },

  // Section 9: FRC Rectangular
  { name: 'FRCRFRC24x18 LD1', category: 'FRC COVER', subCategory: 'FRC Rectangular Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Rectangular Cover 24x18 - LD1' },
  { name: 'FRCRFRC28x22 LD2', category: 'FRC COVER', subCategory: 'FRC Rectangular Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Rectangular Cover 28x22 - LD2' },
  { name: 'FRCRFRC28x22 LD5', category: 'FRC COVER', subCategory: 'FRC Rectangular Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Rectangular Cover 28x22 - LD5' },
  { name: 'FRCRFRC28x22 MD10', category: 'FRC COVER', subCategory: 'FRC Rectangular Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Rectangular Cover 28x22 - MD10' },
  { name: 'FRCRFRC30x24 LD3', category: 'FRC COVER', subCategory: 'FRC Rectangular Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Rectangular Cover 30x24 - LD3' },
  { name: 'FRCRFRC32x26 LD5', category: 'FRC COVER', subCategory: 'FRC Rectangular Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Rectangular Cover 32x26 - LD5' },
  { name: 'FRCRFRC32x26 MD10', category: 'FRC COVER', subCategory: 'FRC Rectangular Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Rectangular Cover 32x26 - MD10' },
  { name: 'FRCRFRC32x26 HD20', category: 'FRC COVER', subCategory: 'FRC Rectangular Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Rectangular Cover 32x26 - HD20' },
  { name: 'FRCRFRC36x24 MD10', category: 'FRC COVER', subCategory: 'FRC Rectangular Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Rectangular Cover 36x24 - MD10' },
  { name: 'FRCRFRC38x26 LD5', category: 'FRC COVER', subCategory: 'FRC Rectangular Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Rectangular Cover 38x26 - LD5' },
  { name: 'FRCRFRC44x26 LD5', category: 'FRC COVER', subCategory: 'FRC Rectangular Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Rectangular Cover 44x26 - LD5' },
  { name: 'FRCRFRC38x32 MD10', category: 'FRC COVER', subCategory: 'FRC Rectangular Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Rectangular Cover 38x32 - MD10' },
  { name: 'FRCRFRC38x32 HD20', category: 'FRC COVER', subCategory: 'FRC Rectangular Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Rectangular Cover 38x32 - HD20' },
  { name: 'FRCRFRC41x35.5 EHD35', category: 'FRC COVER', subCategory: 'FRC Rectangular Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Rectangular Cover 41x35.5 - EHD35' },
  { name: 'FRCRFRC44x26 MD10', category: 'FRC COVER', subCategory: 'FRC Rectangular Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Rectangular Cover 44x26 - MD10' },
  { name: 'FRCRFRC44x26 HD20', category: 'FRC COVER', subCategory: 'FRC Rectangular Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Rectangular Cover 44x26 - HD20' },
  { name: 'FRCRFRC44x34 MD10', category: 'FRC COVER', subCategory: 'FRC Rectangular Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Rectangular Cover 44x34 - MD10' },
  { name: 'FRCRFRC44x34 HD20', category: 'FRC COVER', subCategory: 'FRC Rectangular Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Rectangular Cover 44x34 - HD20' },
  { name: 'FRCRFRC42x48 HD20', category: 'FRC COVER', subCategory: 'FRC Rectangular Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Rectangular Cover 42x48 - HD20' },
  { name: 'FRCRFRC48x44 HD20', category: 'FRC COVER', subCategory: 'FRC Rectangular Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Rectangular Cover 48x44 - HD20' },
  { name: 'FRCRFRC52x42 EHD35', category: 'FRC COVER', subCategory: 'FRC Rectangular Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Rectangular Cover 52x42 - EHD35' },
  { name: 'FRCRFRC60x48 LD5', category: 'FRC COVER', subCategory: 'FRC Rectangular Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Rectangular Cover 60x48 - LD5' },
  { name: 'FRCRFRC60x48 HD20', category: 'FRC COVER', subCategory: 'FRC Rectangular Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Rectangular Cover 60x48 - HD20' },
  { name: 'FRCRFRC60x48 EHD35', category: 'FRC COVER', subCategory: 'FRC Rectangular Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Rectangular Cover 60x48 - EHD35' },

  // Section 10: FRC Solid Top / Flat
  { name: 'FRCSFSC12x12', category: 'FRC COVER', subCategory: 'FRC Solid Top Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Solid Top Cover 12x12' },
  { name: 'FRCSFSC15x15', category: 'FRC COVER', subCategory: 'FRC Solid Top Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Solid Top Cover 15x15' },
  { name: 'FRCSFSC18x18 LD1', category: 'FRC COVER', subCategory: 'FRC Solid Top Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Solid Top Cover 18x18 - LD1' },
  { name: 'FRCSFSC18x18 MD10', category: 'FRC COVER', subCategory: 'FRC Solid Top Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Solid Top Cover 18x18 - MD10' },
  { name: 'FRCSFSC18x18 HD20', category: 'FRC COVER', subCategory: 'FRC Solid Top Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Solid Top Cover 18x18 - HD20' },
  { name: 'FRCSFSC24x24 LD2', category: 'FRC COVER', subCategory: 'FRC Solid Top Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Solid Top Cover 24x24 - LD2' },
  { name: 'FRCSFSC24x24 LD5', category: 'FRC COVER', subCategory: 'FRC Solid Top Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Solid Top Cover 24x24 - LD5' },
  { name: 'FRCSFSC24x24 HD20', category: 'FRC COVER', subCategory: 'FRC Solid Top Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Solid Top Cover 24x24 - HD20' },
  { name: 'FRCSFSC27x27 LD3', category: 'FRC COVER', subCategory: 'FRC Solid Top Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Solid Top Cover 27x27 - LD3' },
  { name: 'FRCSFSC30x30 LD5', category: 'FRC COVER', subCategory: 'FRC Solid Top Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Solid Top Cover 30x30 - LD5' },
  { name: 'FRCSFSC30x30 MD10', category: 'FRC COVER', subCategory: 'FRC Solid Top Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Solid Top Cover 30x30 - MD10' },
  { name: 'FRCSFSC30x30 HD20', category: 'FRC COVER', subCategory: 'FRC Solid Top Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Solid Top Cover 30x30 - HD20' },
  { name: 'FRCSFSC30x30 EHD35', category: 'FRC COVER', subCategory: 'FRC Solid Top Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Solid Top Cover 30x30 - EHD35' },
  { name: 'FRCSFSC32.5x32.5 LD5', category: 'FRC COVER', subCategory: 'FRC Solid Top Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Solid Top Cover 32.5x32.5 - LD5' },
  { name: 'FRCSFSC32.5x32.5 MD10', category: 'FRC COVER', subCategory: 'FRC Solid Top Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Solid Top Cover 32.5x32.5 - MD10' },
  { name: 'FRCSFSC36x36 HD20', category: 'FRC COVER', subCategory: 'FRC Solid Top Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Solid Top Cover 36x36 - HD20' },
  { name: 'FRCSFSC36x36 EHD35', category: 'FRC COVER', subCategory: 'FRC Solid Top Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Solid Top Cover 36x36 - EHD35' },
  { name: 'FRCSFSC38x38 LD5', category: 'FRC COVER', subCategory: 'FRC Solid Top Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Solid Top Cover 38x38 - LD5' },
  { name: 'FRCSFSC42x42 MD10', category: 'FRC COVER', subCategory: 'FRC Solid Top Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Solid Top Cover 42x42 - MD10' },
  { name: 'FRCSFSC42x42 HD20', category: 'FRC COVER', subCategory: 'FRC Solid Top Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Solid Top Cover 42x42 - HD20' },
  { name: 'FRCSFSC42x42 EHD35', category: 'FRC COVER', subCategory: 'FRC Solid Top Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Solid Top Cover 42x42 - EHD35' },
  { name: 'FRCSFSC48x48 HD20', category: 'FRC COVER', subCategory: 'FRC Solid Top Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Solid Top Cover 48x48 - HD20' },
  { name: 'FRCSFSC48x48 EHD35', category: 'FRC COVER', subCategory: 'FRC Solid Top Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Solid Top Cover 48x48 - EHD35' },
  { name: 'FRCSFSC55x55 HD20', category: 'FRC COVER', subCategory: 'FRC Solid Top Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Solid Top Cover 55x55 - HD20' },
  { name: 'FRCSFSC55x55 EHD35', category: 'FRC COVER', subCategory: 'FRC Solid Top Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Solid Top Cover 55x55 - EHD35' },
  { name: 'FRCSFSC63x63 HD20', category: 'FRC COVER', subCategory: 'FRC Solid Top Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Solid Top Cover 63x63 - HD20' },
  { name: 'FRCSFSC63x63 EHD35', category: 'FRC COVER', subCategory: 'FRC Solid Top Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Solid Top Cover 63x63 - EHD35' },
  { name: 'FRCSFSC67x67 HD20', category: 'FRC COVER', subCategory: 'FRC Solid Top Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Solid Top Cover 67x67 - HD20' },
  { name: 'FRCSFSC67x67 EHD35', category: 'FRC COVER', subCategory: 'FRC Solid Top Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Solid Top Cover 67x67 - EHD35' },

  // Section 11: FRC Round / Circular
  { name: 'FRCROFROC30 dia MD10', category: 'FRC COVER', subCategory: 'FRC Round Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Round Cover 30 dia - MD10' },
  { name: 'FRCROFROC30 dia HD20', category: 'FRC COVER', subCategory: 'FRC Round Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Round Cover 30 dia - HD20' },
  { name: 'FRCROFROC31.5 dia HD20', category: 'FRC COVER', subCategory: 'FRC Round Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Round Cover 31.5 dia - HD20' },
  { name: 'FRCROFROC31.5 dia EHD35', category: 'FRC COVER', subCategory: 'FRC Round Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Round Cover 31.5 dia - EHD35' },
  { name: 'FRCROFROC33 dia HD20', category: 'FRC COVER', subCategory: 'FRC Round Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Round Cover 33 dia - HD20' },
  { name: 'FRCROFROC34 dia HD20', category: 'FRC COVER', subCategory: 'FRC Round Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Round Cover 34 dia - HD20' },
  { name: 'FRCROFROC34 dia EHD35', category: 'FRC COVER', subCategory: 'FRC Round Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Round Cover 34 dia - EHD35' },

  // Section 12: FRC Checker Plate / CP
  { name: 'FRCCP24x24 LD5', category: 'FRC COVER', subCategory: 'FRC Checker Plate Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Checker Plate Cover 24x24 - LD5' },
  { name: 'FRCCP24x24 HD20', category: 'FRC COVER', subCategory: 'FRC Checker Plate Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Checker Plate Cover 24x24 - HD20' },
  { name: 'FRCCP28x22 MD10', category: 'FRC COVER', subCategory: 'FRC Checker Plate Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Checker Plate Cover 28x22 - MD10' },
  { name: 'FRCCP30x30 LD5', category: 'FRC COVER', subCategory: 'FRC Checker Plate Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Checker Plate Cover 30x30 - LD5' },
  { name: 'FRCCP30x30 MD10', category: 'FRC COVER', subCategory: 'FRC Checker Plate Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Checker Plate Cover 30x30 - MD10' },
  { name: 'FRCCP30x30 HD20', category: 'FRC COVER', subCategory: 'FRC Checker Plate Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Checker Plate Cover 30x30 - HD20' },
  { name: 'FRCCP32x26 LD5', category: 'FRC COVER', subCategory: 'FRC Checker Plate Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Checker Plate Cover 32x26 - LD5' },
  { name: 'FRCCP32x26 MD10', category: 'FRC COVER', subCategory: 'FRC Checker Plate Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Checker Plate Cover 32x26 - MD10' },
  { name: 'FRCCP32x26 HD20', category: 'FRC COVER', subCategory: 'FRC Checker Plate Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Checker Plate Cover 32x26 - HD20' },
  { name: 'FRCCP32.5x32.5 LD5', category: 'FRC COVER', subCategory: 'FRC Checker Plate Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Checker Plate Cover 32.5x32.5 - LD5' },
  { name: 'FRCCP32.5x32.5 MD10', category: 'FRC COVER', subCategory: 'FRC Checker Plate Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Checker Plate Cover 32.5x32.5 - MD10' },
  { name: 'FRCCP36x36 HD20', category: 'FRC COVER', subCategory: 'FRC Checker Plate Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Checker Plate Cover 36x36 - HD20' },
  { name: 'FRCCP36x36 EHD35', category: 'FRC COVER', subCategory: 'FRC Checker Plate Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Checker Plate Cover 36x36 - EHD35' },
  { name: 'FRCCP42x42 MD10', category: 'FRC COVER', subCategory: 'FRC Checker Plate Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Checker Plate Cover 42x42 - MD10' },
  { name: 'FRCCP42x42 HD20', category: 'FRC COVER', subCategory: 'FRC Checker Plate Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Checker Plate Cover 42x42 - HD20' },
  { name: 'FRCCP42x42 EHD35', category: 'FRC COVER', subCategory: 'FRC Checker Plate Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Checker Plate Cover 42x42 - EHD35' },
  { name: 'FRCCP44x34 MD10', category: 'FRC COVER', subCategory: 'FRC Checker Plate Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Checker Plate Cover 44x34 - MD10' },
  { name: 'FRCCP44x34 HD20', category: 'FRC COVER', subCategory: 'FRC Checker Plate Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Checker Plate Cover 44x34 - HD20' },
  { name: 'FRCCP48x48 HD20', category: 'FRC COVER', subCategory: 'FRC Checker Plate Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Checker Plate Cover 48x48 - HD20' },
  { name: 'FRCCP48x48 EHD35', category: 'FRC COVER', subCategory: 'FRC Checker Plate Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Checker Plate Cover 48x48 - EHD35' },
  { name: 'FRCCP60x48 HD20', category: 'FRC COVER', subCategory: 'FRC Checker Plate Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Checker Plate Cover 60x48 - HD20' },
  { name: 'FRCCP60x48 EHD35', category: 'FRC COVER', subCategory: 'FRC Checker Plate Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Checker Plate Cover 60x48 - EHD35' },

  // Section 13: FRC Trench / Gully / Other
  { name: 'FRCGT ONLY CO12x12', category: 'FRC COVER', subCategory: 'FRC Gully Trap', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Gully Trap Cover 12x12' },
  { name: 'FRCGT FC 12x12', category: 'FRC COVER', subCategory: 'FRC Gully Trap', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Gully Trap Full Cover 12x12' },
  { name: 'FRCTSOC 24 x 12x2', category: 'FRC COVER', subCategory: 'FRC Trench Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Trench Side Open Cover 24 x 12x2' },
  { name: 'FRCTSOC 28 x 12x2', category: 'FRC COVER', subCategory: 'FRC Trench Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Trench Side Open Cover 28 x 12x2' },
  { name: 'FRCTSOC 24 x 18x2', category: 'FRC COVER', subCategory: 'FRC Trench Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Trench Side Open Cover 24 x 18x2' },
  { name: 'FRCTSOC 24 x 24x2R', category: 'FRC COVER', subCategory: 'FRC Trench Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Trench Side Open Cover 24 x 24x2R' },
  { name: 'FRCTSOC 36 x 18x2', category: 'FRC COVER', subCategory: 'FRC Trench Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Trench Side Open Cover 36 x 18x2' },
  { name: 'FRCTSOC 36 x 24x2R', category: 'FRC COVER', subCategory: 'FRC Trench Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Trench Side Open Cover 36 x 24x2R' },
  { name: 'FRCTSOC 36 x 24x4R', category: 'FRC COVER', subCategory: 'FRC Trench Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Trench Side Open Cover 36 x 24x4R' },
  { name: 'FRCTPEC 24 x 12x2', category: 'FRC COVER', subCategory: 'FRC Trench Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Trench Plain End Cover 24 x 12x2' },
  { name: 'FRCTPEC 24 x 16x2', category: 'FRC COVER', subCategory: 'FRC Trench Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Trench Plain End Cover 24 x 16x2' },
  { name: 'FRCTPEC 24 x 18x2', category: 'FRC COVER', subCategory: 'FRC Trench Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Trench Plain End Cover 24 x 18x2' },
  { name: 'FRCTPEC 30 x 24x2', category: 'FRC COVER', subCategory: 'FRC Trench Cover', dispatchCategory: 'D2', unit: 'SET', productType: 'TRADING', description: 'FRC Trench Plain End Cover 30 x 24x2' },
];

/** Helper generator for standard FRP load classes */
function generateFRPCovers(prefix, subCategory, sizes, includeHeavyClasses = false) {
  const classes = [
    { code: 'ELD', label: 'Extra Light Duty' },
    { code: 'LD', label: 'Light Duty' },
    { code: 'B125', label: 'B125 Class' },
    { code: 'C250', label: 'C250 Class' },
    { code: 'D400', label: 'D400 Class' },
    ...(includeHeavyClasses
      ? [
          { code: 'E600', label: 'E600 Class' },
          { code: 'F900', label: 'F900 Class' },
        ]
      : []),
  ];

  const items = [];
  sizes.forEach(size => {
    classes.forEach(cls => {
      const suffix = prefix === 'ONGC' ? ' SINGLE' : '';
      const name = `HIMALAYA FRP ${prefix} ${size} ${cls.code}${suffix}`;
      const sku = generateSku(name);
      items.push({
        name,
        sku,
        brand: 'HIMALAYA',
        category: 'FRP COVERS',
        subCategory,
        hsnCode: '39259090',
        unit: 'SET',
        unitPrice: 0,
        gstRate: 18,
        productType: 'MANUFACTURING',
        dispatchCategory: 'D1',
        size,
        capacity: cls.code,
        type: prefix === 'ONGC' ? 'SINGLE' : undefined,
        description: `FRP ${subCategory} ${size} - ${cls.label}${suffix ? ' (Single Piece)' : ''}`
      });
    });
  });
  return items;
}

// ─── EXECUTION LOGIC ──────────────────────────────────────────────────────────

async function run() {
  const args = process.argv.slice(2);
  const isApply = args.includes('--apply');
  const isDryRun = !isApply || args.includes('--dry-run');

  console.log('================================================================');
  console.log(` HIMALAYA ERP - MASTER PRODUCT CATALOG INGESTION (${isDryRun ? 'DRY-RUN MOCK TEST' : 'LIVE DB APPLY'})`);
  console.log('================================================================\n');

  const companies = await prisma.company.findMany();
  console.log(`Found ${companies.length} Tenant Companies in Database:`);
  companies.forEach(c => console.log(`  - [${c.id}] ${c.name}`));

  console.log(`\nTotal Master Catalog Items to Process: ${MASTER_PRODUCT_CATALOG.length}`);

  let totalToCreate = 0;
  let totalToUpdate = 0;
  let totalUnchanged = 0;

  for (const comp of companies) {
    console.log(`\n----------------------------------------------------------------`);
    console.log(` Processing Tenant Company: ${comp.name} (${comp.id})`);
    console.log(`----------------------------------------------------------------`);

    let companyCreateCount = 0;
    let companyUpdateCount = 0;
    let companyUnchangedCount = 0;

    for (const item of MASTER_PRODUCT_CATALOG) {
      const sku = item.sku || generateSku(item.name);
      const brand = item.brand || 'HIMALAYA';
      const hsnCode = item.hsnCode || (item.category === 'COVERBLOCK' ? '68109990' : '39259090');

      const existing = await prisma.product.findFirst({
        where: {
          companyId: comp.id,
          OR: [
            { sku: sku },
            { name: { equals: item.name, mode: 'insensitive' } }
          ]
        }
      });

      if (!existing) {
        companyCreateCount++;
        totalToCreate++;
        if (isApply) {
          const randomId = crypto.randomBytes(5).toString('hex');
          await prisma.product.create({
            data: {
              publicId: `PRD-${randomId}`,
              companyId: comp.id,
              name: item.name,
              sku: sku,
              brand: brand,
              category: item.category,
              variantDetails: item.subCategory,
              productType: item.productType || 'MANUFACTURING',
              dispatchCategory: item.dispatchCategory || 'D1',
              unit: item.unit || 'SET',
              unitPrice: 0,
              minimumStock: 0,
              hsnCode: hsnCode,
              description: item.description,
              isActive: true,
            }
          });
        }
      } else {
        // Check if standardization updates are needed
        const needsUpdate = existing.brand !== brand ||
          existing.dispatchCategory !== item.dispatchCategory ||
          existing.productType !== item.productType ||
          existing.variantDetails !== item.subCategory;

        if (needsUpdate) {
          companyUpdateCount++;
          totalToUpdate++;
          if (isApply) {
            await prisma.product.update({
              where: { id: existing.id },
              data: {
                brand: brand,
                variantDetails: item.subCategory,
                productType: item.productType || existing.productType,
                dispatchCategory: item.dispatchCategory || existing.dispatchCategory,
                hsnCode: existing.hsnCode || hsnCode,
                description: existing.description || item.description,
                isActive: true
              }
            });
          }
        } else {
          companyUnchangedCount++;
          totalUnchanged++;
        }
      }
    }

    console.log(`Company Summary (${comp.name}):`);
    console.log(`  - New Products to Add : ${companyCreateCount}`);
    console.log(`  - Existing to Update  : ${companyUpdateCount}`);
    console.log(`  - Already Standardized: ${companyUnchangedCount}`);
  }

  console.log('\n================================================================');
  console.log(' OVERALL CATALOG SUMMARY:');
  console.log(`  - Total Tenant Companies: ${companies.length}`);
  console.log(`  - Total Products to Create : ${totalToCreate}`);
  console.log(`  - Total Products to Update : ${totalToUpdate}`);
  console.log(`  - Total Standardized       : ${totalUnchanged}`);
  console.log(`  - Execution Mode           : ${isDryRun ? 'DRY-RUN (No DB mutations performed)' : 'APPLIED TO DB'}`);
  console.log('================================================================\n');

  if (isDryRun) {
    console.log('💡 To apply these changes to the live database, run:');
    console.log('   node scripts/ingest_complete_master_products.js --apply\n');
  }
}

run()
  .catch(err => {
    console.error('Fatal error during catalog ingestion:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
