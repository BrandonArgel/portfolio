import * as React from "react";
import { Hero, Spinner } from "components";
const Content = React.lazy(() => import("components/Content"));
const Particles = React.lazy(() => import("components/Particles"));

const Home = () => {
	return (
		<>
			<Hero />
			<React.Suspense fallback={<Spinner />}>
				<Content />
				<Particles />
			</React.Suspense>
		</>
	);
};

export default Home;
