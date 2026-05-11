"use client";

import { useReducer, createContext } from "react";

import { initialState } from "./initialState";
import { AppReducer } from "./AppReducer";

const AppContext = createContext(initialState);

const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(AppReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export { AppContext, AppProvider };