import React, { Component } from "react";
import { HashLink } from "react-router-hash-link";

import "./styles/aside.css";

class Aside extends Component {
  render() {
    return (
      <aside aria-hidden="true" tabIndex="-1" id="aside">
        <nav>
          <ul>
            <li>
              <HashLink to="/#about">Sobre mí</HashLink>
            </li>
            <li>
              <HashLink to="/#projects">Proyectos</HashLink>
            </li>
            <li>
              <HashLink to="/#contact">Contacto</HashLink>
            </li>
          </ul>
        </nav>
      </aside>
    );
  }
}

export default Aside;
