import { GitHub, Instagram, Linkedin, Platzi, Twitter } from "assets/icons";

export const NavItems = [
	{
		name: "About Me",
		url: "about",
	},
	{
		name: "Experience",
		url: "experience",
	},
	{
		name: "Projects",
		url: "projects",
	},
	{
		name: "Contact",
		url: "contact",
	},
];

export const Works = [
	{
		company: "Consultora Blockchain",
		company_url: "https://blockchainconsultora.com/es",
		position: "Web Developer",
		start_date: "September 2021",
		end_date: "February 2022",
		description: [
			"Developing a web application for the mayor's office in La Paz, Bolivia. Using technologies such as JavaScript, SCSS, storybook, and some JS libraries, such as React, Next.js, in addition to using Redux-Saga, among others.",
		],
	},
	{
		company: "Axo Systems",
		company_url:
			"https://mx.linkedin.com/company/axosystems?trk=public_profile_topcard-current-company",
		position: "Front-End",
		start_date: "January 2021",
		end_date: "September 2021",
		description: [
			"Developed and maintained code for in-house and client websites using HTML, CSS, Sass, JavaScript, React, Firebase, Wordpress, and more.",
			"Manually tested sites in various browsers and mobile devices to ensure cross-browser compatibility and responsiveness.",
			"Clients included CNI Consultores, Solar Center, and more.",
		],
	},
];

const images = {
	blog: "blog",
	rick: "rick_and_morty",
	badges: "platzi_badges",
	music: "music_player",
	simon: "simon_says",
};

export const CardProjects = [
	{
		name: "Personal Blog",
		description: (
			<p>
				If you want to learn about topics like personal development, technology and health. Check
				out my blog! <span>Developing...</span>
			</p>
		),
		link: "https://blog.brandonargel.me",
		github: "https://github.com/BrandonArgel/blog",
		images: {
			sm: require(`assets/images/${images.blog}.jpg`),
			md: require(`assets/images/${images.blog}-x2.jpg`),
			lg: require(`assets/images/${images.blog}-x3.jpg`),
		},
	},
	{
		name: "Rick and Morty",
		description: (
			<p>
				I made this project fetching data from the{" "}
				<a target="_blank" rel="noopener noreferrer" href="https://rickandmortyapi.com/">
					Rick and Morty API
				</a>
				, with react and an typescript, using the best practices and optimization techniques.
			</p>
		),
		link: "https://rickandmorty.brandonargel.me/",
		github: "https://github.com/BrandonArgel/rick-and-morty",
		images: {
			sm: require(`assets/images/${images.rick}.jpg`),
			md: require(`assets/images/${images.rick}-x2.jpg`),
			lg: require(`assets/images/${images.rick}-x3.jpg`),
		},
	},
	{
		name: "Platzi Badges",
		description: (
			<p>
				This is a project where I started learning about react, I made also a REST API to make,
				modify, and delete the badges, you can also register your own badge!
			</p>
		),
		link: "https://brandonargel.github.io/platzi-badges/",
		github: "https://github.com/BrandonArgel/platzi-badges",
		images: {
			sm: require(`assets/images/${images.badges}.jpg`),
			md: require(`assets/images/${images.badges}-x2.jpg`),
			lg: require(`assets/images/${images.badges}-x3.jpg`),
		},
	},
	{
		name: "Music Player",
		description: (
			<p>
				Vanilla JavaScript music player, this is one of my very first projects using JavaScript.
			</p>
		),
		link: "https://brandonargel.github.io/music-player/",
		github: "https://github.com/BrandonArgel/music-player",
		images: {
			sm: require(`assets/images/${images.music}.jpg`),
			md: require(`assets/images/${images.music}-x2.jpg`),
			lg: require(`assets/images/${images.music}-x3.jpg`),
		},
	},
	{
		name: "Simon Says",
		description: (
			<p>
				Game Simon Says, with Vanilla JavaScript. Can you pass all 15 levels? Challenge your memory!
			</p>
		),
		link: "https://brandonargel.github.io/simon-says/",
		github: "https://github.com/BrandonArgel/simon-says",
		images: {
			sm: require(`assets/images/${images.simon}.jpg`),
			md: require(`assets/images/${images.simon}-x2.jpg`),
			lg: require(`assets/images/${images.simon}-x3.jpg`),
		},
	},
	// {
	// 	name: "Mathematics",
	// 	description: (
	// 		<p>
	// 			Also I like a lot Maths, and I want to create a website where anyone can learn about it
	// 			(Site in spanish). At the moment the only activebranch is the calculator.  <span>Developing...</span>
	// 		</p>
	// 	),
	// 	link: "https://matematicas.brandonargel.me",
	// 	github: "https://github.com/BrandonArgel/matematicas",
	// 	images: {
	// 		sm: "",
	// 		md: "",
	// 		lg: "",
	// 	}
	// },
];

/**
 * Other projects:
 * - Flowskip
 * - Rock,Pape,Scissors game
 * - Platzi Video
 * - Batatabit
 * - Professional Form
 * - Animated Pumpkin
 * - Alcaldía La Paz Bolivia
 */

export const Social = [
	{
		link: "https://github.com/BrandonArgel",
		icon: <GitHub />,
		title: "GitHub de Brandon Argel",
	},
	{
		link: "https://platzi.com/p/BrandArgel/",
		icon: <Platzi />,
		title: "Perfil de Platzi de Brandon Argel",
	},
	{
		link: "https://www.linkedin.com/in/brandargel/",
		icon: <Linkedin />,
		title: "Linkedin de Brandon Argel",
	},
	{
		link: "https://www.instagram.com/brandargel/",
		icon: <Instagram />,
		title: "Instagram de Brandon Argel",
	},
	{
		link: "https://twitter.com/BrandArgel",
		icon: <Twitter />,
		title: "Twitter de Brandon Argel",
	},
];
