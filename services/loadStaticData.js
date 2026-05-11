export const loadStaticData = async () => {
  const targetStaticData = [
    {
      name: "formFields",
      loadFunction: async () => {
        const formFields = await fetch(`${process.env.FIREBASE_FUNCTIONS_URL}/airtable/select`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            base: process.env.WEB_CONTENT_BASE_ID,
            table: "Form Fields",
            query: {
              view: "Grid view",
            }
          }),
        }).then((res) => res.json());
        return formFields;
      }
    },
    {
      name: "medicines",
      loadFunction: async () => {
        const medicines = await fetch(`${process.env.FIREBASE_FUNCTIONS_URL}/airtable/select`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            base: process.env.WEB_CONTENT_BASE_ID,
            table: "Medicines",
            query: {
              view: "Grid view",
            }
          }),
        }).then((res) => res.json());
        return medicines;
      }
    }
  ]

  const responses = await Promise.all(
    targetStaticData.map(({ loadFunction }) => loadFunction())
  );
  const staticData = targetStaticData.reduce((acc, { name }, index) => {
    acc[name] = responses[index];
    return acc;
  }, {});

  return staticData;
};

export default loadStaticData;