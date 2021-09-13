import React, { useEffect, useRef } from "react";

import Header from "../components/Header";
import Hero from "../components/Hero";
import About from "../components/About";
import Experience from "../components/Experience";
import Projects from "../components/Projects";
import Contact from "../components/Contact";
import Footer from "../components/Footer";

import "./styles/Animations.css";
import "./styles/Home.css";

export default function Home() {
	const main = useRef(null);

	const animations = () => {
		function fade(direction) {
			var animate = document.querySelectorAll(".fade_" + direction);
			for (var i = 0; i < animate.length; i++) {
				var altura = window.innerHeight / 1.3;
				var distancia = animate[i].getBoundingClientRect().top;
				animate[i].classList.add("transform_" + direction);
				if (distancia <= altura) {
					animate[i].classList.add("appear");
				} else {
					animate[i].classList.remove("appear");
				}
			}
		}

		fade("left");
		fade("right");
		fade("up");
		fade("down");
		fade("none");
	};

	useEffect(() => {
		main.current.addEventListener("scroll", animations);
	}, []);

	return (
		<main ref={main} id="main">
			<Header main={main} />
			<Hero />
			<About />
			<Experience />
			<Projects />
			<Contact />
			<Footer />
		</main>
	);
}
