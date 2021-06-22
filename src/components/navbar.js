import './styles/navbar.css'

const Navbar = () => {
    return (
        <nav className="header__navbar">
            <ul>
                <li className="fadeInDown delay2"><a className="underlined" href="#about">Sobre mí</a></li>
                <li className="fadeInDown delay4"><a className="underlined" href="#projects">Proyectos</a></li>
                <li className="fadeInDown delay6"><a className="underlined" href="#contact">Contacto</a></li>
            </ul>
        </nav>
    )
}
  
export default Navbar;