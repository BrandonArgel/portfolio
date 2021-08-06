import React from "react";
import { useForm, ValidationError } from "@formspree/react";

import "./styles/contactForm.css";

export default function ContactForm() {
  const [state, handleSubmit] = useForm("meqvkwyd");
  if (state.succeeded) {
    return (
      <div className="form-response">
        <p>¡Su mensaje ha sido enviado con éxito!</p>
        <br />
        <p>Pronto recibirá una respuesta 😃</p>
      </div>
    );
  }
  return (
    <fieldset>
      <legend>
        <h2 className="main__section--title">¡Hablemos!</h2>
      </legend>
      <form onSubmit={handleSubmit}>
        <input
          required
          autoComplete
          id="name"
          type="text"
          name="firstname"
          datatype="text"
          placeholder="Nombre"
        />
        <ValidationError prefix="name" field="name" errors={state.errors} />
        <input
          autoComplete
          required
          id="email"
          type="email"
          name="email"
          placeholder="Correo"
        />
        <ValidationError prefix="Email" field="email" errors={state.errors} />
        <textarea required id="message" name="message" placeholder="Mensaje" />
        <ValidationError
          prefix="Message"
          field="message"
          errors={state.errors}
        />
        <button type="submit" disabled={state.submitting}>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          Enviar
        </button>
      </form>
    </fieldset>
  );
}
