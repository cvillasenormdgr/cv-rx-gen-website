import Main from './components/Main';
import loadStaticData from '@/services/loadStaticData';
import { AppProvider } from './context/AppContext';
import { ConsultProvider } from './context/ConsultContext';

export default async function Home() {
  const data = await loadStaticData();
  const groupedFormFields = data.formFields.reduce((acc, item) => {
    const section = item["Form Field Sections"];

    if (!acc[section]) {
      acc[section] = [];
    }

    acc[section].push(item);

    return acc;
  }, {});

  return (
    <div>
      <AppProvider>
        <ConsultProvider>
          <Main medicines={data.medicines} groupedFormFields={groupedFormFields} />
        </ConsultProvider>
      </AppProvider>
    </div>
  );
}
