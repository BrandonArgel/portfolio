import * as React from "react";
import { Hero, Loader } from "@components";
const About = React.lazy(() =>
	import("@components").then(({ About }) => ({
		default: About,
	}))
);
const Contact = React.lazy(() =>
	import("@components").then(({ Contact }) => ({
		default: Contact,
	}))
);
const Jobs = React.lazy(() =>
	import("@components").then(({ Jobs }) => ({
		default: Jobs,
	}))
);
const Projects = React.lazy(() =>
	import("@components").then(({ Projects }) => ({
		default: Projects,
	}))
);

const Home = () => {
	React.useEffect(() => {
		if (window.location.hash) {
			const id = window.location.hash.substring(1);

			setTimeout(() => {
				const el = document.getElementById(id);
				if (el) {
					el.scrollIntoView();
					el.focus();
				}
			}, 0);
		}
	});

	return (
		<>
			<Hero />
			<React.Suspense fallback={<Loader />}>
				<About />
				<Jobs />
				<Projects />
				<Contact />
			</React.Suspense>
		</>
	);
};

export { Home };
