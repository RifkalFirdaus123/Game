import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import AdminPanel from "./pages/Admin.jsx";
import "./index.css";

// Simple routing based on URL path
const currentPath = window.location.pathname;
const Page = currentPath === "/admin" ? AdminPanel : App;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Page />
  </React.StrictMode>
);

