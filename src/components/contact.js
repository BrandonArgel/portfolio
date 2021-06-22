import React, { Component } from 'react'

import './styles/contact.css'
import ContactForm from './contactForm'

import Github from '../assets/svg/Github.svg'
import Instagram from '../assets/svg/Instagram.svg'
import Linkedin from '../assets/svg/Linkedin.svg'
import Platzi from '../assets/svg/Platzi.svg'
import Twitter from '../assets/svg/Twitter.svg'
import Facebook from '../assets/svg/Facebook.svg'

export default class Contact extends Component {
    render() {
        return (
            <section id="contact" className="main__contact animation fade_left transform_left appear">
                <h2 className="main__section--title">Contacto</h2>
                <p>Actualmente estoy buscando nuevas oportunidades, mi bandeja de entrada está siempre abierta.</p>
                <p>Si tiene alguna pregunta sobre mis servicios, o simplemente quiere saludarme, no dude en contactarme.</p>
                <p>A continuación se muestran mis redes sociales y una sección de contacto:</p>
                <div className="main__social">
                    <a className="main__social--networks" target="_blank" rel="noopener noreferrer" href="https://github.com/BrandonArgel">
                        <p>Github</p>
                        <img className="main__social--icon" src={Github} alt="Github" />
                    </a>
                    <a className="main__social--networks" target="_blank" rel="noopener noreferrer" href="https://www.instagram.com/brandargel/">
                        <p>Instagram</p>
                        <img className="main__social--icon" src={Instagram} alt="Instagram" />
                    </a>
                    <a className="main__social--networks" target="_blank" rel="noopener noreferrer" href="https://www.linkedin.com/in/brandargel/">
                        <p>Linkedin</p>
                        <img className="main__social--icon" src={Linkedin} alt="Linkedin" />
                    </a>
                    <a className="main__social--networks" target="_blank" rel="noopener noreferrer" href="https://platzi.com/p/BrandArgel/">
                        <p>Platzi</p>
                        <img className="main__social--icon" src={Platzi} alt="Platzi" />
                    </a>
                    <a className="main__social--networks" target="_blank" rel="noopener noreferrer" href="https://twitter.com/BrandonArgelVD">
                        <p>Twitter</p>
                        <img className="main__social--icon" src={Twitter} alt="Twitter" />
                    </a>
                    <a className="main__social--networks" target="_blank" rel="noopener noreferrer" href="https://www.facebook.com/brandonargel.dominguez/">
                        <p>Facebook</p>
                        <img className="main__social--icon" src={Facebook} alt="Facebook" />
                    </a>
                </div>
                <ContactForm />
            </section>
        )
    }
}
