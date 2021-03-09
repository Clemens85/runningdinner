import React from 'react'
import {Route, Switch, NavLink} from "react-router-dom";
import FormArrayIssue from "./FormArrayIssue";

export default function LandingApp(props) {

  return (
      <div>
        <FormArrayIssue />
        <nav>
          <ul>
            <li>
              <NavLink to="/">Start</NavLink>
            </li>
            <li>
              <NavLink to="/news">Neuigkeiten</NavLink>
            </li>
            <li>
              <NavLink to="/running-dinner-events">Running Dinner Events</NavLink>
            </li>
          </ul>
        </nav>
        <div>
          <Switch>
            <Route path="/running-dinner-events">
              <h1>Hier wären dann alle public Events</h1>
            </Route>
            <Route path="/news">
              <h1>Neuigkeiten</h1>
            </Route>
            <Route path="/">
              <h1>Landing Start</h1>
            </Route>
          </Switch>
        </div>
      </div>
  );

}
