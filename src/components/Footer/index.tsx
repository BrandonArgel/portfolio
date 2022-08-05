import * as React from "react";
import { LanguageContext } from "@context";
import { SocialIcons } from "@utils";
import styles from "./Footer.module.scss";

const Footer = () => {
	const {
		texts: { footer },
	} = React.useContext(LanguageContext);
	return (
		<footer className={styles.footer}>
			<div className={styles.footer__social}>
				{footer.map(({ link, image, title }: { link: string; image: string; title: string }) => (
					<a href={link} key={link} target="_blank" rel="noopener noreferrer" title={title}>
						{SocialIcons[image as keyof typeof SocialIcons]}
					</a>
				))}
			</div>
		</footer>
	);
};

export { Footer };
