import { Spinner } from "assets/icons";

import styles from "./index.module.scss";

const InlineLoader = () => {
	return (
		<div className={styles.loader}>
			<Spinner />
		</div>
	);
};

export default InlineLoader;
