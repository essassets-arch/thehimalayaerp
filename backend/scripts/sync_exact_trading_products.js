/**
 * Sync Exact Trading Products for Himalaya ERP
 * - Sets productType: 'TRADING' for the exact 121 requested products
 * - Ensures any products not in this list are NOT marked as 'TRADING' (demoted to 'MANUFACTURING')
 * - Ensures all tenant companies have all 121 trading products created/updated properly
 */

const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

function generateSku(name) {
  return name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 50);
}

// ─── COMPLETE LIST OF 121 TRADING PRODUCTS ───────────────────────────────────

const EXACT_TRADING_PRODUCTS = [
  // 1. FRP MOULDED GRATINGS (4 items)
  { name: 'FRP MOULDED GRATING 25MM', brand: 'HIMALAYA', category: 'FRP GRATINGS', subCategory: 'Moulded Grating', hsnCode: '39259090', unit: 'SQM', dispatchCategory: 'D2', productType: 'TRADING', description: 'FRP Moulded Grating 25mm thickness' },
  { name: 'FRP MOULDED GRATING 30MM', brand: 'HIMALAYA', category: 'FRP GRATINGS', subCategory: 'Moulded Grating', hsnCode: '39259090', unit: 'SQM', dispatchCategory: 'D2', productType: 'TRADING', description: 'FRP Moulded Grating 30mm thickness' },
  { name: 'FRP MOULDED GRATING 38MM', brand: 'HIMALAYA', category: 'FRP GRATINGS', subCategory: 'Moulded Grating', hsnCode: '39259090', unit: 'SQM', dispatchCategory: 'D2', productType: 'TRADING', description: 'FRP Moulded Grating 38mm thickness' },
  { name: 'FRP MOULDED FRATINGS 50MM', brand: 'HIMALAYA', category: 'FRP GRATINGS', subCategory: 'Moulded Grating', hsnCode: '39259090', unit: 'SQM', dispatchCategory: 'D2', productType: 'TRADING', description: 'FRP Moulded Grating 50mm thickness' },

  // 2. RCC HUME PIPES (3 items)
  { name: 'RCC HUME PIPE NP2 CLASS', brand: 'HIMALAYA', category: 'RCC PIPE', subCategory: 'Hume Pipe', hsnCode: '68109100', unit: 'MTR', dispatchCategory: 'D2', productType: 'TRADING', description: 'RCC Hume Pipe NP2 Class - Standard Quality' },
  { name: 'RCC HUME PIPE NP3 CLASS', brand: 'HIMALAYA', category: 'RCC PIPE', subCategory: 'Hume Pipe', hsnCode: '68109100', unit: 'MTR', dispatchCategory: 'D2', productType: 'TRADING', description: 'RCC Hume Pipe NP3 Class - Medium Quality' },
  { name: 'RCC HUME PIPE NP4 CLASS', brand: 'HIMALAYA', category: 'RCC PIPE', subCategory: 'Hume Pipe', hsnCode: '68109100', unit: 'MTR', dispatchCategory: 'D2', productType: 'TRADING', description: 'RCC Hume Pipe NP4 Class - Heavy Quality' },

  // 3. FRC SQUARE ROUND COVERS (FRCSQRC series - 20 items)
  { name: 'FRCSQRC24x24 LD3', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Round Cover', hsnCode: '68109990', unit: 'SET', weight: 59, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC SQ. Frame & RO. Cover 24x24 LD3' },
  { name: 'FRCSQRC24x24 LD5', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Round Cover', hsnCode: '68109990', unit: 'SET', weight: 70, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC SQ. Frame & RO. Cover 24x24 LD5' },
  { name: 'FRCSQRC24x24 MD10', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Round Cover', hsnCode: '68109990', unit: 'SET', weight: 93, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC SQ. Frame & RO. Cover 24x24 MD10' },
  { name: 'FRCSQRC30x30 LD5', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Round Cover', hsnCode: '68109990', unit: 'SET', weight: 122, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC SQ. Frame & RO. Cover 30x30 LD5' },
  { name: 'FRCSQRC30x30 MD10', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Round Cover', hsnCode: '68109990', unit: 'SET', weight: 147, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC SQ. Frame & RO. Cover 30x30 MD10' },
  { name: 'FRCSQRC30x30 HD20', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Round Cover', hsnCode: '68109990', unit: 'SET', weight: 170, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC SQ. Frame & RO. Cover 30x30 HD20' },
  { name: 'FRCSQRC33x33 HD20', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Round Cover', hsnCode: '68109990', unit: 'SET', weight: 234, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC SQ. Frame & RO. Cover 33x33 HD20' },
  { name: 'FRCSQRC34x34 LD5', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Round Cover', hsnCode: '68109990', unit: 'SET', weight: 159, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC SQ. Frame & RO. Cover 34x34 LD5' },
  { name: 'FRCSQRC34x34 HD20', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Round Cover', hsnCode: '68109990', unit: 'SET', weight: 264, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC SQ. Frame & RO. Cover 34x34 HD20' },
  { name: 'FRCSQRC34x34 EHD35', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Round Cover', hsnCode: '68109990', unit: 'SET', weight: 281, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC SQ. Frame & RO. Cover 34x34 EHD35' },
  { name: 'FRCSQRC36x36 LD5', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Round Cover', hsnCode: '68109990', unit: 'SET', weight: 173, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC SQ. Frame & RO. Cover 36x36 LD5' },
  { name: 'FRCSQRC36x36 MD10', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Round Cover', hsnCode: '68109990', unit: 'SET', weight: 210, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC SQ. Frame & RO. Cover 36x36 MD10' },
  { name: 'FRCSQRC36x36 HD20', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Round Cover', hsnCode: '68109990', unit: 'SET', weight: 285, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC SQ. Frame & RO. Cover 36x36 HD20' },
  { name: 'FRCSQRC36x36 EHD35', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Round Cover', hsnCode: '68109990', unit: 'SET', weight: 314, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC SQ. Frame & RO. Cover 36x36 EHD35' },
  { name: 'FRCSQRC42x42 LD5', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Round Cover', hsnCode: '68109990', unit: 'SET', weight: 237, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC SQ. Frame & RO. Cover 42x42 LD5' },
  { name: 'FRCSQRC42x42 HD20', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Round Cover', hsnCode: '68109990', unit: 'SET', weight: 385, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC SQ. Frame & RO. Cover 42x42 HD20' },
  { name: 'FRCSQRC42x42 EHD35', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Round Cover', hsnCode: '68109990', unit: 'SET', weight: 410, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC SQ. Frame & RO. Cover 42x42 EHD35' },
  { name: 'FRCSQRC48x48 LD5', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Round Cover', hsnCode: '68109990', unit: 'SET', weight: 272, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC SQ. Frame & RO. Cover 48x48 LD5' },
  { name: 'FRCSQRC48x48 HD20', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Round Cover', hsnCode: '68109990', unit: 'SET', weight: 566, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC SQ. Frame & RO. Cover 48x48 HD20' },
  { name: 'FRCSQRC48x48 EHD35', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Round Cover', hsnCode: '68109990', unit: 'SET', weight: 573, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC SQ. Frame & RO. Cover 48x48 EHD35' },

  // 4. FRC RECTANGULAR COVERS (FRCRFRC series - 24 items)
  { name: 'FRCRFRC24x18 LD1', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Rectangular Cover', hsnCode: '68109990', unit: 'SET', weight: 33, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Rectangular Cover 24x18 - LD1' },
  { name: 'FRCRFRC28x22 LD2', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Rectangular Cover', hsnCode: '68109990', unit: 'SET', weight: 53, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Rectangular Cover 28x22 - LD2' },
  { name: 'FRCRFRC28x22 LD5', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Rectangular Cover', hsnCode: '68109990', unit: 'SET', weight: 70, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Rectangular Cover 28x22 - LD5' },
  { name: 'FRCRFRC28x22 MD10', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Rectangular Cover', hsnCode: '68109990', unit: 'SET', weight: 95, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Rectangular Cover 28x22 - MD10' },
  { name: 'FRCRFRC30x24 LD3', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Rectangular Cover', hsnCode: '68109990', unit: 'SET', weight: 61, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Rectangular Cover 30x24 - LD3' },
  { name: 'FRCRFRC32x26 LD5', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Rectangular Cover', hsnCode: '68109990', unit: 'SET', weight: 102, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Rectangular Cover 32x26 - LD5' },
  { name: 'FRCRFRC32x26 MD10', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Rectangular Cover', hsnCode: '68109990', unit: 'SET', weight: 124, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Rectangular Cover 32x26 - MD10' },
  { name: 'FRCRFRC32x26 HD20', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Rectangular Cover', hsnCode: '68109990', unit: 'SET', weight: 159, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Rectangular Cover 32x26 - HD20' },
  { name: 'FRCRFRC36x24 MD10', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Rectangular Cover', hsnCode: '68109990', unit: 'SET', weight: 140, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Rectangular Cover 36x24 - MD10' },
  { name: 'FRCRFRC38x26 LD5', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Rectangular Cover', hsnCode: '68109990', unit: 'SET', weight: 120, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Rectangular Cover 38x26 - LD5' },
  { name: 'FRCRFRC44x26 LD5', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Rectangular Cover', hsnCode: '68109990', unit: 'SET', weight: 133, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Rectangular Cover 44x26 - LD5' },
  { name: 'FRCRFRC38x32 MD10', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Rectangular Cover', hsnCode: '68109990', unit: 'SET', weight: 191, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Rectangular Cover 38x32 - MD10' },
  { name: 'FRCRFRC38x32 HD20', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Rectangular Cover', hsnCode: '68109990', unit: 'SET', weight: 242, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Rectangular Cover 38x32 - HD20' },
  { name: 'FRCRFRC41x35.5 EHD35', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Rectangular Cover', hsnCode: '68109990', unit: 'SET', weight: 361, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Rectangular Cover 41x35.5 - EHD35' },
  { name: 'FRCRFRC44x26 MD10', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Rectangular Cover', hsnCode: '68109990', unit: 'SET', weight: 178, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Rectangular Cover 44x26 - MD10' },
  { name: 'FRCRFRC44x26 HD20', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Rectangular Cover', hsnCode: '68109990', unit: 'SET', weight: 275, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Rectangular Cover 44x26 - HD20' },
  { name: 'FRCRFRC44x34 MD10', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Rectangular Cover', hsnCode: '68109990', unit: 'SET', weight: 201, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Rectangular Cover 44x34 - MD10' },
  { name: 'FRCRFRC44x34 HD20', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Rectangular Cover', hsnCode: '68109990', unit: 'SET', weight: 309, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Rectangular Cover 44x34 - HD20' },
  { name: 'FRCRFRC42x48 HD20', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Rectangular Cover', hsnCode: '68109990', unit: 'SET', weight: 415, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Rectangular Cover 42x48 - HD20' },
  { name: 'FRCRFRC48x44 HD20', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Rectangular Cover', hsnCode: '68109990', unit: 'SET', weight: 456, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Rectangular Cover 48x44 - HD20' },
  { name: 'FRCRFRC52x42 EHD35', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Rectangular Cover', hsnCode: '68109990', unit: 'SET', weight: 485, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Rectangular Cover 52x42 - EHD35' },
  { name: 'FRCRFRC60x48 LD5', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Rectangular Cover', hsnCode: '68109990', unit: 'SET', weight: 335, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Rectangular Cover 60x48 - LD5' },
  { name: 'FRCRFRC60x48 HD20', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Rectangular Cover', hsnCode: '68109990', unit: 'SET', weight: 604, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Rectangular Cover 60x48 - HD20' },
  { name: 'FRCRFRC60x48 EHD35', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Rectangular Cover', hsnCode: '68109990', unit: 'SET', weight: 609, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Rectangular Cover 60x48 - EHD35' },

  // 5. FRC SQUARE FRAME SQUARE COVER (FRCSFSC series - 28 items)
  { name: 'FRCSFSC12x12', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Frame Square Cover', hsnCode: '68109990', unit: 'SET', weight: 11, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Square Frame Square Cover 12x12' },
  { name: 'FRCSFSC15x15', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Frame Square Cover', hsnCode: '68109990', unit: 'SET', weight: 18, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Square Frame Square Cover 15x15' },
  { name: 'FRCSFSC18x18 LD1', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Frame Square Cover', hsnCode: '68109990', unit: 'SET', weight: 26, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Square Frame Square Cover 18x18 LD1' },
  { name: 'FRCSFSC18x18 MD10', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Frame Square Cover', hsnCode: '68109990', unit: 'SET', weight: 67, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Square Frame Square Cover 18x18 MD10' },
  { name: 'FRCSFSC18x18 HD20', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Frame Square Cover', hsnCode: '68109990', unit: 'SET', weight: 67, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Square Frame Square Cover 18x18 HD20' },
  { name: 'FRCSFSC24x24 LD2', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Frame Square Cover', hsnCode: '68109990', unit: 'SET', weight: 47, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Square Frame Square Cover 24x24 LD2' },
  { name: 'FRCSFSC24x24 LD5', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Frame Square Cover', hsnCode: '68109990', unit: 'SET', weight: 71, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Square Frame Square Cover 24x24 LD5' },
  { name: 'FRCSFSC24x24 HD20', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Frame Square Cover', hsnCode: '68109990', unit: 'SET', weight: 109, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Square Frame Square Cover 24x24 HD20' },
  { name: 'FRCSFSC27x27 LD3', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Frame Square Cover', hsnCode: '68109990', unit: 'SET', weight: 64, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Square Frame Square Cover 27x27 LD3' },
  { name: 'FRCSFSC30x30 LD5', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Frame Square Cover', hsnCode: '68109990', unit: 'SET', weight: 112, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Square Frame Square Cover 30x30 LD5' },
  { name: 'FRCSFSC30x30 MD10', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Frame Square Cover', hsnCode: '68109990', unit: 'SET', weight: 152, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Square Frame Square Cover 30x30 MD10' },
  { name: 'FRCSFSC30x30 HD20', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Frame Square Cover', hsnCode: '68109990', unit: 'SET', weight: 189, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Square Frame Square Cover 30x30 HD20' },
  { name: 'FRCSFSC30x30 EHD35', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Frame Square Cover', hsnCode: '68109990', unit: 'SET', weight: 189, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Square Frame Square Cover 30x30 EHD35' },
  { name: 'FRCSFSC32.5x32.5 LD5', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Frame Square Cover', hsnCode: '68109990', unit: 'SET', weight: 110, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Square Frame Square Cover 32.5x32.5 LD5' },
  { name: 'FRCSFSC32.5x32.5 MD10', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Frame Square Cover', hsnCode: '68109990', unit: 'SET', weight: 172, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Square Frame Square Cover 32.5x32.5 MD10' },
  { name: 'FRCSFSC36x36 HD20', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Frame Square Cover', hsnCode: '68109990', unit: 'SET', weight: 273, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Square Frame Square Cover 36x36 HD20' },
  { name: 'FRCSFSC36x36 EHD35', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Frame Square Cover', hsnCode: '68109990', unit: 'SET', weight: 289, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Square Frame Square Cover 36x36 EHD35' },
  { name: 'FRCSFSC38x38 LD5', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Frame Square Cover', hsnCode: '68109990', unit: 'SET', weight: 145, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Square Frame Square Cover 38x38 LD5' },
  { name: 'FRCSFSC42x42 MD10', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Frame Square Cover', hsnCode: '68109990', unit: 'SET', weight: 282, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Square Frame Square Cover 42x42 MD10' },
  { name: 'FRCSFSC42x42 HD20', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Frame Square Cover', hsnCode: '68109990', unit: 'SET', weight: 374, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Square Frame Square Cover 42x42 HD20' },
  { name: 'FRCSFSC42x42 EHD35', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Frame Square Cover', hsnCode: '68109990', unit: 'SET', weight: 384, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Square Frame Square Cover 42x42 EHD35' },
  { name: 'FRCSFSC48x48 HD20', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Frame Square Cover', hsnCode: '68109990', unit: 'SET', weight: 493, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Square Frame Square Cover 48x48 HD20' },
  { name: 'FRCSFSC48x48 EHD35', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Frame Square Cover', hsnCode: '68109990', unit: 'SET', weight: 501, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Square Frame Square Cover 48x48 EHD35' },
  { name: 'FRCSFSC55x55 HD20', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Frame Square Cover', hsnCode: '68109990', unit: 'SET', weight: 825, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Square Frame Square Cover 55x55 HD20' },
  { name: 'FRCSFSC55x55 EHD35', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Frame Square Cover', hsnCode: '68109990', unit: 'SET', weight: 825, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Square Frame Square Cover 55x55 EHD35' },
  { name: 'FRCSFSC63x63 HD20', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Frame Square Cover', hsnCode: '68109990', unit: 'SET', weight: 990, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Square Frame Square Cover 63x63 HD20' },
  { name: 'FRCSFSC63x63 EHD35', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Frame Square Cover', hsnCode: '68109990', unit: 'SET', weight: 990, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Square Frame Square Cover 63x63 EHD35' },
  { name: 'FRCSFSC67x67 HD20', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Frame Square Cover', hsnCode: '68109990', unit: 'SET', weight: 990, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Square Frame Square Cover 67x67 HD20' },
  { name: 'FRCSFSC67x67 EHD35', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Square Frame Square Cover', hsnCode: '68109990', unit: 'SET', weight: 990, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Square Frame Square Cover 67x67 EHD35' },

  // 6. FRC ROUND FRAME ROUND COVER (FRCROFROC series - 7 items)
  { name: 'FRCROFROC30 dia MD10', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Round Frame Round Cover', hsnCode: '68109990', unit: 'SET', weight: 109, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC RO. Frame & RO. Cover 30 dia MD10' },
  { name: 'FRCROFROC30 dia HD20', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Round Frame Round Cover', hsnCode: '68109990', unit: 'SET', weight: 143, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC RO. Frame & RO. Cover 30 dia HD20' },
  { name: 'FRCROFROC31.5 dia HD20', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Round Frame Round Cover', hsnCode: '68109990', unit: 'SET', weight: 173, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC RO. Frame & RO. Cover 31.5 dia HD20' },
  { name: 'FRCROFROC31.5 dia EHD35', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Round Frame Round Cover', hsnCode: '68109990', unit: 'SET', weight: 189, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC RO. Frame & RO. Cover 31.5 dia EHD35' },
  { name: 'FRCROFROC33 dia HD20', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Round Frame Round Cover', hsnCode: '68109990', unit: 'SET', weight: 164, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC RO. Frame & RO. Cover 33 dia HD20' },
  { name: 'FRCROFROC34 dia HD20', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Round Frame Round Cover', hsnCode: '68109990', unit: 'SET', weight: 205, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC RO. Frame & RO. Cover 34 dia HD20' },
  { name: 'FRCROFROC34 dia EHD35', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Round Frame Round Cover', hsnCode: '68109990', unit: 'SET', weight: 228, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC RO. Frame & RO. Cover 34 dia EHD35' },

  // 7. FRC CHECKER PLATE / CATCHPIT (FRCCP series - 22 items)
  { name: 'FRCCP24x24 LD5', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Catchpit Cover', hsnCode: '68109990', unit: 'SET', weight: 68, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Catchpit Cover 24x24 LD5' },
  { name: 'FRCCP24x24 HD20', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Catchpit Cover', hsnCode: '68109990', unit: 'SET', weight: 109, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Catchpit Cover 24x24 HD20' },
  { name: 'FRCCP28x22 MD10', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Catchpit Cover', hsnCode: '68109990', unit: 'SET', weight: 95, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Catchpit Cover 28x22 MD10' },
  { name: 'FRCCP30x30 LD5', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Catchpit Cover', hsnCode: '68109990', unit: 'SET', weight: 110, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Catchpit Cover 30x30 LD5' },
  { name: 'FRCCP30x30 MD10', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Catchpit Cover', hsnCode: '68109990', unit: 'SET', weight: 144, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Catchpit Cover 30x30 MD10' },
  { name: 'FRCCP30x30 HD20', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Catchpit Cover', hsnCode: '68109990', unit: 'SET', weight: 187, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Catchpit Cover 30x30 HD20' },
  { name: 'FRCCP32x26 LD5', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Catchpit Cover', hsnCode: '68109990', unit: 'SET', weight: 102, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Catchpit Cover 32x26 LD5' },
  { name: 'FRCCP32x26 MD10', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Catchpit Cover', hsnCode: '68109990', unit: 'SET', weight: 124, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Catchpit Cover 32x26 MD10' },
  { name: 'FRCCP32x26 HD20', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Catchpit Cover', hsnCode: '68109990', unit: 'SET', weight: 159, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Catchpit Cover 32x26 HD20' },
  { name: 'FRCCP32.5x32.5 LD5', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Catchpit Cover', hsnCode: '68109990', unit: 'SET', weight: 110, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Catchpit Cover 32.5x32.5 LD5' },
  { name: 'FRCCP32.5x32.5 MD10', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Catchpit Cover', hsnCode: '68109990', unit: 'SET', weight: 177, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Catchpit Cover 32.5x32.5 MD10' },
  { name: 'FRCCP36x36 HD20', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Catchpit Cover', hsnCode: '68109990', unit: 'SET', weight: 255, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Catchpit Cover 36x36 HD20' },
  { name: 'FRCCP36x36 EHD35', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Catchpit Cover', hsnCode: '68109990', unit: 'SET', weight: 276, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Catchpit Cover 36x36 EHD35' },
  { name: 'FRCCP42x42 MD10', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Catchpit Cover', hsnCode: '68109990', unit: 'SET', weight: 282, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Catchpit Cover 42x42 MD10' },
  { name: 'FRCCP42x42 HD20', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Catchpit Cover', hsnCode: '68109990', unit: 'SET', weight: 334, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Catchpit Cover 42x42 HD20' },
  { name: 'FRCCP42x42 EHD35', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Catchpit Cover', hsnCode: '68109990', unit: 'SET', weight: 344, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Catchpit Cover 42x42 EHD35' },
  { name: 'FRCCP44x34 MD10', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Catchpit Cover', hsnCode: '68109990', unit: 'SET', weight: 201, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Catchpit Cover 44x34 MD10' },
  { name: 'FRCCP44x34 HD20', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Catchpit Cover', hsnCode: '68109990', unit: 'SET', weight: 303, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Catchpit Cover 44x34 HD20' },
  { name: 'FRCCP48x48 HD20', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Catchpit Cover', hsnCode: '68109990', unit: 'SET', weight: 476, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Catchpit Cover 48x48 HD20' },
  { name: 'FRCCP48x48 EHD35', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Catchpit Cover', hsnCode: '68109990', unit: 'SET', weight: 486, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Catchpit Cover 48x48 EHD35' },
  { name: 'FRCCP60x48 HD20', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Catchpit Cover', hsnCode: '68109990', unit: 'SET', weight: 609, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Catchpit Cover 60x48 HD20' },
  { name: 'FRCCP60x48 EHD35', brand: 'HIMALAYA', category: 'FRC COVER', subCategory: 'Catchpit Cover', hsnCode: '68109990', unit: 'SET', weight: 609, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Catchpit Cover 60x48 EHD35' },

  // 8. FRC GT / TRENCH / PERFORATED TRENCH (13 items)
  { name: 'FRCGT ONLY CO12x12', brand: 'HIMALAYA', category: 'OTHERS', subCategory: 'GT Cover', hsnCode: '68109990', unit: 'SET', weight: 2, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC GT Cover - Only Cover 12x12' },
  { name: 'FRCGT FC 12x12', brand: 'HIMALAYA', category: 'OTHERS', subCategory: 'GT Cover', hsnCode: '68109990', unit: 'SET', weight: 9, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC GT Cover 12x12 Full Cover' },
  { name: 'FRCTSOC 24 x 12x2', brand: 'HIMALAYA', category: 'OTHERS', subCategory: 'Trench Cover', hsnCode: '68109990', unit: 'SET', weight: 23, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Trench Side Open Cover 24 x 12x2' },
  { name: 'FRCTSOC 28 x 12x2', brand: 'HIMALAYA', category: 'OTHERS', subCategory: 'Trench Cover', hsnCode: '68109990', unit: 'SET', weight: 27, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Trench Side Open Cover 28 x 12x2' },
  { name: 'FRCTSOC 24 x 18x2', brand: 'HIMALAYA', category: 'OTHERS', subCategory: 'Trench Cover', hsnCode: '68109990', unit: 'SET', weight: 32, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Trench Side Open Cover 24 x 18x2' },
  { name: 'FRCTSOC 24 x 24x2R', brand: 'HIMALAYA', category: 'OTHERS', subCategory: 'Trench Cover', hsnCode: '68109990', unit: 'SET', weight: 45, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Trench Side Open Cover 24 x 24x2R' },
  { name: 'FRCTSOC 36 x 18x2', brand: 'HIMALAYA', category: 'OTHERS', subCategory: 'Trench Cover', hsnCode: '68109990', unit: 'SET', weight: 100, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Trench Side Open Cover 36 x 18x2' },
  { name: 'FRCTSOC 36 x 24x2R', brand: 'HIMALAYA', category: 'OTHERS', subCategory: 'Trench Cover', hsnCode: '68109990', unit: 'SET', weight: 74, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Trench Side Open Cover 36 x 24x2R' },
  { name: 'FRCTSOC 36 x 24x4R', brand: 'HIMALAYA', category: 'OTHERS', subCategory: 'Trench Cover', hsnCode: '68109990', unit: 'SET', weight: 148, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Trench Side Open Cover 36 x 24x4R' },
  { name: 'FRCTPEC 24 x 12x2', brand: 'HIMALAYA', category: 'OTHERS', subCategory: 'Perforated Trench Cover', hsnCode: '68109990', unit: 'SET', weight: 23, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Perforated Trench Cover 24 x 12x2' },
  { name: 'FRCTPEC 24 x 16x2', brand: 'HIMALAYA', category: 'OTHERS', subCategory: 'Perforated Trench Cover', hsnCode: '68109990', unit: 'SET', weight: 33, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Perforated Trench Cover 24 x 16x2' },
  { name: 'FRCTPEC 24 x 18x2', brand: 'HIMALAYA', category: 'OTHERS', subCategory: 'Perforated Trench Cover', hsnCode: '68109990', unit: 'SET', weight: 32, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Perforated Trench Cover 24 x 18x2' },
  { name: 'FRCTPEC 30 x 24x2', brand: 'HIMALAYA', category: 'OTHERS', subCategory: 'Perforated Trench Cover', hsnCode: '68109990', unit: 'SET', weight: 56, dispatchCategory: 'D2', productType: 'TRADING', description: 'FRC Perforated Trench Cover 30 x 24x2' }
];

async function applyTradingProducts() {
  console.log(`Starting synchronization for ${EXACT_TRADING_PRODUCTS.length} Trading Products...`);

  const allowedTradingNames = new Set(EXACT_TRADING_PRODUCTS.map(p => p.name.toUpperCase()));

  const companies = await prisma.company.findMany();
  console.log(`Found ${companies.length} companies in DB.`);

  for (const comp of companies) {
    console.log(`\n============================================================`);
    console.log(` Processing Company: ${comp.name} (${comp.id})`);
    console.log(`============================================================`);

    // 1. Demote any current TRADING products that are NOT in the allowed list
    const currentCompTrading = await prisma.product.findMany({
      where: {
        companyId: comp.id,
        productType: 'TRADING'
      }
    });

    let demotedCount = 0;
    for (const prod of currentCompTrading) {
      if (!allowedTradingNames.has(prod.name.toUpperCase())) {
        await prisma.product.update({
          where: { id: prod.id },
          data: {
            productType: 'MANUFACTURING',
            dispatchCategory: 'D1'
          }
        });
        demotedCount++;
      }
    }
    console.log(`Demoted ${demotedCount} non-trading products to 'MANUFACTURING'.`);

    // 2. Upsert each of the 121 Trading Products for this company
    let createdCount = 0;
    let updatedCount = 0;

    for (const item of EXACT_TRADING_PRODUCTS) {
      const sku = generateSku(item.name);
      
      const existing = await prisma.product.findFirst({
        where: {
          companyId: comp.id,
          OR: [
            { name: { equals: item.name, mode: 'insensitive' } },
            { sku: sku }
          ]
        }
      });

      if (existing) {
        await prisma.product.update({
          where: { id: existing.id },
          data: {
            name: item.name,
            sku: existing.sku || sku,
            brand: item.brand,
            category: item.category,
            variantDetails: item.subCategory,
            productType: 'TRADING',
            dispatchCategory: item.dispatchCategory || 'D2',
            unit: item.unit,
            weight: item.weight ?? existing.weight,
            hsnCode: item.hsnCode,
            gstRate: 18,
            description: item.description,
            isActive: true
          }
        });
        updatedCount++;
      } else {
        const randomId = crypto.randomBytes(5).toString('hex');
        await prisma.product.create({
          data: {
            publicId: `PRD-${randomId}`,
            companyId: comp.id,
            name: item.name,
            sku: sku,
            brand: item.brand,
            category: item.category,
            variantDetails: item.subCategory,
            productType: 'TRADING',
            dispatchCategory: item.dispatchCategory || 'D2',
            unit: item.unit,
            unitPrice: 0,
            minimumStock: 0,
            weight: item.weight ?? null,
            hsnCode: item.hsnCode,
            gstRate: 18,
            description: item.description,
            isActive: true
          }
        });
        createdCount++;
      }
    }

    console.log(`Created: ${createdCount}, Updated: ${updatedCount}`);

    // Verify company TRADING count
    const finalTrading = await prisma.product.findMany({
      where: {
        companyId: comp.id,
        productType: 'TRADING'
      },
      select: { name: true }
    });

    console.log(`Final TRADING products count for ${comp.name}: ${finalTrading.length} (Expected: ${EXACT_TRADING_PRODUCTS.length})`);
  }

  console.log('\n============================================================');
  console.log(' ALL COMPANIES SYNCHRONIZED SUCCESSFULLY!');
  console.log('============================================================\n');
}

applyTradingProducts()
  .catch(err => {
    console.error('Error syncing trading products:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
