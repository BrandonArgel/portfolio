import React from "react";
import { HashRouter, Switch, Route } from "react-router-dom";

import Portfolio from "../pages/portfolio.js";
// import Curriculum from "../pages/curriculum.js";
import NotFound from "../pages/404.js";

function App() {
  return (
    <HashRouter>
      <Switch>
        <Route exact path="/" component={Portfolio} />
        {/* <Route exact path="/curriculum" component={Curriculum} /> */}
        <Route component={NotFound} />
      </Switch>
    </HashRouter>
  );
}

export default App;
