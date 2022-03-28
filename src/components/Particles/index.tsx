import Particles from "react-tsparticles";

const ParticlesBg = () => {
	return (
		<Particles
			id="tsparticles"
			options={{
				fpsLimit: 60,
				fullScreen: {
					enable: true,
					zIndex: -1,
				},
				interactivity: {
					events: {
						onHover: {
							enable: true,
							mode: "connect",
						},
						resize: true,
					},
				},
				particles: {
					color: {
						value: "#10eed2",
					},
					links: {
						color: "#10eed2",
						distance: 150,
						enable: true,
						opacity: 0.2,
						width: 2,
					},
					collisions: {
						enable: true,
					},
					move: {
						direction: "none",
						enable: true,
						outMode: "bounce",
						random: false,
						speed: 2,
					},
					number: {
						density: {
							enable: true,
							area: 1000,
						},
						limit: 200,
						value: 100,
					},
					opacity: {
						value: 0.5,
					},
					shape: {
						type: "circle",
					},
					size: {
						random: true,
						value: 3,
					},
				},
				pauseOnBlur: true,
				motion: {
					disable: true,
				},
				detectRetina: true,
			}}
		/>
	);
};

export default ParticlesBg;
