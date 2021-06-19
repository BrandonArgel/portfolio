import React from 'react'
import Particles from 'react-particles-js';

import Header from './header'
import Footer from './footer'

export default function Layout(props) {
    return (
        <React.Fragment>
            <Particles id="particles"
              params={{
                particles: {
                    number: {
                      value: 50,
                      density: {
                        enable: true,
                        value_area: 800,
                      },
                    },
                    color: {
                      value: "#16FFE2",
                    },
                    shape: {
                      type: "circle",
                      stroke: {
                        width: 0,
                        color: "#16FFE2",
                      },
                    },
                    opacity: {
                      value: 0.5,
                      random: false,
                      anim: {
                        enable: true,
                        speed: .5,
                        opacity_min: 0.1,
                        sync: false,
                      },
                    },
                    size: {
                      value: 3,
                      random: true,
                      anim: {
                        enable: false,
                        speed: 40,
                        size_min: 0.1,
                        sync: false,
                      },
                    },
                    line_linked: {
                      enable: true,
                      distance: 150,
                      color: "#16FFE2",
                      opacity: 0.1,
                      width: 2,
                    },
                    move: {
                      enable: true,
                      speed: 2,
                      direction: "none",
                      random: false,
                      straight: false,
                      out_mode: "out",
                      bounce: false,
                      attract: {
                        enable: false,
                        rotateX: 600,
                        rotateY: 1200,
                      },
                    },
                  },
                  retina_detect: true,
            	}}
              style={{
                width: '100vw',
                height: '100vh',
                position: 'fixed',
                top: '0',
                left: '0',
                zIndex: -1
              }}
            />
            <Header />
            {props.children}
            <Footer />
        </React.Fragment>
    )
}
