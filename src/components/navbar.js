import { HashLink } from "react-router-hash-link";

import "./styles/navbar.css";

const Navbar = () => {
  return (
    <nav className="header__navbar">
      <ul>
        <li className="fadeInDown delay2">
          <HashLink className="underlined" to="/#about">
            Sobre mí
          </HashLink>
        </li>
        <li className="fadeInDown delay4">
          <HashLink className="underlined" to="/#projects">
            Proyectos
          </HashLink>
        </li>
        <li className="fadeInDown delay6">
          <HashLink className="underlined" to="/#contact">
            Contacto
          </HashLink>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
