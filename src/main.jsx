import React from 'react';
import ReactDOM from 'react-dom/client';
import Driver from './Driver.jsx';
import Forwarder from './Forwarder.jsx';
import Customer from './Customer.jsx';
import Factor from './Factor.jsx';

const role = import.meta.env.VITE_AUTH_ROLE;
let App;

switch (role) {
  case 'driver':
    App = Driver;
    break;

  case 'forwarder':
    App = Forwarder;
    break;

  case 'customer':
    App = Customer;
    break;

  case 'factor':
    App = Factor;
    break;

  default:
    throw new Error('Unknown role');
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
