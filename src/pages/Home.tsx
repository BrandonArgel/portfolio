import * as React from "react";
import { Hero, Loader } from "components";
const About = React.lazy(() => import("components/sections/About"));
const Contact = React.lazy(() => import("components/sections/Contact"));
const Jobs = React.lazy(() => import("components/sections/Jobs"));
const Projects = React.lazy(() => import("components/sections/Projects"));
const Particles = React.lazy(() => import("components/Particles"));

const Home = () => {
	const showIn = (entries: IntersectionObserverEntry[]) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				entry.target.classList.add("visible");
			}
		});
	};

	const observer = new IntersectionObserver(showIn, {
		root: null,
		rootMargin: "0px 0px -100px 0px",
		threshold: 0.0,
	});

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

		setTimeout(() => {
			const sections = document.querySelectorAll("section");
			const projects = document.querySelectorAll(".project");

			sections.forEach((section) => observer.observe(section));
			projects.forEach((project) => observer.observe(project));
		}, 0);
	});

	return (
		<>
			<Hero />
			<React.Suspense fallback={<Loader />}>
				<About />
				<Jobs />
				<Projects />
				<Contact />
				<Particles />
			</React.Suspense>
		</>
	);
};

export default Home;
