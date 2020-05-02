import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { compose } from 'ramda';
import graphql from 'babel-plugin-relay/macro';
import { withStyles } from '@material-ui/core/styles/index';
import Drawer from '@material-ui/core/Drawer';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import Slide from '@material-ui/core/Slide';
import MoreVert from '@material-ui/icons/MoreVert';
import { ConnectionHandler } from 'relay-runtime';
import inject18n from '../../../../components/i18n';
import { commitMutation, QueryRenderer } from '../../../../relay/environment';
import KillChainPhaseEdition from './KillChainPhaseEdition';
import Loader from '../../../../components/Loader';

const styles = (theme) => ({
  container: {
    margin: 0,
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

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

const killChainPhasePopoverDeletionMutation = graphql`
  mutation KillChainPhasePopoverDeletionMutation($id: ID!) {
    killChainPhaseEdit(id: $id) {
      delete
    }
  }
`;

const killChainPhaseEditionQuery = graphql`
  query KillChainPhasePopoverEditionQuery($id: String!) {
    killChainPhase(id: $id) {
      ...KillChainPhaseEdition_killChainPhase
    }
  }
`;

class KillChainPhasePopover extends Component {
  constructor(props) {
    super(props);
    this.state = {
      anchorEl: null,
      displayUpdate: false,
      displayDelete: false,
      deleting: false,
    };
  }

  handleOpen(event) {
    this.setState({ anchorEl: event.currentTarget });
  }

  handleClose() {
    this.setState({ anchorEl: null });
  }

  handleOpenUpdate() {
    this.setState({ displayUpdate: true });
    this.handleClose();
  }

  handleCloseUpdate() {
    this.setState({ displayUpdate: false });
  }

  handleOpenDelete() {
    this.setState({ displayDelete: true });
    this.handleClose();
  }

  handleCloseDelete() {
    this.setState({ displayDelete: false });
  }

  submitDelete() {
    this.setState({ deleting: true });
    commitMutation({
      mutation: killChainPhasePopoverDeletionMutation,
      variables: {
        id: this.props.killChainPhaseId,
      },
      updater: (store) => {
        const container = store.getRoot();
        const payload = store.getRootField('killChainPhaseEdit');
        const userProxy = store.get(container.getDataID());
        const conn = ConnectionHandler.getConnection(
          userProxy,
          'Pagination_killChainPhases',
          this.props.paginationOptions,
        );
        ConnectionHandler.deleteNode(conn, payload.getValue('delete'));
      },
      onCompleted: () => {
        this.setState({ deleting: false });
        this.handleCloseDelete();
      },
    });
  }

  render() {
    const { classes, t, killChainPhaseId } = this.props;
    return (
      <div className={classes.container}>
        <IconButton onClick={this.handleOpen.bind(this)} aria-haspopup="true">
          <MoreVert />
        </IconButton>
        <Menu anchorEl={this.state.anchorEl}
          open={Boolean(this.state.anchorEl)}
          onClose={this.handleClose.bind(this)}
          style={{ marginTop: 50 }}>
          <MenuItem onClick={this.handleOpenUpdate.bind(this)}>
            {t('Update')}
          </MenuItem>
          <MenuItem onClick={this.handleOpenDelete.bind(this)}>
            {t('Delete')}
          </MenuItem>
        </Menu>
        <Drawer open={this.state.displayUpdate}
          anchor="right"
          classes={{ paper: classes.drawerPaper }}
          onClose={this.handleCloseUpdate.bind(this)}>
          <QueryRenderer
            query={killChainPhaseEditionQuery}
            variables={{ id: killChainPhaseId }}
            render={({ props }) => {
              if (props) {
                // Done
                return (
                  <KillChainPhaseEdition killChainPhase={props.killChainPhase}
                    handleClose={this.handleCloseUpdate.bind(this)}
                  />
                );
              }
              return <Loader variant="inElement" />;
            }}
          />
        </Drawer>
        <Dialog open={this.state.displayDelete}
          keepMounted={true}
          TransitionComponent={Transition}
          onClose={this.handleCloseDelete.bind(this)}>
          <DialogContent>
            <DialogContentText>
              {t('Do you want to delete this kill chain phase?')}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleCloseDelete.bind(this)}
              color="primary"
              disabled={this.state.deleting}>
              {t('Cancel')}
            </Button>
            <Button onClick={this.submitDelete.bind(this)}
              color="primary"
              disabled={this.state.deleting}>
              {t('Delete')}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

KillChainPhasePopover.propTypes = {
  killChainPhaseId: PropTypes.string,
  paginationOptions: PropTypes.object,
  classes: PropTypes.object,
  t: PropTypes.func,
};

export default compose(inject18n, withStyles(styles))(KillChainPhasePopover);
