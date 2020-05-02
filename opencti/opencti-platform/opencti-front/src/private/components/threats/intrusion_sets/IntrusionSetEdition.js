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
import IntrusionSetEditionContainer from './IntrusionSetEditionContainer';
import { intrusionSetEditionOverviewFocus } from './IntrusionSetEditionOverview';
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

export const intrusionSetEditionQuery = graphql`
  query IntrusionSetEditionContainerQuery($id: String!) {
    intrusionSet(id: $id) {
      ...IntrusionSetEditionContainer_intrusionSet
    }
  }
`;

class IntrusionSetEdition extends Component {
  constructor(props) {
    super(props);
    this.state = { open: false };
  }

  handleOpen() {
    this.setState({ open: true });
  }

  handleClose() {
    commitMutation({
      mutation: intrusionSetEditionOverviewFocus,
      variables: {
        id: this.props.intrusionSetId,
        input: { focusOn: '' },
      },
    });
    this.setState({ open: false });
  }

  render() {
    const { classes, intrusionSetId } = this.props;
    return (
      <div>
        <Fab
          onClick={this.handleOpen.bind(this)}
          color="secondary"
          aria-label="Edit"
          className={classes.editButton}>
          <Edit />
        </Fab>
        <Drawer
          open={this.state.open}
          anchor="right"
          classes={{ paper: classes.drawerPaper }}
          onClose={this.handleClose.bind(this)}>
          <QueryRenderer
            query={intrusionSetEditionQuery}
            variables={{ id: intrusionSetId }}
            render={({ props }) => {
              if (props) {
                return (
                  <IntrusionSetEditionContainer intrusionSet={props.intrusionSet}
                    handleClose={this.handleClose.bind(this)}/>
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

IntrusionSetEdition.propTypes = {
  intrusionSetId: PropTypes.string,
  classes: PropTypes.object,
  theme: PropTypes.object,
  t: PropTypes.func,
};

export default compose(
  inject18n,
  withStyles(styles, { withTheme: true }),
)(IntrusionSetEdition);
