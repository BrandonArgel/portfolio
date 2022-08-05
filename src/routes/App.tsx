import * as React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout, Loader } from "@components";
import { LanguageProvider } from "@context";

const Home = React.lazy(() =>
	import("@pages").then(({ Home }) => ({
		default: Home,
	}))
);

const App = () => {
	return (
		<LanguageProvider>
			<BrowserRouter>
				<React.Suspense fallback={<Loader />}>
					<a className="skip-to-content" href="#content">
						Saltar al contenido
					</a>
					<Routes>
						<Route path="/" element={<Layout />}>
							<Route index element={<Home />} />
						</Route>
						{/* <Route path="*" element={<NoMatch />} /> */}
					</Routes>
				</React.Suspense>
			</BrowserRouter>
		</LanguageProvider>
	);
};

export default App;
