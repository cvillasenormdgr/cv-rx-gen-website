export const AppReducer = (state, action) => {
  switch (action.type) {
    case "SET_FORM_FIELDS":
      return { ...state, formFields: action.payload };
    case "SET_MEDICINES":
      return { ...state, medicines: action.payload };
    case "OPEN_MODAL":
      return { ...state, modalsOpen: [...state.modalsOpen, action.payload] };
    case "CLOSE_MODAL":
      return { ...state, modalsOpen: state.modalsOpen.filter(modal => modal !== action.payload) };
    default:
      return state;
  }
}