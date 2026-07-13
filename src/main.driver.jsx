import React from 'react';
import ReactDOM from 'react-dom/client';
import DriverApp from './Driver.jsx';
import { Capacitor } from '@capacitor/core';

if(Capacitor.isNativePlatform()) {
  window.APP_DATA = {
    home_url: "https://driver.360logistics.kz",
    rest_url: "https://driver.360logistics.kz/wp-json/",
    admin_url: "https://driver.360logistics.kz/wp-admin/admin-ajax.php",
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <DriverApp />
);