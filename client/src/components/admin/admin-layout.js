import React from 'react';
import PropTypes from 'prop-types';
import CssBaseline from '@material-ui/core/CssBaseline';
import Drawer from '@material-ui/core/Drawer';
import Hidden from '@material-ui/core/Hidden';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import Sidebar from './sidebar';
import Header from './header';
import { getOne } from '../../redux/actions/users';

const drawerWidth = 240;

const styles = theme => ({
  root: {
    display: 'flex',
  },
  drawer: {
    [theme.breakpoints.up('md')]: {
      width: drawerWidth,
      flexShrink: 0,
    },
  },
  appBar: {
    marginLeft: drawerWidth,
    [theme.breakpoints.up('md')]: {
      width: `calc(100% - ${drawerWidth}px)`,
    },
    backgroundColor: '#1b2327'
  },
  menuButton: {
    marginRight: 20,
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
  toolbar: theme.mixins.toolbar,
  drawerPaper: {
    backgroundColor: '#263238',
    width: drawerWidth,
  },
  content: {
    [theme.breakpoints.up('md')]: {
      flexGrow: 1,
      padding: theme.spacing.unit * 3,
    }
  },
});

class AdminLayout extends React.Component {
  state = {
    mobileOpen: false,
    currentUser: ''
  };
  componentDidMount() {
    this.props.getOne(this.props.id).then(d => this.setState({currentUser: d}))
  }
  handleDrawerToggle = () => {
    this.setState(state => ({ mobileOpen: !state.mobileOpen }));
  }

  render() {
    const { classes, theme, children, history, authenticated, ...rest } = this.props;
    const { currentUser } = this.state;
    const drawer = <Sidebar history={history}/>

    return (
      <div className={classes.root}>
        <CssBaseline />
        <Header
          handleDrawerToggle={this.handleDrawerToggle}
          authenticated={authenticated}
          currentUser={currentUser}
          admin
          />
        <nav className={classes.drawer}>
          <Hidden mdUp implementation="css">
            <Drawer
              container={this.props.container}
              variant="temporary"
              anchor={theme.direction === 'rtl' ? 'right' : 'left'}
              open={this.state.mobileOpen}
              onClose={this.handleDrawerToggle}
              classes={{
                paper: classes.drawerPaper,
              }}
            >
              {drawer}
            </Drawer>
          </Hidden>
          <Hidden mdDown implementation="css">
            <Drawer
              classes={{
                paper: classes.drawerPaper,
              }}
              variant="permanent"
              open
            >
              {drawer}
            </Drawer>
          </Hidden>
        </nav>
        <main className={classes.content}>
          <div className={classes.toolbar} />
            {children}
        </main>
      </div>
    );
  }
}

AdminLayout.propTypes = {
  classes: PropTypes.object.isRequired,
  container: PropTypes.object,
  theme: PropTypes.object.isRequired,
};
export default connect(null, { getOne })(withStyles(styles, { withTheme: true })(AdminLayout))