import * as React from "react";
import styles from "./Button.module.scss";

type size = "small" | "medium" | "large";

interface ButtonProps {
	active?: boolean;
	children: React.ReactNode;
	className?: string;
	disabled?: boolean;
	link?: boolean;
	onClick?: () => void;
	size?: size;
	type?: string;
	[key: string]: any;
}

const Button = ({
	active,
	children,
	className = "",
	disabled,
	link,
	size = "medium",
	type,
	...rest
}: ButtonProps) => {
	return React.createElement(
		link ? "a" : "button",
		{
			...rest,
			className: `${styles.button} ${styles[size]} ${active ? styles.active : ""} ${className}`,
			disabled,
			type,
		},
		children,
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
	);
};

export { Button };
