import ReactDOM from "react-dom";
import App from "./components/App.component.jsx";
import { Provider } from "react-redux";
import store from "./redux/store";

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.min.js'
import './css/estilos.css';

const startApp = () => {
    // console.log(device.cordova)
    ReactDOM.render(
        <Provider store={store}>
            <App />
        </Provider>,
        document.querySelector("#root")
    );
}

// Si se ejecuta con cordova, la app arranca luego de deviceready.
if(!window.cordova) {
    console.log("start NORMAL");
    startApp()
} else {
    console.log("start DEVICEREADY");
    document.addEventListener('deviceready', startApp, false)
}