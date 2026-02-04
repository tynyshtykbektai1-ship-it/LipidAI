import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
} from 'docx'

interface ReportData {
  tc: number
  hdl: number
  tg: number
  ldlResult: number
  category: string
  date: string
}

export function generateWordReport(data: ReportData): Promise<Blob> {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Title
          new Paragraph({
            text: 'LDL-C Prediction Report',
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: {
              after: 400,
            },
          }),

          // Date
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: {
              after: 400,
            },
            children: [
              new TextRun({
                text: `Report Generated: ${data.date}`,
                size: 20,
                color: '666666',
              }),
            ],
          }),

          // Input Values Section
          new Paragraph({
            text: 'Input Blood Test Values',
            heading: HeadingLevel.HEADING_2,
            spacing: {
              before: 400,
              after: 200,
            },
          }),

          new Paragraph({
            spacing: { after: 100 },
            children: [
              new TextRun({
                text: 'TC (Total Cholesterol): ',
                bold: true,
              }),
              new TextRun({
                text: `${data.tc} mg/dL`,
              }),
            ],
          }),

          new Paragraph({
            spacing: { after: 100 },
            children: [
              new TextRun({
                text: 'HDL-C (Good Cholesterol): ',
                bold: true,
              }),
              new TextRun({
                text: `${data.hdl} mg/dL`,
              }),
            ],
          }),

          new Paragraph({
            spacing: { after: 300 },
            children: [
              new TextRun({
                text: 'TG (Triglycerides): ',
                bold: true,
              }),
              new TextRun({
                text: `${data.tg} mg/dL`,
              }),
            ],
          }),

          // Results Section
          new Paragraph({
            text: 'Prediction Results',
            heading: HeadingLevel.HEADING_2,
            spacing: {
              before: 400,
              after: 200,
            },
          }),

          new Paragraph({
            spacing: { after: 100 },
            children: [
              new TextRun({
                text: 'Predicted LDL-C Level: ',
                bold: true,
              }),
              new TextRun({
                text: `${data.ldlResult} mg/dL`,
                bold: true,
                size: 28,
                color: getCategoryColor(data.category),
              }),
            ],
          }),

          new Paragraph({
            spacing: { after: 300 },
            children: [
              new TextRun({
                text: 'Category: ',
                bold: true,
              }),
              new TextRun({
                text: data.category,
                bold: true,
                color: getCategoryColor(data.category),
              }),
            ],
          }),

          // Reference Ranges Section
          new Paragraph({
            text: 'LDL-C Reference Ranges',
            heading: HeadingLevel.HEADING_2,
            spacing: {
              before: 400,
              after: 200,
            },
          }),

          new Paragraph({
            spacing: { after: 100 },
            children: [
              new TextRun({
                text: '< 100 mg/dL',
                bold: true,
              }),
              new TextRun({
                text: ' - Optimal',
              }),
            ],
          }),

          new Paragraph({
            spacing: { after: 100 },
            children: [
              new TextRun({
                text: '100-129 mg/dL',
                bold: true,
              }),
              new TextRun({
                text: ' - Near Optimal',
              }),
            ],
          }),

          new Paragraph({
            spacing: { after: 100 },
            children: [
              new TextRun({
                text: '130-159 mg/dL',
                bold: true,
              }),
              new TextRun({
                text: ' - Borderline High',
              }),
            ],
          }),

          new Paragraph({
            spacing: { after: 100 },
            children: [
              new TextRun({
                text: '160-189 mg/dL',
                bold: true,
              }),
              new TextRun({
                text: ' - High',
              }),
            ],
          }),

          new Paragraph({
            spacing: { after: 400 },
            children: [
              new TextRun({
                text: '≥ 190 mg/dL',
                bold: true,
              }),
              new TextRun({
                text: ' - Very High',
              }),
            ],
          }),

          // Disclaimer
          new Paragraph({
            text: 'Important Notice',
            heading: HeadingLevel.HEADING_3,
            spacing: {
              before: 600,
              after: 200,
            },
          }),

          new Paragraph({
            spacing: { after: 100 },
            children: [
              new TextRun({
                text: 'This report is for informational and educational purposes only. The LDL-C prediction is an estimate based on the Friedewald equation and should not be used as a substitute for professional medical advice, diagnosis, or treatment.',
                italics: true,
                size: 20,
              }),
            ],
          }),

          new Paragraph({
            spacing: { after: 100 },
            children: [
              new TextRun({
                text: 'Always consult with a qualified healthcare provider regarding any questions you may have about your cholesterol levels or cardiovascular health.',
                italics: true,
                size: 20,
              }),
            ],
          }),
        ],
      },
    ],
  })

  return Packer.toBlob(doc)
}

function getCategoryColor(category: string): string {
  if (category.includes('Optimal')) {
    return '15803d' // green-700
  } else if (category.includes('Borderline')) {
    return 'ea580c' // orange-600
  } else if (category.includes('High')) {
    return 'dc2626' // red-600
  }
  return '000000'
}
