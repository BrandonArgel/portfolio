import * as React from "react";
import { LanguageContext } from "@context";
import { Button } from "@components";
import styles from "./Hero.module.scss";

class TextoAnimado {
	text: HTMLElement | null;
	objective: HTMLElement | null;
	letters: string[];

	constructor(id: string, objective: string) {
		this.text = document.getElementById(id);
		this.objective = document.getElementById(objective);
		this.letters = this.text!.innerText.split("");

		this.text!.innerText = "";

		this.letters.forEach((letter) => {
			let char = letter === " " ? "&nbsp;" : letter;

			this.text!.innerHTML =
				this.text!.innerHTML +
				`
          <div>
              <span>${char}</span>
              <span class=${styles.secondLine}>${char}</span>
          </div>
        `;
		});

		this.objective!.addEventListener("mouseenter", () => {
			let count = 0;

			const interval = setInterval(() => {
				if (count < this.text!.children.length) {
					this.text!.children[count].classList.add(styles.animated);
					count += 1;
				} else {
					clearInterval(interval);
				}
			}, 20);
		});

		this.objective!.addEventListener("mouseleave", () => {
			let count = 0;

			const interval = setInterval(() => {
				if (count < this.text!.children.length) {
					this.text!.children[count].classList.remove(styles.animated);
					count += 1;
				} else {
					clearInterval(interval);
				}
			}, 20);
		});
	}
}

const Hero = () => {
	const {
		language,
		texts: { hero, contact },
	} = React.useContext(LanguageContext);
	React.useEffect(() => {
		new TextoAnimado("name", "hero");
	}, []);

	return (
		<section className={styles.hero} id="hero">
			<div className={styles.hero__container}>
				<span className={styles.hero__title}>{hero.title}</span>
				<div className={styles.hero__presentation}>
					<h1 id="name" className={styles.hero__presentation_animated}>
						{hero.presentation.animated}
					</h1>
					<p className={styles.hero__presentation_do}>{hero.presentation.do}</p>
				</div>
				<p className={styles.hero__presentation_info}>
					{hero.info.firstPart} <span> {hero.info.profession}</span>
					{hero.info.secondPart}
				</p>
				<p className={styles.hero__presentation_info}>{hero.info.secondParagraph}</p>
				<p className={styles.hero__presentation_info}>{hero.info.thirdParagraph}</p>
			</div>
			<div className={styles.hero__buttons}>
				<Button
					href={`/${hero.buttons.resume.link}-${language}.pdf`}
					link
					rel="noopener noreferrer"
					size="medium"
					target="_blank"
				>
					{hero.buttons.resume.text}
				</Button>
				<Button size="medium" href={`#${contact.id}`} link>
					{hero.buttons.contact}
				</Button>
			</div>
		</section>
	);
};

export { Hero };
