import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { withRouter, Link } from 'react-router-dom';
import { compose } from 'ramda';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import { ArrowForwardIosOutlined } from '@material-ui/icons';
import { CityVariantOutline } from 'mdi-material-ui';
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

class TopMenuCity extends Component {
  render() {
    const {
      t,
      location,
      match: {
        params: { cityId },
      },
      classes,
    } = this.props;
    return (
      <div>
        <Button
          component={Link}
          to="/dashboard/entities/cities"
          variant="contained"
          size="small"
          color="inherit"
          classes={{ root: classes.buttonHome }}
        >
          <CityVariantOutline className={classes.icon} fontSize="small" />
          {t('Cities')}
        </Button>
        <ArrowForwardIosOutlined
          color="inherit"
          classes={{ root: classes.arrow }}
        />
        <Button
          component={Link}
          to={`/dashboard/entities/cities/${cityId}`}
          variant={
            location.pathname === `/dashboard/entities/cities/${cityId}`
              ? 'contained'
              : 'text'
          }
          size="small"
          color={
            location.pathname === `/dashboard/entities/cities/${cityId}`
              ? 'primary'
              : 'inherit'
          }
          classes={{ root: classes.button }}
        >
          {t('Overview')}
        </Button>
        <Button
          component={Link}
          to={`/dashboard/entities/cities/${cityId}/knowledge`}
          variant={
            location.pathname.includes(
              `/dashboard/entities/cities/${cityId}/knowledge`,
            )
              ? 'contained'
              : 'text'
          }
          size="small"
          color={
            location.pathname.includes(
              `/dashboard/entities/cities/${cityId}/knowledge`,
            )
              ? 'primary'
              : 'inherit'
          }
          classes={{ root: classes.button }}
        >
          {t('Knowledge')}
        </Button>
        <Button
          component={Link}
          to={`/dashboard/entities/cities/${cityId}/reports`}
          variant={
            location.pathname === `/dashboard/entities/cities/${cityId}/reports`
              ? 'contained'
              : 'text'
          }
          size="small"
          color={
            location.pathname === `/dashboard/entities/cities/${cityId}/reports`
              ? 'primary'
              : 'inherit'
          }
          classes={{ root: classes.button }}
        >
          {t('Reports')}
        </Button>
        <Button
          component={Link}
          to={`/dashboard/entities/cities/${cityId}/observables`}
          variant={
            location.pathname.includes(
              `/dashboard/entities/cities/${cityId}/observables`,
            )
              ? 'contained'
              : 'text'
          }
          size="small"
          color={
            location.pathname.includes(
              `/dashboard/entities/cities/${cityId}/observables`,
            )
              ? 'primary'
              : 'inherit'
          }
          classes={{ root: classes.button }}
        >
          {t('Observables')}
        </Button>
        <Security needs={[KNOWLEDGE_KNUPLOAD, KNOWLEDGE_KNGETEXPORT]}>
          <Button
            component={Link}
            to={`/dashboard/entities/cities/${cityId}/files`}
            variant={
              location.pathname === `/dashboard/entities/cities/${cityId}/files`
                ? 'contained'
                : 'text'
            }
            size="small"
            color={
              location.pathname === `/dashboard/entities/cities/${cityId}/files`
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
          to={`/dashboard/entities/cities/${cityId}/history`}
          variant={
            location.pathname === `/dashboard/entities/cities/${cityId}/history`
              ? 'contained'
              : 'text'
          }
          size="small"
          color={
            location.pathname === `/dashboard/entities/cities/${cityId}/history`
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

TopMenuCity.propTypes = {
  classes: PropTypes.object,
  location: PropTypes.object,
  match: PropTypes.object,
  t: PropTypes.func,
  history: PropTypes.object,
};

export default compose(inject18n, withRouter, withStyles(styles))(TopMenuCity);
