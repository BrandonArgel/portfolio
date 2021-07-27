import React from "react";
import Particles from "react-particles-js";
import styled from "styled-components";
import { Link } from "react-router-dom";

import portal from "../assets/svg/404/portal.png";
import notFound from "../assets/svg/404/NotFound.svg";

import Header from "../components/header";

function NotFound() {
  return (
    <React.Fragment>
      <Header />
      <section
        style={{
          width: "100vw",
          height: "100vh",
          background: "black",
          zIndex: -2,
          display: "flex",
          overflow: "hidden",
        }}
      >
        <Link to="/">
          <Portal src={portal} />
        </Link>
        <NotFounded>
          <NotFoundImg src={notFound} />
        </NotFounded>
      </section>
      <Particles
        id="particles"
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
              value: "#AFEB10",
            },
            shape: {
              type: "circle",
              stroke: {
                width: 0,
                color: "#AFEB10",
              },
            },
            opacity: {
              value: 1,
              random: false,
              anim: {
                enable: true,
                speed: 0.5,
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
              distance: 25,
              color: "#AFEB10",
              opacity: 0.2,
              width: 1,
            },
            move: {
              enable: true,
              speed: 5,
              direction: "top-left",
              random: true,
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
          width: "100vw",
          height: "100vh",
          position: "fixed",
          top: "0",
          left: "0",
        }}
      />
    </React.Fragment>
  );
}

const Portal = styled.img`
  position: absolute;
  top: -100px;
  left: -100px;
  animation: increase 60s linear infinite;
  z-index: 1;

  @keyframes increase {
    0% {
      transform: scale(0) rotate(0deg);
    }

    100% {
      transform: scale(2) rotate(5000deg);
    }
  }
`;

const NotFounded = styled.div`
  position: relative;
  width: 100%;
  margin: 0px auto;
  pointer-events: none;
  z-index: 2;
`;

const NotFoundImg = styled.img`
  width: 100%;
  max-width: 400px;
  display: block;
  margin: 0px auto;
  padding: 100px 70px;
  pointer-events: none;
  animation: atract 5s linear infinite;

  @keyframes atract {
    0% {
      transform: scaleX(1) rotate(-50deg);
    }
    25% {
      transform: scaleX(1.1) rotate(-60deg);
    }
    50% {
      transform: scale(1) rotate(-50deg);
    }
    75% {
      transform: scaleY(1.1) rotate(-60deg);
    }
    100% {
      transform: scaleX(1) rotate(-50deg);
    }
  }
`;

export default NotFound;
