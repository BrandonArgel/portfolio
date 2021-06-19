import React from 'react'
import { BrowserRouter, Switch, Route } from "react-router-dom";

import Layout from './layout'
import Portfolio from '../pages/portfolio.js'
// import Projects from '../pages/projects.js'

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Switch>
          <Route path="/" component={Portfolio} />
          {/* <Route exact path="/proyectos" component={Projects} /> */}
          {/* <Route component={NotFound} /> */}
        </Switch>
      </Layout>
    </BrowserRouter>
  );
}

export default App;