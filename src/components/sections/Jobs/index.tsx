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
					Works.map(({ company, company_url, position, start_date, end_date, description }, i) => (
						<div
							key={i}
							className={`${styles.tabs__pannel_item} ${
								activeTab === i ? styles.tabs__pannel_item_active : ""
							}`}
						>
							<h3>
								<span>{position}</span> in{" "}
								<a href={company_url} target="_blank" rel="noopener noreferrer">
									{company}
								</a>
							</h3>
							<p>
								{start_date} - {end_date}
							</p>
							<ul>
								{description.map((item, i) => (
									<li key={i}>{item}</li>
								))}
							</ul>
						</div>
					))}
			</div>
		</section>
	);
};

export default Jobs;
