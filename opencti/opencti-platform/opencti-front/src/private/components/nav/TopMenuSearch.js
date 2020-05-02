import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { compose } from 'ramda';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import inject18n from '../../../components/i18n';

const styles = theme => ({
  button: {
    marginRight: theme.spacing(1),
    padding: '2px 5px 2px 5px',
    minHeight: 20,
    textTransform: 'none',
    cursor: 'default',
  },
});

class TopMenuSearch extends Component {
  render() {
    const { t, classes } = this.props;
    return (
      <div>
        <Button
          variant="contained"
          size="small"
          color="primary"
          classes={{ root: classes.button }}
        >
          {t('Search')}
        </Button>
      </div>
    );
  }
}

TopMenuSearch.propTypes = {
  classes: PropTypes.object,
  location: PropTypes.object,
  t: PropTypes.func,
  history: PropTypes.object,
};

export default compose(
  inject18n,
  withRouter,
  withStyles(styles),
)(TopMenuSearch);
