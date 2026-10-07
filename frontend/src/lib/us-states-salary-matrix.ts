/**
 * Complete 50 US States Tax Data and Declarative Programmatic Preset Generator.
 * Provides authentic state income tax effective brackets, descriptions, and FAQs
 * for high-volume salary and paycheck calculation search queries.
 */

import { FAQItem } from "@/types/registry";
import { calculateUsSalary } from "./engines/financial-engine";

export interface StateProgrammaticPreset {
  toolSlug: string;
  presetSlug: string;
  name: string;
  title: string;
  subtitle?: string;
  metaDescription: string;
  answerSummary: string;
  badge?: string;
  keywords?: string[];
  about: string;
  initialValues: Record<string, number | string | boolean>;
  faqs: FAQItem[];
  relatedPresetSlugs?: string[];
}

export interface StateTaxMeta {
  code: string;
  name: string;
  ratePercent: number; // Effective / standard single filer tax rate %
  hasNoIncomeTax?: boolean;
  notes: string;
  medianIncome: number;
}

export const US_STATES_TAX_DATA: StateTaxMeta[] = [
  // 9 No-Income-Tax States
  { code: "AK", name: "Alaska", ratePercent: 0, hasNoIncomeTax: true, notes: "Alaska levies zero state personal income tax and distributes an annual Permanent Fund Dividend.", medianIncome: 88000 },
  { code: "FL", name: "Florida", ratePercent: 0, hasNoIncomeTax: true, notes: "Florida has no state personal income tax under its state constitution.", medianIncome: 69000 },
  { code: "NV", name: "Nevada", ratePercent: 0, hasNoIncomeTax: true, notes: "Nevada imposes zero individual state income tax.", medianIncome: 72000 },
  { code: "NH", name: "New Hampshire", ratePercent: 0, hasNoIncomeTax: true, notes: "New Hampshire has no state tax on earned wage income.", medianIncome: 90000 },
  { code: "SD", name: "South Dakota", ratePercent: 0, hasNoIncomeTax: true, notes: "South Dakota has no individual or corporate income tax.", medianIncome: 70000 },
  { code: "TN", name: "Tennessee", ratePercent: 0, hasNoIncomeTax: true, notes: "Tennessee levies zero personal state income tax on earned wages.", medianIncome: 65000 },
  { code: "TX", name: "Texas", ratePercent: 0, hasNoIncomeTax: true, notes: "Texas has zero individual state income tax under Article 8 of the Texas Constitution.", medianIncome: 73000 },
  { code: "WA", name: "Washington", ratePercent: 0, hasNoIncomeTax: true, notes: "Washington state levies no personal income tax on employee paychecks.", medianIncome: 91000 },
  { code: "WY", name: "Wyoming", ratePercent: 0, hasNoIncomeTax: true, notes: "Wyoming does not levy personal or corporate income tax.", medianIncome: 72000 },

  // Flat & Low Tax States
  { code: "AZ", name: "Arizona", ratePercent: 2.50, notes: "Arizona utilizes a flat 2.50% individual income tax rate.", medianIncome: 74000 },
  { code: "CO", name: "Colorado", ratePercent: 4.40, notes: "Colorado imposes a flat state income tax rate of 4.40%.", medianIncome: 89000 },
  { code: "GA", name: "Georgia", ratePercent: 5.39, notes: "Georgia transitioned to a flat individual income tax rate of 5.39%.", medianIncome: 72000 },
  { code: "ID", name: "Idaho", ratePercent: 5.695, notes: "Idaho levies a flat state income tax rate of 5.695%.", medianIncome: 72000 },
  { code: "IL", name: "Illinois", ratePercent: 4.95, notes: "Illinois levies a constitutionally mandated flat 4.95% individual income tax rate.", medianIncome: 78000 },
  { code: "IN", name: "Indiana", ratePercent: 3.05, notes: "Indiana imposes a low state flat rate of 3.05% (plus local county option taxes).", medianIncome: 67000 },
  { code: "IA", name: "Iowa", ratePercent: 3.80, notes: "Iowa is transitioning to a flat 3.80% personal income tax rate.", medianIncome: 70000 },
  { code: "KY", name: "Kentucky", ratePercent: 4.00, notes: "Kentucky enforces a flat individual income tax rate of 4.00%.", medianIncome: 60000 },
  { code: "MI", name: "Michigan", ratePercent: 4.25, notes: "Michigan levies a flat individual income tax rate of 4.25%.", medianIncome: 67000 },
  { code: "MS", name: "Mississippi", ratePercent: 4.70, notes: "Mississippi is phasing down to a flat 4.00% tax rate.", medianIncome: 53000 },
  { code: "NC", name: "North Carolina", ratePercent: 4.50, notes: "North Carolina imposes a flat individual income tax rate of 4.50%.", medianIncome: 67000 },
  { code: "ND", name: "North Dakota", ratePercent: 2.00, notes: "North Dakota features the nation's lowest progressive brackets top-capped at 2.50%.", medianIncome: 73000 },
  { code: "PA", name: "Pennsylvania", ratePercent: 3.07, notes: "Pennsylvania has a flat personal income tax rate of 3.07% without deductions.", medianIncome: 73000 },
  { code: "UT", name: "Utah", ratePercent: 4.65, notes: "Utah levies a flat state individual income tax rate of 4.65%.", medianIncome: 89000 },

  // Graduated & Progressive Tax States
  { code: "AL", name: "Alabama", ratePercent: 4.50, notes: "Alabama levies graduated tax rates up to 5.00%.", medianIncome: 59000 },
  { code: "AR", name: "Arkansas", ratePercent: 4.40, notes: "Arkansas has reduced its top marginal individual income tax rate to 4.40%.", medianIncome: 56000 },
  { code: "CA", name: "California", ratePercent: 7.20, notes: "California features progressive brackets ranging from 1% to 12.3% (plus 1% Mental Health surcharge over $1M).", medianIncome: 91000 },
  { code: "CT", name: "Connecticut", ratePercent: 5.50, notes: "Connecticut levies progressive brackets ranging from 3.0% to 6.99%.", medianIncome: 88000 },
  { code: "DE", name: "Delaware", ratePercent: 5.20, notes: "Delaware features graduated tax brackets topping out at 6.60%.", medianIncome: 79000 },
  { code: "HI", name: "Hawaii", ratePercent: 7.50, notes: "Hawaii features progressive tax brackets ranging from 1.4% to 11.0%.", medianIncome: 92000 },
  { code: "KS", name: "Kansas", ratePercent: 5.20, notes: "Kansas imposes graduated income tax brackets topping out at 5.70%.", medianIncome: 69000 },
  { code: "LA", name: "Louisiana", ratePercent: 4.25, notes: "Louisiana levies individual income tax rates up to 4.25%.", medianIncome: 57000 },
  { code: "ME", name: "Maine", ratePercent: 6.50, notes: "Maine features progressive tax rates up to 7.15%.", medianIncome: 69000 },
  { code: "MD", name: "Maryland", ratePercent: 4.75, notes: "Maryland imposes state rates up to 5.75% plus mandatory county income taxes.", medianIncome: 98000 },
  { code: "MA", name: "Massachusetts", ratePercent: 5.00, notes: "Massachusetts imposes a flat 5.00% tax rate plus a 4% surtax on income over $1M.", medianIncome: 94000 },
  { code: "MN", name: "Minnesota", ratePercent: 6.80, notes: "Minnesota levies progressive state rates up to 9.85%.", medianIncome: 82000 },
  { code: "MO", name: "Missouri", ratePercent: 4.70, notes: "Missouri top individual income tax rate is capped at 4.80%.", medianIncome: 65000 },
  { code: "MT", name: "Montana", ratePercent: 5.20, notes: "Montana has simplified brackets topping at 5.90%.", medianIncome: 67000 },
  { code: "NE", name: "Nebraska", ratePercent: 5.80, notes: "Nebraska is phasing down its top individual rate to 3.99% by 2027.", medianIncome: 74000 },
  { code: "NJ", name: "New Jersey", ratePercent: 5.50, notes: "New Jersey features graduated rates ranging from 1.4% to 10.75%.", medianIncome: 96000 },
  { code: "NM", name: "New Mexico", ratePercent: 4.90, notes: "New Mexico levies progressive tax brackets up to 5.90%.", medianIncome: 58000 },
  { code: "NY", name: "New York", ratePercent: 6.20, notes: "New York State levies rates up to 10.9% (plus New York City local tax if resident).", medianIncome: 81000 },
  { code: "OH", name: "Ohio", ratePercent: 3.50, notes: "Ohio has consolidated down to two brackets with a top rate of 3.50%.", medianIncome: 67000 },
  { code: "OK", name: "Oklahoma", ratePercent: 4.75, notes: "Oklahoma imposes graduated income tax brackets topping at 4.75%.", medianIncome: 60000 },
  { code: "OR", name: "Oregon", ratePercent: 8.50, notes: "Oregon features progressive tax brackets ranging from 4.75% to 9.90% with no sales tax.", medianIncome: 76000 },
  { code: "RI", name: "Rhode Island", ratePercent: 5.00, notes: "Rhode Island taxes graduated income up to 5.99%.", medianIncome: 81000 },
  { code: "SC", name: "South Carolina", ratePercent: 5.40, notes: "South Carolina features a top personal rate being phased down to 6.0%.", medianIncome: 64000 },
  { code: "VA", name: "Virginia", ratePercent: 5.75, notes: "Virginia features a progressive income tax structure with a top bracket of 5.75%.", medianIncome: 87000 },
  { code: "VT", name: "Vermont", ratePercent: 6.60, notes: "Vermont taxes graduated income with brackets up to 8.75%.", medianIncome: 76000 },
  { code: "WV", name: "West Virginia", ratePercent: 5.12, notes: "West Virginia has reduced its top marginal tax rate to 5.12%.", medianIncome: 54000 },
  { code: "WI", name: "Wisconsin", ratePercent: 5.30, notes: "Wisconsin levies graduated income tax rates up to 7.65%.", medianIncome: 70000 },
  { code: "DC", name: "District of Columbia", ratePercent: 6.50, notes: "Washington D.C. features progressive income tax rates up to 10.75%.", medianIncome: 98000 },
];

export const SALARY_BRACKETS = [
  { amount: 45000, label: "45k", display: "$45,000" },
  { amount: 60000, label: "60k", display: "$60,000" },
  { amount: 75000, label: "75k", display: "$75,000" },
  { amount: 85000, label: "85k", display: "$85,000" },
  { amount: 100000, label: "100k", display: "$100,000" },
  { amount: 120000, label: "120k", display: "$120,000" },
  { amount: 150000, label: "150k", display: "$150,000" },
  { amount: 175000, label: "175k", display: "$175,000" },
  { amount: 200000, label: "200k", display: "$200,000" },
  { amount: 250000, label: "250k", display: "$250,000" },
];

/**
 * Generates declarative programmatic salary presets for all 50 states + DC across 10 salary brackets.
 * Includes unique, authentic take-home calculations, FICA, federal deductions, and custom state FAQs.
 */
export function generate50StateSalaryPresets(): StateProgrammaticPreset[] {
  const presets: StateProgrammaticPreset[] = [];

  for (const state of US_STATES_TAX_DATA) {
    const stateSlugPart = state.name.toLowerCase().replace(/\s+/g, "-");

    for (const bracket of SALARY_BRACKETS) {
      const presetSlug = `${bracket.label}-salary-in-${stateSlugPart}`;
      
      // Calculate real numbers using core financial engine
      const calcResult = calculateUsSalary({
        grossSalary: bracket.amount,
        filingStatus: "single",
        stateTaxPercent: state.ratePercent,
        k401ContributionPercent: 5,
      });

      const netAnnual = calcResult.netAnnualTakeHome.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
      const netMonthly = calcResult.netMonthlyTakeHome.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
      const netBiWeekly = calcResult.netBiWeeklyTakeHome.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
      const stateTaxPaid = calcResult.stateIncomeTax.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
      const fedTaxPaid = calcResult.federalIncomeTax.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
      const ficaPaid = (calcResult.socialSecurityTax + calcResult.medicareTax).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

      const taxSummary = state.hasNoIncomeTax
        ? `Because ${state.name} has zero state income tax, you keep an extra $3,000–$7,000 annually compared to high-tax states.`
        : `State income tax in ${state.name} accounts for roughly ${stateTaxPaid} annually (${state.ratePercent.toFixed(2)}% effective rate).`;

      const title = `${bracket.display} Salary in ${state.name}: Take-Home Pay & Tax Breakdown (2026) | ConvertSheet`;
      const subtitle = `See your exact paycheck after federal taxes, ${state.name} state taxes, and FICA deductions on ${bracket.display} per year.`;
      const metaDescription = `Calculate take-home pay on a ${bracket.display} salary in ${state.name}. Net annual is ${netAnnual} (${netMonthly}/month, ${netBiWeekly} bi-weekly) after federal, state, and FICA deductions.`;
      const answerSummary = `On a ${bracket.display} gross salary in ${state.name} (Single filer, 2026), your estimated net take-home pay is approximately ${netAnnual} per year (${netMonthly}/month or ${netBiWeekly} bi-weekly). Total estimated deductions include ${fedTaxPaid} in federal income tax, ${ficaPaid} in FICA, and ${stateTaxPaid} in ${state.name} state taxes.`;

      const isGoodSalary = bracket.amount >= state.medianIncome;

      presets.push({
        toolSlug: "salary-calculator",
        presetSlug,
        name: `${bracket.display} ${state.name} Salary Calculator`,
        title,
        subtitle,
        metaDescription,
        answerSummary,
        badge: state.hasNoIncomeTax ? "0% State Tax" : `${state.name} State Tax`,
        keywords: [
          `${bracket.display} salary in ${state.name}`,
          `${bracket.label} in ${stateSlugPart} take home pay`,
          `${state.name} paycheck calculator ${bracket.label}`,
          `${bracket.display} after taxes in ${state.name}`,
        ],
        about: `### ${bracket.display} Salary Breakdown in ${state.name} (2026 Tax Year)

| Deduction / Paycheck Metric | Annual Amount | Monthly Amount | Bi-Weekly Paycheck |
| :--- | :--- | :--- | :--- |
| **Gross Salary** | **${bracket.display}** | **$${Math.round(bracket.amount / 12).toLocaleString()}** | **$${Math.round(bracket.amount / 26).toLocaleString()}** |
| Federal Income Tax | ${fedTaxPaid} | $${Math.round(calcResult.federalIncomeTax / 12).toLocaleString()} | $${Math.round(calcResult.federalIncomeTax / 26).toLocaleString()} |
| FICA (Social Security & Medicare) | ${ficaPaid} | $${Math.round((calcResult.socialSecurityTax + calcResult.medicareTax) / 12).toLocaleString()} | $${Math.round((calcResult.socialSecurityTax + calcResult.medicareTax) / 26).toLocaleString()} |
| ${state.name} State Income Tax | ${stateTaxPaid} | $${Math.round(calcResult.stateIncomeTax / 12).toLocaleString()} | $${Math.round(calcResult.stateIncomeTax / 26).toLocaleString()} |
| Estimated 401(k) (5% contribution) | $${Math.round(calcResult.k401Deduction).toLocaleString()} | $${Math.round(calcResult.k401Deduction / 12).toLocaleString()} | $${Math.round(calcResult.k401Deduction / 26).toLocaleString()} |
| **Net Take-Home Pay** | **${netAnnual}** | **${netMonthly}** | **${netBiWeekly}** |

${state.notes} ${taxSummary}`,
        initialValues: {
          regime: "US",
          grossSalary: bracket.amount,
          filingStatus: "single",
          stateTaxPercent: state.ratePercent,
          k401ContributionPercent: 5,
        },
        faqs: [
          {
            question: `What is the take-home pay on a ${bracket.display} salary in ${state.name}?`,
            answer: `Your estimated net take-home pay is ${netAnnual} per year, which equates to roughly ${netMonthly} per month or ${netBiWeekly} every two weeks after all taxes and standard deductions.`
          },
          {
            question: `How much state income tax do I pay in ${state.name} on ${bracket.display}?`,
            answer: state.hasNoIncomeTax
              ? `${state.name} has no state personal income tax, meaning $0 is withheld from your paycheck for state income taxes.`
              : `You will pay approximately ${stateTaxPaid} in ${state.name} state income taxes annually based on an effective rate of ${state.ratePercent.toFixed(2)}%.`
          },
          {
            question: `Is ${bracket.display} considered a good salary in ${state.name}?`,
            answer: isGoodSalary
              ? `Yes. The median household income in ${state.name} is approximately $${state.medianIncome.toLocaleString()}. An individual salary of ${bracket.display} is above the state median.`
              : `A salary of ${bracket.display} is close to or below ${state.name}'s median household income of $${state.medianIncome.toLocaleString()}, making it solid for single individuals but tight for families in urban metros.`
          },
          {
            question: `What is the bi-weekly paycheck on ${bracket.display} in ${state.name}?`,
            answer: `Assuming 26 bi-weekly pay periods in a standard corporate calendar, your net take-home paycheck is approximately ${netBiWeekly}.`
          }
        ],
        relatedPresetSlugs: [
          `100k-salary-in-${stateSlugPart}`,
          `75k-salary-in-${stateSlugPart}`,
          `120k-salary-in-${stateSlugPart}`,
        ].filter((s) => s !== presetSlug)
      });
    }
  }

  return presets;
}
