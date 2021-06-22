import React, { Component } from 'react'

import './styles/aside.css'


class Aside extends Component {
    render(){
        return(
            <aside id="aside">
                <nav>
                    <ul>
                        <li><a href="#about">Sobre mí</a></li>
                        <li><a href="#projects">Proyectos</a></li>
                        <li><a href="#contact">Contacto</a></li>
                    </ul>
                </nav>
            </aside>
        )
    }
}

export default Aside;