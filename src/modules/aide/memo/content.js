/**
 * Aide-mémoire — structure (indépendante de la langue).
 * "@cle" = texte traduit (fichiers locales/<langue>.json, espace « memo ») ; sinon valeur littérale
 * (code, abréviation, nombre) affichée telle quelle dans toutes les langues.
 * Contenu repris de l'ancien site (pages/memo.php), vérifié et corrigé le 25/10/2026 :
 * trous de passage (ISO 273), forets STI M10/M12, couples 8.8/10.9/12.9 (VDI 2230, µ 0,14),
 * code couleur des frein-filets, DOT 5.1, test de sonde lambda, réglage de clé dynamométrique,
 * ordre de serrage de culasse (le schéma numéroté sans figure a été remplacé par la méthode),
 * pression d'injection directe, abréviations de capteurs (FPR = régulateur, pas capteur),
 * lignes de capteurs inventées ou en double supprimées.
 */
export const MEMO = [
 {
  "id": "threads",
  "items": [
   {
    "title": "@threads.i1.title",
    "blocks": [
     {
      "type": "table",
      "columns": [
       "@threads.i1.b1.h1",
       "@threads.i1.b1.h2",
       "@threads.i1.b1.h3",
       "@threads.i1.b1.h4",
       "@threads.i1.b1.h5"
      ],
      "rows": [
       [
        "M3x0.5",
        "0.5",
        "@threads.i1.b1.r1c3",
        "6g/6H",
        "@threads.i1.b1.r1c5"
       ],
       [
        "M4x0.7",
        "0.7",
        "@threads.i1.b1.r2c3",
        "6g/6H",
        "@threads.i1.b1.r2c5"
       ],
       [
        "M5x0.8",
        "0.8",
        "@threads.i1.b1.r3c3",
        "6g/6H",
        "@threads.i1.b1.r3c5"
       ],
       [
        "M6x1.0",
        "1.0",
        "@threads.i1.b1.r4c3",
        "6g/6H",
        "@threads.i1.b1.r4c5"
       ],
       [
        "M8x1.25",
        "1.25",
        "@threads.i1.b1.r5c3",
        "6g/6H",
        "@threads.i1.b1.r5c5"
       ],
       [
        "M10x1.5",
        "1.5",
        "@threads.i1.b1.r6c3",
        "6g/6H",
        "@threads.i1.b1.r6c5"
       ],
       [
        "M12x1.75",
        "1.75",
        "@threads.i1.b1.r7c3",
        "6g/6H",
        "@threads.i1.b1.r7c5"
       ],
       [
        "M14x2.0",
        "2.0",
        "@threads.i1.b1.r8c3",
        "6g/6H",
        "@threads.i1.b1.r8c5"
       ],
       [
        "M6x0.75",
        "0.75",
        "@threads.i1.b1.r9c3",
        "6g/6H",
        "@threads.i1.b1.r9c5"
       ],
       [
        "M8x1.0",
        "1.0",
        "@threads.i1.b1.r10c3",
        "6g/6H",
        "@threads.i1.b1.r10c5"
       ],
       [
        "M10x1.25",
        "1.25",
        "@threads.i1.b1.r11c3",
        "6g/6H",
        "@threads.i1.b1.r11c5"
       ],
       [
        "M12x1.5",
        "1.5",
        "@threads.i1.b1.r12c3",
        "6g/6H",
        "@threads.i1.b1.r12c5"
       ]
      ]
     }
    ]
   },
   {
    "title": "@threads.i2.title",
    "blocks": [
     {
      "type": "text",
      "text": "@threads.i2.b1.t"
     },
     {
      "type": "table",
      "columns": [
       "@threads.i2.b2.h1",
       "@threads.i2.b2.h2",
       "@threads.i2.b2.h3"
      ],
      "rows": [
       [
        "M3x0.5",
        "0.5",
        "2.5"
       ],
       [
        "M4x0.7",
        "0.7",
        "3.3"
       ],
       [
        "M5x0.8",
        "0.8",
        "4.2"
       ],
       [
        "M6x1.0",
        "1.0",
        "5.0"
       ],
       [
        "M8x1.25",
        "1.25",
        "6.8"
       ],
       [
        "M10x1.5",
        "1.5",
        "8.5"
       ],
       [
        "M12x1.75",
        "1.75",
        "10.2"
       ],
       [
        "M14x2.0",
        "2.0",
        "12.0"
       ],
       [
        "M10x1.25",
        "1.25",
        "8.8"
       ],
       [
        "M12x1.5",
        "1.5",
        "10.5"
       ]
      ]
     }
    ]
   },
   {
    "title": "@threads.i3.title",
    "blocks": [
     {
      "type": "table",
      "columns": [
       "@threads.i3.b1.h1",
       "@threads.i3.b1.h2",
       "@threads.i3.b1.h3",
       "@threads.i3.b1.h4"
      ],
      "rows": [
       [
        "M3",
        "3.2",
        "3.4",
        "3.6"
       ],
       [
        "M4",
        "4.3",
        "4.5",
        "4.8"
       ],
       [
        "M5",
        "5.3",
        "5.5",
        "5.8"
       ],
       [
        "M6",
        "6.4",
        "6.6",
        "7.0"
       ],
       [
        "M8",
        "8.4",
        "9.0",
        "10.0"
       ],
       [
        "M10",
        "10.5",
        "11.0",
        "12.0"
       ],
       [
        "M12",
        "13.0",
        "13.5",
        "14.5"
       ]
      ]
     },
     {
      "type": "note",
      "text": "@threads.i3.b2.t"
     }
    ]
   },
   {
    "title": "@threads.i4.title",
    "blocks": [
     {
      "type": "list",
      "items": [
       "@threads.i4.b1.l1",
       "@threads.i4.b1.l2",
       "@threads.i4.b1.l3",
       "@threads.i4.b1.l4"
      ]
     },
     {
      "type": "note",
      "text": "@threads.i4.b2.t"
     }
    ]
   }
  ]
 },
 {
  "id": "inserts",
  "items": [
   {
    "title": "@inserts.i1.title",
    "blocks": [
     {
      "type": "table",
      "columns": [
       "@inserts.i1.b1.h1",
       "@inserts.i1.b1.h2",
       "@inserts.i1.b1.h3",
       "@inserts.i1.b1.h4"
      ],
      "rows": [
       [
        "M5x0.8",
        "5.2",
        "M5x0.8 STI",
        "1D · 1.5D · 2D"
       ],
       [
        "M6x1.0",
        "6.3",
        "M6x1.0 STI",
        "1D · 1.5D · 2D · 3D"
       ],
       [
        "M8x1.25",
        "8.4",
        "M8x1.25 STI",
        "1D · 1.5D · 2D"
       ],
       [
        "M10x1.5",
        "10.5",
        "M10x1.5 STI",
        "1D · 1.5D · 2D"
       ],
       [
        "M12x1.75",
        "12.5",
        "M12x1.75 STI",
        "1D · 1.5D · 2D"
       ],
       [
        "M14x1.25",
        "14.3",
        "M14x1.25 STI",
        "1D · 1.5D"
       ]
      ]
     },
     {
      "type": "note",
      "text": "@inserts.i1.b2.t"
     }
    ]
   },
   {
    "title": "@inserts.i2.title",
    "blocks": [
     {
      "type": "list",
      "items": [
       "@inserts.i2.b1.l1",
       "@inserts.i2.b1.l2",
       "@inserts.i2.b1.l3",
       "@inserts.i2.b1.l4",
       "@inserts.i2.b1.l5",
       "@inserts.i2.b1.l6"
      ]
     },
     {
      "type": "warn",
      "text": "@inserts.i2.b2.t"
     }
    ]
   },
   {
    "title": "@inserts.i3.title",
    "blocks": [
     {
      "type": "table",
      "columns": [
       "@inserts.i3.b1.h1",
       "@inserts.i3.b1.h2"
      ],
      "rows": [
       [
        "@inserts.i3.b1.r1c1",
        "@inserts.i3.b1.r1c2"
       ],
       [
        "@inserts.i3.b1.r2c1",
        "@inserts.i3.b1.r2c2"
       ],
       [
        "@inserts.i3.b1.r3c1",
        "@inserts.i3.b1.r3c2"
       ],
       [
        "@inserts.i3.b1.r4c1",
        "@inserts.i3.b1.r4c2"
       ]
      ]
     }
    ]
   }
  ]
 },
 {
  "id": "torque",
  "items": [
   {
    "title": "@torque.i1.title",
    "blocks": [
     {
      "type": "table",
      "columns": [
       "@torque.i1.b1.h1",
       "@torque.i1.b1.h2",
       "@torque.i1.b1.h3"
      ],
      "rows": [
       [
        "M5",
        "6",
        "5"
       ],
       [
        "M6",
        "10",
        "8.5"
       ],
       [
        "M8",
        "25",
        "21"
       ],
       [
        "M10",
        "49",
        "42"
       ],
       [
        "M12",
        "85",
        "72"
       ],
       [
        "M14",
        "135",
        "115"
       ],
       [
        "M16",
        "210",
        "180"
       ]
      ]
     }
    ]
   },
   {
    "title": "@torque.i2.title",
    "blocks": [
     {
      "type": "table",
      "columns": [
       "@torque.i2.b1.h1",
       "@torque.i2.b1.h2",
       "@torque.i2.b1.h3"
      ],
      "rows": [
       [
        "M6",
        "15",
        "13"
       ],
       [
        "M8",
        "36",
        "31"
       ],
       [
        "M10",
        "72",
        "61"
       ],
       [
        "M12",
        "125",
        "105"
       ],
       [
        "M14",
        "200",
        "170"
       ],
       [
        "M16",
        "310",
        "265"
       ]
      ]
     }
    ]
   },
   {
    "title": "@torque.i3.title",
    "blocks": [
     {
      "type": "table",
      "columns": [
       "@torque.i3.b1.h1",
       "@torque.i3.b1.h2",
       "@torque.i3.b1.h3"
      ],
      "rows": [
       [
        "M6",
        "18",
        "15"
       ],
       [
        "M8",
        "43",
        "36"
       ],
       [
        "M10",
        "84",
        "71"
       ],
       [
        "M12",
        "145",
        "125"
       ],
       [
        "M14",
        "235",
        "200"
       ],
       [
        "M16",
        "365",
        "310"
       ]
      ]
     },
     {
      "type": "note",
      "text": "@torque.i3.b2.t"
     }
    ]
   },
   {
    "title": "@torque.i4.title",
    "blocks": [
     {
      "type": "list",
      "items": [
       "@torque.i4.b1.l1",
       "@torque.i4.b1.l2",
       "@torque.i4.b1.l3"
      ]
     }
    ]
   }
  ]
 },
 {
  "id": "engine_tightening",
  "items": [
   {
    "title": "@engine_tightening.i1.title",
    "blocks": [
     {
      "type": "list",
      "items": [
       "@engine_tightening.i1.b1.l1",
       "@engine_tightening.i1.b1.l2",
       "@engine_tightening.i1.b1.l3",
       "@engine_tightening.i1.b1.l4",
       "@engine_tightening.i1.b1.l5"
      ]
     },
     {
      "type": "warn",
      "text": "@engine_tightening.i1.b2.t"
     }
    ]
   },
   {
    "title": "@engine_tightening.i2.title",
    "blocks": [
     {
      "type": "table",
      "columns": [
       "@engine_tightening.i2.b1.h1",
       "@engine_tightening.i2.b1.h2"
      ],
      "rows": [
       [
        "@engine_tightening.i2.b1.r1c1",
        "22–28"
       ],
       [
        "@engine_tightening.i2.b1.r2c1",
        "18–24"
       ]
      ]
     },
     {
      "type": "note",
      "text": "@engine_tightening.i2.b2.t"
     }
    ]
   },
   {
    "title": "@engine_tightening.i3.title",
    "blocks": [
     {
      "type": "table",
      "columns": [
       "@engine_tightening.i3.b1.h1",
       "@engine_tightening.i3.b1.h2",
       "@engine_tightening.i3.b1.h3"
      ],
      "rows": [
       [
        "M10",
        "10.9",
        "45–60 N·m + 90°"
       ],
       [
        "M12",
        "10.9",
        "60–80 N·m + 90°"
       ],
       [
        "M12",
        "12.9",
        "80–100 N·m + 90°"
       ]
      ]
     },
     {
      "type": "note",
      "text": "@engine_tightening.i3.b2.t"
     }
    ]
   },
   {
    "title": "@engine_tightening.i4.title",
    "blocks": [
     {
      "type": "table",
      "columns": [
       "@engine_tightening.i4.b1.h1",
       "@engine_tightening.i4.b1.h2"
      ],
      "rows": [
       [
        "@engine_tightening.i4.b1.r1c1",
        "0.15–0.25"
       ],
       [
        "@engine_tightening.i4.b1.r2c1",
        "0.25–0.35"
       ]
      ]
     },
     {
      "type": "note",
      "text": "@engine_tightening.i4.b2.t"
     }
    ]
   }
  ]
 },
 {
  "id": "wheels",
  "items": [
   {
    "title": "@wheels.i1.title",
    "blocks": [
     {
      "type": "table",
      "columns": [
       "@wheels.i1.b1.h1",
       "@wheels.i1.b1.h2",
       "@wheels.i1.b1.h3",
       "@wheels.i1.b1.h4"
      ],
      "rows": [
       [
        "M12x1.25 / 1.5",
        "95–120",
        "110–130",
        "@wheels.i1.b1.r1c4"
       ],
       [
        "M14x1.25 / 1.5",
        "110–140",
        "120–150",
        "@wheels.i1.b1.r2c4"
       ],
       [
        "1/2\"-20 UNF",
        "95–120",
        "110–130",
        "@wheels.i1.b1.r3c4"
       ]
      ]
     }
    ]
   },
   {
    "title": "@wheels.i2.title",
    "blocks": [
     {
      "type": "list",
      "items": [
       "@wheels.i2.b1.l1",
       "@wheels.i2.b1.l2",
       "@wheels.i2.b1.l3"
      ]
     },
     {
      "type": "warn",
      "text": "@wheels.i2.b2.t"
     }
    ]
   },
   {
    "title": "@wheels.i3.title",
    "blocks": [
     {
      "type": "table",
      "columns": [
       "@wheels.i3.b1.h1",
       "@wheels.i3.b1.h2"
      ],
      "rows": [
       [
        "82",
        "475"
       ],
       [
        "85",
        "515"
       ],
       [
        "88",
        "560"
       ],
       [
        "91",
        "615"
       ],
       [
        "94",
        "670"
       ],
       [
        "98",
        "750"
       ],
       [
        "102",
        "850"
       ],
       [
        "105",
        "925"
       ]
      ]
     }
    ]
   },
   {
    "title": "@wheels.i4.title",
    "blocks": [
     {
      "type": "table",
      "columns": [
       "@wheels.i4.b1.h1",
       "@wheels.i4.b1.h2"
      ],
      "rows": [
       [
        "T",
        "190"
       ],
       [
        "H",
        "210"
       ],
       [
        "V",
        "240"
       ],
       [
        "W",
        "270"
       ],
       [
        "Y",
        "300"
       ],
       [
        "(Y)",
        "> 300"
       ]
      ]
     }
    ]
   }
  ]
 },
 {
  "id": "brakes",
  "items": [
   {
    "title": "@brakes.i1.title",
    "blocks": [
     {
      "type": "table",
      "columns": [
       "@brakes.i1.b1.h1",
       "@brakes.i1.b1.h2",
       "@brakes.i1.b1.h3",
       "@brakes.i1.b1.h4"
      ],
      "rows": [
       [
        "DOT 3",
        "205",
        "140",
        "@brakes.i1.b1.r1c4"
       ],
       [
        "DOT 4",
        "230",
        "155",
        "@brakes.i1.b1.r2c4"
       ],
       [
        "DOT 5.1",
        "260",
        "180",
        "@brakes.i1.b1.r3c4"
       ],
       [
        "@brakes.i1.b1.r4c1",
        "260",
        "180",
        "@brakes.i1.b1.r4c4"
       ]
      ]
     },
     {
      "type": "note",
      "text": "@brakes.i1.b2.t"
     }
    ]
   },
   {
    "title": "@brakes.i2.title",
    "blocks": [
     {
      "type": "table",
      "columns": [
       "@brakes.i2.b1.h1",
       "@brakes.i2.b1.h2"
      ],
      "rows": [
       [
        "@brakes.i2.b1.r1c1",
        "25–35"
       ],
       [
        "@brakes.i2.b1.r2c1",
        "80–110"
       ],
       [
        "@brakes.i2.b1.r3c1",
        "10–15"
       ],
       [
        "@brakes.i2.b1.r4c1",
        "15–20"
       ]
      ]
     }
    ]
   },
   {
    "title": "@brakes.i3.title",
    "blocks": [
     {
      "type": "list",
      "items": [
       "@brakes.i3.b1.l1",
       "@brakes.i3.b1.l2",
       "@brakes.i3.b1.l3"
      ]
     },
     {
      "type": "note",
      "text": "@brakes.i3.b2.t"
     }
    ]
   }
  ]
 },
 {
  "id": "coolant",
  "items": [
   {
    "title": "@coolant.i1.title",
    "blocks": [
     {
      "type": "table",
      "columns": [
       "@coolant.i1.b1.h1",
       "@coolant.i1.b1.h2",
       "@coolant.i1.b1.h3",
       "@coolant.i1.b1.h4"
      ],
      "rows": [
       [
        "IAT",
        "@coolant.i1.b1.r1c2",
        "@coolant.i1.b1.r1c3",
        "@coolant.i1.b1.r1c4"
       ],
       [
        "OAT",
        "@coolant.i1.b1.r2c2",
        "@coolant.i1.b1.r2c3",
        "@coolant.i1.b1.r2c4"
       ],
       [
        "HOAT",
        "@coolant.i1.b1.r3c2",
        "@coolant.i1.b1.r3c3",
        "@coolant.i1.b1.r3c4"
       ],
       [
        "Si-OAT (G12+, G13)",
        "@coolant.i1.b1.r4c2",
        "@coolant.i1.b1.r4c3",
        "@coolant.i1.b1.r4c4"
       ]
      ]
     },
     {
      "type": "warn",
      "text": "@coolant.i1.b2.t"
     }
    ]
   },
   {
    "title": "@coolant.i2.title",
    "blocks": [
     {
      "type": "list",
      "items": [
       "@coolant.i2.b1.l1",
       "@coolant.i2.b1.l2",
       "@coolant.i2.b1.l3"
      ]
     },
     {
      "type": "note",
      "text": "@coolant.i2.b2.t"
     }
    ]
   }
  ]
 },
 {
  "id": "electrical",
  "items": [
   {
    "title": "@electrical.i1.title",
    "blocks": [
     {
      "type": "table",
      "columns": [
       "@electrical.i1.b1.h1",
       "@electrical.i1.b1.h2"
      ],
      "rows": [
       [
        "5 A",
        "@electrical.i1.b1.r1c2"
       ],
       [
        "10 A",
        "@electrical.i1.b1.r2c2"
       ],
       [
        "15 A",
        "@electrical.i1.b1.r3c2"
       ],
       [
        "20 A",
        "@electrical.i1.b1.r4c2"
       ],
       [
        "30 A",
        "@electrical.i1.b1.r5c2"
       ]
      ]
     }
    ]
   },
   {
    "title": "@electrical.i2.title",
    "blocks": [
     {
      "type": "table",
      "columns": [
       "@electrical.i2.b1.h1",
       "@electrical.i2.b1.h2"
      ],
      "rows": [
       [
        "@electrical.i2.b1.r1c1",
        "5–7"
       ],
       [
        "@electrical.i2.b1.r2c1",
        "10–12"
       ],
       [
        "@electrical.i2.b1.r3c1",
        "12–15"
       ]
      ]
     }
    ]
   },
   {
    "title": "@electrical.i3.title",
    "blocks": [
     {
      "type": "table",
      "columns": [
       "@electrical.i3.b1.h1",
       "@electrical.i3.b1.h2"
      ],
      "rows": [
       [
        "5",
        "0.5"
       ],
       [
        "10",
        "1.0"
       ],
       [
        "15",
        "1.5"
       ],
       [
        "25",
        "2.5"
       ],
       [
        "40",
        "6"
       ],
       [
        "60",
        "10"
       ],
       [
        "100",
        "25"
       ]
      ]
     },
     {
      "type": "note",
      "text": "@electrical.i3.b2.t"
     }
    ]
   },
   {
    "title": "@electrical.i4.title",
    "blocks": [
     {
      "type": "table",
      "columns": [
       "@electrical.i4.b1.h1",
       "@electrical.i4.b1.h2",
       "@electrical.i4.b1.h3"
      ],
      "rows": [
       [
        "@electrical.i4.b1.r1c1",
        "@electrical.i4.b1.r1c2",
        "@electrical.i4.b1.r1c3"
       ],
       [
        "@electrical.i4.b1.r2c1",
        "> 9.5 V",
        "@electrical.i4.b1.r2c3"
       ],
       [
        "@electrical.i4.b1.r3c1",
        "13.8–14.7 V",
        "@electrical.i4.b1.r3c3"
       ]
      ]
     }
    ]
   }
  ]
 },
 {
  "id": "diagnostics",
  "items": [
   {
    "title": "@diagnostics.i1.title",
    "blocks": [
     {
      "type": "table",
      "columns": [
       "@diagnostics.i1.b1.h1",
       "@diagnostics.i1.b1.h2",
       "@diagnostics.i1.b1.h3",
       "@diagnostics.i1.b1.h4"
      ],
      "rows": [
       [
        "P0300",
        "@diagnostics.i1.b1.r1c2",
        "@diagnostics.i1.b1.r1c3",
        "@diagnostics.i1.b1.r1c4"
       ],
       [
        "P0171",
        "@diagnostics.i1.b1.r2c2",
        "@diagnostics.i1.b1.r2c3",
        "@diagnostics.i1.b1.r2c4"
       ],
       [
        "P0172",
        "@diagnostics.i1.b1.r3c2",
        "@diagnostics.i1.b1.r3c3",
        "@diagnostics.i1.b1.r3c4"
       ],
       [
        "P0420",
        "@diagnostics.i1.b1.r4c2",
        "@diagnostics.i1.b1.r4c3",
        "@diagnostics.i1.b1.r4c4"
       ],
       [
        "P0106",
        "@diagnostics.i1.b1.r5c2",
        "@diagnostics.i1.b1.r5c3",
        "@diagnostics.i1.b1.r5c4"
       ],
       [
        "P0335",
        "@diagnostics.i1.b1.r6c2",
        "@diagnostics.i1.b1.r6c3",
        "@diagnostics.i1.b1.r6c4"
       ],
       [
        "P0234",
        "@diagnostics.i1.b1.r7c2",
        "@diagnostics.i1.b1.r7c3",
        "@diagnostics.i1.b1.r7c4"
       ]
      ]
     }
    ]
   },
   {
    "title": "@diagnostics.i2.title",
    "blocks": [
     {
      "type": "list",
      "items": [
       "@diagnostics.i2.b1.l1",
       "@diagnostics.i2.b1.l2",
       "@diagnostics.i2.b1.l3",
       "@diagnostics.i2.b1.l4"
      ]
     },
     {
      "type": "note",
      "text": "@diagnostics.i2.b2.t"
     }
    ]
   }
  ]
 },
 {
  "id": "tools",
  "items": [
   {
    "title": "@tools.i1.title",
    "blocks": [
     {
      "type": "list",
      "items": [
       "@tools.i1.b1.l1",
       "@tools.i1.b1.l2",
       "@tools.i1.b1.l3"
      ]
     },
     {
      "type": "warn",
      "text": "@tools.i1.b2.t"
     }
    ]
   },
   {
    "title": "@tools.i2.title",
    "blocks": [
     {
      "type": "text",
      "text": "@tools.i2.b1.t"
     },
     {
      "type": "list",
      "items": [
       "@tools.i2.b2.l1",
       "@tools.i2.b2.l2",
       "@tools.i2.b2.l3"
      ]
     }
    ]
   },
   {
    "title": "@tools.i3.title",
    "blocks": [
     {
      "type": "table",
      "columns": [
       "@tools.i3.b1.h1",
       "@tools.i3.b1.h2"
      ],
      "rows": [
       [
        "@tools.i3.b1.r1c1",
        "@tools.i3.b1.r1c2"
       ],
       [
        "@tools.i3.b1.r2c1",
        "@tools.i3.b1.r2c2"
       ],
       [
        "@tools.i3.b1.r3c1",
        "@tools.i3.b1.r3c2"
       ],
       [
        "@tools.i3.b1.r4c1",
        "@tools.i3.b1.r4c2"
       ]
      ]
     },
     {
      "type": "warn",
      "text": "@tools.i3.b2.t"
     }
    ]
   },
   {
    "title": "@tools.i4.title",
    "blocks": [
     {
      "type": "table",
      "columns": [
       "@tools.i4.b1.h1",
       "@tools.i4.b1.h2"
      ],
      "rows": [
       [
        "1 N·m",
        "0.7376 lb·ft"
       ],
       [
        "1 lb·ft",
        "1.3558 N·m"
       ],
       [
        "1 N·m",
        "0.10197 kgf·m"
       ],
       [
        "1 bar",
        "100 kPa = 14.504 psi"
       ],
       [
        "1 psi",
        "6.895 kPa"
       ],
       [
        "°F",
        "°C × 9/5 + 32"
       ],
       [
        "K",
        "°C + 273.15"
       ],
       [
        "1 in",
        "25.4 mm"
       ],
       [
        "1 hp",
        "@tools.i4.b1.r9c2"
       ]
      ]
     }
    ]
   }
  ]
 },
 {
  "id": "alignment",
  "items": [
   {
    "title": "@alignment.i1.title",
    "blocks": [
     {
      "type": "table",
      "columns": [
       "@alignment.i1.b1.h1",
       "@alignment.i1.b1.h2",
       "@alignment.i1.b1.h3"
      ],
      "rows": [
       [
        "@alignment.i1.b1.r1c1",
        "−1.0° … 0°",
        "@alignment.i1.b1.r1c3"
       ],
       [
        "@alignment.i1.b1.r2c1",
        "−2.0° … −0.5°",
        "@alignment.i1.b1.r2c3"
       ],
       [
        "@alignment.i1.b1.r3c1",
        "0 … +0.2°",
        "@alignment.i1.b1.r3c3"
       ],
       [
        "@alignment.i1.b1.r4c1",
        "+0.1 … +0.4°",
        "@alignment.i1.b1.r4c3"
       ],
       [
        "@alignment.i1.b1.r5c1",
        "+3° … +7°",
        "@alignment.i1.b1.r5c3"
       ]
      ]
     },
     {
      "type": "note",
      "text": "@alignment.i1.b2.t"
     }
    ]
   },
   {
    "title": "@alignment.i2.title",
    "blocks": [
     {
      "type": "table",
      "columns": [
       "@alignment.i2.b1.h1",
       "@alignment.i2.b1.h2"
      ],
      "rows": [
       [
        "@alignment.i2.b1.r1c1",
        "@alignment.i2.b1.r1c2"
       ],
       [
        "@alignment.i2.b1.r2c1",
        "@alignment.i2.b1.r2c2"
       ],
       [
        "@alignment.i2.b1.r3c1",
        "@alignment.i2.b1.r3c2"
       ],
       [
        "@alignment.i2.b1.r4c1",
        "@alignment.i2.b1.r4c2"
       ],
       [
        "@alignment.i2.b1.r5c1",
        "@alignment.i2.b1.r5c2"
       ]
      ]
     }
    ]
   }
  ]
 },
 {
  "id": "mixture",
  "items": [
   {
    "title": "@mixture.i1.title",
    "blocks": [
     {
      "type": "table",
      "columns": [
       "AFR",
       "@mixture.i1.b1.h2",
       "@mixture.i1.b1.h3",
       "@mixture.i1.b1.h4"
      ],
      "rows": [
       [
        "12.0–12.5",
        "0.82–0.85",
        "@mixture.i1.b1.r1c3",
        "@mixture.i1.b1.r1c4"
       ],
       [
        "12.8–13.2",
        "0.87–0.90",
        "@mixture.i1.b1.r2c3",
        "@mixture.i1.b1.r2c4"
       ],
       [
        "14.7",
        "1.00",
        "@mixture.i1.b1.r3c3",
        "@mixture.i1.b1.r3c4"
       ],
       [
        "15.5–16.5",
        "1.05–1.12",
        "@mixture.i1.b1.r4c3",
        "@mixture.i1.b1.r4c4"
       ]
      ]
     },
     {
      "type": "note",
      "text": "@mixture.i1.b2.t"
     }
    ]
   },
   {
    "title": "@mixture.i2.title",
    "blocks": [
     {
      "type": "table",
      "columns": [
       "@mixture.i2.b1.h1",
       "@mixture.i2.b1.h2",
       "@mixture.i2.b1.h3",
       "@mixture.i2.b1.h4"
      ],
      "rows": [
       [
        "@mixture.i2.b1.r1c1",
        "@mixture.i2.b1.r1c2",
        "@mixture.i2.b1.r1c3",
        "@mixture.i2.b1.r1c4"
       ],
       [
        "@mixture.i2.b1.r2c1",
        "@mixture.i2.b1.r2c2",
        "@mixture.i2.b1.r2c3",
        "—"
       ],
       [
        "@mixture.i2.b1.r3c1",
        "@mixture.i2.b1.r3c2",
        "@mixture.i2.b1.r3c3",
        "@mixture.i2.b1.r3c4"
       ],
       [
        "@mixture.i2.b1.r4c1",
        "@mixture.i2.b1.r4c2",
        "@mixture.i2.b1.r4c3",
        "@mixture.i2.b1.r4c4"
       ]
      ]
     }
    ]
   }
  ]
 },
 {
  "id": "spark",
  "items": [
   {
    "title": "@spark.i1.title",
    "blocks": [
     {
      "type": "table",
      "columns": [
       "@spark.i1.b1.h1",
       "@spark.i1.b1.h2",
       "@spark.i1.b1.h3"
      ],
      "rows": [
       [
        "@spark.i1.b1.r1c1",
        "0.8–1.0",
        "@spark.i1.b1.r1c3"
       ],
       [
        "@spark.i1.b1.r2c1",
        "0.7–0.8",
        "@spark.i1.b1.r2c3"
       ],
       [
        "@spark.i1.b1.r3c1",
        "0.5–0.7",
        "@spark.i1.b1.r3c3"
       ]
      ]
     },
     {
      "type": "note",
      "text": "@spark.i1.b2.t"
     }
    ]
   },
   {
    "title": "@spark.i2.title",
    "blocks": [
     {
      "type": "list",
      "items": [
       "@spark.i2.b1.l1",
       "@spark.i2.b1.l2",
       "@spark.i2.b1.l3",
       "@spark.i2.b1.l4",
       "@spark.i2.b1.l5"
      ]
     }
    ]
   },
   {
    "title": "@spark.i3.title",
    "blocks": [
     {
      "type": "list",
      "items": [
       "@spark.i3.b1.l1",
       "@spark.i3.b1.l2",
       "@spark.i3.b1.l3",
       "@spark.i3.b1.l4",
       "@spark.i3.b1.l5"
      ]
     }
    ]
   },
   {
    "title": "@spark.i4.title",
    "blocks": [
     {
      "type": "list",
      "items": [
       "@spark.i4.b1.l1",
       "@spark.i4.b1.l2",
       "@spark.i4.b1.l3"
      ]
     }
    ]
   }
  ]
 },
 {
  "id": "egt",
  "items": [
   {
    "title": "@egt.i1.title",
    "blocks": [
     {
      "type": "table",
      "columns": [
       "EGT (°C)",
       "@egt.i1.b1.h2",
       "@egt.i1.b1.h3"
      ],
      "rows": [
       [
        "700–850",
        "@egt.i1.b1.r1c2",
        "@egt.i1.b1.r1c3"
       ],
       [
        "850–950",
        "@egt.i1.b1.r2c2",
        "@egt.i1.b1.r2c3"
       ],
       [
        "950–1050",
        "@egt.i1.b1.r3c2",
        "@egt.i1.b1.r3c3"
       ],
       [
        "> 1050",
        "@egt.i1.b1.r4c2",
        "@egt.i1.b1.r4c3"
       ]
      ]
     },
     {
      "type": "note",
      "text": "@egt.i1.b2.t"
     }
    ]
   }
  ]
 },
 {
  "id": "faults",
  "items": [
   {
    "title": "@faults.i1.title",
    "blocks": [
     {
      "type": "table",
      "columns": [
       "@faults.i1.b1.h1",
       "@faults.i1.b1.h2",
       "@faults.i1.b1.h3"
      ],
      "rows": [
       [
        "@faults.i1.b1.r1c1",
        "@faults.i1.b1.r1c2",
        "@faults.i1.b1.r1c3"
       ],
       [
        "@faults.i1.b1.r2c1",
        "@faults.i1.b1.r2c2",
        "@faults.i1.b1.r2c3"
       ],
       [
        "@faults.i1.b1.r3c1",
        "@faults.i1.b1.r3c2",
        "@faults.i1.b1.r3c3"
       ],
       [
        "@faults.i1.b1.r4c1",
        "@faults.i1.b1.r4c2",
        "@faults.i1.b1.r4c3"
       ],
       [
        "@faults.i1.b1.r5c1",
        "@faults.i1.b1.r5c2",
        "@faults.i1.b1.r5c3"
       ]
      ]
     }
    ]
   }
  ]
 },
 {
  "id": "maintenance",
  "items": [
   {
    "title": "@maintenance.i1.title",
    "blocks": [
     {
      "type": "list",
      "items": [
       "@maintenance.i1.b1.l1",
       "@maintenance.i1.b1.l2",
       "@maintenance.i1.b1.l3",
       "@maintenance.i1.b1.l4",
       "@maintenance.i1.b1.l5",
       "@maintenance.i1.b1.l6",
       "@maintenance.i1.b1.l7",
       "@maintenance.i1.b1.l8"
      ]
     }
    ]
   }
  ]
 },
 {
  "id": "pressures",
  "items": [
   {
    "title": "@pressures.i1.title",
    "blocks": [
     {
      "type": "table",
      "columns": [
       "@pressures.i1.b1.h1",
       "@pressures.i1.b1.h2",
       "@pressures.i1.b1.h3"
      ],
      "rows": [
       [
        "@pressures.i1.b1.r1c1",
        "@pressures.i1.b1.r1c2",
        "@pressures.i1.b1.r1c3"
       ],
       [
        "@pressures.i1.b1.r2c1",
        "@pressures.i1.b1.r2c2",
        "@pressures.i1.b1.r2c3"
       ],
       [
        "@pressures.i1.b1.r3c1",
        "90–110 °C",
        "@pressures.i1.b1.r3c3"
       ]
      ]
     }
    ]
   },
   {
    "title": "@pressures.i2.title",
    "blocks": [
     {
      "type": "table",
      "columns": [
       "@pressures.i2.b1.h1",
       "@pressures.i2.b1.h2",
       "@pressures.i2.b1.h3"
      ],
      "rows": [
       [
        "@pressures.i2.b1.r1c1",
        "@pressures.i2.b1.r1c2",
        "@pressures.i2.b1.r1c3"
       ],
       [
        "@pressures.i2.b1.r2c1",
        "@pressures.i2.b1.r2c2",
        "@pressures.i2.b1.r2c3"
       ],
       [
        "@pressures.i2.b1.r3c1",
        "@pressures.i2.b1.r3c2",
        "@pressures.i2.b1.r3c3"
       ]
      ]
     }
    ]
   }
  ]
 },
 {
  "id": "sensors",
  "items": [
   {
    "title": "@sensors.i1.title",
    "blocks": [
     {
      "type": "table",
      "columns": [
       "@sensors.i1.b1.h1",
       "@sensors.i1.b1.h2",
       "@sensors.i1.b1.h3",
       "@sensors.i1.b1.h4"
      ],
      "rows": [
       [
        "@sensors.i1.b1.r1c1",
        "ECT",
        "@sensors.i1.b1.r1c3",
        "@sensors.i1.b1.r1c4"
       ],
       [
        "@sensors.i1.b1.r2c1",
        "IAT",
        "@sensors.i1.b1.r2c3",
        "@sensors.i1.b1.r2c4"
       ],
       [
        "@sensors.i1.b1.r3c1",
        "MAP",
        "@sensors.i1.b1.r3c3",
        "@sensors.i1.b1.r3c4"
       ],
       [
        "@sensors.i1.b1.r4c1",
        "MAF",
        "@sensors.i1.b1.r4c3",
        "@sensors.i1.b1.r4c4"
       ],
       [
        "@sensors.i1.b1.r5c1",
        "O2",
        "@sensors.i1.b1.r5c3",
        "0.1–0.9 V"
       ],
       [
        "@sensors.i1.b1.r6c1",
        "UEGO",
        "@sensors.i1.b1.r6c3",
        "λ 0.65–1.30"
       ],
       [
        "@sensors.i1.b1.r7c1",
        "KS",
        "@sensors.i1.b1.r7c3",
        "@sensors.i1.b1.r7c4"
       ],
       [
        "@sensors.i1.b1.r8c1",
        "CKP",
        "@sensors.i1.b1.r8c3",
        "@sensors.i1.b1.r8c4"
       ],
       [
        "@sensors.i1.b1.r9c1",
        "CMP",
        "@sensors.i1.b1.r9c3",
        "@sensors.i1.b1.r9c4"
       ],
       [
        "@sensors.i1.b1.r10c1",
        "TPS",
        "@sensors.i1.b1.r10c3",
        "≈ 0.5–4.5 V"
       ],
       [
        "@sensors.i1.b1.r11c1",
        "FPS",
        "@sensors.i1.b1.r11c3",
        "@sensors.i1.b1.r11c4"
       ],
       [
        "@sensors.i1.b1.r12c1",
        "EOT",
        "@sensors.i1.b1.r12c3",
        "90–110 °C"
       ],
       [
        "@sensors.i1.b1.r13c1",
        "EOP",
        "@sensors.i1.b1.r13c3",
        "@sensors.i1.b1.r13c4"
       ],
       [
        "@sensors.i1.b1.r14c1",
        "EGT",
        "@sensors.i1.b1.r14c3",
        "@sensors.i1.b1.r14c4"
       ],
       [
        "@sensors.i1.b1.r15c1",
        "IAT2",
        "@sensors.i1.b1.r15c3",
        "@sensors.i1.b1.r15c4"
       ],
       [
        "@sensors.i1.b1.r16c1",
        "FT",
        "@sensors.i1.b1.r16c3",
        "@sensors.i1.b1.r16c4"
       ],
       [
        "@sensors.i1.b1.r17c1",
        "Flex",
        "@sensors.i1.b1.r17c3",
        "0–85 %"
       ],
       [
        "@sensors.i1.b1.r18c1",
        "WG",
        "@sensors.i1.b1.r18c3",
        "@sensors.i1.b1.r18c4"
       ],
       [
        "NOx",
        "NOx",
        "@sensors.i1.b1.r19c3",
        "@sensors.i1.b1.r19c4"
       ]
      ]
     }
    ]
   }
  ]
 }
];
