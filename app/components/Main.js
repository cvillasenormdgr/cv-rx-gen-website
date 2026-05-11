"use client";
import { useContext } from "react";

import Form from "./Form";
import Sidebar from "./Sidebar";

import { AppContext } from "@/app/context/AppContext";
import { ConsultContext } from "@/app/context/ConsultContext";

const Main = ({ medicines, groupedFormFields }) => {
  const { state, dispatch } = useContext(AppContext);
  const { consultState, consultDispatch } = useContext(ConsultContext);
  return (
    <div className="main">
      <div className="main__content">
        <Form
          medicines={medicines}
          groupedFormFields={groupedFormFields}
          dispatch={dispatch}
          state={state}
          consultState={consultState}
          consultDispatch={consultDispatch}
        />
      </div>
      <Sidebar
        dispatch={dispatch}
        state={state}
        consultState={consultState}
        consultDispatch={consultDispatch}
      />
    </div>
  );
}

export default Main;