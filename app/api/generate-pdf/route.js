import puppeteer from 'puppeteer';
import { RegularTemplate, BestLifeTemplate, YakapGamotTemplate } from '@/app/components/PrescriptionTemplates';

// Prescription PDFs MUST always render with the light palette regardless of the
// on-screen theme. Do NOT mount ThemeProvider here and do NOT add the `dark`
// class to the rendered HTML — generated PDFs are documents that get printed
// or shared and must remain visually deterministic.

const getTemplate = (template, item) => {
  switch (template) {
    case "bestlife":
      return BestLifeTemplate(item);
    case "ykg":
      return YakapGamotTemplate(item);
    default:
      return RegularTemplate(item);
  }
};

export async function POST(req) {
  const data = await req.json();
  const {
    medicines,
    patientName,
    doctorName,
    consultDate,
    birthday,
    sex,
    prcNo,
    ptrNo,
    specialization,
  } = data;
  const groupedMedicines = medicines.reduce((acc, medicine) => {
    const key = medicine.source;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(medicine);
    return acc;
  }, {});

  const temp = Object.entries(groupedMedicines).map(([key, medicines]) => {
    return {
      key,
      medicines,
    };
  });

  const html = `
    <html>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&display=swap" rel="stylesheet">
        <style>
          * {
            box-sizing: border-box;
          }

          body {
            font-family: Lato, sans-serif;
            padding: 24px;
            padding-bottom: 40mm;
          }
          .logo-header {
            display: flex;
            flex-direction: row;
            justify-content: flex-start;
            align-items: center;
            gap: 16px;
          }

          .prescription-header {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 8px;
            width: 100%;
          }

          .prescription-header-item {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            padding: 4px 0;
            font-size: 15px;
          }

          .prescription-header-item strong {
            white-space: nowrap;
          }

          .prescription-header-item span {
            text-align: right;
            word-break: break-word;
          }

          .divider {
            border: none;
            border-top: 1px solid black;
            width: 100%;
          }

          .rx-title {
            font-size: 3.75rem; /* text-6xl */
            font-weight: 500;
            text-align: left;
          }

          .message-box {
            background-color: rgba(13, 109, 110, 0.1); /* #0D6D6E / 10% */
            border-left: 8px solid #0D6D6E;
            width: 100%;
            padding: 16px;
          }

          .message-box p {
            font-weight: 300;
          }

          .med-container {
            display: flex;
            flex-direction: column;
            gap: 8px;
            width: 100%;
          }

          .med-item {
            font-family: Arial, sans-serif;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
            width: 100%;
          }

          .med-header {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
          }

          .med-title {
            font-size: 16px;
            font-weight: 600;
            color: #111;
          }

          .med-qty {
            font-size: 14px;
            color: #333;
            font-weight: 500;
          }

          .med-signa {
            margin-top: 4px;
            font-size: 13px;
            font-style: italic;
            color: #555;
          }

          footer {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;

            display: flex;
            justify-content: space-between;
            align-items: flex-end;

            padding: 20px 40px;
          }

          .footer-text {
            display: flex;
            flex-direction: column;
          }

          .footer-img {
            display: flex;
            align-items: flex-end;
            justify-content: flex-end;
          }

          .footer-img img {
            display: block;
          }

          .title {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 16px;
          }
          .section {
            margin-bottom: 12px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          td, th {
            border: 1px solid #ddd;
            padding: 8px;
          }
        </style>
      </head>
      <body>
        <div>
          ${temp.map(item => getTemplate(item.key, { medicines: item.medicines, patientName, doctorName, specialization, consultDate, birthday, sex, prcNo, ptrNo })).join('')}
        </div>
      </body>
    </html>
  `
  const browser = await puppeteer.launch({
    args: ['--allow-file-access-from-files']
  });
  const page = await browser.newPage();
  await page.setContent(html, {
    waitUntil: 'networkidle0',
    baseURL: `file://${process.cwd()}/public/`
  });
  const pdf = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: {
      top: '10mm',
      right: '10mm',
      bottom: '10mm',
      left: '10mm',
    },
  });
  await browser.close();

  return new Response(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="prescription.pdf"',
    },
  });
}