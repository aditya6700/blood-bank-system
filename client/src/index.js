import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { AuthContextProvider } from './context/AuthContext';

// Importing the Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';

// Importing the reactToastify CSS
import "react-toastify/dist/ReactToastify.css";

//Importing react bootstrap table2 CSS
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";

// Importing react bootstrap table2 paginator CSS
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';

// Importing swiper CSS
import 'swiper/css/bundle';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode>
    <BrowserRouter>
      <AuthContextProvider>
        <App />
      </AuthContextProvider>
    </BrowserRouter>
  // </React.StrictMode>
);