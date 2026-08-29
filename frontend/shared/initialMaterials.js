// Master Raw Materials Inventory (Authoritative 217 items from Master CSV)
export const INITIAL_MATERIALS = [
  {
    "id": "RM-HM107",
    "code": "HM107",
    "material": "Sandpaper (Grit 400)",
    "unit": "PCS",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "Sandpaper (Grit 400)",
    "transactions": []
  },
  {
    "id": "RM-HM106",
    "code": "HM106",
    "material": "Sandpaper (Grit 320)",
    "unit": "PCS",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "Sandpaper (Grit 320)",
    "transactions": []
  },
  {
    "id": "RM-HM105",
    "code": "HM105",
    "material": "Sandpaper (Grit 220)",
    "unit": "PCS",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "Sandpaper (Grit 220)",
    "transactions": []
  },
  {
    "id": "RM-HM104",
    "code": "HM104",
    "material": "Sandpaper (Grit 180)",
    "unit": "PCS",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "Sandpaper (Grit 180)",
    "transactions": []
  },
  {
    "id": "RM-HM103",
    "code": "HM103",
    "material": "Sandpaper (Grit 120)",
    "unit": "PCS",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "Sandpaper (Grit 120)",
    "transactions": []
  },
  {
    "id": "RM-HM102",
    "code": "HM102",
    "material": "Sandpaper (Grit 80)",
    "unit": "PCS",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "Sandpaper (Grit 80)",
    "transactions": []
  },
  {
    "id": "RM-HM216",
    "code": "HM216",
    "material": "Hunndi",
    "unit": "Pcs",
    "stock": 100,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Fast Moving",
    "description": "Hunndi",
    "transactions": [
      {
        "id": "TX-INIT-HM216",
        "type": "Stock In",
        "quantity": 100,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM215",
    "code": "HM215",
    "material": "iron hammer",
    "unit": "Pcs",
    "stock": 4,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Fast Moving",
    "description": "iron hammer",
    "transactions": [
      {
        "id": "TX-INIT-HM215",
        "type": "Stock In",
        "quantity": 4,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM214",
    "code": "HM214",
    "material": "c clamp 12",
    "unit": "Pcs",
    "stock": 4,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Fast Moving",
    "description": "c clamp 12",
    "transactions": [
      {
        "id": "TX-INIT-HM214",
        "type": "Stock In",
        "quantity": 4,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM213",
    "code": "HM213",
    "material": "c clamp 4",
    "unit": "Pcs",
    "stock": 4,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Slow Moving",
    "description": "c clamp 4",
    "transactions": [
      {
        "id": "TX-INIT-HM213",
        "type": "Stock In",
        "quantity": 4,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM212",
    "code": "HM212",
    "material": "golden brown pigment",
    "unit": "Kg",
    "stock": 3,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Fast Moving",
    "description": "golden brown pigment",
    "transactions": [
      {
        "id": "TX-INIT-HM212",
        "type": "Stock In",
        "quantity": 3,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM211",
    "code": "HM211",
    "material": "TERRA COATA Pigment",
    "unit": "PCS",
    "stock": 12,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Slow Moving",
    "description": "TERRA COATA Pigment",
    "transactions": [
      {
        "id": "TX-INIT-HM211",
        "type": "Stock In",
        "quantity": 12,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM210",
    "code": "HM210",
    "material": "BROWAN Pigment",
    "unit": "PCS",
    "stock": 1,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Non-Moving",
    "description": "BROWAN Pigment",
    "transactions": [
      {
        "id": "TX-INIT-HM210",
        "type": "Stock In",
        "quantity": 1,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM209",
    "code": "HM209",
    "material": "FAVDE HANDLE",
    "unit": "PCS",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "FAVDE HANDLE",
    "transactions": []
  },
  {
    "id": "RM-HM208",
    "code": "HM208",
    "material": "Thundor File",
    "unit": "PCS",
    "stock": 1,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Fast Moving",
    "description": "Thundor File",
    "transactions": [
      {
        "id": "TX-INIT-HM208",
        "type": "Stock In",
        "quantity": 1,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM207",
    "code": "HM207",
    "material": "Flat File",
    "unit": "PCS",
    "stock": 1,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Slow Moving",
    "description": "Flat File",
    "transactions": [
      {
        "id": "TX-INIT-HM207",
        "type": "Stock In",
        "quantity": 1,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM206",
    "code": "HM206",
    "material": "Round File",
    "unit": "PCS",
    "stock": 1,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Slow Moving",
    "description": "Round File",
    "transactions": [
      {
        "id": "TX-INIT-HM206",
        "type": "Stock In",
        "quantity": 1,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM205",
    "code": "HM205",
    "material": "Pliers (Pakkad)",
    "unit": "PCS",
    "stock": 2,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Slow Moving",
    "description": "Pliers (Pakkad)",
    "transactions": [
      {
        "id": "TX-INIT-HM205",
        "type": "Stock In",
        "quantity": 2,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM204",
    "code": "HM204",
    "material": "handle",
    "unit": "PCS",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "handle",
    "transactions": []
  },
  {
    "id": "RM-HM203",
    "code": "HM203",
    "material": "bear disc 36",
    "unit": "PCS",
    "stock": 50,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Slow Moving",
    "description": "bear disc 36",
    "transactions": [
      {
        "id": "TX-INIT-HM203",
        "type": "Stock In",
        "quantity": 50,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM202",
    "code": "HM202",
    "material": "sending machine pad",
    "unit": "PCS",
    "stock": 1,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Fast Moving",
    "description": "sending machine pad",
    "transactions": [
      {
        "id": "TX-INIT-HM202",
        "type": "Stock In",
        "quantity": 1,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM201",
    "code": "HM201",
    "material": "welcro paper 600",
    "unit": "PCS",
    "stock": 50,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Fast Moving",
    "description": "welcro paper 600",
    "transactions": [
      {
        "id": "TX-INIT-HM201",
        "type": "Stock In",
        "quantity": 50,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM200",
    "code": "HM200",
    "material": "welcro paper 400",
    "unit": "PCS",
    "stock": 40,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Fast Moving",
    "description": "welcro paper 400",
    "transactions": [
      {
        "id": "TX-INIT-HM200",
        "type": "Stock In",
        "quantity": 40,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM199",
    "code": "HM199",
    "material": "welcro paper 320",
    "unit": "PCS",
    "stock": 45,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Fast Moving",
    "description": "welcro paper 320",
    "transactions": [
      {
        "id": "TX-INIT-HM199",
        "type": "Stock In",
        "quantity": 45,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM198",
    "code": "HM198",
    "material": "welcro paper 220",
    "unit": "PCS",
    "stock": 15,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Fast Moving",
    "description": "welcro paper 220",
    "transactions": [
      {
        "id": "TX-INIT-HM198",
        "type": "Stock In",
        "quantity": 15,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM197",
    "code": "HM197",
    "material": "welcro paper 180",
    "unit": "PCS",
    "stock": 28,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Fast Moving",
    "description": "welcro paper 180",
    "transactions": [
      {
        "id": "TX-INIT-HM197",
        "type": "Stock In",
        "quantity": 28,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM196",
    "code": "HM196",
    "material": "welcro paper 120",
    "unit": "PCS",
    "stock": 60,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Slow Moving",
    "description": "welcro paper 120",
    "transactions": [
      {
        "id": "TX-INIT-HM196",
        "type": "Stock In",
        "quantity": 60,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM195",
    "code": "HM195",
    "material": "welcro paper 80",
    "unit": "PCS",
    "stock": 75,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Slow Moving",
    "description": "welcro paper 80",
    "transactions": [
      {
        "id": "TX-INIT-HM195",
        "type": "Stock In",
        "quantity": 75,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM194",
    "code": "HM194",
    "material": "bear disc 120",
    "unit": "PCS",
    "stock": 30,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Non-Moving",
    "description": "bear disc 120",
    "transactions": [
      {
        "id": "TX-INIT-HM194",
        "type": "Stock In",
        "quantity": 30,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM193",
    "code": "HM193",
    "material": "bear disc 80",
    "unit": "PCS",
    "stock": 70,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Fast Moving",
    "description": "bear disc 80",
    "transactions": [
      {
        "id": "TX-INIT-HM193",
        "type": "Stock In",
        "quantity": 70,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM192",
    "code": "HM192",
    "material": "RED BRICK PIGMENT",
    "unit": "PCS",
    "stock": 20,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Slow Moving",
    "description": "RED BRICK PIGMENT",
    "transactions": [
      {
        "id": "TX-INIT-HM192",
        "type": "Stock In",
        "quantity": 20,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM191",
    "code": "HM191",
    "material": "c clamp big",
    "unit": "PCS",
    "stock": 4,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Slow Moving",
    "description": "c clamp big",
    "transactions": [
      {
        "id": "TX-INIT-HM191",
        "type": "Stock In",
        "quantity": 4,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM190",
    "code": "HM190",
    "material": "buffing machine",
    "unit": "PCS",
    "stock": 2,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Fast Moving",
    "description": "buffing machine",
    "transactions": [
      {
        "id": "TX-INIT-HM190",
        "type": "Stock In",
        "quantity": 2,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM189",
    "code": "HM189",
    "material": "WELDING ROD",
    "unit": "PCS",
    "stock": 180,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Non-Moving",
    "description": "WELDING ROD",
    "transactions": [
      {
        "id": "TX-INIT-HM189",
        "type": "Stock In",
        "quantity": 180,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM188",
    "code": "HM188",
    "material": "welcro paper 600 grit",
    "unit": "PCS",
    "stock": 50,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Slow Moving",
    "description": "welcro paper 600 grit",
    "transactions": [
      {
        "id": "TX-INIT-HM188",
        "type": "Stock In",
        "quantity": 50,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM187",
    "code": "HM187",
    "material": "bear disc 120",
    "unit": "PCS",
    "stock": 30,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Fast Moving",
    "description": "bear disc 120",
    "transactions": [
      {
        "id": "TX-INIT-HM187",
        "type": "Stock In",
        "quantity": 30,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM186-B",
    "code": "HM186-B",
    "material": "bear disc 80",
    "unit": "PCS",
    "stock": 70,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Slow Moving",
    "description": "bear disc 80",
    "transactions": [
      {
        "id": "TX-INIT-HM186-B",
        "type": "Stock In",
        "quantity": 70,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM186",
    "code": "HM186",
    "material": "sand paper 180",
    "unit": "PCS",
    "stock": 28,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Fast Moving",
    "description": "sand paper 180",
    "transactions": [
      {
        "id": "TX-INIT-HM186",
        "type": "Stock In",
        "quantity": 28,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM185",
    "code": "HM185",
    "material": "MEASURING TAPE",
    "unit": "NOS",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "MEASURING TAPE",
    "transactions": []
  },
  {
    "id": "RM-HM184",
    "code": "HM184",
    "material": "bucket 12no",
    "unit": "PCS",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "bucket 12no",
    "transactions": []
  },
  {
    "id": "RM-HM183",
    "code": "HM183",
    "material": "BALTI MID",
    "unit": "PCS",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "BALTI MID",
    "transactions": []
  },
  {
    "id": "RM-HM182",
    "code": "HM182",
    "material": "steel putty blade 5/6\"",
    "unit": "PCS",
    "stock": 30,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Non-Moving",
    "description": "steel putty blade 5/6\"",
    "transactions": [
      {
        "id": "TX-INIT-HM182",
        "type": "Stock In",
        "quantity": 30,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM181",
    "code": "HM181",
    "material": "steel putty blade 8\"",
    "unit": "PCS",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "steel putty blade 8\"",
    "transactions": []
  },
  {
    "id": "RM-HM180",
    "code": "HM180",
    "material": "steel putty blade 50*150mm",
    "unit": "PCS",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "steel putty blade 50*150mm",
    "transactions": []
  },
  {
    "id": "RM-HM179",
    "code": "HM179",
    "material": "p v",
    "unit": "PCS",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "p v",
    "transactions": []
  },
  {
    "id": "RM-HM178",
    "code": "HM178",
    "material": "sterar 10mm",
    "unit": "PCS",
    "stock": 22,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Fast Moving",
    "description": "sterar 10mm",
    "transactions": [
      {
        "id": "TX-INIT-HM178",
        "type": "Stock In",
        "quantity": 22,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM177",
    "code": "HM177",
    "material": "sterar 8mm",
    "unit": "PCS",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "sterar 8mm",
    "transactions": []
  },
  {
    "id": "RM-HM176",
    "code": "HM176",
    "material": "sand paper 600",
    "unit": "PCS",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "sand paper 600",
    "transactions": []
  },
  {
    "id": "RM-HM175",
    "code": "HM175",
    "material": "emery paper 80",
    "unit": "PCS",
    "stock": 1630,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Slow Moving",
    "description": "emery paper 80",
    "transactions": [
      {
        "id": "TX-INIT-HM175",
        "type": "Stock In",
        "quantity": 1630,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM174",
    "code": "HM174",
    "material": "D A GREY",
    "unit": "PCS",
    "stock": 45,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Fast Moving",
    "description": "D A GREY",
    "transactions": [
      {
        "id": "TX-INIT-HM174",
        "type": "Stock In",
        "quantity": 45,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM173",
    "code": "HM173",
    "material": "balti small 8 NO",
    "unit": "PCS",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "balti small 8 NO",
    "transactions": []
  },
  {
    "id": "RM-HM172",
    "code": "HM172",
    "material": "NYLON BLOCK PATTI SMALL",
    "unit": "NOS",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "NYLON BLOCK PATTI SMALL",
    "transactions": []
  },
  {
    "id": "RM-HM171",
    "code": "HM171",
    "material": "dhaga",
    "unit": "BOX",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "dhaga",
    "transactions": []
  },
  {
    "id": "RM-HM170",
    "code": "HM170",
    "material": "rassi/plastic sulti",
    "unit": "KGS",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "rassi/plastic sulti",
    "transactions": []
  },
  {
    "id": "RM-HM169",
    "code": "HM169",
    "material": "grey moja",
    "unit": "PAIR",
    "stock": 35,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Fast Moving",
    "description": "grey moja",
    "transactions": [
      {
        "id": "TX-INIT-HM169",
        "type": "Stock In",
        "quantity": 35,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM168",
    "code": "HM168",
    "material": "wire tape",
    "unit": "PKT",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "wire tape",
    "transactions": []
  },
  {
    "id": "RM-HM167",
    "code": "HM167",
    "material": "write angle",
    "unit": "PCS",
    "stock": 2,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Fast Moving",
    "description": "write angle",
    "transactions": [
      {
        "id": "TX-INIT-HM167",
        "type": "Stock In",
        "quantity": 2,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM166",
    "code": "HM166",
    "material": "allen key",
    "unit": "PCS",
    "stock": 1,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Fast Moving",
    "description": "allen key",
    "transactions": [
      {
        "id": "TX-INIT-HM166",
        "type": "Stock In",
        "quantity": 1,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM165",
    "code": "HM165",
    "material": "handle patra",
    "unit": "PCS",
    "stock": 1,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Fast Moving",
    "description": "handle patra",
    "transactions": [
      {
        "id": "TX-INIT-HM165",
        "type": "Stock In",
        "quantity": 1,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM164",
    "code": "HM164",
    "material": "pvc farsi white",
    "unit": "PCS",
    "stock": 42,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Fast Moving",
    "description": "pvc farsi white",
    "transactions": [
      {
        "id": "TX-INIT-HM164",
        "type": "Stock In",
        "quantity": 42,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM163",
    "code": "HM163",
    "material": "Fawda",
    "unit": "PCS",
    "stock": 1,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Fast Moving",
    "description": "Fawda",
    "transactions": [
      {
        "id": "TX-INIT-HM163",
        "type": "Stock In",
        "quantity": 1,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM162",
    "code": "HM162",
    "material": "Ecodrive Belt",
    "unit": "PCS",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "Ecodrive Belt",
    "transactions": []
  },
  {
    "id": "RM-HM161",
    "code": "HM161",
    "material": "Acid Gloves",
    "unit": "SET",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "Acid Gloves",
    "transactions": []
  },
  {
    "id": "RM-HM160",
    "code": "HM160",
    "material": "Reileas Chemicale",
    "unit": "BRL(200LTR)",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "Reileas Chemicale",
    "transactions": []
  },
  {
    "id": "RM-HM159",
    "code": "HM159",
    "material": "Admixture CHEMICAL",
    "unit": "BRL'",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "Admixture CHEMICAL",
    "transactions": []
  },
  {
    "id": "RM-HM158",
    "code": "HM158",
    "material": "Grees",
    "unit": "KG",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "Grees",
    "transactions": []
  },
  {
    "id": "RM-HM157",
    "code": "HM157",
    "material": "Wire BUNDLE",
    "unit": "PCS",
    "stock": 1,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Fast Moving",
    "description": "Wire BUNDLE",
    "transactions": [
      {
        "id": "TX-INIT-HM157",
        "type": "Stock In",
        "quantity": 1,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM156",
    "code": "HM156",
    "material": "Belcha",
    "unit": "NOS",
    "stock": 3,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Fast Moving",
    "description": "Belcha",
    "transactions": [
      {
        "id": "TX-INIT-HM156",
        "type": "Stock In",
        "quantity": 3,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM155",
    "code": "HM155",
    "material": "Cloth Gloves",
    "unit": "SET",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "Cloth Gloves",
    "transactions": []
  },
  {
    "id": "RM-HM154",
    "code": "HM154",
    "material": "fingure",
    "unit": "PKT",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "fingure",
    "transactions": []
  },
  {
    "id": "RM-HM153",
    "code": "HM153",
    "material": "glinder paid wheel",
    "unit": "PCS",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "glinder paid wheel",
    "transactions": []
  },
  {
    "id": "RM-HM152",
    "code": "HM152",
    "material": "iron cutter disc",
    "unit": "PCS",
    "stock": 75,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Non-Moving",
    "description": "iron cutter disc",
    "transactions": [
      {
        "id": "TX-INIT-HM152",
        "type": "Stock In",
        "quantity": 75,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM151",
    "code": "HM151",
    "material": "patra",
    "unit": "PCS",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "patra",
    "transactions": []
  },
  {
    "id": "RM-HM150",
    "code": "HM150",
    "material": "hydralic oil",
    "unit": "LTR",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "hydralic oil",
    "transactions": []
  },
  {
    "id": "RM-HM149",
    "code": "HM149",
    "material": "hamer",
    "unit": "PCS",
    "stock": 7,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Fast Moving",
    "description": "hamer",
    "transactions": [
      {
        "id": "TX-INIT-HM149",
        "type": "Stock In",
        "quantity": 7,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM148",
    "code": "HM148",
    "material": "spaner kit",
    "unit": "PCS",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "spaner kit",
    "transactions": []
  },
  {
    "id": "RM-HM147",
    "code": "HM147",
    "material": "duble seel rubber 4mm",
    "unit": "METER",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "duble seel rubber 4mm",
    "transactions": []
  },
  {
    "id": "RM-HM146",
    "code": "HM146",
    "material": "plug box",
    "unit": "PCS",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "plug box",
    "transactions": []
  },
  {
    "id": "RM-HM145",
    "code": "HM145",
    "material": "gogels",
    "unit": "PCS",
    "stock": 2,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Slow Moving",
    "description": "gogels",
    "transactions": [
      {
        "id": "TX-INIT-HM145",
        "type": "Stock In",
        "quantity": 2,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM144",
    "code": "HM144",
    "material": "mask",
    "unit": "PKT",
    "stock": 310,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Fast Moving",
    "description": "mask",
    "transactions": [
      {
        "id": "TX-INIT-HM144",
        "type": "Stock In",
        "quantity": 310,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM143",
    "code": "HM143",
    "material": "yellow gloves",
    "unit": "SET",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "yellow gloves",
    "transactions": []
  },
  {
    "id": "RM-HM142",
    "code": "HM142",
    "material": "fevikick",
    "unit": "PCS",
    "stock": 40,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Non-Moving",
    "description": "fevikick",
    "transactions": [
      {
        "id": "TX-INIT-HM142",
        "type": "Stock In",
        "quantity": 40,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM141",
    "code": "HM141",
    "material": "hand mixture carbon",
    "unit": "PCS",
    "stock": 20,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Fast Moving",
    "description": "hand mixture carbon",
    "transactions": [
      {
        "id": "TX-INIT-HM141",
        "type": "Stock In",
        "quantity": 20,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM140",
    "code": "HM140",
    "material": "hand mixture sterer 8mm",
    "unit": "PCS",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "hand mixture sterer 8mm",
    "transactions": []
  },
  {
    "id": "RM-HM139",
    "code": "HM139",
    "material": "hand mixture sterer 10mm",
    "unit": "PCS",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "hand mixture sterer 10mm",
    "transactions": []
  },
  {
    "id": "RM-HM138",
    "code": "HM138",
    "material": "hand mixter",
    "unit": "PCS",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "hand mixter",
    "transactions": []
  },
  {
    "id": "RM-HM137",
    "code": "HM137",
    "material": "grinder carbon",
    "unit": "PCS",
    "stock": 60,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Fast Moving",
    "description": "grinder carbon",
    "transactions": [
      {
        "id": "TX-INIT-HM137",
        "type": "Stock In",
        "quantity": 60,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM136",
    "code": "HM136",
    "material": "blue colour",
    "unit": "CAN",
    "stock": 2,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Fast Moving",
    "description": "blue colour",
    "transactions": [
      {
        "id": "TX-INIT-HM136",
        "type": "Stock In",
        "quantity": 2,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM135",
    "code": "HM135",
    "material": "black colour",
    "unit": "CAN",
    "stock": 12,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Fast Moving",
    "description": "black colour",
    "transactions": [
      {
        "id": "TX-INIT-HM135",
        "type": "Stock In",
        "quantity": 12,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM134",
    "code": "HM134",
    "material": "grey colour",
    "unit": "CAN",
    "stock": 24,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Non-Moving",
    "description": "grey colour",
    "transactions": [
      {
        "id": "TX-INIT-HM134",
        "type": "Stock In",
        "quantity": 24,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM133",
    "code": "HM133",
    "material": "desil",
    "unit": "PCS",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "desil",
    "transactions": []
  },
  {
    "id": "RM-HM132",
    "code": "HM132",
    "material": "jadu",
    "unit": "PCS",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "jadu",
    "transactions": []
  },
  {
    "id": "RM-HM131",
    "code": "HM131",
    "material": "knife blade frame",
    "unit": "PCS",
    "stock": 4,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Slow Moving",
    "description": "knife blade frame",
    "transactions": [
      {
        "id": "TX-INIT-HM131",
        "type": "Stock In",
        "quantity": 4,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM130",
    "code": "HM130",
    "material": "knife blade",
    "unit": "PCS",
    "stock": 120,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Slow Moving",
    "description": "knife blade",
    "transactions": [
      {
        "id": "TX-INIT-HM130",
        "type": "Stock In",
        "quantity": 120,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM129",
    "code": "HM129",
    "material": "packing role thread",
    "unit": "PCS",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "packing role thread",
    "transactions": []
  },
  {
    "id": "RM-HM128",
    "code": "HM128",
    "material": "raping White tape",
    "unit": "PCS",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "raping White tape",
    "transactions": []
  },
  {
    "id": "RM-HM127",
    "code": "HM127",
    "material": "stone bit",
    "unit": "PKT",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "stone bit",
    "transactions": []
  },
  {
    "id": "RM-HM126",
    "code": "HM126",
    "material": "raping role",
    "unit": "ROLL",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "raping role",
    "transactions": []
  },
  {
    "id": "RM-HM125",
    "code": "HM125",
    "material": "masking tape",
    "unit": "PCS",
    "stock": 288,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Fast Moving",
    "description": "masking tape",
    "transactions": [
      {
        "id": "TX-INIT-HM125",
        "type": "Stock In",
        "quantity": 288,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM124",
    "code": "HM124",
    "material": "flap disc",
    "unit": "PCS",
    "stock": 30,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Fast Moving",
    "description": "flap disc",
    "transactions": [
      {
        "id": "TX-INIT-HM124",
        "type": "Stock In",
        "quantity": 30,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM123",
    "code": "HM123",
    "material": "cloth",
    "unit": "KG",
    "stock": 3,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Non-Moving",
    "description": "cloth",
    "transactions": [
      {
        "id": "TX-INIT-HM123",
        "type": "Stock In",
        "quantity": 3,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM122",
    "code": "HM122",
    "material": "c clamp",
    "unit": "PCS",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "c clamp",
    "transactions": []
  },
  {
    "id": "RM-HM121",
    "code": "HM121",
    "material": "roundhandel",
    "unit": "PCS",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "roundhandel",
    "transactions": []
  },
  {
    "id": "RM-HM120",
    "code": "HM120",
    "material": "c handel",
    "unit": "PCS",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "c handel",
    "transactions": []
  },
  {
    "id": "RM-HM119",
    "code": "HM119",
    "material": "attandance sheet",
    "unit": "PCS",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "attandance sheet",
    "transactions": []
  },
  {
    "id": "RM-HM118",
    "code": "HM118",
    "material": "NOTEBOOK",
    "unit": "PCS",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "NOTEBOOK",
    "transactions": []
  },
  {
    "id": "RM-HM117",
    "code": "HM117",
    "material": "eraser",
    "unit": "PCS",
    "stock": 20,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Fast Moving",
    "description": "eraser",
    "transactions": [
      {
        "id": "TX-INIT-HM117",
        "type": "Stock In",
        "quantity": 20,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM116",
    "code": "HM116",
    "material": "sharpner",
    "unit": "PCS",
    "stock": 10,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Slow Moving",
    "description": "sharpner",
    "transactions": [
      {
        "id": "TX-INIT-HM116",
        "type": "Stock In",
        "quantity": 10,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM115",
    "code": "HM115",
    "material": "pencile",
    "unit": "PCS",
    "stock": 4,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Non-Moving",
    "description": "pencile",
    "transactions": [
      {
        "id": "TX-INIT-HM115",
        "type": "Stock In",
        "quantity": 4,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM114",
    "code": "HM114",
    "material": "board marker",
    "unit": "PCS",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "board marker",
    "transactions": []
  },
  {
    "id": "RM-HM113",
    "code": "HM113",
    "material": "permenent marker",
    "unit": "PCS",
    "stock": 15,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Fast Moving",
    "description": "permenent marker",
    "transactions": [
      {
        "id": "TX-INIT-HM113",
        "type": "Stock In",
        "quantity": 15,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM112",
    "code": "HM112",
    "material": "pen",
    "unit": "PCS",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "pen",
    "transactions": []
  },
  {
    "id": "RM-HM111",
    "code": "HM111",
    "material": "ply wood 18mm",
    "unit": "PCS",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "ply wood 18mm",
    "transactions": []
  },
  {
    "id": "RM-HM110",
    "code": "HM110",
    "material": "ply wood 12mm",
    "unit": "PCS",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "ply wood 12mm",
    "transactions": []
  },
  {
    "id": "RM-HM109",
    "code": "HM109",
    "material": "ply wood 6mm",
    "unit": "PCS",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "ply wood 6mm",
    "transactions": []
  },
  {
    "id": "RM-HM108",
    "code": "HM108",
    "material": "Buffing/Polishing Compound (Paste Form)",
    "unit": "KG",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "Buffing/Polishing Compound (Paste Form)",
    "transactions": []
  },
  {
    "id": "RM-HM101",
    "code": "HM101",
    "material": "Emery Paper (Grit 1200)",
    "unit": "PCS",
    "stock": 8,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Fast Moving",
    "description": "Emery Paper (Grit 1200)",
    "transactions": [
      {
        "id": "TX-INIT-HM101",
        "type": "Stock In",
        "quantity": 8,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM100",
    "code": "HM100",
    "material": "Emery Paper (Grit 1000)",
    "unit": "PCS",
    "stock": 340,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Fast Moving",
    "description": "Emery Paper (Grit 1000)",
    "transactions": [
      {
        "id": "TX-INIT-HM100",
        "type": "Stock In",
        "quantity": 340,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM099",
    "code": "HM099",
    "material": "Emery Paper (Grit 800)",
    "unit": "PCS",
    "stock": 100,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Fast Moving",
    "description": "Emery Paper (Grit 800)",
    "transactions": [
      {
        "id": "TX-INIT-HM099",
        "type": "Stock In",
        "quantity": 100,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM098",
    "code": "HM098",
    "material": "Emery Paper (Grit 600)",
    "unit": "PCS",
    "stock": 140,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Slow Moving",
    "description": "Emery Paper (Grit 600)",
    "transactions": [
      {
        "id": "TX-INIT-HM098",
        "type": "Stock In",
        "quantity": 140,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM097",
    "code": "HM097",
    "material": "Emery Paper (Grit 400)",
    "unit": "PCS",
    "stock": 790,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Fast Moving",
    "description": "Emery Paper (Grit 400)",
    "transactions": [
      {
        "id": "TX-INIT-HM097",
        "type": "Stock In",
        "quantity": 790,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM096",
    "code": "HM096",
    "material": "Emery Paper (Grit 320)",
    "unit": "PCS",
    "stock": 300,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Fast Moving",
    "description": "Emery Paper (Grit 320)",
    "transactions": [
      {
        "id": "TX-INIT-HM096",
        "type": "Stock In",
        "quantity": 300,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM095",
    "code": "HM095",
    "material": "Emery Paper (Grit 220)",
    "unit": "PCS",
    "stock": 50,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Slow Moving",
    "description": "Emery Paper (Grit 220)",
    "transactions": [
      {
        "id": "TX-INIT-HM095",
        "type": "Stock In",
        "quantity": 50,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM094",
    "code": "HM094",
    "material": "Emery Paper (Grit 150)",
    "unit": "PCS",
    "stock": 800,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Fast Moving",
    "description": "Emery Paper (Grit 150)",
    "transactions": [
      {
        "id": "TX-INIT-HM094",
        "type": "Stock In",
        "quantity": 800,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM093",
    "code": "HM093",
    "material": "Emery Paper (Grit 120)",
    "unit": "PCS",
    "stock": 25,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Fast Moving",
    "description": "Emery Paper (Grit 120)",
    "transactions": [
      {
        "id": "TX-INIT-HM093",
        "type": "Stock In",
        "quantity": 25,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM092",
    "code": "HM092",
    "material": "Emery Paper (Grit 60)",
    "unit": "ROLL",
    "stock": 1,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Fast Moving",
    "description": "Emery Paper (Grit 60)",
    "transactions": [
      {
        "id": "TX-INIT-HM092",
        "type": "Stock In",
        "quantity": 1,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM091",
    "code": "HM091",
    "material": "Hole Saw Cutter – 50mm Diameter",
    "unit": "PCS",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "Hole Saw Cutter – 50mm Diameter",
    "transactions": []
  },
  {
    "id": "RM-HM090",
    "code": "HM090",
    "material": "Hole Saw Cutter – 25mm Diameter",
    "unit": "PCS",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "Hole Saw Cutter – 25mm Diameter",
    "transactions": []
  },
  {
    "id": "RM-HM089",
    "code": "HM089",
    "material": "HSS Twist Drill Bit – 12mm",
    "unit": "PCS",
    "stock": 17,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Fast Moving",
    "description": "HSS Twist Drill Bit – 12mm",
    "transactions": [
      {
        "id": "TX-INIT-HM089",
        "type": "Stock In",
        "quantity": 17,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM088",
    "code": "HM088",
    "material": "HSS Twist Drill Bit – 10mm",
    "unit": "PCS",
    "stock": 8,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Fast Moving",
    "description": "HSS Twist Drill Bit – 10mm",
    "transactions": [
      {
        "id": "TX-INIT-HM088",
        "type": "Stock In",
        "quantity": 8,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM087",
    "code": "HM087",
    "material": "HSS Twist Drill Bit – 8mm",
    "unit": "PCS",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "HSS Twist Drill Bit – 8mm",
    "transactions": []
  },
  {
    "id": "RM-HM086",
    "code": "HM086",
    "material": "HSS Twist Drill Bit – 6mm *210mm",
    "unit": "PCS",
    "stock": 23,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Fast Moving",
    "description": "HSS Twist Drill Bit – 6mm *210mm",
    "transactions": [
      {
        "id": "TX-INIT-HM086",
        "type": "Stock In",
        "quantity": 23,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM085",
    "code": "HM085",
    "material": "HSS Twist Drill Bit – 6mm",
    "unit": "PCS",
    "stock": 11,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Fast Moving",
    "description": "HSS Twist Drill Bit – 6mm",
    "transactions": [
      {
        "id": "TX-INIT-HM085",
        "type": "Stock In",
        "quantity": 11,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM084",
    "code": "HM084",
    "material": "HSS Twist Drill Bit – 4mm",
    "unit": "PCS",
    "stock": 10,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Fast Moving",
    "description": "HSS Twist Drill Bit – 4mm",
    "transactions": [
      {
        "id": "TX-INIT-HM084",
        "type": "Stock In",
        "quantity": 10,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM083",
    "code": "HM083",
    "material": "HSS Twist Drill Bit – 3mm",
    "unit": "PCS",
    "stock": 10,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Slow Moving",
    "description": "HSS Twist Drill Bit – 3mm",
    "transactions": [
      {
        "id": "TX-INIT-HM083",
        "type": "Stock In",
        "quantity": 10,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM082",
    "code": "HM082",
    "material": "Masonry Drill Bit",
    "unit": "PCS",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "Masonry Drill Bit",
    "transactions": []
  },
  {
    "id": "RM-HM081",
    "code": "HM081",
    "material": "Electric Drill Machine (Variable Speed)",
    "unit": "PCS",
    "stock": 4,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Slow Moving",
    "description": "Electric Drill Machine (Variable Speed)",
    "transactions": [
      {
        "id": "TX-INIT-HM081",
        "type": "Stock In",
        "quantity": 4,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM080",
    "code": "HM080",
    "material": "Plaster of Paris (CaSO₄·½H₂O)",
    "unit": "PCS",
    "stock": 23,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Slow Moving",
    "description": "Plaster of Paris (CaSO₄·½H₂O)",
    "transactions": [
      {
        "id": "TX-INIT-HM080",
        "type": "Stock In",
        "quantity": 23,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM079",
    "code": "HM079",
    "material": "Surface Primer for FRP Application",
    "unit": "PCS",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "Surface Primer for FRP Application",
    "transactions": []
  },
  {
    "id": "RM-HM078",
    "code": "HM078",
    "material": "buffing compond",
    "unit": "PCS",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "buffing compond",
    "transactions": []
  },
  {
    "id": "RM-HM077",
    "code": "HM077",
    "material": "Orbital/Eccentric Sanding Machine",
    "unit": "PCS",
    "stock": 2,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Fast Moving",
    "description": "Orbital/Eccentric Sanding Machine",
    "transactions": [
      {
        "id": "TX-INIT-HM077",
        "type": "Stock In",
        "quantity": 2,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM076",
    "code": "HM076",
    "material": "Cotton Wool Buffing Pad",
    "unit": "PCS",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "Cotton Wool Buffing Pad",
    "transactions": []
  },
  {
    "id": "RM-HM075",
    "code": "HM075",
    "material": "Electric Polishing Machine (Rotary/Orbital)",
    "unit": "PCS",
    "stock": 1,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Fast Moving",
    "description": "Electric Polishing Machine (Rotary/Orbital)",
    "transactions": [
      {
        "id": "TX-INIT-HM075",
        "type": "Stock In",
        "quantity": 1,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM074",
    "code": "HM074",
    "material": "spary gun nozzel 4mm",
    "unit": "PCS",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "spary gun nozzel 4mm",
    "transactions": []
  },
  {
    "id": "RM-HM073",
    "code": "HM073",
    "material": "Air Spray Gun for Gel Coat/Primer Application",
    "unit": "PCS",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "Air Spray Gun for Gel Coat/Primer Application",
    "transactions": []
  },
  {
    "id": "RM-HM072",
    "code": "HM072",
    "material": "Digital Vernier Caliper (0.01 mm accuracy)",
    "unit": "PCS",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "Digital Vernier Caliper (0.01 mm accuracy)",
    "transactions": []
  },
  {
    "id": "RM-HM071",
    "code": "HM071",
    "material": "grinder lock nut",
    "unit": "PCS",
    "stock": 20,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Slow Moving",
    "description": "grinder lock nut",
    "transactions": [
      {
        "id": "TX-INIT-HM071",
        "type": "Stock In",
        "quantity": 20,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM070",
    "code": "HM070",
    "material": "bear disc 60",
    "unit": "PKT",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "bear disc 60",
    "transactions": []
  },
  {
    "id": "RM-HM069",
    "code": "HM069",
    "material": "gc wheel",
    "unit": "PCS",
    "stock": 65,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Fast Moving",
    "description": "gc wheel",
    "transactions": [
      {
        "id": "TX-INIT-HM069",
        "type": "Stock In",
        "quantity": 65,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM068",
    "code": "HM068",
    "material": "dimanod cutter",
    "unit": "PCS",
    "stock": 60,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Fast Moving",
    "description": "dimanod cutter",
    "transactions": [
      {
        "id": "TX-INIT-HM068",
        "type": "Stock In",
        "quantity": 60,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM067",
    "code": "HM067",
    "material": "Angle Grinder (4\"/5\")",
    "unit": "PCS",
    "stock": 8,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Fast Moving",
    "description": "Angle Grinder (4\"/5\")",
    "transactions": [
      {
        "id": "TX-INIT-HM067",
        "type": "Stock In",
        "quantity": 8,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM066",
    "code": "HM066",
    "material": "wood cutter blade",
    "unit": "PCS",
    "stock": 1,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Non-Moving",
    "description": "wood cutter blade",
    "transactions": [
      {
        "id": "TX-INIT-HM066",
        "type": "Stock In",
        "quantity": 1,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM065",
    "code": "HM065",
    "material": "Wood/Composite Router Machine",
    "unit": "PCS",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "Wood/Composite Router Machine",
    "transactions": []
  },
  {
    "id": "RM-HM064",
    "code": "HM064",
    "material": "jigsaw blade",
    "unit": "PCS",
    "stock": 80,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Slow Moving",
    "description": "jigsaw blade",
    "transactions": [
      {
        "id": "TX-INIT-HM064",
        "type": "Stock In",
        "quantity": 80,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM063",
    "code": "HM063",
    "material": "Electric Jigsaw Machine",
    "unit": "PCS",
    "stock": 1,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Slow Moving",
    "description": "Electric Jigsaw Machine",
    "transactions": [
      {
        "id": "TX-INIT-HM063",
        "type": "Stock In",
        "quantity": 1,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM062",
    "code": "HM062",
    "material": "head screwdriver small",
    "unit": "NOS",
    "stock": 2,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Slow Moving",
    "description": "head screwdriver small",
    "transactions": [
      {
        "id": "TX-INIT-HM062",
        "type": "Stock In",
        "quantity": 2,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM061",
    "code": "HM061",
    "material": "head screwdriver big",
    "unit": "NOS",
    "stock": 4,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Fast Moving",
    "description": "head screwdriver big",
    "transactions": [
      {
        "id": "TX-INIT-HM061",
        "type": "Stock In",
        "quantity": 4,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM060",
    "code": "HM060",
    "material": "General Purpose Chisel",
    "unit": "PCS",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "General Purpose Chisel",
    "transactions": []
  },
  {
    "id": "RM-HM059",
    "code": "HM059",
    "material": "Flat Chisel –50",
    "unit": "PCS",
    "stock": 45,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Slow Moving",
    "description": "Flat Chisel –50",
    "transactions": [
      {
        "id": "TX-INIT-HM059",
        "type": "Stock In",
        "quantity": 45,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM058",
    "code": "HM058",
    "material": "Flat Chisel - 32",
    "unit": "PCS",
    "stock": 30,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Fast Moving",
    "description": "Flat Chisel - 32",
    "transactions": [
      {
        "id": "TX-INIT-HM058",
        "type": "Stock In",
        "quantity": 30,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM057",
    "code": "HM057",
    "material": "Flat Chisel -25",
    "unit": "PCS",
    "stock": 20,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Fast Moving",
    "description": "Flat Chisel -25",
    "transactions": [
      {
        "id": "TX-INIT-HM057",
        "type": "Stock In",
        "quantity": 20,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM056",
    "code": "HM056",
    "material": "Flat Chisel –40",
    "unit": "PCS",
    "stock": 40,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Fast Moving",
    "description": "Flat Chisel –40",
    "transactions": [
      {
        "id": "TX-INIT-HM056",
        "type": "Stock In",
        "quantity": 40,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM055",
    "code": "HM055",
    "material": "Steel Ruler / Engineer Scale small 2 feet",
    "unit": "PCS",
    "stock": 2,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Fast Moving",
    "description": "Steel Ruler / Engineer Scale small 2 feet",
    "transactions": [
      {
        "id": "TX-INIT-HM055",
        "type": "Stock In",
        "quantity": 2,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM054",
    "code": "HM054",
    "material": "Steel Ruler / Engineer Scale small 1.5 feet",
    "unit": "PCS",
    "stock": 4,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Fast Moving",
    "description": "Steel Ruler / Engineer Scale small 1.5 feet",
    "transactions": [
      {
        "id": "TX-INIT-HM054",
        "type": "Stock In",
        "quantity": 4,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM053",
    "code": "HM053",
    "material": "Steel Ruler / Engineer Scale Medium",
    "unit": "NOS",
    "stock": 2,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Slow Moving",
    "description": "Steel Ruler / Engineer Scale Medium",
    "transactions": [
      {
        "id": "TX-INIT-HM053",
        "type": "Stock In",
        "quantity": 2,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM052",
    "code": "HM052",
    "material": "Steel Measuring Tape (3m",
    "unit": "PCS",
    "stock": 7,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Non-Moving",
    "description": "Steel Measuring Tape (3m",
    "transactions": [
      {
        "id": "TX-INIT-HM052",
        "type": "Stock In",
        "quantity": 7,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM051",
    "code": "HM051",
    "material": "Steel Measuring Tape (5m",
    "unit": "PCS",
    "stock": 2,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Non-Moving",
    "description": "Steel Measuring Tape (5m",
    "transactions": [
      {
        "id": "TX-INIT-HM051",
        "type": "Stock In",
        "quantity": 2,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM050",
    "code": "HM050",
    "material": "Hacksaw Blade",
    "unit": "NOS",
    "stock": 340,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Slow Moving",
    "description": "Hacksaw Blade",
    "transactions": [
      {
        "id": "TX-INIT-HM050",
        "type": "Stock In",
        "quantity": 340,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM049",
    "code": "HM049",
    "material": "Steel Putty blade (2\")",
    "unit": "PCS",
    "stock": 60,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Slow Moving",
    "description": "Steel Putty blade (2\")",
    "transactions": [
      {
        "id": "TX-INIT-HM049",
        "type": "Stock In",
        "quantity": 60,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM048",
    "code": "HM048",
    "material": "Steel Putty blade (4\")",
    "unit": "PCS",
    "stock": 13,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Fast Moving",
    "description": "Steel Putty blade (4\")",
    "transactions": [
      {
        "id": "TX-INIT-HM048",
        "type": "Stock In",
        "quantity": 13,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM047",
    "code": "HM047",
    "material": "balti big 20",
    "unit": "PCS",
    "stock": 7,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Fast Moving",
    "description": "balti big 20",
    "transactions": [
      {
        "id": "TX-INIT-HM047",
        "type": "Stock In",
        "quantity": 7,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM046",
    "code": "HM046",
    "material": "balti small 5 to 18",
    "unit": "PCS",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "balti small 5 to 18",
    "transactions": []
  },
  {
    "id": "RM-HM045",
    "code": "HM045",
    "material": "mugga big",
    "unit": "PCS",
    "stock": 11,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Non-Moving",
    "description": "mugga big",
    "transactions": [
      {
        "id": "TX-INIT-HM045",
        "type": "Stock In",
        "quantity": 11,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM044",
    "code": "HM044",
    "material": "mugga small",
    "unit": "PCS",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "mugga small",
    "transactions": []
  },
  {
    "id": "RM-HM043",
    "code": "HM043",
    "material": "bucket 14no",
    "unit": "PCS",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "bucket 14no",
    "transactions": []
  },
  {
    "id": "RM-HM042",
    "code": "HM042",
    "material": "bucket 19no",
    "unit": "PCS",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "bucket 19no",
    "transactions": []
  },
  {
    "id": "RM-HM041",
    "code": "HM041",
    "material": "bucket 10no",
    "unit": "PCS",
    "stock": 24,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Fast Moving",
    "description": "bucket 10no",
    "transactions": [
      {
        "id": "TX-INIT-HM041",
        "type": "Stock In",
        "quantity": 24,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM040",
    "code": "HM040",
    "material": "bucket 12no",
    "unit": "PCS",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "bucket 12no",
    "transactions": []
  },
  {
    "id": "RM-HM039",
    "code": "HM039",
    "material": "bucket 8no",
    "unit": "PCS",
    "stock": 8,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Non-Moving",
    "description": "bucket 8no",
    "transactions": [
      {
        "id": "TX-INIT-HM039",
        "type": "Stock In",
        "quantity": 8,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM038",
    "code": "HM038",
    "material": "thapi 12",
    "unit": "PCS",
    "stock": 3,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Fast Moving",
    "description": "thapi 12",
    "transactions": [
      {
        "id": "TX-INIT-HM038",
        "type": "Stock In",
        "quantity": 3,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM037",
    "code": "HM037",
    "material": "thapi 10",
    "unit": "PCS",
    "stock": 14,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Fast Moving",
    "description": "thapi 10",
    "transactions": [
      {
        "id": "TX-INIT-HM037",
        "type": "Stock In",
        "quantity": 14,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM036",
    "code": "HM036",
    "material": "thapi 8",
    "unit": "PCS",
    "stock": 54,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Fast Moving",
    "description": "thapi 8",
    "transactions": [
      {
        "id": "TX-INIT-HM036",
        "type": "Stock In",
        "quantity": 54,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM035",
    "code": "HM035",
    "material": "thapi 6",
    "unit": "PCS",
    "stock": 56,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Fast Moving",
    "description": "thapi 6",
    "transactions": [
      {
        "id": "TX-INIT-HM035",
        "type": "Stock In",
        "quantity": 56,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM034",
    "code": "HM034",
    "material": "thapi SMALL",
    "unit": "PCS",
    "stock": 45,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Slow Moving",
    "description": "thapi SMALL",
    "transactions": [
      {
        "id": "TX-INIT-HM034",
        "type": "Stock In",
        "quantity": 45,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM033",
    "code": "HM033",
    "material": "Paint Brush 100mm",
    "unit": "PCS",
    "stock": 73,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Fast Moving",
    "description": "Paint Brush 100mm",
    "transactions": [
      {
        "id": "TX-INIT-HM033",
        "type": "Stock In",
        "quantity": 73,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM032",
    "code": "HM032",
    "material": "Brush 25mm",
    "unit": "PCS",
    "stock": 54,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Fast Moving",
    "description": "Brush 25mm",
    "transactions": [
      {
        "id": "TX-INIT-HM032",
        "type": "Stock In",
        "quantity": 54,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM031",
    "code": "HM031",
    "material": "Paint Brush 75mm",
    "unit": "PCS",
    "stock": 310,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Fast Moving",
    "description": "Paint Brush 75mm",
    "transactions": [
      {
        "id": "TX-INIT-HM031",
        "type": "Stock In",
        "quantity": 310,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM030",
    "code": "HM030",
    "material": "Paint Brush 50mm",
    "unit": "PCS",
    "stock": 315,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Slow Moving",
    "description": "Paint Brush 50mm",
    "transactions": [
      {
        "id": "TX-INIT-HM030",
        "type": "Stock In",
        "quantity": 315,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM029",
    "code": "HM029",
    "material": "Thinner (General Purpose Paint/Resin Thinner)",
    "unit": "LTR",
    "stock": 450,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Fast Moving",
    "description": "Thinner (General Purpose Paint/Resin Thinner)",
    "transactions": [
      {
        "id": "TX-INIT-HM029",
        "type": "Stock In",
        "quantity": 450,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM028",
    "code": "HM028",
    "material": "Acetone (Solvent)",
    "unit": "PCS",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "Acetone (Solvent)",
    "transactions": []
  },
  {
    "id": "RM-HM027",
    "code": "HM027",
    "material": "Gel Coat Grade Filler Powder",
    "unit": "KG",
    "stock": 75,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Fast Moving",
    "description": "Gel Coat Grade Filler Powder",
    "transactions": [
      {
        "id": "TX-INIT-HM027",
        "type": "Stock In",
        "quantity": 75,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM026",
    "code": "HM026",
    "material": "General Mineral Filler (e.g., Dolomite Powder)",
    "unit": "KG",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "General Mineral Filler (e.g., Dolomite Powder)",
    "transactions": []
  },
  {
    "id": "RM-HM025",
    "code": "HM025",
    "material": "Quartz Powder – black and white",
    "unit": "PCS",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "Quartz Powder – black and white",
    "transactions": []
  },
  {
    "id": "RM-HM024",
    "code": "HM024",
    "material": "Quartz Powder – big",
    "unit": "KGS",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "Quartz Powder – big",
    "transactions": []
  },
  {
    "id": "RM-HM023",
    "code": "HM023",
    "material": "Quartz Powder – medium",
    "unit": "KGS",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "Quartz Powder – medium",
    "transactions": []
  },
  {
    "id": "RM-HM022",
    "code": "HM022",
    "material": "Quartz Powder – small",
    "unit": "KGS",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "Quartz Powder – small",
    "transactions": []
  },
  {
    "id": "RM-HM021",
    "code": "HM021",
    "material": "Dimethylaniline (DMA) Promoter",
    "unit": "PCS",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "Dimethylaniline (DMA) Promoter",
    "transactions": []
  },
  {
    "id": "RM-HM020",
    "code": "HM020",
    "material": "Cobalt Octoate Solution (Accelerator)",
    "unit": "KGS",
    "stock": 60,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Fast Moving",
    "description": "Cobalt Octoate Solution (Accelerator)",
    "transactions": [
      {
        "id": "TX-INIT-HM020",
        "type": "Stock In",
        "quantity": 60,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM019",
    "code": "HM019",
    "material": "Methyl Ethyl Ketone Peroxide (Catalyst)",
    "unit": "KG",
    "stock": 30,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Fast Moving",
    "description": "Methyl Ethyl Ketone Peroxide (Catalyst)",
    "transactions": [
      {
        "id": "TX-INIT-HM019",
        "type": "Stock In",
        "quantity": 30,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM018",
    "code": "HM018",
    "material": "Unidirectional Fiberglass Mat – 1230 GSM",
    "unit": "ROLL",
    "stock": 2,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Slow Moving",
    "description": "Unidirectional Fiberglass Mat – 1230 GSM",
    "transactions": [
      {
        "id": "TX-INIT-HM018",
        "type": "Stock In",
        "quantity": 2,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM017",
    "code": "HM017",
    "material": "Woven Roving – 610 GSM",
    "unit": "ROLL",
    "stock": 65,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Fast Moving",
    "description": "Woven Roving – 610 GSM",
    "transactions": [
      {
        "id": "TX-INIT-HM017",
        "type": "Stock In",
        "quantity": 65,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM016",
    "code": "HM016",
    "material": "Chopped Strand Mat – 450 GSM",
    "unit": "ROLL",
    "stock": 2,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Non-Moving",
    "description": "Chopped Strand Mat – 450 GSM",
    "transactions": [
      {
        "id": "TX-INIT-HM016",
        "type": "Stock In",
        "quantity": 2,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM015",
    "code": "HM015",
    "material": "Chopped Strand Mat – 225 GSM",
    "unit": "KGS",
    "stock": 99,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Fast Moving",
    "description": "Chopped Strand Mat – 225 GSM",
    "transactions": [
      {
        "id": "TX-INIT-HM015",
        "type": "Stock In",
        "quantity": 99,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM014",
    "code": "HM014",
    "material": "Surface Tissue Mat (30 GSM)",
    "unit": "ROLL",
    "stock": 1,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Fast Moving",
    "description": "Surface Tissue Mat (30 GSM)",
    "transactions": [
      {
        "id": "TX-INIT-HM014",
        "type": "Stock In",
        "quantity": 1,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM013",
    "code": "HM013",
    "material": "Isophthalic Gel Coat (Pre-accelerated)",
    "unit": "KG",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "Isophthalic Gel Coat (Pre-accelerated)",
    "transactions": []
  },
  {
    "id": "RM-HM012",
    "code": "HM012",
    "material": "Vinyl Ester Resin",
    "unit": "PCS",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "Vinyl Ester Resin",
    "transactions": []
  },
  {
    "id": "RM-HM011",
    "code": "HM011",
    "material": "Isophthalic Polyester Resin",
    "unit": "KGS",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "Isophthalic Polyester Resin",
    "transactions": []
  },
  {
    "id": "RM-HM010",
    "code": "HM010",
    "material": "General Purpose Unsaturated Polyester Resin (Clear)",
    "unit": "BAREL",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "General Purpose Unsaturated Polyester Resin (Clear)",
    "transactions": []
  },
  {
    "id": "RM-HM009",
    "code": "HM009",
    "material": "Polyethylene Terephthalate Resin (PET)",
    "unit": "BAREL",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "Polyethylene Terephthalate Resin (PET)",
    "transactions": []
  },
  {
    "id": "RM-HM008",
    "code": "HM008",
    "material": "Phthalocyanine Blue Pigment",
    "unit": "PCS",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "Phthalocyanine Blue Pigment",
    "transactions": []
  },
  {
    "id": "RM-HM007",
    "code": "HM007",
    "material": "Black Pigment",
    "unit": "PCS",
    "stock": 8,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Fast Moving",
    "description": "Black Pigment",
    "transactions": [
      {
        "id": "TX-INIT-HM007",
        "type": "Stock In",
        "quantity": 8,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM006",
    "code": "HM006",
    "material": "LIGHT GREY PIGMENT",
    "unit": "KG",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "LIGHT GREY PIGMENT",
    "transactions": []
  },
  {
    "id": "RM-HM005",
    "code": "HM005",
    "material": "White Pigment (TiO₂)",
    "unit": "KG",
    "stock": 9,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Fast Moving",
    "description": "White Pigment (TiO₂)",
    "transactions": [
      {
        "id": "TX-INIT-HM005",
        "type": "Stock In",
        "quantity": 9,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM004",
    "code": "HM004",
    "material": "NC-50 Solvent-Based Mold Release Agent",
    "unit": "PCS",
    "stock": 0,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "Out of Stock",
    "fsn": "Non-Moving",
    "description": "NC-50 Solvent-Based Mold Release Agent",
    "transactions": []
  },
  {
    "id": "RM-HM003",
    "code": "HM003",
    "material": "Polyvinyl Alcohol (PVA) Release Agent",
    "unit": "LTR",
    "stock": 20,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Fast Moving",
    "description": "Polyvinyl Alcohol (PVA) Release Agent",
    "transactions": [
      {
        "id": "TX-INIT-HM003",
        "type": "Stock In",
        "quantity": 20,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM002",
    "code": "HM002",
    "material": "Benjo Mold Release Wax Polish",
    "unit": "KG",
    "stock": 2,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Slow Moving",
    "description": "Benjo Mold Release Wax Polish",
    "transactions": [
      {
        "id": "TX-INIT-HM002",
        "type": "Stock In",
        "quantity": 2,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  },
  {
    "id": "RM-HM001",
    "code": "HM001",
    "material": "White Mold Release Wax Polish",
    "unit": "KG",
    "stock": 85,
    "category": "Raw Material",
    "reorderLevel": 0,
    "minStock": 0,
    "rate": 0,
    "storageLocation": "Raw Material Store",
    "status": "In Stock",
    "fsn": "Fast Moving",
    "description": "White Mold Release Wax Polish",
    "transactions": [
      {
        "id": "TX-INIT-HM001",
        "type": "Stock In",
        "quantity": 85,
        "rate": 0,
        "date": "2026-08-18",
        "supplier": "Initial Inventory Import",
        "remarks": "Opening balance imported from master catalog"
      }
    ]
  }
];
