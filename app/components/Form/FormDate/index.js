import React from 'react'

const FormDate = ({ name, label, required, register, errors }) => {
  return (
    <div className="flex flex-row items-center gap-2">
      <label className="font-bold min-w-[100px]" htmlFor={name}>{label}</label>
      <input className="border border-border rounded-md px-4 py-2 w-full" type="date" id={name} {...register(name, { required })} />
      {errors[name] && <span className="text-destructive">{errors[name].message}</span>}
    </div>
  )
}

export default FormDate