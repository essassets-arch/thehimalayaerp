export interface SalaryInputData {
  basicSalary: number;
  hraPercentage?: number;
  ltaPercentage?: number;
  educationAllowancePercentage?: number;
  conveyancePercentage?: number;
  employeeEpfPercentage?: number;
  employeeEsicPercentage?: number;
  professionalTaxPercentage?: number;
  companyEpfPercentage?: number;
  companyEsicPercentage?: number;
  gratuityPercentage?: number;
}

export function round(val: number): number {
  return Math.round((Number(val || 0) + Number.EPSILON) * 100) / 100;
}

export function calculateSalaryStructure(input: SalaryInputData) {
  const basic = round(Number(input.basicSalary) || 0);
  const hraPct = round(Number(input.hraPercentage) || 0);
  const ltaPct = round(Number(input.ltaPercentage) || 0);
  const eduPct = round(Number(input.educationAllowancePercentage) || 0);
  const convPct = round(Number(input.conveyancePercentage) || 0);

  const hraAmount = round((basic * hraPct) / 100);
  const ltaAmount = round((basic * ltaPct) / 100);
  const educationAllowanceAmount = round((basic * eduPct) / 100);
  const conveyanceAmount = round((basic * convPct) / 100);

  const grossTotalA = round(basic + hraAmount + ltaAmount + educationAllowanceAmount + conveyanceAmount);

  const epfPct = round(Number(input.employeeEpfPercentage) || 0);
  const esicPct = round(Number(input.employeeEsicPercentage) || 0);
  const ptPct = round(Number(input.professionalTaxPercentage) || 0);

  // Statutory EPF Wage Ceiling is ₹15,000 (12% of 15,000 = ₹1,800)
  const epfWage = basic > 15000 && epfPct === 12 ? 15000 : basic;
  const employeeEpfAmount = round((epfWage * epfPct) / 100);

  // Statutory ESIC Wage Ceiling is ₹21,000 (0.75% of 21,000 = ₹157.50 / ₹158)
  const esicWage = grossTotalA > 21000 ? 21000 : grossTotalA;
  const employeeEsicAmount = round((esicWage * esicPct) / 100);

  // Professional Tax: standard ₹200 if gross >= 12,000
  const professionalTaxAmount = ptPct > 0 ? round((grossTotalA * ptPct) / 100) : (grossTotalA >= 12000 ? 200 : 0);

  const totalDeductionB = round(employeeEpfAmount + employeeEsicAmount + professionalTaxAmount);
  const netTakeHomeC = round(grossTotalA - totalDeductionB);

  const compEpfPct = round(Number(input.companyEpfPercentage) || 0);
  const compEsicPct = round(Number(input.companyEsicPercentage) || 0);
  const gratuityPct = round(
    input.gratuityPercentage !== undefined && input.gratuityPercentage !== null && !isNaN(Number(input.gratuityPercentage))
      ? Number(input.gratuityPercentage)
      : 0
  );

  const companyEpfAmount = round((epfWage * compEpfPct) / 100);
  const companyEsicAmount = round((esicWage * compEsicPct) / 100);
  const gratuityAmount = round((basic * gratuityPct) / 100);

  const totalCompanyContributionD = round(companyEpfAmount + companyEsicAmount + gratuityAmount);
  const ctcPerMonthE = round(grossTotalA + totalCompanyContributionD);

  return {
    basicSalary: basic,
    hraPercentage: hraPct,
    hraAmount,
    ltaPercentage: ltaPct,
    ltaAmount,
    educationAllowancePercentage: eduPct,
    educationAllowanceAmount,
    conveyancePercentage: convPct,
    conveyanceAmount,
    grossTotalA,
    employeeEpfPercentage: epfPct,
    employeeEpfAmount,
    employeeEsicPercentage: esicPct,
    employeeEsicAmount,
    professionalTaxPercentage: ptPct,
    professionalTaxAmount,
    totalDeductionB,
    netTakeHomeC,
    companyEpfPercentage: compEpfPct,
    companyEpfAmount,
    companyEsicPercentage: compEsicPct,
    companyEsicAmount,
    gratuityPercentage: gratuityPct,
    gratuityAmount,
    totalCompanyContributionD,
    ctcPerMonthE,
  };
}
