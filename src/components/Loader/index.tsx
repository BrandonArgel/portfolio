import { Spinner } from "assets/icons";

import styles from "./index.module.scss";

const Loader = () => {
	return (
		<div className={styles.loader}>
			<Spinner />
		</div>
	);
};

export default Loader;
