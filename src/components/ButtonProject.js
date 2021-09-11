import React from "react";
import styled from "styled-components";

import githubLogo from "../assets/svg/GithubBtn.svg";
import portfolioLogo from "../assets/svg/PortfolioBtn.svg";

const ButtonHover = ({ children, github, href }) => {
	return (
		<Button as="a" href={href} target="_blank" rel="noopener noreferrer">
			<span></span>
			<span></span>
			<span></span>
			<span></span>
			<span></span>
			<span></span>
			<span></span>
			<span></span>
			{children}
			{github ? (
				<LogoImage src={githubLogo} alt="Github Logo" />
			) : (
				<LogoImage src={portfolioLogo} alt="Portfolio Logo" />
			)}
		</Button>
	);
};

const Button = styled.button`
	align-items: center;
	background: transparent;
	border: none;
	outline: none;
	color: var(--special-text);
	cursor: pointer;
	display: flex;
	font: 1.6rem/100% var(--font-mono);
	overflow: hidden;
	padding: 15px;
	position: relative;
	text-decoration: none;
	transition: all cubic-bezier(0.215, 0.61, 0.355, 1) 0.5s;

	span:nth-child(1) {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 2px;
		background: linear-gradient(to right, transparent, var(--special-text));
	}
	span:nth-child(2) {
		position: absolute;
		top: 0;
		right: 0;
		width: 2px;
		height: 100%;
		transform: translateY(-100%);
		background: linear-gradient(to bottom, transparent, var(--special-text));
	}
	span:nth-child(3) {
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		height: 2px;
		background: linear-gradient(to left, transparent, var(--special-text));
	}
	span:nth-child(4) {
		position: absolute;
		top: 0;
		left: 0;
		width: 2px;
		height: 100%;
		transform: translateY(100%);
		background: linear-gradient(to top, transparent, var(--special-text));
	}
	span:nth-child(5) {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 2px;
		transform: translateX(-100%);
		background: linear-gradient(to right, transparent, var(--special-text));
	}
	span:nth-child(6) {
		position: absolute;
		top: 0;
		right: 0;
		width: 2px;
		height: 100%;
		background: linear-gradient(to bottom, transparent, var(--special-text));
	}
	span:nth-child(7) {
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		height: 2px;
		transform: translateX(100%);
		background: linear-gradient(to left, transparent, var(--special-text));
	}
	span:nth-child(8) {
		position: absolute;
		top: 0;
		left: 0;
		width: 2px;
		height: 100%;
		background: linear-gradient(to top, transparent, var(--special-text));
	}
	&:hover {
		transform: scale(1.1);

		span: nth-child(1) {
			animation: animate1 2s linear infinite;
		}
		span: nth-child(2) {
			animation: animate2 2s 1s linear infinite;
		}
		span: nth-child(3) {
			animation: animate3 2s linear infinite;
		}
		span: nth-child(4) {
			animation: animate4 2s 1s linear infinite;
		}
		span: nth-child(5) {
			animation: animate5 2s 1s linear infinite;
		}
		span: nth-child(6) {
			animation: animate6 2s linear infinite;
		}
		span: nth-child(7) {
			animation: animate7 2s 1s linear infinite;
		}
		span: nth-child(8) {
			animation: animate8 2s linear infinite;
		}
	}
	&:focus {
		transform: scale(1.1);

		span: nth-child(1) {
			animation: animate1 2s linear infinite;
		}
		span: nth-child(2) {
			animation: animate2 2s 1s linear infinite;
		}
		span: nth-child(3) {
			animation: animate3 2s linear infinite;
		}
		span: nth-child(4) {
			animation: animate4 2s 1s linear infinite;
		}
		span: nth-child(5) {
			animation: animate5 2s 1s linear infinite;
		}
		span: nth-child(6) {
			animation: animate6 2s linear infinite;
		}
		span: nth-child(7) {
			animation: animate7 2s 1s linear infinite;
		}
		span: nth-child(8) {
			animation: animate8 2s linear infinite;
		}
	}
	&:active {
		transform: scale(1.1);

		span: nth-child(1) {
			animation: animate1 2s linear infinite;
		}
		span: nth-child(2) {
			animation: animate2 2s 1s linear infinite;
		}
		span: nth-child(3) {
			animation: animate3 2s linear infinite;
		}
		span: nth-child(4) {
			animation: animate4 2s 1s linear infinite;
		}
		span: nth-child(5) {
			animation: animate5 2s 1s linear infinite;
		}
		span: nth-child(6) {
			animation: animate6 2s linear infinite;
		}
		span: nth-child(7) {
			animation: animate7 2s 1s linear infinite;
		}
		span: nth-child(8) {
			animation: animate8 2s linear infinite;
		}
	}
	@keyframes animate1 {
		0% {
			transform: translateX(-100%);
		}
		100% {
			transform: translateX(100%);
		}
	}
	@keyframes animate2 {
		0% {
			transform: translateY(-100%);
		}
		100% {
			transform: translateY(100%);
		}
	}
	@keyframes animate3 {
		0% {
			transform: translateX(100%);
		}
		100% {
			transform: translateX(-100%);
		}
	}
	@keyframes animate4 {
		0% {
			transform: translateY(100%);
		}
		100% {
			transform: translateY(-100%);
		}
	}
	@keyframes animate5 {
		0% {
			transform: translateX(-100%);
		}
		100% {
			transform: translateX(100%);
		}
	}
	@keyframes animate6 {
		0% {
			transform: translateY(-100%);
		}
		100% {
			transform: translateY(100%);
		}
	}
	@keyframes animate7 {
		0% {
			transform: translateX(100%);
		}
		100% {
			transform: translateX(-100%);
		}
	}
	@keyframes animate8 {
		0% {
			transform: translateY(100%);
		}
		100% {
			transform: translateY(-100%);
		}
	}

	@media (min-width: 425px) and (max-width: 624px) {
		padding: 15px 30px;
	}

	@media (min-width: 768px) and (max-width: 784px) {
		padding: 15px 30px;
	}

	@media (min-width: 1024px) {
		padding: 15px 30px;
	}
`;

const LogoImage = styled.img`
	margin-left: 5px;
	width: 20px;
`;

export default ButtonHover;
