import * as React from "react";
import { LanguageContext } from "@context";
import { useShowIn } from "@hooks";
import Me from "@assets/images/me.jpg";
import Me2x from "@assets/images/me-x2.jpg";
import styles from "./About.module.scss";

const About = () => {
	const {
		texts: { about },
	} = React.useContext(LanguageContext);
	const sectionRef = React.useRef<HTMLDivElement>(null);
	const getAge = (birthday: string) => {
		const today = new Date();
		const birthDate = new Date(birthday);
		let age = today.getFullYear() - birthDate.getFullYear();
		const m = today.getMonth() - birthDate.getMonth();

		if (m < 0 || (m === 0 && today.getDay() < birthDate.getDay())) {
			age--;
		}
		return age;
	};

	React.useEffect(() => {
		if (sectionRef.current) {
			useShowIn(sectionRef);
		}
	}, []);

	return (
		<section className={styles.about} id={about.id} ref={sectionRef}>
			<div className={styles.about__content}>
				<h2>{about.title}</h2>
				<p>
					{about.description.firstPart} {getAge("2002-06-27")} {about.description.secondPart}
				</p>
				<p>{about.studies}</p>
				<blockquote>{about.motto}</blockquote>
				<p>{about.focus.past}</p>
				<p>{about.focus.main}</p>
				<p>{about.technologies.title}</p>
				<ul>
					{about.technologies.list.map((technology: string) => (
						<li key={technology}>{technology}</li>
					))}
				</ul>
			</div>
			<img
				className={styles.about__image}
				src={Me}
				alt={about.name}
				width={400}
				height={400}
				srcSet={`${Me2x} 2x`}
				loading="lazy"
			/>
		</section>
	);
};

export { About };
