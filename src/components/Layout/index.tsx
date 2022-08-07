import * as React from "react";
import { Outlet } from "react-router-dom";
import { Header, Footer } from "@components";

const Particles = React.lazy(() =>
	import("@components").then(({ Particles }) => ({
		default: Particles,
	}))
);

const Layout = () => {
	return (
		<>
			<Header />
			<main id="content">
				<Outlet />
				<Footer />
			</main>
			<Particles />
		</>
	);
};

export { Layout };
