"use client";

import React, { useState, useEffect, useContext, Fragment } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';

import Navbar from '../Navbar';
import { Button } from '@/components/ui/button';
import createFormField from './utils/createFormField';

const Form = ({
  medicines,
  groupedFormFields,
  dispatch,
  state,
  consultDispatch
}) => {
  const [loading, setLoading] = useState(false)

  const { control, register, handleSubmit, formState: { errors } } = useForm();
  const { fields, append, remove } = useFieldArray({
    control: control,
    name: "medicines",
  });

  useEffect(() => {
    dispatch({ type: "SET_MEDICINES", payload: medicines });
  }, [medicines, dispatch]);

  const formSections = (Object.keys(groupedFormFields)).map((section) => {
    switch (section) {
      case "Order Details":
        return (
          <div key={section} className="flex flex-col gap-4">
            <div className="flex flex-row gap-8">
              <img src="/MedGrocer.png" alt="Logo" className="w-auto h-8" />
              <img src="/Group 1.png" alt="Logo" className="w-auto h-8" />
              <img src="/PhilHealth YAKAP Logo 2.png" alt="Logo" className="w-auto h-8" />
            </div>
            <p className="font-bold text-right">Page 1 of 1</p>
            <div className="grid grid-cols-2 gap-2 w-full">
              {groupedFormFields[section].sort((a, b) => a["Order"] - b["Order"]).map(
                (field) =>
                  createFormField({
                    field,
                    register,
                    errors,
                    key: field["Record ID"],
                    append,
                    remove,
                    fields,
                    control,
                  })
              )}
            </div>
            <hr className="border-black w-full" />
            <h1 className="text-6xl font-medium text-left">Rx</h1>
          </div>
        )
      case "Medicine":
        return (
          <div key={section} className="flex flex-col gap-4">
            {groupedFormFields[section].sort((a, b) => a["Order"] - b["Order"]).map(
              (field) =>
                createFormField({
                  field,
                  register,
                  errors,
                  key: field["Record ID"],
                  append,
                  remove,
                  fields,
                  control,
                })
            )}
          </div>
        )
      case "Footer":
        return (
          <div className="flex flex-row gap-2 w-full justify-between items-end" key={section}>
            <div className="flex flex-col gap-4 w-full">
              <div className="max-w-[400px]">
                {groupedFormFields[section]
                  .sort((a, b) => a["Order"] - b["Order"])
                  .map((field) =>
                    createFormField({
                      field,
                      register,
                      errors,
                      key: field["Record ID"],
                      append,
                      remove,
                      fields,
                      control,
                    })
                  )
                }
              </div>

              <div>
                <p>
                  For any further clarifications or assistance, please contact us at{" "}
                  <a href="mailto:info@medgrocer.com">info@medgrocer.com</a>
                </p>
              </div>

              <div className="flex flex-col">
                <p className="font-bold text-[#0D6D6E]">
                  MG HEALTH SOLUTIONS INC.
                </p>
                <p>
                  24F Centuria Medical Makati, Kalayaan cor. Salamanca St.,
                </p>
                <p>Poblacion, Makati, 1210, Metro Manila</p>
              </div>
            </div>

            <img
              src="/image.png"
              alt="Logo"
              className="h-100 w-auto object-contain"
            />
          </div>
        )
      default:
        return null;
    }
  });

  const onSubmit = async (data) => {
    const enriched = {
      birthday: data?.["Birthday"],
      doctorName: data?.["Doctor Name"],
      specialization: data?.["Specialization"],
      patientName: data?.["Patient Name"],
      consultDate: data?.["Consult Date"],
      sex: data?.["Sex"],
      prcNo: data?.["PRC Number"],
      ptrNo: data?.["PTR Number"],
      medicines: (data.medicines ?? []).map((row) => {
        const found = state.medicines.find((m) => m['Name'] === row.name);
        return {
          name: row.name,
          source: found?.['Medicine Type'] ?? null,
          dosage: found?.['Dosage'] ?? null,
          quantity: row.quantity ?? null,
          sig: row.signa ?? null,
        };
      }),
    };

    try {
      setLoading(true);
      consultDispatch({ type: "CLEAR_DOCUMENT" });
      const pdfBlob = await generatePdf(enriched);
      const typedBlob = new Blob([pdfBlob], { type: 'application/pdf' }); // ← ensure correct MIME type
      const pdfUrl = URL.createObjectURL(typedBlob);
      consultDispatch({ type: "SET_DOCUMENT", payload: pdfUrl });
      dispatch({ type: "OPEN_MODAL", payload: "Prescription" });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const generatePdf = async (data) => {
    const response = await fetch('/api/generate-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }, // ← missing header
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error?.error ?? `HTTP ${response.status}`);
    }

    const pdf = await response.blob();
    return pdf;
  };


  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="py-10 px-60 flex flex-col gap-4">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {formSections}
          <Button type="submit" className="border border-border rounded-full" disabled={loading}>{loading ? 'Generating...' : 'Generate Document'}</Button>
        </form>
      </main>
    </div>
  );
}

export default Form;