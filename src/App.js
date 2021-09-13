import React from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";

import Home from "./pages/Home";
import NavBar from "./components/NavBar";
import Particles from "./components/Particles";

export default function App() {
	return (
		<BrowserRouter>
			<NavBar />
			<Particles />
			<Switch>
				<Route exact path="/" component={Home} />
			</Switch>
		</BrowserRouter>
	);
}
