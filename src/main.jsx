import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import Driver from "./Driver.jsx";
import Forwarder from "./Forwarder.jsx";
import Customer from "./Customer.jsx";

let App;

switch ("forwarder") {
  case "driver":
    App = Driver;
    break;

  case "forwarder":
    App = Forwarder;
    break;

  case "customer":
    App = Customer;
    break;

  default:
    throw new Error("Unknown role");
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
