import React, { Component} from 'react'

import './styles/portfolio.css'
import './styles/animations.css'
import About from '../components/about'
import Projects from '../components/projects'
import Contact from '../components/contact'
import Pdf from '../components/Curriculum.pdf'
import Button from '../components/button'

class Portfolio extends Component{
    componentDidMount(){
        class TextoAnimado {
            constructor(id, objective) {
              this.text = document.getElementById(id);
              this.objective = document.getElementById(objective);
              this.letters = this.text.innerText.split("");
          
              this.text.innerText = "";
          
              this.letters.forEach((letra) => {
                let caracter = letra === " " ? "&nbsp;" : letra;
          
                this.text.innerHTML =
                  this.text.innerHTML +
                  `
                          <div>
                              <span>${caracter}</span>
                              <span class="segunda-linea">${caracter}</span>
                          </div>
                      `;
              });
          
              this.objective.addEventListener("mouseenter", () => {
                let cuenta = 0;
          
                const intervalo = setInterval(() => {
                  if (cuenta < this.text.children.length) {
                    this.text.children[cuenta].classList.add("animacion");
                    cuenta += 1;
                  } else {
                    clearInterval(intervalo);
                  }
                }, 20);
              });
          
              this.objective.addEventListener("mouseleave", () => {
                let cuenta = 0;
          
                const intervalo = setInterval(() => {
                  if (cuenta < this.text.children.length) {
                    this.text.children[cuenta].classList.remove("animacion");
                    cuenta += 1;
                  } else {
                    clearInterval(intervalo);
                  }
                }, 20);
              });
            }
          }

        new TextoAnimado("name", "main__hero--text");

        window.addEventListener('scroll', this.animations)
    }

    animations = () => {
      function fade(direction){
          var animate = document.querySelectorAll('.fade_'+direction);
          for(var i = 0; i < animate.length; i++){
              var altura = window.innerHeight/1.3;
              var distancia = animate[i].getBoundingClientRect().top;
              animate[i].classList.add('transform_'+direction)
              if(distancia <= altura){
                  animate[i].classList.add('appear');
                } else {
                  animate[i].classList.remove('appear');
              }
          }
      }
      
      fade('left');
      fade('right');
      fade('up');
      fade('down');
      fade('none');
    }

    componentWillUnmount(){
      window.removeEventListener('scroll', this.animations)
    }

    render(){
        return(
            <main id="main">
                <section className="main__hero fadeInLeft">
                    <div id="main__hero--text">
                        <h1 className="main__hero--title">Hola, mi nombre es</h1>
                        <div className="main__hero--presentation">
                            <div id="name" className="main__hero--animated-name">Brandon Argel.</div>
                            <p className="main__hero--presentation-do">Yo construyo sitios web.</p>
                        </div>
                        <p className="main__hero--info">Soy un<span className="main__hero--info-career"> Frontend Developer </span>en constante aprendizaje y evolución que vive en la ciudad de Guadalajara, México y me especializo en construir sitios web.</p>
                    </div>
                    <div className="main__hero--buttons">
                        <Button href="mailto:brandargel@gmail.com" text="Ponerse en contacto" />
                        <Button href={Pdf} text="Currículum" />
                    </div>
                </section>
                <About />
                <Projects />
                <Contact />
            </main>
        )
    }
}

export default Portfolio
