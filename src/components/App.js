import React from 'react'
import { BrowserRouter, Switch, Route } from "react-router-dom";

import Layout from './layout'
import Portfolio from '../pages/portfolio.js'

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Switch>
          <Route exact path="/" component={Portfolio} />
          {/* <Route component={NotFound} /> */}
        </Switch>
      </Layout>
    </BrowserRouter>
  );
}

export default App;