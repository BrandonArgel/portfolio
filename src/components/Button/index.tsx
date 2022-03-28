import * as React from "react";
import styles from "./index.module.scss";

type size = "small" | "medium" | "large";
type type = "primary" | "secondary";

interface ButtonProps {
	active?: boolean;
	children: React.ReactNode;
	className?: string;
	disabled?: boolean;
	href?: string;
	link?: boolean;
	onClick?: () => void;
	rel?: string;
	size?: size;
	target?: string;
	type?: type;
}

const Button = (props: ButtonProps) => {
	const {
		active = false,
		children,
		className = "",
		disabled = false,
		link = false,
		size = "large",
		type = "primary",
		...rest
	} = props;

	return React.createElement(
		link ? "a" : "button",
		{
			...rest,
			className: `${styles[size]} ${styles[type]} ${active ? styles.active : ""} ${className}`,
			disabled,
		},
		children,
		type === "primary" && (
			<>
				<span></span>
				<span></span>
				<span></span>
				<span></span>
				<span></span>
				<span></span>
				<span></span>
				<span></span>
			</>
		)
	);
};

export default Button;
