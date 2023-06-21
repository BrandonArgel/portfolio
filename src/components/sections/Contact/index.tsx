import * as React from "react";
import { LanguageContext } from "@context";
import { useShowIn } from "@hooks";
import emailjs from "@emailjs/browser";
import { Button } from "@components";
import { Alert, Info, Success } from "@assets/icons";
import styles from "./Contact.module.scss";

const REGEX = {
	name: /^[a-zA-ZÀ-ÿ\s]{1,50}$/,
	correo: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
};

const { VITE_SERVICE_ID, VITE_TEMPLATE_ID, VITE_USER_ID } = import.meta.env;

const Contact = () => {
	const {
		texts: { contact },
	} = React.useContext(LanguageContext);
	const sectionRef = React.useRef<HTMLDivElement>(null);
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
		if (!value) {
			setName({ ...name, error: contact.errors.name.required });
		} else if (!REGEX.name.test(value)) {
			setName({ ...name, error: contact.errors.name.invalid });
		} else {
			return true;
		}
	};

	const validateEmail = (value: string) => {
		if (!value) setEmail({ ...email, error: contact.errors.email.required });
		else if (!REGEX.correo.test(value)) setEmail({ ...email, error: contact.errors.email.invalid });
		else return true;
	};

	const validateMessage = (value: string) => {
		if (!value) setMessage({ ...message, error: contact.errors.message.required });
		else if (value.length > 500)
			setMessage({
				...message,
				error: contact.errors.message.validation,
			});
		else return true;
	};

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (hasSent) {
			setAlreadySent(true);
			setTimeout(() => setAlreadySent(false), 3000);
			return;
		}
		const valName = validateName(name.value);
		const valEmail = validateEmail(email.value);
		const valMessage = validateMessage(message.value);
		if (valName && valEmail && valMessage) {
			setSending(true);
			try {
				emailjs
					.sendForm(`${VITE_SERVICE_ID}`, `${VITE_TEMPLATE_ID}`, form.current!, `${VITE_USER_ID}`)
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

	React.useEffect(() => {
		if (sectionRef.current) {
			useShowIn(sectionRef);
		}
	}, []);

	return (
		<section className={styles.contact} id={contact.id} ref={sectionRef}>
			<h2 className={styles.contact__title}>{contact.title}</h2>
			<p className={styles.contact__description}>{contact.description.current}</p>
			<p className={styles.contact__description}>{contact.description.invite}</p>
			<fieldset className={styles.contact__fieldset}>
				<legend>{contact.form.legend}</legend>
				<form ref={form} className={styles.contact__form} onSubmit={handleSubmit}>
					<input
						className={styles.contact__form_input}
						placeholder={contact.form.name}
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
						placeholder={contact.form.email}
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
						placeholder={contact.form.message}
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
							<Info /> {contact.messages.alreadySent}
						</div>
					)}
					<Button
						active
						className={styles.contact__form_submit}
						disabled={hasSent}
						size="small"
						type="submit"
					>
						{sending ? contact.form.button.sending : contact.form.button.send}
					</Button>
					{error && (
						<div aria-live="assertive" className={styles.contact__form_error}>
							<Alert /> {contact.form.error}
						</div>
					)}
					{hasSent && (
						<p className={styles.contact__form_success}>
							<Success /> {contact.messages.success}
						</p>
					)}
				</form>
			</fieldset>
		</section>
	);
};

export { Contact };
