import React from "react";

import "./styles/NavBar.css";

export default function NavBar() {
	return (
		<aside className="aside">
			<nav>
				<ul>
					<li>
						<a
							href="#about"
							onClick={() => {
								removeMenu("about");
							}}
						>
							About me
						</a>
					</li>
					<li>
						<a
							href="#experience"
							onClick={() => {
								removeMenu("experience");
							}}
						>
							Experience
						</a>
					</li>
					<li>
						<a
							href="#portfolio"
							onClick={() => {
								removeMenu("portfolio");
							}}
						>
							Portfolio
						</a>
					</li>
					<li>
						<a
							href="#contact"
							onClick={() => {
								removeMenu("contact");
							}}
						>
							Contact
						</a>
					</li>
				</ul>
			</nav>
		</aside>
	);
}

const removeMenu = (id) => {
	const hamburger = document.querySelector(".hamburger-icon");
	const main = document.querySelector("#main");
	const particles = document.querySelector("#tsparticles");
	const section = document.getElementById(id);

	main.classList.remove("transform");
	particles.classList.remove("transform");
	hamburger.classList.remove("active");
	// The following code is to avoid the overscroll effect by the perspective of the page
	// * console.log(section.getBoundingClientRect().top); // Didn't work
	// * console.log(section.offsetTop); // It works
	// * console.log(main.scrollTop); // Just to check the scrollTop

	// The scrollTo function must be placed in the event loop to replace the overscroll of the href

	setTimeout(() => {
		main.scrollTo(0, section.offsetTop - 100);
	}, 1);
};
