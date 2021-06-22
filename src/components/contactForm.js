import React from 'react';
import { useForm, ValidationError } from '@formspree/react';

import './styles/contactForm.css'

export default function ContactForm() {
  const [state, handleSubmit] = useForm("meqvkwyd");
  if (state.succeeded) {
      return (
          <div className="form-response">
            <p>¡Su mensaje ha sido enviado con éxito!</p><br />
            <p>Pronto recibirá una respuesta 😃</p>
          </div>
        
      )
  }
  return (
      <fieldset>
        <legend><h2 className="main__section--title">¡Hablemos!</h2></legend>
        <form onSubmit={handleSubmit}>
            <label htmlFor="email">Correo electrónico:</label>
            <input required id="email" type="email" name="email" placeholder="correo@gmail.com" />
            <ValidationError prefix="Email" field="email" errors={state.errors} />
            <label htmlFor="message">Mensaje:</label>
            <textarea required id="message" name="message" placeholder="Hola, que tal..." />
            <ValidationError prefix="Message" field="message" errors={state.errors} />
            <button type="submit" disabled={state.submitting}>Submit</button>
        </form>
      </fieldset>
  );
}