import { Spinner } from "@assets/icons";

import styles from "./Loader.module.scss";

const Loader = () => {
	return (
		<div className={styles.loader}>
			<Spinner />
		</div>
	);
};

export { Loader };
