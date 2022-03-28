import * as React from "react";
import emailjs from "@emailjs/browser";
import { Button } from "components";
import { Alert, Info, Success } from "assets/icons";
import styles from "./index.module.scss";

const REGEX = {
	name: /^[a-zA-ZÀ-ÿ\s]{1,50}$/,
	correo: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
};

const { REACT_APP_SERVICE_ID, REACT_APP_TEMPLATE_ID, REACT_APP_USER_ID } = process.env;

const Contact = () => {
	const form = React.useRef<HTMLFormElement>(null);
	const [name, setName] = React.useState({
		value: "",
		error: "",
	});
	const [email, setEmail] = React.useState({
		value: "",
		error: "",
	});
	const [message, setMessage] = React.useState({
		value: "",
		error: "",
	});
	const [hasSent, setHasSent] = React.useState(localStorage.getItem("sentForm") === "true");
	const [alreadySent, setAlreadySent] = React.useState(false);
	const [sending, setSending] = React.useState(false);
	const [error, setError] = React.useState(false);

	const validateName = (value: string) => {
		if (!value) return setName({ ...name, error: "El nombre no puede estar vacío" });
		if (!REGEX.name.test(value)) {
			return setName({ ...name, error: "El nombre sólo puede tener hasta 50 letras y espacios" });
		}
		return true;
	};

	const validateEmail = (value: string) => {
		if (!value) return setEmail({ ...email, error: "El correo no puede estar vacío" });
		if (!REGEX.correo.test(value)) return setEmail({ ...email, error: "El correo no es válido" });
		return true;
	};

	const validateMessage = (value: string) => {
		if (!value) return setMessage({ ...message, error: "El mensaje no puede estar vacío" });
		if (value.length > 500)
			return setMessage({
				...message,
				error: "El mensaje puede tener hasta 500 caracteres",
			});
		return true;
	};

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (hasSent) {
			setAlreadySent(true);
			setTimeout(() => setAlreadySent(false), 3000);
			return;
		}
		if (validateName(name.value) && validateEmail(email.value) && validateMessage(message.value)) {
			setSending(true);
			try {
				emailjs
					.sendForm(
						`${REACT_APP_SERVICE_ID}`,
						`${REACT_APP_TEMPLATE_ID}`,
						form.current!,
						`${REACT_APP_USER_ID}`
					)
					.then(
						(result) => {
							setHasSent(true);
							localStorage.setItem("sentForm", "true");
							form.current!.reset();
							setName({ value: "", error: "" });
							setEmail({ value: "", error: "" });
							setMessage({ value: "", error: "" });
							setSending(false);
						},
						(error) => {
							console.error(error.text);
							setError(true);
							setTimeout(() => setError(false), 3000);
							setSending(false);
						}
					);
			} catch (error) {
				console.error(error);
				setError(true);
			}
		}
	};

	return (
		<section className={styles.contact} id="contact">
			<h2 className={styles.contact__title}>Contact</h2>
			<p className={styles.contact__description}>
				I am currently looking for new opportunities, my inbox is always open.
			</p>
			<p className={styles.contact__description}>
				If you have any questions about my services, or just want to say hello, feel free to contact
				me.
			</p>
			<fieldset className={styles.contact__fieldset}>
				<legend>Lets talk!</legend>
				<form ref={form} className={styles.contact__form} onSubmit={handleSubmit}>
					<input
						className={styles.contact__form_input}
						placeholder="Name"
						type="text"
						autoComplete="on"
						value={name.value}
						onBlur={(e) => validateName(e.target.value)}
						onChange={(e) => setName({ value: e.target.value, error: "" })}
						disabled={!!hasSent}
						name="from_name"
					/>
					{name.error && (
						<div aria-live="assertive" className={styles.contact__form_error}>
							<Alert /> {name.error}
						</div>
					)}
					<input
						className={styles.contact__form_input}
						placeholder="Mail"
						type="email"
						autoComplete="on"
						value={email.value}
						onBlur={(e) => validateEmail(e.target.value)}
						onChange={(e) => setEmail({ value: e.target.value, error: "" })}
						disabled={!!hasSent}
						name="reply_to"
					/>
					{email.error && (
						<div aria-live="assertive" className={styles.contact__form_error}>
							<Alert /> {email.error}
						</div>
					)}
					<textarea
						className={styles.contact__form_textarea}
						placeholder="Message"
						rows={10}
						value={message.value}
						onBlur={(e) => validateMessage(e.target.value)}
						onChange={(e) => setMessage({ value: e.target.value, error: "" })}
						disabled={!!hasSent}
						name="message"
					/>
					{message.error && (
						<div aria-live="assertive" className={styles.contact__form_error}>
							<Alert /> {message.error}
						</div>
					)}
					{alreadySent && (
						<div aria-live="assertive" className={styles.contact__form_info}>
							<Info /> You have already sent a message
						</div>
					)}
					{sending && (
						<div aria-live="assertive" className={styles.contact__form_info}>
							<Info /> Sending message...
						</div>
					)}
					<Button active className={styles.contact__form_submit} disabled={hasSent} size="small">
						Send
					</Button>
					{error && (
						<div aria-live="assertive" className={styles.contact__form_error}>
							<Alert /> Something went wrong, please try again
						</div>
					)}
					{hasSent && (
						<p className={styles.contact__form_success}>
							<Success /> I'll check your message as soon as possible.
						</p>
					)}
				</form>
			</fieldset>
		</section>
	);
};

export default Contact;
