import { createStore, applyMiddleware, compose } from "redux";
import thunk from "redux-thunk";
import reducers, { State as RootState } from "../reducers";
import { createWrapper } from "next-redux-wrapper";

const __window: any = typeof window !== "undefined" ? (window as any) : null;

const composeEnhancers =
  (typeof __window !== "undefined" &&
    __window?.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) ||
  compose;

const configureStore = () => {
  const store = createStore(reducers, composeEnhancers(applyMiddleware(thunk)));
  return store;
};

const wrapper = createWrapper(configureStore);

export type { RootState };
export default wrapper;
