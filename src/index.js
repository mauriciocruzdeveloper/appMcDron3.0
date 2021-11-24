import ReactDOM from "react-dom";
import App from "./components/App.component.jsx";
import { Provider } from "react-redux";
import store from "./redux/store";

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.min.js'
import './css/estilos.css';

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.querySelector("#root")
);