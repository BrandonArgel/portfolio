import * as React from "react";

import { Button } from "components";

import styles from "./index.module.scss";

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
	React.useEffect(() => {
		new TextoAnimado("name", "hero");
	});

	return (
		<section className={styles.hero} id="hero">
			<div className={styles.hero__container}>
				<h1 className={styles.hero__title}>Hi! My name is</h1>
				<div className={styles.hero__presentation}>
					<p id="name" className={styles.hero__presentation_animated}>
						Brandon Argel
					</p>
					<p className={styles.hero__presentation_do}>And I build websites</p>
				</div>
				<p className={styles.hero__presentation_info}>
					I am a <span> Front-End Developer </span>, student of Platzi and part of Platzi
					Master, I really enjoy learning new things every day and creating for the web.
				</p>
			</div>
			<div className={styles.hero__buttons}>
				<Button size="medium">Resume</Button>
				<Button size="medium">Contact</Button>
			</div>
		</section>
	);
};

export default Hero;
