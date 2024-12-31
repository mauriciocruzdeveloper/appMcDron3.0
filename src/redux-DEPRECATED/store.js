import { createStore, compose, applyMiddleware } from "redux";
import ThunkMiddleware from "redux-thunk";
import rootReducer from "./root-reducer";

const composeEnhancers =
    window.window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const middlewares = [ThunkMiddleware];

const store = createStore(
    rootReducer,
    composeEnhancers(applyMiddleware(...middlewares))
);

export default store;