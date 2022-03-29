import * as React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout, Loader } from "components";
// const Resume = require("assets/resume.pdf");

const Home = React.lazy(() => import("pages/Home"));

const App = () => {
	return (
		<BrowserRouter>
			<React.Suspense fallback={<Loader />}>
				<a className="skip-to-content" href="#content">
					Saltar al contenido
				</a>
				<Routes>
					<Route path="/" element={<Layout />}>
						<Route index element={<Home />} />
						{/* <Route path="resume" element={<object data={Resume} type="application/pdf" aria-label="Resume of Brandon Argel" />} /> */}
					</Route>
					{/* <Route path="*" element={<NoMatch />} /> */}
				</Routes>
			</React.Suspense>
		</BrowserRouter>
	);
};

export default App;
