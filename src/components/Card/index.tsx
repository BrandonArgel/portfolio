import * as React from "react";
import { useShowIn } from "@hooks";
import { Button } from "@components";
import { CardImages } from "@utils";
import styles from "./Card.module.scss";

interface CardProps {
	name: string;
	description: string;
	link?: string;
	github: string;
	image: string;
}

const Card = ({ name, description, link, github, image }: CardProps) => {
	const cardRef = React.useRef<HTMLDivElement>(null);

	React.useEffect(() => {
		if (cardRef.current) {
			useShowIn(cardRef);
		}
	}, []);
	return (
		<div className={`${styles.card} project`} key={name} ref={cardRef}>
			<h3>{name}</h3>
			<p>{description}</p>
			<picture>
				<source
					media="(min-width: 867px)"
					srcSet={`${CardImages[image as keyof typeof CardImages].sm}, ${
						CardImages[image as keyof typeof CardImages].md
					} 2x`}
				/>
				<source
					media="(min-width: 607px)"
					srcSet={`${CardImages[image as keyof typeof CardImages].sm}, ${
						CardImages[image as keyof typeof CardImages].md
					} 2x`}
				/>
				<source
					media="(min-width: 372px)"
					srcSet={`${CardImages[image as keyof typeof CardImages].sm}, ${
						CardImages[image as keyof typeof CardImages].md
					} 2x`}
				/>
				<img
					src={CardImages[image as keyof typeof CardImages].sm}
					alt={`Project ${name}`}
					width={300}
					height={188}
					loading="lazy"
				/>
			</picture>
			<div className={styles.card__links}>
				{link && (
					<Button size="small" href={link} target="_blank" rel="noopener noreferrer" link>
						Project
					</Button>
				)}
				<Button size="small" href={github} target="_blank" rel="noopener noreferrer" link>
					Github
				</Button>
			</div>
		</div>
	);
};

export { Card };
