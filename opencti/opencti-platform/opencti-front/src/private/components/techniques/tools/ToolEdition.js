import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { compose } from 'ramda';
import { withStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import Fab from '@material-ui/core/Fab';
import { Edit } from '@material-ui/icons';
import graphql from 'babel-plugin-relay/macro';
import {
  commitMutation,
  QueryRenderer,
} from '../../../../relay/environment';
import inject18n from '../../../../components/i18n';
import ToolEditionContainer from './ToolEditionContainer';
import { toolEditionOverviewFocus } from './ToolEditionOverview';
import Loader from '../../../../components/Loader';

const styles = (theme) => ({
  editButton: {
    position: 'fixed',
    bottom: 30,
    right: 30,
  },
  drawerPaper: {
    minHeight: '100vh',
    width: '50%',
    position: 'fixed',
    overflow: 'auto',
    backgroundColor: theme.palette.navAlt.background,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    padding: 0,
  },
});

export const toolEditionQuery = graphql`
  query ToolEditionContainerQuery($id: String!) {
    tool(id: $id) {
      ...ToolEditionContainer_tool
    }
  }
`;

class ToolEdition extends Component {
  constructor(props) {
    super(props);
    this.state = { open: false };
  }

  handleOpen() {
    this.setState({ open: true });
  }

  handleClose() {
    commitMutation({
      mutation: toolEditionOverviewFocus,
      variables: {
        id: this.props.toolId,
        input: { focusOn: '' },
      },
    });
    this.setState({ open: false });
  }

  render() {
    const { classes, toolId } = this.props;
    return (
      <div>
        <Fab onClick={this.handleOpen.bind(this)}
          color="secondary"
          aria-label="Edit"
          className={classes.editButton}>
          <Edit />
        </Fab>
        <Drawer open={this.state.open}
          anchor="right"
          classes={{ paper: classes.drawerPaper }}
          onClose={this.handleClose.bind(this)}>
          <QueryRenderer
            query={toolEditionQuery}
            variables={{ id: toolId }}
            render={({ props }) => {
              if (props) {
                return (
                  <ToolEditionContainer tool={props.tool}
                    handleClose={this.handleClose.bind(this)}
                  />
                );
              }
              return <Loader variant="inElement" />;
            }}
          />
        </Drawer>
      </div>
    );
  }
}

ToolEdition.propTypes = {
  toolId: PropTypes.string,
  me: PropTypes.object,
  classes: PropTypes.object,
  theme: PropTypes.object,
  t: PropTypes.func,
};

export default compose(
  inject18n,
  withStyles(styles, { withTheme: true }),
)(ToolEdition);
