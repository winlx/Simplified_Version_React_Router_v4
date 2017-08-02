import React from 'react';
import PropTypes from 'prop-types';

const matchPath = (pathname, options) => {
  const { exact = false, path } = options;

  if (!path) {
    return {
      path: null,
      url: pathname,
      isExact: true,
    };
  }

  const match = new RegExp(`^${path}`).exec(pathname);

  if (!match) {
    // There wasn't a match.
    return null;
  }

  const url = match[0];
  const isExact = pathname === url;

  if (exact && !isExact) {
    // There was a match, but it wasn't
    // an exact match as specified by
    // the exact prop.
    return null;
  }

  return {
    path,
    url,
    isExact,
  };
};

const instances = [];
const register = comp => instances.push(comp);
const unregister = comp => instances.splice(instances.indexOf(comp), 1);

/**
 * Route "renders some UI when the URL matches a location you specify
 * in the Route's path prop". Method "matchPath" checks if the current
 * URL matches the component's path prop. If it does, we'll render
 * some UI. If it doesn't, we'll do nothing by returning null.
 */
class Route extends React.Component {
  componentWillMount() {
    // Listener for navigation buttons (back/forward).
    window.addEventListener('popstate', this.handlePop);
    // Register every component for update.
    register(this);
  }

  componentWillUnmount() {
    // Unregister every component for update.
    unregister(this);
    // Listener for navigation buttons (back/forward).
    window.removeEventListener('popstate', this.handlePop);
  }

  handlePop = () => {
    this.forceUpdate();
  };

  self = this;

  render() {
    const {
      path,
      exact,
      component,
      render,
    } = this.props;

    const match = matchPath(window.location.pathname, { path, exact });

    if (!match) {
      // Do nothing because the current
      // location doesn't match the path prop.
      return null;
    }

    if (component) {
      // The component prop takes precedent over the
      // render method. If the current location matches
      // the path prop, create a new element passing in
      // match as the prop.
      return React.createElement(component, { match });
    }

    if (render) {
      // If there's a match but component
      // was undefined, invoke the render
      // prop passing in match as an argument.
      return render({ match });
    }

    return null;
  }
}

Route.propTypes = {
  exact: PropTypes.bool,
  path: PropTypes.string,
  component: PropTypes.func,
  render: PropTypes.func,
};

const historyPush = (path) => {
  window.history.pushState({}, null, path);
  instances.forEach(instance => instance.forceUpdate());
};

const historyReplace = (path) => {
  window.history.replaceState({}, null, path);
  instances.forEach(instance => instance.forceUpdate());
};

class Link extends React.Component {
  handleClick = (event) => {
    event.preventDefault();

    const { replace, to } = this.props;

    if (replace) {
      historyReplace(to);
    } else {
      historyPush(to);
    }
  };

  render() {
    const { to, children } = this.props;

    return (
      <a href={to} onClick={this.handleClick}>{children}</a>
    );
  }
}

Link.propTypes = {
  to: PropTypes.string.isRequired,
  replace: PropTypes.bool,
};

export { Route, Link };
