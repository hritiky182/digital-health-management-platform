/**
 * CareAxis Diagnostic & Laboratory Catalog
 * Test panels, specimens, reference ranges, critical threshold alerts, and standard turnaround times.
 */

export const LAB_TEST_CATALOG = [
  {
    id: 'lab-fbc',
    code: 'LAB-CBC-01',
    name: 'Full Blood Count (Complete Blood Count)',
    panel: 'Hematology',
    specimen: 'Whole Blood (EDTA Purple Top)',
    tatHours: 4,
    cost: 25.00,
    parameters: [
      { name: 'Hemoglobin (Hb)', unit: 'g/dL', normalMin: 12.0, normalMax: 17.5, criticalLow: 7.0, criticalHigh: 20.0 },
      { name: 'White Cell Count (WBC)', unit: 'x10^9/L', normalMin: 4.0, normalMax: 11.0, criticalLow: 2.0, criticalHigh: 25.0 },
      { name: 'Platelets', unit: 'x10^9/L', normalMin: 150, normalMax: 450, criticalLow: 50, criticalHigh: 900 },
      { name: 'Hematocrit (Hct)', unit: '%', normalMin: 36.0, normalMax: 50.0, criticalLow: 21.0, criticalHigh: 60.0 },
    ]
  },
  {
    id: 'lab-glu',
    code: 'LAB-GLU-02',
    name: 'Fasting Blood Glucose',
    panel: 'Biochemistry',
    specimen: 'Plasma (Fluoride Grey Top)',
    tatHours: 2,
    cost: 15.00,
    parameters: [
      { name: 'Fasting Glucose', unit: 'mmol/L', normalMin: 3.9, normalMax: 5.6, criticalLow: 2.8, criticalHigh: 19.4 },
    ]
  },
  {
    id: 'lab-hba1c',
    code: 'LAB-A1C-03',
    name: 'Glycated Hemoglobin (HbA1c)',
    panel: 'Biochemistry',
    specimen: 'Whole Blood (EDTA)',
    tatHours: 6,
    cost: 38.00,
    parameters: [
      { name: 'HbA1c', unit: '%', normalMin: 4.0, normalMax: 5.6, criticalLow: 3.5, criticalHigh: 11.0 },
    ]
  },
  {
    id: 'lab-rft',
    code: 'LAB-RFT-04',
    name: 'Renal Function Panel (Urea & Electrolytes)',
    panel: 'Biochemistry',
    specimen: 'Serum (SST Gold Top)',
    tatHours: 4,
    cost: 45.00,
    parameters: [
      { name: 'Creatinine', unit: 'umol/L', normalMin: 53, normalMax: 106, criticalLow: 30, criticalHigh: 450 },
      { name: 'Urea', unit: 'mmol/L', normalMin: 2.5, normalMax: 7.8, criticalLow: 1.0, criticalHigh: 30.0 },
      { name: 'Potassium (K+)', unit: 'mmol/L', normalMin: 3.5, normalMax: 5.0, criticalLow: 2.8, criticalHigh: 6.2 },
      { name: 'Sodium (Na+)', unit: 'mmol/L', normalMin: 135, normalMax: 145, criticalLow: 120, criticalHigh: 155 },
      { name: 'eGFR', unit: 'mL/min/1.73m2', normalMin: 60, normalMax: 120, criticalLow: 15, criticalHigh: 150 },
    ]
  },
  {
    id: 'lab-lft',
    code: 'LAB-LFT-05',
    name: 'Liver Function Panel',
    panel: 'Biochemistry',
    specimen: 'Serum (SST Gold Top)',
    tatHours: 4,
    cost: 48.00,
    parameters: [
      { name: 'ALT (Alanine Aminotransferase)', unit: 'U/L', normalMin: 7, normalMax: 56, criticalLow: 0, criticalHigh: 300 },
      { name: 'AST (Aspartate Aminotransferase)', unit: 'U/L', normalMin: 10, normalMax: 40, criticalLow: 0, criticalHigh: 300 },
      { name: 'Total Bilirubin', unit: 'umol/L', normalMin: 3, normalMax: 21, criticalLow: 0, criticalHigh: 100 },
      { name: 'Albumin', unit: 'g/L', normalMin: 35, normalMax: 50, criticalLow: 20, criticalHigh: 60 },
    ]
  },
  {
    id: 'lab-lip',
    code: 'LAB-LIP-06',
    name: 'Lipid Profile (Fasting)',
    panel: 'Biochemistry',
    specimen: 'Serum (SST Gold Top)',
    tatHours: 4,
    cost: 42.00,
    parameters: [
      { name: 'Total Cholesterol', unit: 'mmol/L', normalMin: 3.0, normalMax: 5.2, criticalLow: 2.0, criticalHigh: 10.0 },
      { name: 'HDL Cholesterol', unit: 'mmol/L', normalMin: 1.0, normalMax: 2.2, criticalLow: 0.6, criticalHigh: 3.0 },
      { name: 'LDL Cholesterol', unit: 'mmol/L', normalMin: 1.5, normalMax: 3.4, criticalLow: 0.8, criticalHigh: 7.0 },
      { name: 'Triglycerides', unit: 'mmol/L', normalMin: 0.5, normalMax: 1.7, criticalLow: 0.3, criticalHigh: 8.0 },
    ]
  },
  {
    id: 'lab-mal',
    code: 'LAB-MAL-07',
    name: 'Malaria Rapid Diagnostic Test & Smear',
    panel: 'Microbiology & Parasitology',
    specimen: 'Capillary / Venous Blood',
    tatHours: 1,
    cost: 18.00,
    parameters: [
      { name: 'Malaria Ag (P.falciparum)', unit: 'Qualitative', normalMin: 'Negative', normalMax: 'Negative', criticalLow: '', criticalHigh: 'Positive' },
      { name: 'Parasite Density', unit: 'parasites/uL', normalMin: 0, normalMax: 0, criticalLow: 0, criticalHigh: 50000 },
    ]
  },
  {
    id: 'lab-uri',
    code: 'LAB-URI-08',
    name: 'Automated Urinalysis & Microscopy',
    panel: 'Microscopy',
    specimen: 'Mid-stream Urine (Sterile Cup)',
    tatHours: 2,
    cost: 16.00,
    parameters: [
      { name: 'Protein', unit: 'mg/dL', normalMin: 'Negative', normalMax: 'Negative', criticalLow: '', criticalHigh: '3+ (300mg/dL)' },
      { name: 'Leukocyte Esterase', unit: 'Qualitative', normalMin: 'Negative', normalMax: 'Negative', criticalLow: '', criticalHigh: 'Large' },
      { name: 'Nitrite', unit: 'Qualitative', normalMin: 'Negative', normalMax: 'Negative', criticalLow: '', criticalHigh: 'Positive' },
    ]
  }
];
