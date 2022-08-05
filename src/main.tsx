import React from "react";
import ReactDOM from "react-dom/client";
import App from "@routes/App";
import "@styles/global.scss";

ReactDOM.createRoot(document.getElementById("app") as HTMLDivElement).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
);
