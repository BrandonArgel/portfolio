import * as React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout, Loader } from "@components";
import { LanguageProvider, LanguageContext } from "@context";

const Home = React.lazy(() =>
	import("@pages").then(({ Home }) => ({
		default: Home,
	}))
);

const App = () => {
	const {
		texts: { skipToContent },
	} = React.useContext(LanguageContext);

	return (
		<BrowserRouter>
			<React.Suspense fallback={<Loader />}>
				<a className="skip-to-content" href="#content">
					{skipToContent}
				</a>
				<Routes>
					<Route path="/" element={<Layout />}>
						<Route index element={<Home />} />
					</Route>
					{/* Create not found page */}
					<Route path="*" element={<Navigate replace to="/" />} />
				</Routes>
			</React.Suspense>
		</BrowserRouter>
	);
};

export default App;
