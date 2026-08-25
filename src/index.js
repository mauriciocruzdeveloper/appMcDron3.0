import ReactDOM from "react-dom";
import App from "./components/App.component";
import { Provider } from "react-redux";

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.min.js'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './css/estilos.css';

import store from "./redux-tool-kit/store";
import { applyTheme, getStoredThemeMode, getSystemTheme, persistThemeMode, resolveTheme } from './utils/theme';

const startApp = () => {
    const storedMode = getStoredThemeMode();
    const systemTheme = getSystemTheme();
    const resolvedTheme = resolveTheme(storedMode, systemTheme);
    applyTheme(resolvedTheme);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (event) => {
        const mode = getStoredThemeMode();
        if (mode === 'system') {
            applyTheme(event.matches ? 'dark' : 'light');
        }
    };

    if (typeof mediaQuery.addEventListener === 'function') {
        mediaQuery.addEventListener('change', handleSystemThemeChange);
    } else if (typeof mediaQuery.addListener === 'function') {
        mediaQuery.addListener(handleSystemThemeChange);
    }

    // console.log(device.cordova)
    ReactDOM.render(
        <Provider store={store}>
            <App />
        </Provider>,
        document.querySelector("#root")
    );
}

window.persistThemeMode = persistThemeMode;
window.applyTheme = applyTheme;

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