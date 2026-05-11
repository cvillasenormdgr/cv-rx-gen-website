"use client";

import React from 'react';

const FormSelect = ({
  name,
  label = "",
  required,
  placeholder,
  register,
  errors,
  options = [],
  disabledValues = [],
  color = "",
}) => {
  const fieldName = name ?? label;
  const disabledSet = new Set(disabledValues);

  return (
    <div className="flex flex-col gap-2 w-full">
      <label htmlFor={fieldName}>{label}</label>
      <select
        id={fieldName}
        className={`border border-border rounded-md px-4 py-2 w-full min-w-0 max-w-full ${color}`}
        defaultValue=""
        {...register(fieldName, { required })}
      >
        <option value="" disabled>{placeholder ?? 'Select an option'}</option>
        {options.map((option) => {
          const optionValue = option?.['Name'];
          return (
            <option
              key={optionValue}
              value={optionValue}
              disabled={disabledSet.has(optionValue)}
            >
              {optionValue}
            </option>
          );
        })}
      </select>
      {errors[fieldName] && <span className="text-destructive">{errors[fieldName].message}</span>}
    </div>
  );
};

export default FormSelect;
