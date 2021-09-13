import React from "react";
import styled from "styled-components";

const ButtonActive = ({ children, className, disabled, id }) => {
	return (
		<Button id={id} className={className} disabled={disabled} type="submit">
			<span></span>
			<span></span>
			<span></span>
			<span></span>
			<span></span>
			<span></span>
			<span></span>
			<span></span>
			{children}
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
	margin: 20px auto 0;
	overflow: hidden;
	padding: 10px 20px;
	position: relative;
	text-decoration: none;
	transition: all cubic-bezier(0.215, 0.61, 0.355, 1) 0.5s;

	& span:nth-child(1) {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 2px;
		background: linear-gradient(to right, transparent, var(--special-text));
		animation: animate1 2s linear infinite;
	}
	@keyframes animate1 {
		0% {
			transform: translateX(-100%);
		}
		100% {
			transform: translateX(100%);
		}
	}
	& span:nth-child(2) {
		position: absolute;
		top: 0;
		right: 0;
		width: 2px;
		height: 100%;
		transform: translateY(-100%);
		background: linear-gradient(to bottom, transparent, var(--special-text));
		animation: animate2 2s 1s linear infinite;
	}
	@keyframes animate2 {
		0% {
			transform: translateY(-100%);
		}
		100% {
			transform: translateY(100%);
		}
	}
	& span:nth-child(3) {
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		height: 2px;
		background: linear-gradient(to left, transparent, var(--special-text));
		animation: animate3 2s linear infinite;
	}
	@keyframes animate3 {
		0% {
			transform: translateX(100%);
		}
		100% {
			transform: translateX(-100%);
		}
	}
	& span:nth-child(4) {
		position: absolute;
		top: 0;
		left: 0;
		width: 2px;
		height: 100%;
		transform: translateY(100%);
		background: linear-gradient(to top, transparent, var(--special-text));
		animation: animate4 2s 1s linear infinite;
	}
	@keyframes animate4 {
		0% {
			transform: translateY(100%);
		}
		100% {
			transform: translateY(-100%);
		}
	}
	& span:nth-child(5) {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 2px;
		transform: translateX(-100%);
		background: linear-gradient(to right, transparent, var(--special-text));
		animation: animate5 2s 1s linear infinite;
	}
	@keyframes animate5 {
		0% {
			transform: translateX(-100%);
		}
		100% {
			transform: translateX(100%);
		}
	}
	& span:nth-child(6) {
		position: absolute;
		top: 0;
		right: 0;
		width: 2px;
		height: 100%;
		background: linear-gradient(to bottom, transparent, var(--special-text));
		animation: animate6 2s linear infinite;
	}
	@keyframes animate6 {
		0% {
			transform: translateY(-100%);
		}
		100% {
			transform: translateY(100%);
		}
	}
	& span:nth-child(7) {
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		height: 2px;
		transform: translateX(100%);
		background: linear-gradient(to left, transparent, var(--special-text));
		animation: animate7 2s 1s linear infinite;
	}
	@keyframes animate7 {
		0% {
			transform: translateX(100%);
		}
		100% {
			transform: translateX(-100%);
		}
	}
	& span:nth-child(8) {
		position: absolute;
		top: 0;
		left: 0;
		width: 2px;
		height: 100%;
		background: linear-gradient(to top, transparent, var(--special-text));
		animation: animate8 2s linear infinite;
	}
	@keyframes animate8 {
		0% {
			transform: translateY(100%);
		}
		100% {
			transform: translateY(-100%);
		}
	}
`;

export default ButtonActive;
