import React, { Component } from 'react'

import CardProject from './cardProject'
import './styles/projects.css'

import personalBlog from '../assets/img/Blog.png'
import musicPlayer from '../assets/img/MusicPlayer.png'
import simonGame from '../assets/img/SimonGame.png'
import rickAndMorty from '../assets/img/Rick&Morty.png'
import gameRPandS from '../assets/img/GameRP&S.png'
import PlatziBadges from '../assets/img/PlatziBadges.png'
import form from '../assets/img/form.png'
import platziVideo from '../assets/img/PlatziVideo.png'
import batatabit from '../assets/img/Batatabit.png'
import animatedPumpkin from '../assets/gif/animated-pumpkin.gif'
export default class Projects extends Component {

    componentDidMount(){
        const button = document.getElementById('button')
        button.addEventListener('click', this.showMore)
    }

    showMore = () => {
        const button = document.getElementById('button')
        const projectHidden = document.getElementById('projectHidden')
        const projectsHidden = document.getElementsByClassName('more-projects')
        if(projectHidden.style.display==='flex'){
            for(let i=0; i<projectsHidden.length; i++){
                projectsHidden[i].style.display='none'
            }
            button.innerHTML='Show more'
        } else {
            for(let i=0; i<projectsHidden.length; i++){
                projectsHidden[i].style.display='flex'
            }
            button.innerHTML='Show less'
        }
    }

    componentWillUnmount(){
        const button = document.getElementById('button')
        button.removeEventListener('click', this.showMore)
    }

    render() {
        return (
            <section id="projects" className="main__projects animation fade_left transform_left appear">
                <h2 className="main__section--title">Proyectos</h2>
                <p>A lo largo de mi carrera como Frontend, he tenido el privilegio de trabajar en proyectos retadores e increíbles. <br /> Aquí hay algunos proyectos que me gustaría compartir.</p>
                <div className="main__projects--container">
                    <CardProject title="Blog Personal" description="Si quieres aprender sobre temas como desarrollo personal, tecnología y salud. ¡Dale un vistazo a mi blog!" image={personalBlog} project="https://brandonargel.github.io/brandblogs/" github="https://github.com/BrandonArgel/brandblogs" />
                    <CardProject title="Reproductor de Música" description="Reproductor de música con HTML, CSS y vanilla JavaScript" image={musicPlayer} project="https://brandonargel.github.io/music_player/" github="https://github.com/BrandonArgel/music_player" right={true} />
                    <CardProject title="Juego: Simón Dice" description="Juego Simón Dice con JavaScript Vanilla ¿Lograrás pasar los 15 niveles? ¡Reta a tu memoria!" image={simonGame} project="https://brandonargel.github.io/SimonDice/" github="https://github.com/BrandonArgel/SimonDice" />
                    <CardProject title="Rick y Morty API" description="API con ReactJS." image={rickAndMorty} project="https://brandonargel.github.io/RickAndMorty/" github="https://github.com/BrandonArgel/RickAndMorty" right={true} />
                    <CardProject title="Juego de Piedra Papel o Tijera" description="Juego de piedra papel o tijera con HTML, CSS y JavaScript." image={gameRPandS} project="https://brandonargel.github.io/Rock-Paper-Scissors/" github="https://github.com/BrandonArgel/Rock-Paper-Scissors" />
                    <CardProject title="Platzi Badges" description="Proyecto con ReactJS de platzi, creación de plataforma para el registro de los asistentes de la Platzi Conf." image={PlatziBadges} project="https://brandonargel.github.io/ReactJS/" github="https://github.com/BrandonArgel/ReactJS" right={true} />
                    <div id="projectHidden" className="more-projects">
                        <CardProject title="Formulario Profesional" description="Formulario Profesional con HTML, CSS y JavaScript de FalconMasters." image={form} project="https://brandonargel.github.io/formulario/" github="https://github.com/BrandonArgel/formulario" />
                    </div>
                    <div className="more-projects">
                        <CardProject title="Platzi Video" description="Proyecto de platzi, sobre el diseño de una aplicación web de videos." image={platziVideo} project="https://brandonargel.github.io/Frontend-Developer/" github="https://github.com/BrandonArgel/Frontend-Developer" right={true} />
                    </div>
                    <div className="more-projects">
                        <CardProject title="Batatabit" description="Proyecto de platzi, empresa de intercambio de criptomonedas." image={batatabit} project="https://brandonargel.github.io/ResponsiveDesign/" github="https://github.com/BrandonArgel/ResponsiveDesign" />
                    </div>
                    <div className="more-projects">
                        <CardProject title="Calabaza animada" description="Calabaza con animaciones CSS, pseudoelementos y keyframes." image={animatedPumpkin} project="https://brandonargel.github.io/Animated-Pumpkin/" github="https://github.com/BrandonArgel/Animated-Pumpkin" right={true} />
                    </div>
                </div>
                <div id="button" className="button button-projects">Show more</div>
            </section>
        )
    }
}
