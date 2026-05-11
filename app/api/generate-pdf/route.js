import { Document } from '@react-pdf/renderer';
import { renderToBuffer } from '@react-pdf/renderer';
import { BestLifeTemplate } from '@/app/components/PrescriptionTemplates/BestLifeTemplate';
import { YakapGamotTemplate } from '@/app/components/PrescriptionTemplates/YakapGamotTemplate';
import { RegularTemplate } from '@/app/components/PrescriptionTemplates/RegularTemplate';

const getTemplate = (key, data) => {
  switch (key) {
    case "bestlife": return <BestLifeTemplate {...data} />;
    case "ykg": return <YakapGamotTemplate {...data} />;
    default: return <RegularTemplate {...data} />;
  }
};

export async function POST(req) {
  const data = await req.json();
  const { medicines, patientName, doctorName, consultDate, birthday, sex, prcNo, ptrNo, specialization } = data;

  const groupedMedicines = medicines.reduce((acc, medicine) => {
    const key = medicine.source;
    if (!acc[key]) acc[key] = [];
    acc[key].push(medicine);
    return acc;
  }, {});

  const temp = Object.entries(groupedMedicines).map(([key, medicines]) => ({ key, medicines }));

  const doc = (
    <Document>
      {temp.map((item) =>
        getTemplate(item.key, { medicines: item.medicines, patientName, doctorName, specialization, consultDate, birthday, sex, prcNo, ptrNo })
      )}
    </Document>
  );

  try {
    const pdf = await renderToBuffer(doc);
    console.log('PDF buffer size:', pdf.length)

    return new Response(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="prescription.pdf"',
      },
    });
  } catch (error) {
    console.error(error);
    return new Response('Error generating PDF: ' + error.message, { status: 500 });
  }
}