import React from "react";

import Section from "../components/Section";
import Title from "../components/Title";

import Photo from "../assets/img/photo.jpg";

import "./styles/About.css";

export default function About() {
	return (
		<Section id="about">
			<div className="about animation fade_left transform_left appear">
				<div className="about--info">
					<Title>About me</Title>
					<p>
						Hi there! I'm Brandon Argel, I am 19 years old and I enjoy learning and creating new things every
						day.
					</p>
					<p>
						Shortly before graduating from the Jorge Matute Remus Polytechnic Computer Engineering, I began my
						studies at Platzi and I decided to adopt their motto:
					</p>
					<blockquote>Never stop learning</blockquote>
					<p>Here are some technologies and tools that I have been working with:</p>
					<ul>
						<li>JavaScript (ES6+)</li>
						<li>HTML</li>
						<li>CSS & (SCSS)</li>
						<li>React</li>
						<li>Git & GitHub</li>
						<li>Figma</li>
					</ul>
				</div>

				<img className="about--photo" src={Photo} alt="Foto de Brandon" />
			</div>
		</Section>
	);
}
