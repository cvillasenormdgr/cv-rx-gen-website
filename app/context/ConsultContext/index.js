"use client";

import { useReducer, createContext } from "react";

import { initialState } from "./initialState";
import { ConsultReducer } from "./ConsultReducer";

const ConsultContext = createContext(initialState);

const ConsultProvider = ({ children }) => {
  const [consultState, consultDispatch] = useReducer(ConsultReducer, initialState);

  return (
    <ConsultContext.Provider value={{ consultState, consultDispatch }}>
      {children}
    </ConsultContext.Provider>
  )
}

export { ConsultContext, ConsultProvider };