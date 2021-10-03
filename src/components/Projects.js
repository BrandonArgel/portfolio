import React, { useState, useRef } from "react";
import styled from "styled-components";

import ButtonProject from "./ButtonProject";
import { Card, CardTitle, CardDescription, CardImage, CardButtons } from "../components/CardProject";
import Section from "../components/Section";
import Title from "../components/Title";

import IMAGES from "../utils";

import "./styles/Projects.css";

export default function Projects() {
	const [visibleProjects, setVisibleProjects] = useState(false);
	const buttonRef = useRef(null);

	return (
		<Section id="portfolio">
			<div className="animation fade_left transform_left appear">
				<Title>Projects</Title>
				<p>
					Throughout my career as a Front-End, I have had the privilege of working on incredible and
					challenging projects. <br /> Here are some projects that I would like to share.
				</p>
			</div>
			<div className="projects">
				<Card className="animation fade_left transform_left appear">
					<CardTitle>Personal Blog</CardTitle>
					<CardDescription>
						If you want to learn about topics like personal development, technology and health. Check out my
						blog!
					</CardDescription>
					<CardImage src={IMAGES.blog} alt="Blog" />
					<CardButtons>
						<ButtonProject href="https://blog.brandonargel.me">Project</ButtonProject>
						<ButtonProject href="https://github.com/BrandonArgel/blog" github={true}>
							Github
						</ButtonProject>
					</CardButtons>
				</Card>
				<Card className="animation fade_right transform_right appear">
					<CardTitle>Flowskip</CardTitle>
					<CardDescription>
						Flowskip was the idea of ​​my friend{" "}
						<Link target="_blank" rel="noopener noreferrer" href="https://www.linkedin.com/in/aarongaribay/">
							Aaron Garibay
						</Link>
						, who developed the Back End and I developed the Front End, in this app you can create your own
						room and invite your friends to join, to manage the flow of your music.
						<br />
						Try it out in{" "}
						<Link target="_blank" rel="noopener noreferrer" href="https://flowskip.com/">
							flowskip.com
						</Link>
					</CardDescription>
					<CardImage src={IMAGES.flowskip} alt="RickAndMorty" />
					<CardButtons>
						<ButtonProject href="https://flowskip.com">Project</ButtonProject>
						<ButtonProject href="https://github.com/flowskip/flowskip" github={true}>
							Github
						</ButtonProject>
					</CardButtons>
				</Card>
				<Card className="animation fade_left transform_left appear">
					<CardTitle>Rick and Morty</CardTitle>
					<CardDescription>
						I made this project fetching data from the{" "}
						<Link target="_blank" rel="noopener noreferrer" href="https://rickandmortyapi.com/">
							Rick and Morty API
						</Link>
						, with react and an "Infinite Scroll" whitch actually is finite!
					</CardDescription>
					<CardImage src={IMAGES.rickAndMorty} alt="RickAndMorty" />
					<CardButtons>
						<ButtonProject href="https://brandonargel.me/rick-and-morty">Project</ButtonProject>
						<ButtonProject href="https://github.com/BrandonArgel/rick-and-morty" github={true}>
							Github
						</ButtonProject>
					</CardButtons>
				</Card>
				<Card className="animation fade_right transform_right appear">
					<CardTitle>Platzi Badges</CardTitle>
					<CardDescription>
						This is a project where I started learning about react, I made also a REST API to make, modify,
						and delete the badges, you can also register your own badge!
					</CardDescription>
					<CardImage src={IMAGES.platziBadges} alt="Platzi Badges" />
					<CardButtons>
						<ButtonProject href="https://brandonargel.me/platzi-badges">Project</ButtonProject>
						<ButtonProject href="https://github.com/BrandonArgel/platzi-badges" github={true}>
							Github
						</ButtonProject>
					</CardButtons>
				</Card>
				<Card className="animation fade_left transform_left appear">
					<CardTitle>Music Player</CardTitle>
					<CardDescription>A vanilla javascript music player, responsive.</CardDescription>
					<CardImage src={IMAGES.musicPlayer} alt="Music Player" />
					<CardButtons>
						<ButtonProject href="https://brandonargel.me/music_player">Project</ButtonProject>
						<ButtonProject href="https://github.com/BrandonArgel/music_player" github={true}>
							Github
						</ButtonProject>
					</CardButtons>
				</Card>
				<Card className="animation fade_right transform_right appear">
					<CardTitle>Simon Says Game</CardTitle>
					<CardDescription>
						Game Simon Says, with Vanilla JavaScript. Can you pass all 15 levels? Challenge your memory!
					</CardDescription>
					<CardImage src={IMAGES.simonSays} alt="Simon Says" />
					<CardButtons>
						<ButtonProject href="https://brandonargel.me/simon-says">Project</ButtonProject>
						<ButtonProject href="https://github.com/BrandonArgel/simon-says" github={true}>
							Github
						</ButtonProject>
					</CardButtons>
				</Card>
				<Card
					className={
						visibleProjects
							? "animation fade_left transform_left appear"
							: "animation fade_left transform_left appear hide"
					}
				>
					<CardTitle>Rock, Paper or Scissors Game</CardTitle>
					<CardDescription>
						Rock Paper or Scissors Game with Vanilla JavaScript, HTML and CSS.
					</CardDescription>
					<CardImage src={IMAGES.rockPaperAndScissors} alt="Rock, Paper or Scissors Game" />
					<CardButtons>
						<ButtonProject href="https://brandonargel.me/rock-paper-and-scissors">Project</ButtonProject>
						<ButtonProject href="https://github.com/BrandonArgel/rock-paper-and-scissors" github={true}>
							Github
						</ButtonProject>
					</CardButtons>
				</Card>
				<Card
					className={
						visibleProjects
							? "animation fade_right transform_right appear"
							: "animation fade_right transform_right appear hide"
					}
				>
					<CardTitle>Platzi Video</CardTitle>
					<CardDescription>One of my very first projects learning the basics of HTML & CSS.</CardDescription>
					<CardImage src={IMAGES.platziVideo} alt="Platzi Video" />
					<CardButtons>
						<ButtonProject href="https://brandonargel.me/platzi-video">Project</ButtonProject>
						<ButtonProject href="https://github.com/BrandonArgel/platzi-video" github={true}>
							Github
						</ButtonProject>
					</CardButtons>
				</Card>
				<Card
					className={
						visibleProjects
							? "animation fade_left transform_left appear"
							: "animation fade_left transform_left appear hide"
					}
				>
					<CardTitle>Professional Form</CardTitle>
					<CardDescription>
						Professional Form improved with HTML, CSS and JavaScript by FalconMasters.
					</CardDescription>
					<CardImage src={IMAGES.form} alt="Professional Form" />
					<CardButtons>
						<ButtonProject href="https://brandonargel.me/formulario/">Project</ButtonProject>
						<ButtonProject href="https://github.com/BrandonArgel/formulario" github={true}>
							Github
						</ButtonProject>
					</CardButtons>
				</Card>
				<Card
					className={
						visibleProjects
							? "animation fade_right transform_right appear"
							: "animation fade_right transform_right appear hide"
					}
				>
					<CardTitle>Batatabit</CardTitle>
					<CardDescription>
						My very first project learning the basics of HTML & CSS, learning responsive design.
					</CardDescription>
					<CardImage src={IMAGES.batatabit} alt="Batatabit" />
					<CardButtons>
						<ButtonProject href="https://brandonargel.me/batatabit">Project</ButtonProject>
						<ButtonProject href="https://github.com/BrandonArgel/batatabit" github={true}>
							Github
						</ButtonProject>
					</CardButtons>
				</Card>
				<Card
					className={
						visibleProjects
							? "animation fade_left transform_left appear"
							: "animation fade_left transform_left appear hide"
					}
				>
					<CardTitle>Animated Pumpkin</CardTitle>
					<CardDescription>
						Learning animations with CSS thanks to a post of{" "}
						<Link
							target="_blank"
							rel="noopener noreferrer"
							href="https://dev.to/raulmar/no-tengas-miedo-a-dibujar-con-css-1ck"
						>
							Raúl Martín
						</Link>
					</CardDescription>
					<CardImage src={IMAGES.pumpkin} alt="Batatabit" />
					<CardButtons>
						<ButtonProject href="https://brandonargel.me/animated-pumpkin">Project</ButtonProject>
						<ButtonProject href="https://github.com/BrandonArgel/animated-pumpkin" github={true}>
							Github
						</ButtonProject>
					</CardButtons>
				</Card>
			</div>
			<Layer
				onClick={() => {
					setVisibleProjects(!visibleProjects);
					buttonRef.current.innerHTML = visibleProjects
						? `
					<span></span>
					<span></span>
					<span></span>
					<span></span>
					<span></span>
					<span></span>
					<span></span>
					<span></span>
					Show more projects!
					`
						: `
					<span></span>
					<span></span>
					<span></span>
					<span></span>
					<span></span>
					<span></span>
					<span></span>
					<span></span>
					Show less projects
					`;
				}}
			>
				<ButtonHover ref={buttonRef}>
					<span></span>
					<span></span>
					<span></span>
					<span></span>
					<span></span>
					<span></span>
					<span></span>
					<span></span>
					Show more projects!
				</ButtonHover>
			</Layer>
		</Section>
	);
}

const Link = styled.a`
	color: var(--special-text);
	display: inline-block;
	text-decoration: none;

	&::after {
		content: "";
		display: block;
		width: 0;
		height: 2px;
		background-color: var(--special-text);
	}

	&:hover::after,
	&:focus::after {
		width: 100%;
		transition: width 0.5s;
	}
`;

const Layer = styled.div`
	height: fit-content;
	margin: 50px auto;
	width: fit-content;
`;

const ButtonHover = styled.button`
	align-items: center;
	background: transparent;
	border: none;
	outline: none;
	color: var(--special-text);
	cursor: pointer;
	display: flex;
	font: 2rem var(--font-mono);
	margin: 0 auto;
	overflow: hidden;
	padding: 15px 25px;
	position: relative;
	text-decoration: none;
	transition: all cubic-bezier(0.215, 0.61, 0.355, 1) 0.5s;
	width: fit-content;

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
`;
