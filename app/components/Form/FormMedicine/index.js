import React, { useContext } from 'react';
import { useWatch } from 'react-hook-form';

import { AppContext } from '@/app/context/AppContext';
import FormSelect from '../FormSelect';
import { Button } from '@/components/ui/button';

const FormMedicine = ({
  required,
  placeholder,
  register, control,
  errors,
  fields,
  append,
  remove,
}) => {
  const { state } = useContext(AppContext);
  const { medicines } = state;
  const selectedRows = useWatch({ control, name: 'medicines' }) ?? [];
  const allSelected = selectedRows
    .map((row) => row?.name)
    .filter(Boolean);
  return (
    <div className="flex flex-col gap-2">
      {fields.map((field, index) => {
        const currentValue = selectedRows[index]?.name;
        const disabledValues = allSelected.filter((value) => value !== currentValue);
        const medicine = medicines.find((m) => m['Name'] === currentValue);

        // const medicineColor = () => {
        //   switch (medicine?.["Medicine Type"]) {
        //     case "ykg":
        //       return "bg-yellow-100";
        //     case "bestlife":
        //       return "bg-blue-100";
        //     case "regular":
        //       return "bg-green-100";
        //     default:
        //       return null;
        //   }
        // }

        return (
          <div key={field.id} className="flex flex-col items-end gap-2 w-full">
            <div className="flex flex-row items-end justify-between gap-20 w-full">
              <div className="min-w-0">
                <FormSelect
                  name={`medicines.${index}.name`}
                  label=""
                  // color={medicineColor()}
                  required={required}
                  placeholder={placeholder}
                  register={register}
                  errors={errors}
                  options={medicines}
                  disabledValues={disabledValues}
                />
              </div>

              <div className="flex flex-row items-center gap-2 min-w-[100px]">
                <label>#</label>
                <input
                  type="text"
                  className="border border-border rounded-md px-4 py-2 w-full"
                  {...register(`medicines.${index}.quantity`)}
                />
                {errors[`medicines.${index}.quantity`] && (
                  <span className="text-destructive">
                    {errors[`medicines.${index}.quantity`].message}
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-row items-center gap-2 w-full justify-between">
              <div className="flex flex-row items-center gap-2 w-full">
                <label className="font-bold italic">Signa:</label>
                <input type="text" className="border border-border rounded-md px-4 py-2 w-full" {...register(`medicines.${index}.signa`)} />
                {errors[`medicines.${index}.signa`] && (
                  <span className="text-destructive">
                    {errors[`medicines.${index}.signa`].message}
                  </span>
                )}
              </div>
              <Button type="button" variant="destructive" onClick={() => remove(index)}>
                X
              </Button>
            </div>
            {index < fields.length - 1 && (
              <hr className="border-gray-300 mt-3 w-full" />
            )}
          </div>
        );
      })}
      <Button type="button" variant="outline" onClick={() => append({ name: '' })}>
        Add medicine
      </Button>
    </div>
  );
};

export default FormMedicine;