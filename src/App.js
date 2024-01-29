import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Authorization from './components/authorization';
import Adminpanel from './components/adminpanel';
import Forms from './components/forms';
import Addform from './components/addform';
import Addadmin from './components/addadmin';
import Addusers from './components/addusers';
import Addteachers from './components/addteachers';
import Profile from './components/profile';
import Form from './components/form';
import { AdminProvider } from './context/AdminContext';

// CustomRoute component to handle both cases of the form route
const CustomRoute = ({ path, component: Component, exact }) => (
  <Route
    exact={exact}
    path={path}
    render={(props) => {
      const { match } = props;
      const { id, userid } = match.params;

      // If only 'id' is present in the URL, set 'userid' to a default value or leave it undefined
      const userIdParam = userid || 'defaultUserId';

      // Pass the extracted parameters as props to the Form component
      return <Component id={id} userid={userIdParam} />;
    }}
  />
);

function App() {
  return (
    <Router>
      <AdminProvider>
        <Switch>
          <Route exact path='/' component={Authorization} />
          <Route exact path='/adminpanel' component={Adminpanel} />
          <Route exact path='/forms' component={Forms} />
          <Route exact path='/addform' component={Addform} />
          <Route exact path='/addadmin' component={Addadmin} />
          <Route exact path='/addusers' component={Addusers} />
          <Route exact path='/addteachers' component={Addteachers} />
          <Route exact path='/profile' component={Profile} />

          {/* Use CustomRoute for the form route */}
          <CustomRoute exact path='/form/:id' component={Form} />
          <CustomRoute exact path='/form/:id/:userid' component={Form} />
        </Switch>
      </AdminProvider>
    </Router>
  );
}

export default App;
