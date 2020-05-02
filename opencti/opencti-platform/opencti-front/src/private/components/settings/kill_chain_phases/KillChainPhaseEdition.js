import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import graphql from 'babel-plugin-relay/macro';
import { createFragmentContainer } from 'react-relay';
import { Field, Form, Formik } from 'formik';
import {
  compose, defaultTo, lensProp, over, pickAll,
} from 'ramda';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import { Close } from '@material-ui/icons';
import * as Yup from 'yup';
import inject18n from '../../../../components/i18n';
import {
  commitMutation,
  requestSubscription,
} from '../../../../relay/environment';
import TextField from '../../../../components/TextField';
import {
  SubscriptionAvatars,
  SubscriptionFocus,
} from '../../../../components/Subscription';

const styles = (theme) => ({
  header: {
    backgroundColor: theme.palette.navAlt.backgroundHeader,
    padding: '20px 20px 20px 60px',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    left: 5,
  },
  importButton: {
    position: 'absolute',
    top: 15,
    right: 20,
  },
  container: {
    padding: '10px 20px 20px 20px',
  },
  appBar: {
    width: '100%',
    zIndex: theme.zIndex.drawer + 1,
    backgroundColor: theme.palette.navAlt.background,
    color: theme.palette.header.text,
    borderBottom: '1px solid #5c5c5c',
  },
  title: {
    float: 'left',
  },
});

const subscription = graphql`
  subscription KillChainPhaseEditionSubscription($id: ID!) {
    killChainPhase(id: $id) {
      ...KillChainPhaseEdition_killChainPhase
    }
  }
`;

const killChainPhaseMutationFieldPatch = graphql`
  mutation KillChainPhaseEditionFieldPatchMutation(
    $id: ID!
    $input: EditInput!
  ) {
    killChainPhaseEdit(id: $id) {
      fieldPatch(input: $input) {
        ...KillChainPhaseEdition_killChainPhase
      }
    }
  }
`;

const killChainPhaseEditionFocus = graphql`
  mutation KillChainPhaseEditionFocusMutation($id: ID!, $input: EditContext!) {
    killChainPhaseEdit(id: $id) {
      contextPatch(input: $input) {
        id
      }
    }
  }
`;

const killChainPhaseValidation = (t) => Yup.object().shape({
  kill_chain_name: Yup.string().required(t('This field is required')),
  phase_name: Yup.string().required(t('This field is required')),
  phase_order: Yup.number()
    .typeError(t('The value must be a number'))
    .integer(t('The value must be a number'))
    .required(t('This field is required')),
});

class KillChainPhaseEditionContainer extends Component {
  componentDidMount() {
    const sub = requestSubscription({
      subscription,
      variables: {
        // eslint-disable-next-line
        id: this.props.killChainPhase.id,
      },
    });
    this.setState({ sub });
  }

  componentWillUnmount() {
    this.state.sub.dispose();
  }

  handleChangeFocus(name) {
    commitMutation({
      mutation: killChainPhaseEditionFocus,
      variables: {
        id: this.props.killChainPhase.id,
        input: {
          focusOn: name,
        },
      },
    });
  }

  handleSubmitField(name, value) {
    killChainPhaseValidation(this.props.t)
      .validateAt(name, { [name]: value })
      .then(() => {
        commitMutation({
          mutation: killChainPhaseMutationFieldPatch,
          variables: {
            id: this.props.killChainPhase.id,
            input: { key: name, value },
          },
        });
      })
      .catch(() => false);
  }

  render() {
    const {
      t, classes, handleClose, killChainPhase,
    } = this.props;
    const { editContext } = killChainPhase;
    const initialValues = over(
      lensProp('phase_order'),
      defaultTo(''),
      pickAll(['kill_chain_name', 'phase_name', 'phase_order'], killChainPhase),
    );
    return (
      <div>
        <div className={classes.header}>
          <IconButton
            aria-label="Close"
            className={classes.closeButton}
            onClick={handleClose.bind(this)}
          >
            <Close fontSize="small" />
          </IconButton>
          <Typography variant="h6" classes={{ root: classes.title }}>
            {t('Update a kill chain phase')}
          </Typography>
          <SubscriptionAvatars context={editContext} />
          <div className="clearfix" />
        </div>
        <div className={classes.container}>
          <Formik
            enableReinitialize={true}
            initialValues={initialValues}
            validationSchema={killChainPhaseValidation(t)}
          >
            {() => (
              <Form style={{ margin: '20px 0 20px 0' }}>
                <Field
                  component={TextField}
                  name="kill_chain_name"
                  label={t('Kill chain name')}
                  fullWidth={true}
                  onFocus={this.handleChangeFocus.bind(this)}
                  onSubmit={this.handleSubmitField.bind(this)}
                  helperText={
                    <SubscriptionFocus
                      context={editContext}
                      fieldName="kill_chain_name"
                    />
                  }
                />
                <Field
                  component={TextField}
                  name="phase_name"
                  label={t('Phase name')}
                  fullWidth={true}
                  style={{ marginTop: 20 }}
                  onFocus={this.handleChangeFocus.bind(this)}
                  onSubmit={this.handleSubmitField.bind(this)}
                  helperText={
                    <SubscriptionFocus
                      context={editContext}
                      fieldName="phase_name"
                    />
                  }
                />
                <Field
                  component={TextField}
                  name="phase_order"
                  label={t('Order')}
                  fullWidth={true}
                  type="number"
                  style={{ marginTop: 20 }}
                  onFocus={this.handleChangeFocus.bind(this)}
                  onSubmit={this.handleSubmitField.bind(this)}
                  helperText={
                    <SubscriptionFocus
                      context={editContext}
                      fieldName="phase_order"
                    />
                  }
                />
              </Form>
            )}
          </Formik>
        </div>
      </div>
    );
  }
}

KillChainPhaseEditionContainer.propTypes = {
  handleClose: PropTypes.func,
  classes: PropTypes.object,
  killChainPhase: PropTypes.object,
  theme: PropTypes.object,
  t: PropTypes.func,
};

const KillChainPhaseEditionFragment = createFragmentContainer(
  KillChainPhaseEditionContainer,
  {
    killChainPhase: graphql`
      fragment KillChainPhaseEdition_killChainPhase on KillChainPhase {
        id
        kill_chain_name
        phase_name
        phase_order
        editContext {
          name
          focusOn
        }
      }
    `,
  },
);

export default compose(
  inject18n,
  withStyles(styles, { withTheme: true }),
)(KillChainPhaseEditionFragment);
