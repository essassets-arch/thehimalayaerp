// Standalone seed script for 212 Store Raw Inventory Materials
const { PrismaClient } = require('@prisma/client');

const materials = [
  {
    "index": 1,
    "code": "HM001",
    "name": "White Mold Release Wax Polish",
    "unit": "KG"
  },
  {
    "index": 2,
    "code": "HM002",
    "name": "Benjo Mold Release Wax Polish",
    "unit": "KG"
  },
  {
    "index": 3,
    "code": "HM003",
    "name": "Polyvinyl Alcohol (PVA) Release Agent",
    "unit": "LTR"
  },
  {
    "index": 4,
    "code": "HM004",
    "name": "NC-50 Solvent-Based Mold Release Agent",
    "unit": "PCS"
  },
  {
    "index": 5,
    "code": "HM005",
    "name": "White Pigment (TiO₂)",
    "unit": "KG"
  },
  {
    "index": 6,
    "code": "HM006",
    "name": "LIGHT GREY PIGMENT",
    "unit": "KG"
  },
  {
    "index": 7,
    "code": "HM007",
    "name": "Black Pigment",
    "unit": "PCS"
  },
  {
    "index": 8,
    "code": "HM008",
    "name": "Phthalocyanine Blue Pigment",
    "unit": "PCS"
  },
  {
    "index": 9,
    "code": "HM009",
    "name": "Polyethylene Terephthalate Resin (PET)",
    "unit": "BAREL"
  },
  {
    "index": 10,
    "code": "HM010",
    "name": "General Purpose Unsaturated Polyester Resin (Clear)",
    "unit": "BAREL"
  },
  {
    "index": 11,
    "code": "HM011",
    "name": "Isophthalic Polyester Resin",
    "unit": "KGS"
  },
  {
    "index": 12,
    "code": "HM012",
    "name": "Vinyl Ester Resin",
    "unit": "PCS"
  },
  {
    "index": 13,
    "code": "HM013",
    "name": "Isophthalic Gel Coat (Pre-accelerated)",
    "unit": "KG"
  },
  {
    "index": 14,
    "code": "HM014",
    "name": "Surface Tissue Mat (30 GSM)",
    "unit": "ROLL"
  },
  {
    "index": 15,
    "code": "HM015",
    "name": "Chopped Strand Mat – 225 GSM",
    "unit": "KGS"
  },
  {
    "index": 16,
    "code": "HM016",
    "name": "Chopped Strand Mat – 450 GSM",
    "unit": "ROLL"
  },
  {
    "index": 17,
    "code": "HM017",
    "name": "Woven Roving – 610 GSM",
    "unit": "ROLL"
  },
  {
    "index": 18,
    "code": "HM018",
    "name": "Unidirectional Fiberglass Mat – 1230 GSM",
    "unit": "ROLL"
  },
  {
    "index": 19,
    "code": "HM019",
    "name": "Methyl Ethyl Ketone Peroxide (Catalyst)",
    "unit": "KG"
  },
  {
    "index": 20,
    "code": "HM020",
    "name": "Cobalt Octoate Solution (Accelerator)",
    "unit": "KGS"
  },
  {
    "index": 21,
    "code": "HM021",
    "name": "Dimethylaniline (DMA) Promoter",
    "unit": "PCS"
  },
  {
    "index": 22,
    "code": "HM022",
    "name": "Quartz Powder – small",
    "unit": "KGS"
  },
  {
    "index": 23,
    "code": "HM023",
    "name": "Quartz Powder – medium",
    "unit": "KGS"
  },
  {
    "index": 24,
    "code": "HM024",
    "name": "Quartz Powder – big",
    "unit": "KGS"
  },
  {
    "index": 25,
    "code": "HM025",
    "name": "Quartz Powder – black and white",
    "unit": "PCS"
  },
  {
    "index": 26,
    "code": "HM026",
    "name": "General Mineral Filler (e.g., Dolomite Powder)",
    "unit": "KG"
  },
  {
    "index": 27,
    "code": "HM027",
    "name": "Gel Coat Grade Filler Powder",
    "unit": "KG"
  },
  {
    "index": 28,
    "code": "HM028",
    "name": "Acetone (Solvent)",
    "unit": "PCS"
  },
  {
    "index": 29,
    "code": "HM029",
    "name": "Thinner (General Purpose Paint/Resin Thinner)",
    "unit": "LTR"
  },
  {
    "index": 30,
    "code": "HM030",
    "name": "Paint Brush 50mm",
    "unit": "PCS"
  },
  {
    "index": 31,
    "code": "HM031",
    "name": "Paint Brush 75mm",
    "unit": "PCS"
  },
  {
    "index": 32,
    "code": "HM032",
    "name": "Brush 25mm",
    "unit": "PCS"
  },
  {
    "index": 33,
    "code": "HM033",
    "name": "Paint Brush 100mm",
    "unit": "PCS"
  },
  {
    "index": 34,
    "code": "HM034",
    "name": "thapi SMALL",
    "unit": "PCS"
  },
  {
    "index": 35,
    "code": "HM035",
    "name": "thapi 6",
    "unit": "PCS"
  },
  {
    "index": 36,
    "code": "HM036",
    "name": "thapi 8",
    "unit": "PCS"
  },
  {
    "index": 37,
    "code": "HM037",
    "name": "thapi 10",
    "unit": "PCS"
  },
  {
    "index": 38,
    "code": "HM038",
    "name": "thapi 12",
    "unit": "PCS"
  },
  {
    "index": 39,
    "code": "HM039",
    "name": "bucket 8no",
    "unit": "PCS"
  },
  {
    "index": 40,
    "code": "HM040",
    "name": "bucket 12no",
    "unit": "PCS"
  },
  {
    "index": 41,
    "code": "HM041",
    "name": "bucket 10no",
    "unit": "PCS"
  },
  {
    "index": 42,
    "code": "HM042",
    "name": "bucket 19no",
    "unit": "PCS"
  },
  {
    "index": 43,
    "code": "HM043",
    "name": "bucket 14no",
    "unit": "PCS"
  },
  {
    "index": 44,
    "code": "HM044",
    "name": "mugga small",
    "unit": "PCS"
  },
  {
    "index": 45,
    "code": "HM045",
    "name": "mugga big",
    "unit": "PCS"
  },
  {
    "index": 46,
    "code": "HM046",
    "name": "balti small 5 to 18",
    "unit": "PCS"
  },
  {
    "index": 47,
    "code": "HM047",
    "name": "balti big 20",
    "unit": "PCS"
  },
  {
    "index": 48,
    "code": "HM048",
    "name": "Steel Putty blade (4\")",
    "unit": "PCS"
  },
  {
    "index": 49,
    "code": "HM049",
    "name": "Steel Putty blade (2\")",
    "unit": "PCS"
  },
  {
    "index": 50,
    "code": "HM050",
    "name": "Hacksaw Blade",
    "unit": "NOS"
  },
  {
    "index": 51,
    "code": "HM051",
    "name": "Steel Measuring Tape (5m",
    "unit": "PCS"
  },
  {
    "index": 52,
    "code": "HM052",
    "name": "Steel Measuring Tape (3m",
    "unit": "PCS"
  },
  {
    "index": 53,
    "code": "HM053",
    "name": "Steel Ruler / Engineer Scale Medium",
    "unit": "NOS"
  },
  {
    "index": 54,
    "code": "HM054",
    "name": "Steel Ruler / Engineer Scale small 1.5 feet",
    "unit": "PCS"
  },
  {
    "index": 55,
    "code": "HM055",
    "name": "Steel Ruler / Engineer Scale small 2 feet",
    "unit": "PCS"
  },
  {
    "index": 56,
    "code": "HM056",
    "name": "Flat Chisel –40",
    "unit": "PCS"
  },
  {
    "index": 57,
    "code": "HM057",
    "name": "Flat Chisel -25",
    "unit": "PCS"
  },
  {
    "index": 58,
    "code": "HM058",
    "name": "Flat Chisel - 32",
    "unit": "PCS"
  },
  {
    "index": 59,
    "code": "HM059",
    "name": "Flat Chisel –50",
    "unit": "PCS"
  },
  {
    "index": 60,
    "code": "HM060",
    "name": "General Purpose Chisel",
    "unit": "PCS"
  },
  {
    "index": 61,
    "code": "HM061",
    "name": "head screwdriver big",
    "unit": "NOS"
  },
  {
    "index": 62,
    "code": "HM062",
    "name": "head screwdriver small",
    "unit": "NOS"
  },
  {
    "index": 63,
    "code": "HM063",
    "name": "Electric Jigsaw Machine",
    "unit": "PCS"
  },
  {
    "index": 64,
    "code": "HM064",
    "name": "jigsaw blade",
    "unit": "PCS"
  },
  {
    "index": 65,
    "code": "HM065",
    "name": "Wood/Composite Router Machine",
    "unit": "PCS"
  },
  {
    "index": 66,
    "code": "HM066",
    "name": "wood cutter blade",
    "unit": "PCS"
  },
  {
    "index": 67,
    "code": "HM067",
    "name": "Angle Grinder (4\"/5\")",
    "unit": "PCS"
  },
  {
    "index": 68,
    "code": "HM068",
    "name": "dimanod cutter",
    "unit": "PCS"
  },
  {
    "index": 69,
    "code": "HM069",
    "name": "gc wheel",
    "unit": "PCS"
  },
  {
    "index": 70,
    "code": "HM070",
    "name": "bear disc 60",
    "unit": "PKT"
  },
  {
    "index": 71,
    "code": "HM071",
    "name": "grinder lock nut",
    "unit": "PCS"
  },
  {
    "index": 72,
    "code": "HM072",
    "name": "Digital Vernier Caliper (0.01 mm accuracy)",
    "unit": "PCS"
  },
  {
    "index": 73,
    "code": "HM073",
    "name": "Air Spray Gun for Gel Coat/Primer Application",
    "unit": "PCS"
  },
  {
    "index": 74,
    "code": "HM074",
    "name": "spary gun nozzel 4mm",
    "unit": "PCS"
  },
  {
    "index": 75,
    "code": "HM075",
    "name": "Electric Polishing Machine (Rotary/Orbital)",
    "unit": "PCS"
  },
  {
    "index": 76,
    "code": "HM076",
    "name": "Cotton Wool Buffing Pad",
    "unit": "PCS"
  },
  {
    "index": 77,
    "code": "HM077",
    "name": "Orbital/Eccentric Sanding Machine",
    "unit": "PCS"
  },
  {
    "index": 78,
    "code": "HM078",
    "name": "buffing compond",
    "unit": "PCS"
  },
  {
    "index": 79,
    "code": "HM079",
    "name": "Surface Primer for FRP Application",
    "unit": "PCS"
  },
  {
    "index": 80,
    "code": "HM080",
    "name": "Plaster of Paris (CaSO₄·½H₂O)",
    "unit": "PCS"
  },
  {
    "index": 81,
    "code": "HM081",
    "name": "Electric Drill Machine (Variable Speed)",
    "unit": "PCS"
  },
  {
    "index": 82,
    "code": "HM082",
    "name": "Masonry Drill Bit",
    "unit": "PCS"
  },
  {
    "index": 83,
    "code": "HM083",
    "name": "HSS Twist Drill Bit – 3mm",
    "unit": "PCS"
  },
  {
    "index": 84,
    "code": "HM084",
    "name": "HSS Twist Drill Bit – 4mm",
    "unit": "PCS"
  },
  {
    "index": 85,
    "code": "HM085",
    "name": "HSS Twist Drill Bit – 6mm",
    "unit": "PCS"
  },
  {
    "index": 86,
    "code": "HM086",
    "name": "HSS Twist Drill Bit – 6mm *210mm",
    "unit": "PCS"
  },
  {
    "index": 87,
    "code": "HM087",
    "name": "HSS Twist Drill Bit – 8mm",
    "unit": "PCS"
  },
  {
    "index": 88,
    "code": "HM088",
    "name": "HSS Twist Drill Bit – 10mm",
    "unit": "PCS"
  },
  {
    "index": 89,
    "code": "HM089",
    "name": "HSS Twist Drill Bit – 12mm",
    "unit": "PCS"
  },
  {
    "index": 90,
    "code": "HM090",
    "name": "Hole Saw Cutter – 25mm Diameter",
    "unit": "PCS"
  },
  {
    "index": 91,
    "code": "HM091",
    "name": "Hole Saw Cutter – 50mm Diameter",
    "unit": "PCS"
  },
  {
    "index": 92,
    "code": "HM092",
    "name": "Emery Paper (Grit 60)",
    "unit": "ROLL"
  },
  {
    "index": 93,
    "code": "HM093",
    "name": "Emery Paper (Grit 120)",
    "unit": "PCS"
  },
  {
    "index": 94,
    "code": "HM094",
    "name": "Emery Paper (Grit 150)",
    "unit": "PCS"
  },
  {
    "index": 95,
    "code": "HM095",
    "name": "Emery Paper (Grit 220)",
    "unit": "PCS"
  },
  {
    "index": 96,
    "code": "HM096",
    "name": "Emery Paper (Grit 320)",
    "unit": "PCS"
  },
  {
    "index": 97,
    "code": "HM097",
    "name": "Emery Paper (Grit 400)",
    "unit": "PCS"
  },
  {
    "index": 98,
    "code": "HM098",
    "name": "Emery Paper (Grit 600)",
    "unit": "PCS"
  },
  {
    "index": 99,
    "code": "HM099",
    "name": "Emery Paper (Grit 800)",
    "unit": "PCS"
  },
  {
    "index": 100,
    "code": "HM100",
    "name": "Emery Paper (Grit 1000)",
    "unit": "PCS"
  },
  {
    "index": 101,
    "code": "HM101",
    "name": "Emery Paper (Grit 1200)",
    "unit": "PCS"
  },
  {
    "index": 102,
    "code": "HM102",
    "name": "Sandpaper (Grit 80)",
    "unit": "PCS"
  },
  {
    "index": 103,
    "code": "HM103",
    "name": "Sandpaper (Grit 120)",
    "unit": "PCS"
  },
  {
    "index": 104,
    "code": "HM104",
    "name": "Sandpaper (Grit 180)",
    "unit": "PCS"
  },
  {
    "index": 105,
    "code": "HM105",
    "name": "Sandpaper (Grit 220)",
    "unit": "PCS"
  },
  {
    "index": 106,
    "code": "HM106",
    "name": "Sandpaper (Grit 320)",
    "unit": "PCS"
  },
  {
    "index": 107,
    "code": "HM107",
    "name": "Sandpaper (Grit 400)",
    "unit": "PCS"
  },
  {
    "index": 108,
    "code": "HM108",
    "name": "Buffing/Polishing Compound (Paste Form)",
    "unit": "KG"
  },
  {
    "index": 109,
    "code": "HM109",
    "name": "ply wood 6mm",
    "unit": "PCS"
  },
  {
    "index": 110,
    "code": "HM110",
    "name": "ply wood 12mm",
    "unit": "PCS"
  },
  {
    "index": 111,
    "code": "HM111",
    "name": "ply wood 18mm",
    "unit": "PCS"
  },
  {
    "index": 112,
    "code": "HM112",
    "name": "pen",
    "unit": "PCS"
  },
  {
    "index": 113,
    "code": "HM113",
    "name": "permenent marker",
    "unit": "PCS"
  },
  {
    "index": 114,
    "code": "HM114",
    "name": "board marker",
    "unit": "PCS"
  },
  {
    "index": 115,
    "code": "HM115",
    "name": "pencile",
    "unit": "PCS"
  },
  {
    "index": 116,
    "code": "HM116",
    "name": "sharpner",
    "unit": "PCS"
  },
  {
    "index": 117,
    "code": "HM117",
    "name": "eraser",
    "unit": "PCS"
  },
  {
    "index": 118,
    "code": "HM118",
    "name": "NOTEBOOK",
    "unit": "PCS"
  },
  {
    "index": 119,
    "code": "HM119",
    "name": "attandance sheet",
    "unit": "PCS"
  },
  {
    "index": 120,
    "code": "HM120",
    "name": "c handel",
    "unit": "PCS"
  },
  {
    "index": 121,
    "code": "HM121",
    "name": "roundhandel",
    "unit": "PCS"
  },
  {
    "index": 122,
    "code": "HM122",
    "name": "c clamp",
    "unit": "PCS"
  },
  {
    "index": 123,
    "code": "HM123",
    "name": "cloth",
    "unit": "KG"
  },
  {
    "index": 124,
    "code": "HM124",
    "name": "flap disc",
    "unit": "PCS"
  },
  {
    "index": 125,
    "code": "HM125",
    "name": "masking tape",
    "unit": "PCS"
  },
  {
    "index": 126,
    "code": "HM126",
    "name": "raping role",
    "unit": "ROLL"
  },
  {
    "index": 127,
    "code": "HM127",
    "name": "stone bit",
    "unit": "PKT"
  },
  {
    "index": 128,
    "code": "HM128",
    "name": "raping White tape",
    "unit": "PCS"
  },
  {
    "index": 129,
    "code": "HM129",
    "name": "packing role thread",
    "unit": "PCS"
  },
  {
    "index": 130,
    "code": "HM130",
    "name": "knife blade",
    "unit": "PCS"
  },
  {
    "index": 131,
    "code": "HM131",
    "name": "knife blade frame",
    "unit": "PCS"
  },
  {
    "index": 132,
    "code": "HM132",
    "name": "jadu",
    "unit": "PCS"
  },
  {
    "index": 133,
    "code": "HM133",
    "name": "desil",
    "unit": "PCS"
  },
  {
    "index": 134,
    "code": "HM134",
    "name": "grey colour",
    "unit": "CAN"
  },
  {
    "index": 135,
    "code": "HM135",
    "name": "black colour",
    "unit": "CAN"
  },
  {
    "index": 136,
    "code": "HM136",
    "name": "blue colour",
    "unit": "CAN"
  },
  {
    "index": 137,
    "code": "HM137",
    "name": "grinder carbon",
    "unit": "PCS"
  },
  {
    "index": 138,
    "code": "HM138",
    "name": "hand mixter",
    "unit": "PCS"
  },
  {
    "index": 139,
    "code": "HM139",
    "name": "hand mixture sterer 10mm",
    "unit": "PCS"
  },
  {
    "index": 140,
    "code": "HM140",
    "name": "hand mixture sterer 8mm",
    "unit": "PCS"
  },
  {
    "index": 141,
    "code": "HM141",
    "name": "hand mixture carbon",
    "unit": "PCS"
  },
  {
    "index": 142,
    "code": "HM142",
    "name": "fevikick",
    "unit": "PCS"
  },
  {
    "index": 143,
    "code": "HM143",
    "name": "yellow gloves",
    "unit": "SET"
  },
  {
    "index": 144,
    "code": "HM144",
    "name": "mask",
    "unit": "PKT"
  },
  {
    "index": 145,
    "code": "HM145",
    "name": "gogels",
    "unit": "PCS"
  },
  {
    "index": 146,
    "code": "HM146",
    "name": "plug box",
    "unit": "PCS"
  },
  {
    "index": 147,
    "code": "HM147",
    "name": "duble seel rubber 4mm",
    "unit": "METER"
  },
  {
    "index": 148,
    "code": "HM148",
    "name": "spaner kit",
    "unit": "PCS"
  },
  {
    "index": 149,
    "code": "HM149",
    "name": "hamer",
    "unit": "PCS"
  },
  {
    "index": 150,
    "code": "HM150",
    "name": "hydralic oil",
    "unit": "LTR"
  },
  {
    "index": 151,
    "code": "HM151",
    "name": "patra",
    "unit": "PCS"
  },
  {
    "index": 152,
    "code": "HM152",
    "name": "iron cutter disc",
    "unit": "PCS"
  },
  {
    "index": 153,
    "code": "HM153",
    "name": "glinder paid wheel",
    "unit": "PCS"
  },
  {
    "index": 154,
    "code": "HM154",
    "name": "fingure",
    "unit": "PKT"
  },
  {
    "index": 155,
    "code": "HM155",
    "name": "Cloth Gloves",
    "unit": "SET"
  },
  {
    "index": 156,
    "code": "HM156",
    "name": "Belcha",
    "unit": "NOS"
  },
  {
    "index": 157,
    "code": "HM157",
    "name": "Wire BUNDLE",
    "unit": "PCS"
  },
  {
    "index": 158,
    "code": "HM158",
    "name": "Grees",
    "unit": "KG"
  },
  {
    "index": 159,
    "code": "HM159",
    "name": "Admixture CHEMICAL",
    "unit": "BRL"
  },
  {
    "index": 160,
    "code": "HM160",
    "name": "Reileas Chemicale",
    "unit": "BRL (200 LTR)"
  },
  {
    "index": 161,
    "code": "HM161",
    "name": "Acid Gloves",
    "unit": "SET"
  },
  {
    "index": 162,
    "code": "HM162",
    "name": "Ecodrive Belt",
    "unit": "PCS"
  },
  {
    "index": 163,
    "code": "HM163",
    "name": "Fawda",
    "unit": "PCS"
  },
  {
    "index": 164,
    "code": "HM164",
    "name": "pvc farsi white",
    "unit": "PCS"
  },
  {
    "index": 165,
    "code": "HM165",
    "name": "handle patra",
    "unit": "PCS"
  },
  {
    "index": 166,
    "code": "HM166",
    "name": "allen key",
    "unit": "PCS"
  },
  {
    "index": 167,
    "code": "HM167",
    "name": "write angle",
    "unit": "PCS"
  },
  {
    "index": 168,
    "code": "HM168",
    "name": "wire tape",
    "unit": "PKT"
  },
  {
    "index": 169,
    "code": "HM169",
    "name": "grey moja",
    "unit": "PAIR"
  },
  {
    "index": 170,
    "code": "HM170",
    "name": "rassi/plastic sulti",
    "unit": "KGS"
  },
  {
    "index": 171,
    "code": "HM171",
    "name": "dhaga",
    "unit": "BOX"
  },
  {
    "index": 172,
    "code": "HM172",
    "name": "NYLON BLOCK PATTI SMALL",
    "unit": "NOS"
  },
  {
    "index": 173,
    "code": "HM173",
    "name": "balti small 8 NO",
    "unit": "PCS"
  },
  {
    "index": 174,
    "code": "HM174",
    "name": "D A GREY",
    "unit": "PCS"
  },
  {
    "index": 175,
    "code": "HM175",
    "name": "emery paper 80",
    "unit": "PCS"
  },
  {
    "index": 176,
    "code": "HM176",
    "name": "sand paper 600",
    "unit": "PCS"
  },
  {
    "index": 177,
    "code": "HM177",
    "name": "sterar 8mm",
    "unit": "PCS"
  },
  {
    "index": 178,
    "code": "HM178",
    "name": "sterar 10mm",
    "unit": "PCS"
  },
  {
    "index": 179,
    "code": "HM179",
    "name": "p v",
    "unit": "PCS"
  },
  {
    "index": 180,
    "code": "HM180",
    "name": "steel putty blade 50*150mm",
    "unit": "PCS"
  },
  {
    "index": 181,
    "code": "HM181",
    "name": "steel putty blade 8\"",
    "unit": "PCS"
  },
  {
    "index": 182,
    "code": "HM182",
    "name": "steel putty blade 5/6\"",
    "unit": "PCS"
  },
  {
    "index": 183,
    "code": "HM183",
    "name": "BALTI MID",
    "unit": "PCS"
  },
  {
    "index": 184,
    "code": "HM184",
    "name": "bucket 12no",
    "unit": "PCS"
  },
  {
    "index": 185,
    "code": "HM185",
    "name": "MEASURING TAPE",
    "unit": "NOS"
  },
  {
    "index": 186,
    "code": "HM186",
    "name": "sand paper 180",
    "unit": "PCS"
  },
  {
    "index": 187,
    "code": "HM186-B",
    "name": "bear disc 80",
    "unit": "PCS"
  },
  {
    "index": 188,
    "code": "HM187",
    "name": "bear disc 120",
    "unit": "PCS"
  },
  {
    "index": 189,
    "code": "HM188",
    "name": "welcro paper 600 grit",
    "unit": "PCS"
  },
  {
    "index": 190,
    "code": "HM189",
    "name": "WELDING ROD",
    "unit": "PCS"
  },
  {
    "index": 191,
    "code": "HM190",
    "name": "buffing machine",
    "unit": "PCS"
  },
  {
    "index": 192,
    "code": "HM191",
    "name": "c clamp big",
    "unit": "PCS"
  },
  {
    "index": 193,
    "code": "HM192",
    "name": "RED BRICK PIGMENT",
    "unit": "PCS"
  },
  {
    "index": 194,
    "code": "HM193",
    "name": "bear disc 80",
    "unit": "PCS"
  },
  {
    "index": 195,
    "code": "HM194",
    "name": "bear disc 120",
    "unit": "PCS"
  },
  {
    "index": 196,
    "code": "HM195",
    "name": "welcro paper 80",
    "unit": "PCS"
  },
  {
    "index": 197,
    "code": "HM196",
    "name": "welcro paper 120",
    "unit": "PCS"
  },
  {
    "index": 198,
    "code": "HM197",
    "name": "welcro paper 180",
    "unit": "PCS"
  },
  {
    "index": 199,
    "code": "HM198",
    "name": "welcro paper 220",
    "unit": "PCS"
  },
  {
    "index": 200,
    "code": "HM199",
    "name": "welcro paper 320",
    "unit": "PCS"
  },
  {
    "index": 201,
    "code": "HM200",
    "name": "welcro paper 400",
    "unit": "PCS"
  },
  {
    "index": 202,
    "code": "HM201",
    "name": "welcro paper 600",
    "unit": "PCS"
  },
  {
    "index": 203,
    "code": "HM202",
    "name": "sending machine pad",
    "unit": "PCS"
  },
  {
    "index": 204,
    "code": "HM203",
    "name": "bear disc 36",
    "unit": "PCS"
  },
  {
    "index": 205,
    "code": "HM204",
    "name": "handle",
    "unit": "PCS"
  },
  {
    "index": 206,
    "code": "HM205",
    "name": "Pliers (Pakkad)",
    "unit": "PCS"
  },
  {
    "index": 207,
    "code": "HM206",
    "name": "Round File",
    "unit": "PCS"
  },
  {
    "index": 208,
    "code": "HM207",
    "name": "Flat File",
    "unit": "PCS"
  },
  {
    "index": 209,
    "code": "HM208",
    "name": "Thundor File",
    "unit": "PCS"
  },
  {
    "index": 210,
    "code": "HM209",
    "name": "FAVDE HANDLE",
    "unit": "PCS"
  },
  {
    "index": 211,
    "code": "HM210",
    "name": "BROWAN Pigment",
    "unit": "PCS"
  },
  {
    "index": 212,
    "code": "HM211",
    "name": "TERRA COATA Pigment",
    "unit": "PCS"
  }
];

async function seed() {
  const prisma = new PrismaClient();
  try {
    let company = await prisma.company.findFirst({
      where: { id: '88c57ebc-b3b7-49e3-8d5d-6321a0e89015' }
    });
    if (!company) {
      company = await prisma.company.findFirst({
        orderBy: { createdAt: 'asc' }
      });
    }
    if (!company) {
      console.error('No company found in database! Creating default company...');
      company = await prisma.company.create({
        data: {
          id: '88c57ebc-b3b7-49e3-8d5d-6321a0e89015',
          publicId: 'COMP-001',
          name: 'Himalaya Corp',
        }
      });
    }

    console.log('Seeding 212 raw materials for company:', company.id, company.name);

    let count = 0;
    for (const m of materials) {
      const rm = await prisma.rawMaterial.upsert({
        where: { sku: m.code },
        update: {
          name: m.name,
          unit: m.unit,
          category: 'Raw Material',
          storageLocation: 'Raw Material Store',
          isActive: true,
          companyId: company.id
        },
        create: {
          publicId: 'RM-' + m.code,
          companyId: company.id,
          sku: m.code,
          name: m.name,
          unit: m.unit,
          category: 'Raw Material',
          storageLocation: 'Raw Material Store',
          minimumStock: 0,
          isActive: true
        }
      });

      // Upsert Product record
      await prisma.product.upsert({
        where: { id: rm.id },
        update: {
          name: m.name,
          sku: m.code,
          unit: m.unit,
          category: 'Raw Material',
          productType: 'RAW_MATERIAL',
          isActive: true,
          companyId: company.id
        },
        create: {
          id: rm.id,
          publicId: 'PROD-' + m.code,
          companyId: company.id,
          sku: m.code,
          name: m.name,
          unit: m.unit,
          category: 'Raw Material',
          productType: 'RAW_MATERIAL',
          unitPrice: 0,
          minimumStock: 0,
          isActive: true
        }
      });
      count++;
    }
    console.log(`Successfully seeded ${count} raw materials and product mirrors!`);
  } catch (err) {
    console.error('Error seeding materials:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
