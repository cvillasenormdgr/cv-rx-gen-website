import React from 'react'

const FormMessage = ({ label }) => {
  return (
    <div className="bg-[#0D6D6E]/10 border-l-8 border-[#0D6D6E] w-full p-4">
      <p className="font-bold">{label}</p>
    </div>
  )
}

export default FormMessage