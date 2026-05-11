export const ConsultReducer = (state, action) => {
  switch (action.type) {
    case "SET_DOCTOR_NAME":
      return { ...state, doctorName: action.payload };
    case "SET_PATIENT_NAME":
      return { ...state, patientName: action.payload };
    case "SET_MEDICINES":
      return { ...state, medicines: [...state.medicines, action.payload] };
    case "CLEAR_MEDICINES":
      return { ...state, medicines: [] };
    case "SET_DOCUMENT":
      return { ...state, document: action.payload };
    case "CLEAR_DOCUMENT":
      return { ...state, document: null };
    default:
      return state;
  }
}