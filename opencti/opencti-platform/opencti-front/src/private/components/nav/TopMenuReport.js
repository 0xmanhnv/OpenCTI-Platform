import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { withRouter, Link } from 'react-router-dom';
import { compose } from 'ramda';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import { ArrowForwardIosOutlined, DescriptionOutlined } from '@material-ui/icons';
import inject18n from '../../../components/i18n';
import Security, {
  KNOWLEDGE_KNGETEXPORT,
  KNOWLEDGE_KNUPLOAD,
} from '../../../utils/Security';

const styles = (theme) => ({
  buttonHome: {
    marginRight: theme.spacing(2),
    padding: '2px 5px 2px 5px',
    minHeight: 20,
    textTransform: 'none',
    color: '#666666',
    backgroundColor: '#ffffff',
  },
  button: {
    marginRight: theme.spacing(2),
    padding: '2px 5px 2px 5px',
    minHeight: 20,
    minWidth: 20,
    textTransform: 'none',
  },
  icon: {
    marginRight: theme.spacing(1),
  },
  arrow: {
    verticalAlign: 'middle',
    marginRight: 10,
  },
});

class TopMenuReport extends Component {
  render() {
    const {
      t,
      location,
      match: {
        params: { reportId },
      },
      classes,
    } = this.props;
    return (
      <div>
        <Button
          component={Link}
          to="/dashboard/reports/all"
          variant="contained"
          size="small"
          color="inherit"
          classes={{ root: classes.buttonHome }}
        >
          <DescriptionOutlined className={classes.icon} fontSize="small" />
          {t('Reports')}
        </Button>
        <ArrowForwardIosOutlined color="inherit" classes={{ root: classes.arrow }} />
        <Button
          component={Link}
          to={`/dashboard/reports/all/${reportId}`}
          variant={
            location.pathname === `/dashboard/reports/all/${reportId}`
              ? 'contained'
              : 'text'
          }
          size="small"
          color={
            location.pathname === `/dashboard/reports/all/${reportId}`
              ? 'primary'
              : 'inherit'
          }
          classes={{ root: classes.button }}
        >
          {t('Overview')}
        </Button>
        <Button
          component={Link}
          to={`/dashboard/reports/all/${reportId}/entities`}
          variant={
            location.pathname === `/dashboard/reports/all/${reportId}/entities`
              ? 'contained'
              : 'text'
          }
          size="small"
          color={
            location.pathname === `/dashboard/reports/all/${reportId}/entities`
              ? 'primary'
              : 'inherit'
          }
          classes={{ root: classes.button }}
        >
          {t('Entities')}
        </Button>
        <Button
          component={Link}
          to={`/dashboard/reports/all/${reportId}/observables`}
          variant={
            location.pathname
            === `/dashboard/reports/all/${reportId}/observables`
              ? 'contained'
              : 'text'
          }
          size="small"
          color={
            location.pathname
            === `/dashboard/reports/all/${reportId}/observables`
              ? 'primary'
              : 'inherit'
          }
          classes={{ root: classes.button }}
        >
          {t('Observables')}
        </Button>
        <Button
          component={Link}
          to={`/dashboard/reports/all/${reportId}/knowledge`}
          variant={
            location.pathname === `/dashboard/reports/all/${reportId}/knowledge`
              ? 'contained'
              : 'text'
          }
          size="small"
          color={
            location.pathname === `/dashboard/reports/all/${reportId}/knowledge`
              ? 'primary'
              : 'inherit'
          }
          classes={{ root: classes.button }}
        >
          {t('Knowledge')}
        </Button>
        <Security needs={[KNOWLEDGE_KNUPLOAD, KNOWLEDGE_KNGETEXPORT]}>
          <Button
            component={Link}
            to={`/dashboard/reports/all/${reportId}/files`}
            variant={
              location.pathname === `/dashboard/reports/all/${reportId}/files`
                ? 'contained'
                : 'text'
            }
            size="small"
            color={
              location.pathname === `/dashboard/reports/all/${reportId}/files`
                ? 'primary'
                : 'inherit'
            }
            classes={{ root: classes.button }}
          >
            {t('Files')}
          </Button>
        </Security>
        <Button
          component={Link}
          to={`/dashboard/reports/all/${reportId}/history`}
          variant={
            location.pathname === `/dashboard/reports/all/${reportId}/history`
              ? 'contained'
              : 'text'
          }
          size="small"
          color={
            location.pathname === `/dashboard/reports/all/${reportId}/history`
              ? 'primary'
              : 'inherit'
          }
          classes={{ root: classes.button }}
        >
          {t('History')}
        </Button>
      </div>
    );
  }
}

TopMenuReport.propTypes = {
  classes: PropTypes.object,
  location: PropTypes.object,
  match: PropTypes.object,
  t: PropTypes.func,
  history: PropTypes.object,
};

export default compose(
  inject18n,
  withRouter,
  withStyles(styles),
)(TopMenuReport);
