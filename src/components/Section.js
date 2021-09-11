import React from "react";

import styled from "styled-components";

export default function Section({ children, id }) {
	return <StyledSection id={id}>{children}</StyledSection>;
}

const StyledSection = styled.section`
	margin: 80px auto 0;
	max-width: 1300px;
	padding: 20px;
	width: 100%;

	@media (min-width: 768px) {
		padding: 20px 100px 80px;
	}
`;
