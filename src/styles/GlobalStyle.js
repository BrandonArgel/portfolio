import { createGlobalStyle } from "styled-components";
import variables from "./Variables";

const GlobalStyle = createGlobalStyle`
    ${variables};

    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    html {
        font-size: 62.5%;
    }

    ::-webkit-scrollbar {
        background-color: transparent;
        width: 10px;
    }

    ::-webkit-scrollbar-track {
        background-color: transparent;
    }

    ::-webkit-scrollbar-thumb {
        background: linear-gradient(180deg, rgba(22, 255, 226, 0.6) 0%, rgba(22, 255, 226, .5) 25%, rgba(22, 255, 226, 1) 53%, rgba(22, 255, 226, .5) 75%, rgba(22, 255, 226, 0.6) 100%);
    }

    ::-webkit-scrollbar-thumb:hover {
        background-color: rgba(22, 255, 226, 0.8);
    }

    body {
        color: #CCDDFF;
        font: normal 1.6rem/100% var(--font-mono);
    }

    #root {
        background-image: var(--fond-gradient);
        height: 100vh;
        overflow: hidden;
    }

    #tsparticles canvas {
        pointer-events: none !important;
    }

    :focus {
        outline: none;
        border: none;
    }
`;

export default GlobalStyle;
