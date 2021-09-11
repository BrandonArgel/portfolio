import React from "react";
import styled from "styled-components";

import Form from "./Form";
import Section from "../components/Section";
import Title from "../components/Title";

import "./styles/Contact.css";

export default function Contact() {
	return (
		<Section id="contact">
			<Paragraph>
				<Title>Contact</Title>
				<p>I am currently looking for new opportunities, my inbox is always open.</p>
				<p>
					If you have any questions about my services, or just want to say hello, feel free to contact me.
				</p>
			</Paragraph>
			<Form />
		</Section>
	);
}

const Paragraph = styled.div`
	text-align: center;

	p {
		font: 1.6rem/2.5rem var(--font-mono);
	}
`;
