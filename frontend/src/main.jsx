import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './global-hover.css'
import App from './App.jsx'
import {Provider} from 'react-redux';
import {store} from './app/store.js';
import {ToastContainer} from 'react-toastify';

//////////////// ///// Entry Point of the Application ///// ////////////////
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store = {store}>
    <App />
    <ToastContainer />
    </Provider>
  </StrictMode>,
)
