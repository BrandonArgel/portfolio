import React, { Component } from 'react'

import Photo from '../assets/img/Photo.jpg'
import './styles/about.css'

export default class About extends Component {
    render() {
        return (
            <section id="about" className="main__about animation fade_left transform_left appear">
                <div className="main__about--info">
                    <h2 className="main__section--title">Sobre mí</h2>
                    <p>¡Hola! Soy Brandon Argel, actualmente vivo en Jal. México, tengo 18 años de edad y disfruto aprendiendo y creando cosas nuevas todos los días.</p>
                    <p>Poco antes de graduarme del politécnico Ingeniero Jorge Matute Remus en la carrera de Informática, comencé mis estudios en <a href="http://platzi.com/" className="underlined">Platzi</a> y decidí adoptar su lema:</p>
                    <blockquote>Nunca pares de aprender</blockquote>
                    <p>Aquí hay algunas tecnologías y herramientas con las que he estado trabajando:</p>
                    <ul className="main__about--skills">
                        <li>JavaScript (ES6+)</li>
                        <li>HTML & CSS</li>
                        <li>React</li>
                        <li>Git & GitHub</li>
                        <li>Figma</li>
                        <li>Terminal de comandos</li>
                        <li>CodeStream</li>
                    </ul>
                </div>
                
                <img className="main__about--photo" src={Photo} alt="Foto de Brandon" />
            </section>
        )
    }
}
