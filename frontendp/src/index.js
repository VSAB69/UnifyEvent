import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";


// 🔥 GOOGLE OAUTH
import { GoogleOAuthProvider } from "@react-oauth/google";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(

    <GoogleOAuthProvider clientId="982537946399-pri4i3tvqt04aaqdn08e4ngobfvr592u.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>

);

