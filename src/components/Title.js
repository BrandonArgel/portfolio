import React from "react";
import styled from "styled-components";

export default function Title({ children }) {
	return <StyledTitle>{children}</StyledTitle>;
}

const StyledTitle = styled.h2`
	margin-bottom: 20px;
	color: var(--special-text);
	font: bold 3rem/1.1 var(--font-mono);
`;
