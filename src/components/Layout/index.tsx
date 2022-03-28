import * as React from "react";
import { Outlet } from "react-router-dom";
import { Header, Footer } from "components";

const Layout = () => {
	return (
		<>
			<Header />
			<main id="content">
				<div>
					<Outlet />
				</div>
				<Footer />
			</main>
		</>
	);
};

export default Layout;
