import React, { Component } from 'react'

import './styles/aside.css'


class Aside extends Component {
    render(){
        return(
            <aside id="aside">
                <nav>
                    <ul>
                        <li><a href="#1">Sobre mí</a></li>
                        <li><a href="#2">Proyectos</a></li>
                        <li><a href="#3">Contacto</a></li>
                    </ul>
                </nav>
            </aside>
        )
    }
}

export default Aside;