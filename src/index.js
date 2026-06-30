import ReactDOM from "react-dom";
import App from "./components/App.component";
import { Provider } from "react-redux";

// Estilos propios — sin Bootstrap, sin precompilación
import './css/utilities.css';
import './css/estilos.css';
// Íconos Bootstrap (web font, liviana — solo íconos)
import 'bootstrap-icons/font/bootstrap-icons.css';

import store from "./redux-tool-kit/store";

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
if(window.cordova) {
    console.log("start DEVICEREADY");
    document.addEventListener('deviceready', () => {
        startApp();
    }, false)
} else {
    console.log("start NORMAL");
    startApp()
}