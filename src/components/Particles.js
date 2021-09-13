import React, { Fragment } from "react";
import ParticlesJS from "react-particles-js";

export default function Particles() {
	return (
		<Fragment>
			<ParticlesJS
				params={{
					particles: {
						number: {
							value: 50,
							density: {
								enable: true,
								value_area: 800,
							},
						},
						color: {
							value: "#16FFE2",
						},
						shape: {
							type: "circle",
							stroke: {
								width: 0,
								color: "#16FFE2",
							},
						},
						opacity: {
							value: 0.5,
							random: false,
							anim: {
								enable: true,
								speed: 0.5,
								opacity_min: 0.1,
								sync: false,
							},
						},
						size: {
							value: 3,
							random: true,
							anim: {
								enable: false,
								speed: 40,
								size_min: 0.1,
								sync: false,
							},
						},
						line_linked: {
							enable: true,
							distance: 150,
							color: "#16FFE2",
							opacity: 0.1,
							width: 2,
						},
						move: {
							enable: true,
							speed: 2,
							direction: "none",
							random: false,
							straight: false,
							out_mode: "out",
							bounce: false,
							attract: {
								enable: false,
								rotateX: 600,
								rotateY: 1200,
							},
						},
					},
					retina_detect: true,
				}}
			/>
		</Fragment>
	);
}
