import * as React from "react";
import { Works } from "config";
import styles from "./index.module.scss";

const Jobs = () => {
	const [activeTab, setActiveTab] = React.useState(0);

	return (
		<section className={styles.tabs} id="experience">
			<h2>Where I've worked</h2>
			<div className={styles.tabs__list}>
				{Works &&
					Works.map(({ company }, i) => (
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
				{Works &&
					Works.map(({ positions }, i) => (
						<div
							key={i}
							className={`${styles.tabs__pannel_item} ${
								activeTab === i ? styles.tabs__pannel_item_active : ""
							}`}
						>
							<ul className={`${styles.tab} ${positions.length > 1 ? styles.tab__line : ""}`}>
								{positions.map(({ title, description, start_date, end_date, skills }, j) => (
									<li key={j} className={styles.tab__item}>
										<h3 className={styles.tab__title}>{title}</h3>
										<p className={styles.tab__date}>
											{start_date} - {end_date}
										</p>
										<ul className={styles.tab__description}>
											{description.map((item, k) => (
												<li key={k} className={styles.tab__description_item}>
													{item}
												</li>
											))}
										</ul>
										<ul className={styles.tab__skills}>
											{skills.map((item, k) => (
												<li key={k} className={styles.tab__skills_item}>
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

export default Jobs;
