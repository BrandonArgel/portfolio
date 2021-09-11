import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

import Logo from "../assets/svg/Logo.svg";

import "./styles/Header.css";

export default function Header({ main }) {
	const hamburgerIcon = useRef(null);
	const [header, setHeader] = useState(false);

	const toggleMenu = () => {
		hamburgerIcon.current.classList.toggle("active");
		main.current.classList.toggle("transform");

		main.current.addEventListener("click", removeMenu);
	};

	const removeMenu = () => {
		main.current.removeEventListener("click", removeMenu);
		hamburgerIcon.current.classList.remove("active");
		main.current.classList.remove("transform");
	};

	const changeHeader = () => {
		if (main.current.scrollTop > 0) {
			setHeader(true);
		} else {
			setHeader(false);
		}
	};

	useEffect(() => {
		main.current.addEventListener("scroll", changeHeader);
	}, []);

	return (
		<header className={header ? "header active" : "header"}>
			<div className="header__container">
				<Link className="header__logo fadeInDown" to="/" onClick={scrollToTop}>
					<img className="header__logo--img" src={Logo} alt="Logo" />
				</Link>
				<svg
					as="button"
					tabIndex="0"
					ref={hamburgerIcon}
					onClick={toggleMenu}
					className="hamburger-icon fadeInDown delay2"
					width="32"
					height="32"
				>
					<line id="top" x1="10%" y1="20%" x2="50%" y2="20%" />
					<line id="middle" x1="10%" y1="50%" x2="90%" y2="50%" />
					<line id="bottom" x1="50%" y1="80%" x2="90%" y2="80%" />
				</svg>
			</div>
		</header>
	);
}

const scrollToTop = () => {
	document.getElementById("main").scrollTo(0, 0);
};
