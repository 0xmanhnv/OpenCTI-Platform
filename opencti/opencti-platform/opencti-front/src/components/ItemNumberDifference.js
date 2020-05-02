import React, { Component } from 'react';
import { compose } from 'ramda';
import * as PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { ArrowUpward, ArrowDownward, ArrowForward } from '@material-ui/icons';

import inject18n from './i18n';

const styles = () => ({
  diff: {
    float: 'left',
    margin: '21px 0 0 10px',
    padding: '2px 5px 2px 5px',
    fontSize: 12,
  },
  diffDescription: {
    margin: '0 0 0 10px',
    float: 'left',
  },
  diffIcon: {
    float: 'left',
    margin: '1px 5px 0 0',
    fontSize: 13,
  },
  diffNumber: {
    float: 'left',
  },
});

const inlineStyles = {
  green: {
    backgroundColor: 'rgba(76, 175, 80, 0.08)',
    color: '#4caf50',
  },
  red: {
    backgroundColor: 'rgba(244, 67, 54, 0.08)',
    color: '#f44336',
  },
  blueGrey: {
    backgroundColor: 'rgba(96, 125, 139, 0.08)',
    color: '#607d8b',
  },
};

class ItemNumberDifference extends Component {
  render() {
    const {
      t, difference, classes, description,
    } = this.props;
    if (difference < 0) {
      return (
        <div className={classes.diff} style={inlineStyles.red}>
          <ArrowDownward color="inherit" classes={{ root: classes.diffIcon }} />
          <div className={classes.diffNumber}>{difference}</div>
          {description ? (
            <div className={classes.diffDescription}>({t(description)})</div>
          ) : (
            ''
          )}
        </div>
      );
    }
    if (difference === 0) {
      return (
        <div className={classes.diff} style={inlineStyles.blueGrey}>
          <ArrowForward color="inherit" classes={{ root: classes.diffIcon }} />
          <div className={classes.diffNumber}>{difference}</div>
          {description ? (
            <div className={classes.diffDescription}>({t(description)})</div>
          ) : (
            ''
          )}
        </div>
      );
    }
    return (
      <div className={classes.diff} style={inlineStyles.green}>
        <ArrowUpward color="inherit" classes={{ root: classes.diffIcon }} />
        <div className={classes.diffNumber}>{difference}</div>
        {description ? (
          <div className={classes.diffDescription}>({t(description)})</div>
        ) : (
          ''
        )}
      </div>
    );
  }
}

ItemNumberDifference.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func,
  difference: PropTypes.number,
  description: PropTypes.string.isRequired,
};

export default compose(inject18n, withStyles(styles))(ItemNumberDifference);
