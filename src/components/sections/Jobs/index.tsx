import * as React from "react";
import { LanguageContext } from "@context";
import { useShowIn } from "@hooks";
import styles from "./Jobs.module.scss";

const Jobs = () => {
	const {
		texts: { experience },
	} = React.useContext(LanguageContext);
	const sectionRef = React.useRef<HTMLDivElement>(null);
	const [activeTab, setActiveTab] = React.useState(0);

	React.useEffect(() => {
		if (sectionRef.current) {
			useShowIn(sectionRef);
		}
	}, []);

	return (
		<section className={styles.tabs} id={experience.id} ref={sectionRef}>
			<h2>{experience.title}</h2>
			<div className={styles.tabs__list}>
				{experience.jobs.map(({ company }: { company: string }, i: number) => (
					<button
						key={i}
						className={`${styles.tabs__list_item} ${
							activeTab === i ? styles.tabs__list_item_active : ""
						}`}
						onClick={() => setActiveTab(i)}
					>
						{company}
					</button>
				))}
			</div>
			<div className={styles.tabs__pannel}>
				{experience.jobs.map(({ positions }: { positions: string[] }, i: number) => (
					<div
						key={i}
						className={`${styles.tabs__pannel_item} ${
							activeTab === i ? styles.tabs__pannel_item_active : ""
						}`}
					>
						<ul className={`${styles.tab} ${positions.length > 1 ? styles.tab__line : ""}`}>
							{positions.map(
								({ title, description, bullets, start_date, end_date, skills }: any, j: number) => (
									<li key={j} className={styles.tab__item}>
										<h3 className={styles.tab__title}>{title}</h3>
										<p className={styles.tab__date}>
											{start_date} - {end_date}
										</p>
										<p className={styles.tab__description}>{description}</p>
										<ul className={styles.tab__bullets}>
											{bullets.map((item: string, k: number) => (
												<li key={k} className={styles.tab__bullets_item}>
													{item}
												</li>
											))}
										</ul>
										<ul className={styles.tab__skills}>
											{skills.map((item: string, k: number) => (
												<li key={k} className={styles.tab__skills_item}>
													{item}
												</li>
											))}
										</ul>
									</li>
								)
							)}
						</ul>
					</div>
				))}
			</div>
		</section>
	);
};

export { Jobs };
