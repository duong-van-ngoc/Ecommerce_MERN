import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {Provider} from 'react-redux';
import {store} from './app/store.js';
import {ToastContainer} from 'react-toastify';


//////////////////////////// // Entry point of the React application. It renders the App component wrapped with Redux Provider and ToastContainer for notifications.

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store = {store}>
    <App />
    <ToastContainer />
    </Provider>
  </StrictMode>,
)
