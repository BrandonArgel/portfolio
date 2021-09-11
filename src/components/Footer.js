import React from "react";
import styled from "styled-components";

import Twitter from "../assets/svg/Twitter.svg";
import Facebook from "../assets/svg/Facebook.svg";
import Instagram from "../assets/svg/Instagram.svg";
import Github from "../assets/svg/Github.svg";
import Linkedin from "../assets/svg/Linkedin.svg";
import Platzi from "../assets/svg/Platzi.svg";

export default function Footer() {
	return (
		<FooterContainer>
			<p>
				<span>©</span> Sitio construido por Brandon Argel 2021
			</p>
			<Social>
				<a href="https://github.com/BrandonArgel">
					<img src={Github} alt="Github" />
				</a>
				<a href="https://twitter.com/BrandArgel">
					<img src={Twitter} alt="Twitter" />
				</a>
				<a href="https://www.instagram.com/brandargel/">
					<img src={Instagram} alt="Instagram" />
				</a>
				<a href="https://www.linkedin.com/in/brandargel/">
					<img src={Linkedin} alt="Linkedin" />
				</a>
				<a href="https://platzi.com/p/BrandArgel/">
					<img src={Platzi} alt="Platzi" />
				</a>
				<a href="https://www.facebook.com/brandonargel.dominguez/">
					<img src={Facebook} alt="Facebook" />
				</a>
			</Social>
		</FooterContainer>
	);
}

const FooterContainer = styled.footer`
	align-items: center;
	display: flex;
	flex-flow: column;
	justify-content: space-evenly;
	margin: 0 auto;
	max-width: 1200px;
	padding: 20px;
	width: 100%;

	p {
		text-align: center;
	}

	span {
		font-size: 2rem;
	}

	@media (min-width: 768px) {
		padding: 20px 100px 80px;
	}
`;

const Social = styled.div`
	display: flex;
	justify-content: space-between;
	margin: 20px;
	max-width: 350px;
	width: 100%;

	a {
		text-decoration: none;

		img {
			width: 35px;
			opacity: 0.7;
			transition: all 0.3s ease-in-out;
		}

		img:hover {
			opacity: 1;
			transform: scale(1.2);
		}
	}
`;
