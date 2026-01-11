// PDF Export utility for simulation results

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { Scenario, SimulationResult } from '@/types/types';

export async function exportToPDF(
  scenario: Scenario,
  resultA: SimulationResult,
  resultB: SimulationResult
): Promise<void> {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let yPosition = 20;

  // Title
  pdf.setFontSize(24);
  pdf.setTextColor(59, 130, 246); // Primary blue
  pdf.text('Decision Simulator Report', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 15;

  // Scenario Title
  pdf.setFontSize(18);
  pdf.setTextColor(0, 0, 0);
  pdf.text(scenario.title, pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 10;

  // Description
  if (scenario.description) {
    pdf.setFontSize(11);
    pdf.setTextColor(100, 100, 100);
    const descLines = pdf.splitTextToSize(scenario.description, pageWidth - 40);
    pdf.text(descLines, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += descLines.length * 5 + 10;
  }

  // Options
  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
  pdf.text(`Option A: ${scenario.option_a}`, 20, yPosition);
  yPosition += 7;
  pdf.text(`Option B: ${scenario.option_b}`, 20, yPosition);
  yPosition += 7;
  pdf.text(`Time Horizon: ${scenario.time_horizon_weeks} weeks`, 20, yPosition);
  yPosition += 15;

  // Executive Summary
  pdf.setFontSize(16);
  pdf.setTextColor(59, 130, 246);
  pdf.text('Executive Summary', 20, yPosition);
  yPosition += 10;

  pdf.setFontSize(11);
  pdf.setTextColor(0, 0, 0);
  
  const summaryText = [
    `${resultA.option_name}: Mean outcome of ${resultA.outcome_distribution.mean} with ${resultA.outcome_distribution.excellent}% chance of excellent results.`,
    `${resultB.option_name}: Mean outcome of ${resultB.outcome_distribution.mean} with ${resultB.outcome_distribution.excellent}% chance of excellent results.`,
    `Confidence levels: ${resultA.option_name} (${(resultA.confidence_level * 100).toFixed(0)}%), ${resultB.option_name} (${(resultB.confidence_level * 100).toFixed(0)}%)`
  ];

  summaryText.forEach(text => {
    const lines = pdf.splitTextToSize(text, pageWidth - 40);
    pdf.text(lines, 20, yPosition);
    yPosition += lines.length * 5 + 3;
  });

  yPosition += 10;

  // Comparison Table
  pdf.setFontSize(16);
  pdf.setTextColor(59, 130, 246);
  pdf.text('Comparison', 20, yPosition);
  yPosition += 10;

  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);

  const tableData = [
    ['Metric', resultA.option_name, resultB.option_name],
    ['Mean Outcome', resultA.outcome_distribution.mean.toFixed(1), resultB.outcome_distribution.mean.toFixed(1)],
    ['Median Outcome', resultA.outcome_distribution.median.toFixed(1), resultB.outcome_distribution.median.toFixed(1)],
    ['Excellent Probability', `${resultA.outcome_distribution.excellent}%`, `${resultB.outcome_distribution.excellent}%`],
    ['Poor Probability', `${resultA.outcome_distribution.poor}%`, `${resultB.outcome_distribution.poor}%`],
    ['Burnout Risk', `${resultA.risk_breakdown.burnout}%`, `${resultB.risk_breakdown.burnout}%`],
    ['Success Probability', `${resultA.risk_breakdown.success}%`, `${resultB.risk_breakdown.success}%`]
  ];

  const colWidths = [60, 60, 60];
  const rowHeight = 8;

  tableData.forEach((row, index) => {
    if (index === 0) {
      pdf.setFillColor(59, 130, 246);
      pdf.setTextColor(255, 255, 255);
      pdf.rect(20, yPosition - 5, colWidths[0] + colWidths[1] + colWidths[2], rowHeight, 'F');
    } else {
      pdf.setTextColor(0, 0, 0);
      if (index % 2 === 0) {
        pdf.setFillColor(240, 240, 240);
        pdf.rect(20, yPosition - 5, colWidths[0] + colWidths[1] + colWidths[2], rowHeight, 'F');
      }
    }

    pdf.text(row[0], 25, yPosition);
    pdf.text(row[1], 85, yPosition);
    pdf.text(row[2], 145, yPosition);
    yPosition += rowHeight;
  });

  yPosition += 10;

  // Risk Analysis
  if (yPosition > pageHeight - 60) {
    pdf.addPage();
    yPosition = 20;
  }

  pdf.setFontSize(16);
  pdf.setTextColor(59, 130, 246);
  pdf.text('Risk Analysis', 20, yPosition);
  yPosition += 10;

  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);

  const riskData = [
    [`${resultA.option_name}:`, `Success: ${resultA.risk_breakdown.success}%`, `Burnout: ${resultA.risk_breakdown.burnout}%`, `Dropout: ${resultA.risk_breakdown.dropout}%`],
    [`${resultB.option_name}:`, `Success: ${resultB.risk_breakdown.success}%`, `Burnout: ${resultB.risk_breakdown.burnout}%`, `Dropout: ${resultB.risk_breakdown.dropout}%`]
  ];

  riskData.forEach(risk => {
    pdf.text(risk[0], 20, yPosition);
    yPosition += 6;
    risk.slice(1).forEach(item => {
      pdf.text(`  • ${item}`, 25, yPosition);
      yPosition += 5;
    });
    yPosition += 3;
  });

  yPosition += 10;

  // Assumptions
  if (yPosition > pageHeight - 60) {
    pdf.addPage();
    yPosition = 20;
  }

  pdf.setFontSize(16);
  pdf.setTextColor(59, 130, 246);
  pdf.text('Simulation Assumptions', 20, yPosition);
  yPosition += 10;

  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);

  scenario.assumptions.forEach((assumption, index) => {
    const lines = pdf.splitTextToSize(`${index + 1}. ${assumption.text}`, pageWidth - 40);
    pdf.text(lines, 20, yPosition);
    yPosition += lines.length * 5 + 2;

    if (yPosition > pageHeight - 20) {
      pdf.addPage();
      yPosition = 20;
    }
  });

  // Footer
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text(
      `Generated by Decision Simulator - ${new Date().toLocaleDateString()}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
    pdf.text(`Page ${i} of ${totalPages}`, pageWidth - 20, pageHeight - 10, { align: 'right' });
  }

  // Save PDF
  pdf.save(`${scenario.title.replace(/\s+/g, '_')}_report.pdf`);
}

// Export chart as image
export async function exportChartAsImage(elementId: string, filename: string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Element not found:', elementId);
    return;
  }

  const canvas = await html2canvas(element, {
    backgroundColor: '#ffffff',
    scale: 2
  });

  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
