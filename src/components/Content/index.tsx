import * as React from "react";
const About = React.lazy(() => import("components/sections/About"));
const Contact = React.lazy(() => import("components/sections/Contact"));
const Jobs = React.lazy(() => import("components/sections/Jobs"));
const Projects = React.lazy(() => import("components/sections/Projects"));

const Content = () => {
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
	}, []);

	return (
		<>
			<About />
			<Jobs />
			<Projects />
			<Contact />
		</>
	);
};

export default Content;
