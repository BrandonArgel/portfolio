import React from "react";
import styled from "styled-components";

const Card = ({ children, className }) => {
	return <CardContainer className={className}>{children}</CardContainer>;
};

const CardContainer = styled.div`
	background-color: var(--light-fond);
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	padding: 10px;
	text-align: center;
	transition: all 0.3s ease-in-out;
	width: 100%;
	z-index: 1;

	&:hover,
	&:focus,
	&:active,
	&:focus-within {
		transform: translateY(-5px);
		h2 {
			color: var(--special-text);
		}
		p {
			color: var(--light-text);
		}
		img {
			filter: brightness(1);
		}
	}
`;

const CardTitle = styled.h2`
	font: 2rem/100% var(--font-mono);
	padding: 10px 0;
	transition: all 0.3s ease-in-out;
`;

const CardDescription = styled.p`
	color: var(--text);
	font: 1.6rem/100% var(--font-mono);
	padding: 10px 0;
	transition: all 0.3s ease-in-out;
`;

const CardImage = styled.img`
	filter: brightness(0.8);
	transition: all 0.3s ease-in-out;
	width: 100%;
`;

const CardButtons = styled.div`
	display: flex;
	justify-content: space-around;
	padding: 20px 0 10px;
`;

export { Card, CardTitle, CardDescription, CardImage, CardButtons };
