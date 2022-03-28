import { Button } from "components";
import { CardProjects } from "config";
import styles from "./index.module.scss";

const Projects = () => {
	return (
		<section className={styles.projects} id="projects">
			<h2>Projects</h2>
			<p>
				Throughout my career as a Front-End, I have had the opportunity of working on incredible and
				challenging projects. Here are some projects that I would like to share.
			</p>
			<div className={styles.projects__container}>
				{CardProjects.map(({ name, description, link, github, images: { sm, md, lg } }) => (
					<div className={styles.projects__container_card} key={name}>
						<h3>{name}</h3>
						{description}
						<picture>
							<source media="(min-width: 867px)" srcSet={`${md}, ${lg} 2x`} />
							<source media="(min-width: 607px)" srcSet={`${sm}, ${md} 2x`} />
							<source media="(min-width: 372px)" srcSet={`${md}, ${lg} 2x`} />
							<img src={sm} alt={`Project ${name}`} width={300} height={188} loading="lazy" />
						</picture>
						<div className={styles.projects__container_links}>
							<Button size="small" href={link} target="_blank" rel="noopener noreferrer" link>
								Project
							</Button>
							<Button size="small" href={github} target="_blank" rel="noopener noreferrer" link>
								Github
							</Button>
						</div>
					</div>
				))}
			</div>
		</section>
	);
};

export default Projects;
