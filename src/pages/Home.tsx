import * as React from "react";
import { Loader, Hero, Particles } from "components";
const About = React.lazy(() => import("components/sections/About"));
const Contact = React.lazy(() => import("components/sections/Contact"));
const Jobs = React.lazy(() => import("components/sections/Jobs"));
const Projects = React.lazy(() => import("components/sections/Projects"));

const Home = () => {
	return (
		<React.Suspense fallback={<Loader />}>
			<Hero />
			<About />
			<Jobs />
			<Projects />
			<Contact />
			<Particles />
		</React.Suspense>
	);
};

export default Home;
