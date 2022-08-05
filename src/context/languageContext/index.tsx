import { createContext, useState } from "react";
import { useLocalStorage } from "@hooks";
// import translationsRaw from "translations.json";
// const translations = JSON.parse(JSON.stringify(translationsRaw));
const initialLanguage = "english";
const translations = {
	english: {
		header: {
			logo: "Home",
			nav: [
				{
					name: "About me",
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
					name: "Contact me",
					url: "contact",
				},
			],
			select: {
				title: "Select a language",
				options: [
					{
						name: "English 🇺🇸",
						language: "english",
					},
					{
						name: "Spanish 🇪🇸",
						language: "spanish",
					},
					{
						name: "French 🇫🇷",
						language: "french",
					},
				],
			},
			menu: {
				open: "Open Menu",
				close: "Close Menu",
			},
		},
		hero: {
			title: "Hi! My name is",
			presentation: {
				animated: "Brandon Argel",
				do: "And I build websites",
			},
			info: {
				firstPart: "I am a",
				profession: "Front-End Developer",
				secondPart:
					", student of Platzi and part of Platzi Master, I really enjoy learning new things every day and creating for the web.",
			},
			buttons: {
				resume: "Resume",
				contact: "Contact",
			},
		},
		about: {
			title: "About me",
			description: {
				firstPart: "Hi there! I'm Brandon Argel Verdeja Domínguez, and I'm",
				secondPart: "years old.",
			},
			studies:
				"Shortly before graduating from Jorge Matute Remus Polytechnic Computer Engineering, I	began my studies at Platzi and I decided to adopt their motto:",
			motto: "Never stop learning",
			focus: {
				past: "Since then I've focused on learning everything about web development, and I've had the privilege of working with amazing people and companies.",
				main: "My main focus is building accessible, performant and awesome websites. I'm always looking for new challenges.",
			},
			technologies: {
				title: "Here are some technologies and tools that I have been working with:",
				list: [
					"HTML",
					"CSS & (SCSS)",
					"JavaScript",
					"Typescript",
					"React",
					"Git & Github",
					"Figma",
				],
			},
			name: "Brandon Argel",
		},
		experience: {
			title: "Where I've worked",
			jobs: [
				{
					company: "PLatzi",
					company_url: "https://platzi.com",
					positions: [
						{
							title: "Associate Learning",
							start_date: "July 2022",
							end_date: "Present",
							description: [
								"Quality Assurance for the new courses",
								"Supporting students of Platzi",
								"Resolving bugs and issues on the platform",
								"Testing new features on the platform",
							],
							skills: [
								"Quality Assurance",
								"Assertive Communication",
								"Give/Receive Feedback",
								"Attention to Detail",
							],
						},
						{
							title: "Associate SEO",
							start_date: "May 2022",
							end_date: "July 2022",
							description: [
								"Content creation in classes",
								"Continuous improvement of content",
								"Keyword research",
								"Position monitoring",
							],
							skills: ["Content writing", "Writing review", "Constructive feedback", "Notion"],
						},
					],
				},
				{
					company: "Consultora Blockchain",
					company_url: "https://blockchainconsultora.com/es",
					positions: [
						{
							title: "Web Developer",
							start_date: "September 2021",
							end_date: "February 2022",
							description: [
								"Developing a web application for the mayor's office in La Paz, Bolivia.",
								"Using technologies such as JavaScript, SCSS, storybook, and some JS libraries, such as React, Next.js, in addition to using Redux-Saga, among others.",
							],
							skills: ["JavaScript", "SCSS", "React", "Next.js", "Redux-Saga"],
						},
					],
				},
				{
					company: "Axo Systems",
					company_url:
						"https://mx.linkedin.com/company/axosystems?trk=public_profile_topcard-current-company",
					positions: [
						{
							title: "Front-End Developer",
							start_date: "January 2021",
							end_date: "September 2021",
							description: [
								"Developed and maintained code for in-house and client websites using HTML, CSS, Sass, JavaScript, React, Firebase, Wordpress, and more.",
								"Manually tested sites in various browsers and mobile devices to ensure cross-browser compatibility and responsiveness.",
								"Clients included CNI Consultores, Solar Center, and more.",
							],
							skills: ["HTML", "CSS", "Sass", "JavaScript", "React", "Firebase", "Wordpress"],
						},
					],
				},
			],
		},
		projects: {
			title: "Projects",
			list: [
				{
					name: "Movies App",
					description:
						"I developed this project with the API Rest consumption course trilogy at Platzi, and using TMDB API.",
					link: "https://movies-platzi-app.netlify.app/",
					github: "https://github.com/BrandonArgel/movie-app",
					image: "moviesApp",
				},
				{
					name: "Rick and Morty",
					description:
						"I made this project fetching data from the Rick and Morty API, with react and an typescript, using the best practices and optimization techniques.",
					link: "https://rickandmorty.brandonargel.me/",
					github: "https://github.com/BrandonArgel/rick-and-morty",
					image: "rickAndMorty",
				},
				{
					name: "ToDo App",
					description:
						"This is a project that looks pretty simple, but it has a lot of features, such as: dark/light mode, use of local storage, a search bar, drag and drop, and it was developed with	react sass and typescript.",
					link: "https://brandonargel.github.io/todo-app/",
					github: "https://github.com/BrandonArgel/todo-app/",
					image: "todoApp",
				},
				{
					name: "Platzi Badges",
					description:
						"This is a project where I started learning about react, I made also a REST API to make, modify, and delete the badges, you can also register your own badge!",
					link: "https://brandonargel.github.io/platzi-badges/",
					github: "https://github.com/BrandonArgel/platzi-badges",
					image: "platziBadges",
				},
				{
					name: "Music Player",
					description:
						"Vanilla JavaScript music player, this is one of my very first projects using JavaScript.",
					link: "https://brandonargel.github.io/music-player/",
					github: "https://github.com/BrandonArgel/music-player",
					image: "musicPlayer",
				},
				{
					name: "Simon Says",
					description:
						"Game Simon Says, with Vanilla JavaScript. Can you pass all 15 levels? Challenge your memory!",
					link: "https://brandonargel.github.io/simon-says/",
					github: "https://github.com/BrandonArgel/simon-says",
					image: "simonSays",
				},
			],
		},
		contact: {
			title: "Contact",
			description: {
				current: "Currently I'm not looking for new opportunities, but my inbox is always open.",
				invite:
					"If you have any questions about my services, or just want to say hello, feel free to contact me.",
			},
			form: {
				legend: "Lets talk!",
				name: "Name",
				email: "Email",
				message: "Message",
				button: {
					send: "Send",
					sending: "Sending...",
				},
			},
			messages: {
				alreadySent: "You have already sent a message",
				success: "I'll check your message as soon as possible.",
			},
			errors: {
				name: {
					required: "You need to enter a name",
					validation: "The name can only have up to 50, letters and spaces",
				},
				email: {
					required: "You need to enter an email",
					validation: "The email is not valid",
				},
				message: {
					required: "You need to enter a message",
					validation: "The message can only have up to 500 characters",
				},
				error: "Something went wrong, please try again",
			},
		},
		footer: [
			{
				title: "Brandon Argel's GitHub",
				link: "https://github.com/BrandonArgel",
				image: "github",
			},
			{
				title: "Brandon Argel's Platzi Profile",
				link: "https://platzi.com/p/BrandArgel",
				image: "platzi",
			},
			{
				title: "Brandon Argel's Linkedin",
				link: "https://www.linkedin.com/in/brandargel/",
				image: "linkedin",
			},
			{
				title: "Brandon Argel's Instagram",
				link: "https://www.instagram.com/brandargel/",
				image: "instagram",
			},
			{
				title: "Brandon Argel's Twitter",
				link: "https://twitter.com/BrandArgel",
				image: "twitter",
			},
		],
	},
	spanish: {
		header: {
			logo: "Inicio",
			nav: [
				{
					name: "Sobre mí",
					url: "sobre-mi",
				},
				{
					name: "Experiencia",
					url: "experiencia",
				},
				{
					name: "Proyectos",
					url: "proyectos",
				},
				{
					name: "Contáctame",
					url: "contacto",
				},
			],
			select: {
				title: "Selecciona un idioma",
				options: [
					{
						name: "Inglés 🇺🇸",
						language: "english",
					},
					{
						name: "Español 🇪🇸",
						language: "spanish",
					},
					{
						name: "Francés 🇫🇷",
						language: "french",
					},
				],
			},
			menu: {
				open: "Abrir menú",
				close: "Cerrar menú",
			},
		},
		hero: {
			title: "¡Hola! Mi nombre es",
			presentation: {
				animated: "Brandon Argel",
				do: "Y construyo sitios web",
			},
			info: {
				firstPart: "Soy un",
				profession: "Desarrollador Front-End",
				secondPart:
					", estudiante de Platzi y parte de Platzi Master, me gusta aprender cosas nuevas cada día y crear para la web.",
			},
			buttons: {
				resume: "Currículum",
				contact: "Contacto",
			},
		},
		about: {
			title: "Sobre mí",
			description: {
				firstPart: "Hola! Mi nombre es Brandon Argel Verdeja Domínguez, y tengo",
				secondPart: "años.",
			},
			studies:
				"Poco antes de graduarme de la Escuela Politécnica Ing. Jorge Matute Remus, comencé mis estudios en Platzi y decidí adoptar su lema:",
			motto: "Nunca pares de aprender",
			focus: {
				past: "Desde entonces me he centrado en aprender todo sobre desarrollo web, y he tenido el privilegio de trabajar con gente increíble y empresas increíbles.",
				main: "Ahora, mi enfoque principal es construir sitios web accesibles, rápidos y geniales. Siempre estoy buscando nuevos desafíos.",
			},
			technologies: {
				title: "Aquí están algunas tecnologías y herramientas con las que he estado trabajando:",
				list: [
					"HTML",
					"CSS & (SCSS)",
					"JavaScript",
					"Typescript",
					"React",
					"Git & Github",
					"Figma",
				],
			},
			name: "Brandon Argel",
		},
		experience: {
			title: "En dónde he tradajado",
			jobs: [
				{
					company: "PLatzi",
					company_url: "https://platzi.com",
					positions: [
						{
							title: "Asociado en el equipo de aprendizaje",
							start_date: "Julio 2022",
							end_date: "Actualidad",
							description: [
								"Control de calidad para los nuevos cursos",
								"Ayudando a estudiantes de Platzi",
								"Resolver errores y problemas en la plataforma",
								"Probando nuevas características de la plataforma",
							],
							skills: [
								"Control de calidad",
								"Comunicación asertiva",
								"Dar/Recibir feedback",
								"Atención al detalle",
							],
						},
						{
							title: "Asociado en el equipo de SEO",
							start_date: "Mayo 2022",
							end_date: "Julio 2022",
							description: [
								"Creación de contenido para las clases",
								"Mejora continua del contenido",
								"Búsqueda de palabras clave",
								"Monitoreo de posicionamiento",
							],
							skills: [
								"Creación de contenido",
								"Revisión de contenido",
								"Feedback constructivo",
								"Notion",
							],
						},
					],
				},
				{
					company: "Consultora Blockchain",
					company_url: "https://blockchainconsultora.com/es",
					positions: [
						{
							title: "Desarrollador web",
							start_date: "Septiembre 2021",
							end_date: "Febrero 2022",
							description: [
								"Desarrollo de una aplicación web para la alcaldía de La Paz, Bolivia.",
								"Utilizando tecnologías como JavaScript, SCSS, storybook y algunas bibliotecas JS, como React, Next.js, además de utilizar Redux-Saga, entre otras.",
							],
							skills: ["JavaScript", "SCSS", "React", "Next.js", "Redux-Saga"],
						},
					],
				},
				{
					company: "Axo Systems",
					company_url:
						"https://mx.linkedin.com/company/axosystems?trk=public_profile_topcard-current-company",
					positions: [
						{
							title: "Desarrollador Front-End",
							start_date: "Enero 2021",
							end_date: "Septiembre 2021",
							description: [
								"Desarrollo y mantenimiento de código para sitios web internos y de clientes, usando HTML, CSS, Sass, JavaScript, React, Firebase, Wordpress y más.",
								"Sitios probados manualmente en varios navegadores y dispositivos móviles para garantizar la compatibilidad y capacidad de respuesta entre navegadores.",
								"Clientes incluidos: CNI Consultores, Solar Center, entre otros.",
							],
							skills: ["HTML", "CSS", "Sass", "JavaScript", "React", "Firebase", "Wordpress"],
						},
					],
				},
			],
		},
		projects: {
			title: "Proyectos",
			list: [
				{
					name: "Movies App",
					description:
						"Desarrollé este proyecto con la trilogía de cursos de consumo de API Rest en Platzi, y usando TMDB api.",
					link: "https://movies-platzi-app.netlify.app/",
					github: "https://github.com/BrandonArgel/movie-app",
					image: "moviesApp",
				},
				{
					name: "Rick and Morty",
					description:
						"Este proyecto lo realicé solicitando datos de la API de Rick and Morty, con react, typescript, y usando las mejores prácticas y técnicas de optimización.",
					link: "https://rickandmorty.brandonargel.me/",
					github: "https://github.com/BrandonArgel/rick-and-morty",
					image: "rickAndMorty",
				},
				{
					name: "ToDo App",
					description:
						"Este es un proyecto que parece bastante simple, pero tiene muchas características, como: modo oscuro/claro, uso de almacenamiento local, una barra de búsqueda, arrastrar y soltar, y fue desarrollado con React Sass y TypeScript.",
					link: "https://brandonargel.github.io/todo-app/",
					github: "https://github.com/BrandonArgel/todo-app/",
					image: "todoApp",
				},
				{
					name: "Platzi Badges",
					description:
						"Este es un proyecto en el que comencé a aprender sobre reaccionar, también hice una API REST para crear, modificar y eliminar las insignias, ¡también puedes registrar tu propia insignia!",
					link: "https://brandonargel.github.io/platzi-badges/",
					github: "https://github.com/BrandonArgel/platzi-badges",
					image: "platziBadges",
				},
				{
					name: "Music Player",
					description:
						"Reproductor de música con Vanilla JavaScript, este es uno de mis primeros proyectos usando JavaScript.",
					link: "https://brandonargel.github.io/music-player/",
					github: "https://github.com/BrandonArgel/music-player",
					image: "musicPlayer",
				},
				{
					name: "Simon Says",
					description:
						"Juego Simon Says, con Vanilla JavaScript. ¿Puedes pasar los 15 niveles? ¡Desafía tu memoria!",
					link: "https://brandonargel.github.io/simon-says/",
					github: "https://github.com/BrandonArgel/simon-says",
					image: "simonSays",
				},
			],
		},
		contact: {
			title: "Contacto",
			description: {
				current:
					"Actualmente no estoy buscando nuevas oportunidades, pero mi bandeja de entrada siempre está abierta.",
				invite:
					"Si tienes alguna pregunta sobre mis servicios, o simplemente quieres saludarme, no dudes en contactarme.",
			},
			form: {
				legend: "¡Hablemos!",
				name: "Nombre",
				email: "Correo electrónico",
				message: "Mensaje",
				button: {
					send: "Enviar",
					sending: "Enviando...",
				},
			},
			messages: {
				alreadySent: "Ya has enviado un mensaje",
				success: "Revisaré tu mensaje lo antes posible.",
			},
			errors: {
				name: {
					required: "Necesitas ingresar un nombre",
					validation: "El nombre solo puede tener hasta 50, letras y espacios",
				},
				email: {
					required: "Necesitas ingresar tu correo electrónico",
					validation: "El correo electrónico no es válido",
				},
				message: {
					required: "Necesitas ingresar un mensaje",
					validation: "El mensaje no puede tener más de 500 caracteres",
				},
				error: "Ha ocurrido un error, por favor intenta de nuevo",
			},
		},
		footer: [
			{
				title: "GitHub de Brandon Argel",
				link: "https://github.com/BrandonArgel",
				image: "github",
			},
			{
				title: "Perfil de Platzi de Brandon Argel",
				link: "https://platzi.com/p/BrandArgel",
				image: "platzi",
			},
			{
				title: "Linkedin de Brandon Argel",
				link: "https://www.linkedin.com/in/brandargel/",
				image: "linkedin",
			},
			{
				title: "Instagram de Brandon Argel",
				link: "https://www.instagram.com/brandargel/",
				image: "instagram",
			},
			{
				title: "Twitter de Brandon Argel",
				link: "https://twitter.com/BrandArgel",
				image: "twitter",
			},
		],
	},
	french: {
		header: {
			logo: "Accueil",
			nav: [
				{
					name: "À propos de moi",
					url: "a-propos-de-moi",
				},
				{
					name: "Expérience",
					url: "experience",
				},
				{
					name: "Projets",
					url: "projets",
				},
				{
					name: "Contactez-moi",
					url: "contact",
				},
			],
			select: {
				title: "Sélectionnez une langue",
				options: [
					{
						name: "Anglais 🇺🇸",
						language: "english",
					},
					{
						name: "Espagnol 🇪🇸",
						language: "spanish",
					},
					{
						name: "Français 🇫🇷",
						language: "french",
					},
				],
			},
			menu: {
				open: "Ouvrir le menu",
				close: "Fermer le menu",
			},
		},
		hero: {
			title: "Bonjour! Je m'appelle",
			presentation: {
				animated: "Brandon Argel",
				do: "Et je construis des sites web",
			},
			info: {
				firstPart: "Je suis un",
				profession: "Développeur Front-End",
				secondPart:
					", étudiant de Platzi et part de Platzi Master, j'aime apprendre de nouvelles choses chaque jour et créer pour le web.",
			},
			buttons: {
				resume: "Résumé",
				contact: "Contact",
			},
		},
		about: {
			title: "À propos de moi",
			description: {
				firstPart: "Bonjour! Je m'appelle Brandon Argel Verdeja Domínguez, et j'ai",
				secondPart: "ans.",
			},
			studies:
				"Peu de temps avant d'être diplômé de l'école polytechnique Ing. Jorge Matute Remus, j'ai commencé mes études à Platzi et j'ai décidé d'adopter sa devise:",
			motto: "N'arrête jamais d'apprendre",
			focus: {
				past: "Depuis lors, je me suis concentré sur l'apprentissage du développement Web et j'ai eu le privilège de travailler avec des gens incroyables et des entreprises incroyables.",
				main: "Maintenant, mon enfoque principal est de créer des sites web accessibles, rapides et géniales. Je cherche toujours de nouveaux défis.",
			},
			technologies: {
				title: "Voici quelques technologies et outils avec lesquels j'ai travaillé :",
				list: [
					"HTML",
					"CSS & (SCSS)",
					"JavaScript",
					"Typescript",
					"React",
					"Git & Github",
					"Figma",
				],
			},
			name: "Brandon Argel",
		},
		experience: {
			title: "Où j'ai travaillé",
			jobs: [
				{
					company: "PLatzi",
					company_url: "https://platzi.com",
					positions: [
						{
							title: "Associé dans l'équipe d'apprentissage",
							start_date: "Juillet 2022",
							end_date: "Cadeau",
							description: [
								"Assurance qualité pour les nouveaux cours",
								"Aider les étudiants de Platzi",
								"Résoudre les bugs et les problèmes sur la plateforme",
								"Tester de nouvelles fonctionnalités",
							],
							skills: [
								"Assurance qualité",
								"Communication assertive",
								"Donner/Recevoir des commentaires",
								"Attention au détail",
							],
						},
						{
							title: "Collaborateur dans l'équipe SEO",
							start_date: "Peut 2022",
							end_date: "Juillet 2022",
							description: [
								"Création de contenu dans les classes",
								"Amélioration continue du contenu",
								"Recherche de mots-clés",
								"Surveillance de position",
							],
							skills: [
								"Rédaction de contenu",
								"Revue d'écriture",
								"Commentaires constructifs",
								"Notion",
							],
						},
					],
				},
				{
					company: "Consultora Blockchain",
					company_url: "https://blockchainconsultora.com/es",
					positions: [
						{
							title: "Développeur web",
							start_date: "Septembre 2021",
							end_date: "Février 2022",
							description: [
								"Développement d'une application web pour la mairie de La Paz, Bolivie.",
								"Utilisation de technologies telles que JavaScript, SCSS, storybook et certaines bibliothèques JS, telles que React, Next.js, en plus d'utiliser Redux-Saga, entre autres.",
							],
							skills: ["JavaScript", "SCSS", "React", "Next.js", "Redux-Saga"],
						},
					],
				},
				{
					company: "Axo Systems",
					company_url:
						"https://mx.linkedin.com/company/axosystems?trk=public_profile_topcard-current-company",
					positions: [
						{
							title: "Développeur Front-End",
							start_date: "Janvier 2021",
							end_date: "Septembre 2021",
							description: [
								"Développé et maintenu du code pour les sites Web internes et clients en utilisant HTML, CSS, Sass, JavaScript, React, Firebase, Wordpress, etc.",
								"Sites testés manuellement dans divers navigateurs et appareils mobiles pour garantir la compatibilité et la réactivité entre navigateurs.",
								"Les clients comprenaient CNI Consultores, Solar Center, etc.",
							],
							skills: ["HTML", "CSS", "Sass", "JavaScript", "React", "Firebase", "Wordpress"],
						},
					],
				},
			],
		},
		projects: {
			title: "Projets",
			list: [
				{
					name: "Movies App",
					description:
						"J'ai développé ce projet avec la trilogie de cours de consommation Rest API à Platzi, et en utilisant l'api TMDB.",
					link: "https://movies-platzi-app.netlify.app/",
					github: "https://github.com/BrandonArgel/movie-app",
					image: "moviesApp",
				},
				{
					name: "Rick and Morty",
					description:
						"J'ai réalisé ce projet en demandant des données à l'API Rick et Morty, avec réaction, tapuscrit et en utilisant les meilleures pratiques et techniques d'optimisation.",
					link: "https://rickandmorty.brandonargel.me/",
					github: "https://github.com/BrandonArgel/rick-and-morty",
					image: "rickAndMorty",
				},
				{
					name: "ToDo App",
					description:
						"C'est un projet qui semble assez simple, mais il a beaucoup de fonctionnalités, comme : le mode sombre/clair, l'utilisation du stockage local, une barre de recherche, le glisser-déposer, et il a été développé avec React Sass et TypeScript.",
					link: "https://brandonargel.github.io/todo-app/",
					github: "https://github.com/BrandonArgel/todo-app/",
					image: "todoApp",
				},
				{
					name: "Platzi Badges",
					description:
						"C'est un projet où j'ai commencé à apprendre à réagir, j'ai aussi fait une API REST pour créer, modifier et supprimer les badges, vous pouvez aussi enregistrer votre propre badge!",
					link: "https://brandonargel.github.io/platzi-badges/",
					github: "https://github.com/BrandonArgel/platzi-badges",
					image: "platziBadges",
				},
				{
					name: "Music Player",
					description:
						"Lecteur de musique avec Vanilla JavaScript, c'est l'un de mes premiers projets utilisant JavaScript.",
					link: "https://brandonargel.github.io/music-player/",
					github: "https://github.com/BrandonArgel/music-player",
					image: "musicPlayer",
				},
				{
					name: "Simon Says",
					description:
						"Je joue à Simon Says, avec Vanilla JavaScript. Pouvez-vous passer tous les 15 niveaux? Défiez votre mémoire!",
					link: "https://brandonargel.github.io/simon-says/",
					github: "https://github.com/BrandonArgel/simon-says",
					image: "simonSays",
				},
			],
		},
		contact: {
			title: "Contact",
			description: {
				current:
					"Je ne suis pas actuellement à la recherche de nouvelles opportunités, mais ma boîte de réception est toujours ouverte.",
				invite:
					"Si vous avez des questions sur mes services, ou si vous voulez juste dire bonjour, n'hésitez pas à me contacter.",
			},
			form: {
				legend: "Parlons!",
				name: "Nom",
				email: "Email",
				message: "Message",
				button: {
					send: "Envoyer",
					sending: "Envoi en cours...",
				},
			},
			messages: {
				alreadySent: "Vous avez déjà envoyé un message",
				success: "Je vais examiner votre message dès que possible.",
			},
			errors: {
				name: {
					required: "Vous devez entrer un nom",
					validation: "Le nom ne peut contenir que 50 lettres et espaces",
				},
				email: {
					required: "Vous devez saisir votre email",
					validation: "L'email n'est pas valide",
				},
				message: {
					required: "Vous devez entrer un message",
					validation: "Le message ne peut pas dépasser 500 caractères",
				},
				error: "Une erreur s'est produite, veuillez réessayer",
			},
		},
		footer: [
			{
				title: "GitHub de Brandon Argel",
				link: "https://github.com/BrandonArgel",
				image: "github",
			},
			{
				title: "Profil de Brandon Alger Platzi",
				link: "https://platzi.com/p/BrandArgel",
				image: "platzi",
			},
			{
				title: "Linkedin de Brandon Argel",
				link: "https://www.linkedin.com/in/brandargel/",
				image: "linkedin",
			},
			{
				title: "Instagram de Brandon Argel",
				link: "https://www.instagram.com/brandargel/",
				image: "instagram",
			},
			{
				title: "Twitter de Brandon Argel",
				link: "https://twitter.com/BrandArgel",
				image: "twitter",
			},
		],
	},
};

export type Languages = "english" | "spanish" | "french";

type wildcardProps = {
	[key: string]: any;
};

interface LanguageContextProps {
	children: React.ReactNode;
}

const LanguageContext = createContext({
	texts: {} as wildcardProps,
	language: "",
	setLanguage: (lang: Languages) => {},
});

const LanguageProvider = ({ children }: LanguageContextProps) => {
	const [language, setLanguage] = useLocalStorage("language", initialLanguage);
	const [texts, setTexts] = useState(translations[language as keyof typeof translations]);

	const handleLanguage = (lang: Languages) => {
		setLanguage(lang);
		setTexts(translations[lang as keyof typeof translations]);
	};

	return (
		<LanguageContext.Provider
			value={{
				texts,
				language,
				setLanguage: handleLanguage,
			}}
		>
			{children}
		</LanguageContext.Provider>
	);
};

export { LanguageContext, LanguageProvider };
