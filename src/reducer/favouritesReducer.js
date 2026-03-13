export const favouritesReducer = (state, action) => {

  switch (action.type) {

    case "TOGGLE_FAV":

      const exists = state.find((p) => p.id === action.payload.id);

      if (exists) {
        return state.filter((p) => p.id !== action.payload.id);
      } else {
        return [...state, action.payload];
      }

    default:
      return state;

  }

};