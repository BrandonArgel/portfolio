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
		texts: { hero },
	} = React.useContext(LanguageContext);
	React.useEffect(() => {
		new TextoAnimado("name", "hero");
	}, []);

	return (
		<section className={styles.hero} id="hero">
			<div className={styles.hero__container}>
				<h1 className={styles.hero__title}>{hero.title}</h1>
				<div className={styles.hero__presentation}>
					<p id="name" className={styles.hero__presentation_animated}>
						{hero.presentation.animated}
					</p>
					<p className={styles.hero__presentation_do}>{hero.presentation.do}</p>
				</div>
				<p className={styles.hero__presentation_info}>
					{hero.info.firstPart} <span> {hero.info.profession}</span>
					{hero.info.secondPart}
				</p>
			</div>
			<div className={styles.hero__buttons}>
				<Button
					href="https://firebasestorage.googleapis.com/v0/b/personal-project-brandon.appspot.com/o/pdf%2FFrontend_Brandon_Argel_Verdeja_Dom%C3%ADnguez_CV.pdf?alt=media&token=f5b9d82c-6d1b-4bd7-964a-164276ee0625"
					link
					rel="noopener noreferrer"
					size="medium"
					target="_blank"
				>
					{hero.buttons.resume}
				</Button>
				<Button size="medium" href="#contact" link>
					{hero.buttons.contact}
				</Button>
			</div>
		</section>
	);
};

export { Hero };
