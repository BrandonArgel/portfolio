import Me from "assets/images/me.jpg";
import Me2x from "assets/images/me-x2.jpg";
import styles from "./index.module.scss";

const About = () => {
	const getAge = (birthday: string) => {
		const today = new Date();
		const birthDate = new Date(birthday);
		let age = today.getFullYear() - birthDate.getFullYear();
		const m = today.getMonth() - birthDate.getMonth();
		console.log({ today, birthDate });
		if (m < 0 || (m === 0 && today.getDay() < birthDate.getDay())) {
			age--;
		}
		return age;
	};

	return (
		<section className={styles.about} id="about">
			<div className={styles.about__content}>
				<h2>About me</h2>
				<p>Hi there! I'm Brandon Argel and I'm {getAge("2002-06-27")} years old.</p>
				<p>
					Shortly before graduating from Jorge Matute Remus Polytechnic Computer Engineering, I
					began my studies at Platzi and I decided to adopt their motto:
				</p>
				<blockquote>Never stop learning</blockquote>
				<p>
					Since then I've focused on learning everything about web development, and I've had the
					privilege of working with amazing people and companies.
				</p>
				<p>
					My main focus is building accessible, performant and awesome websites. I'm always looking
					for new challenges.
				</p>
				<p>Here are some technologies and tools that I have been working with:</p>
				<ul>
					<li>HTML</li>
					<li>CSS & (SCSS)</li>
					<li>JavaScript</li>
					<li>Typescript</li>
					<li>React</li>
					<li>Git & GitHub</li>
					<li>Figma</li>
				</ul>
			</div>
			<img
				className={styles.about__image}
				src={Me}
				alt="Brandon Argel"
				width={400}
				height={400}
				srcSet={`${Me2x} 2x`}
				loading="lazy"
			/>
		</section>
	);
};

export default About;
