import * as React from "react";
import { LanguageContext } from "@context";
import { useShowIn } from "@hooks";
import styles from "./Education.module.scss";

const Education = () => {
	const {
		texts: { education },
	} = React.useContext(LanguageContext);
	const sectionRef = React.useRef<HTMLDivElement>(null);
	const [activeTab, setActiveTab] = React.useState(0);

	React.useEffect(() => {
		if (sectionRef.current) {
			useShowIn(sectionRef);
		}
	}, []);

	return (
		<section className={styles.tabs} id={education.id} ref={sectionRef}>
			<h2>{education.title}</h2>
			<div className={styles.tabs__list}>
				{education.schools.map(({ name }: { name: string }, i: number) => (
					<button
						key={i}
						className={`${styles.tabs__list_item} ${
							activeTab === i ? styles.tabs__list_item_active : ""
						}`}
						onClick={() => setActiveTab(i)}
					>
						{name}
					</button>
				))}
			</div>
			<div className={styles.tabs__pannel}>
				{education.schools.map(({ career }: { career: string[] }, i: number) => (
					<div
						key={i}
						className={`${styles.tabs__pannel_item} ${
							activeTab === i ? styles.tabs__pannel_item_active : ""
						}`}
					>
						<ul className={styles.tab}>
							{career.map(({ title, description, start_date, end_date }: any, j: number) => (
								<li key={j} className={styles.tab__item}>
									<h3 className={styles.tab__title}>{title}</h3>
									<p className={styles.tab__date}>
										{start_date} - {end_date}
									</p>
									<ul className={styles.tab__description}>
										{description.map((item: string, k: number) => (
											<li key={k} className={styles.tab__description_item}>
												{item}
											</li>
										))}
									</ul>
								</li>
							))}
						</ul>
					</div>
				))}
			</div>
		</section>
	);
};

export { Education };
