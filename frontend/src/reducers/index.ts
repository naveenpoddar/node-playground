import { HYDRATE } from "next-redux-wrapper";
import { AnyAction, combineReducers } from "redux";
import appReducer, { AppState } from "./app";

export type State = {
  app: AppState;
};

const rootReducer = (state: State | undefined, action: AnyAction): State => {
  switch (action.type) {
    case HYDRATE:
      return action.payload;

    default: {
      const combineReducer = combineReducers({
        app: appReducer,
      });

      return combineReducer(state, action);
    }
  }
};

export default rootReducer;
