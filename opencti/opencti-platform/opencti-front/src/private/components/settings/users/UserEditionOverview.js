import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import graphql from 'babel-plugin-relay/macro';
import { createFragmentContainer } from 'react-relay';
import { Formik, Form, Field } from 'formik';
import { withStyles } from '@material-ui/core/styles';
import {
  assoc,
  compose,
  difference,
  head,
  map,
  pathOr,
  pick,
  pipe,
  union,
} from 'ramda';
import * as Yup from 'yup';
import MenuItem from '@material-ui/core/MenuItem';
import { Security } from '@material-ui/icons';
import inject18n from '../../../../components/i18n';
import TextField from '../../../../components/TextField';
import SelectField from '../../../../components/SelectField';
import AutocompleteField from '../../../../components/AutocompleteField';
import { SubscriptionFocus } from '../../../../components/Subscription';
import { commitMutation, fetchQuery } from '../../../../relay/environment';

const styles = () => ({
  icon: {
    paddingTop: 4,
    display: 'inline-block',
  },
  text: {
    display: 'inline-block',
    flexGrow: 1,
    marginLeft: 10,
  },
});

const userMutationFieldPatch = graphql`
  mutation UserEditionOverviewFieldPatchMutation($id: ID!, $input: EditInput!) {
    userEdit(id: $id) {
      fieldPatch(input: $input) {
        ...UserEditionOverview_user
      }
    }
  }
`;

const userEditionOverviewFocus = graphql`
  mutation UserEditionOverviewFocusMutation($id: ID!, $input: EditContext!) {
    userEdit(id: $id) {
      contextPatch(input: $input) {
        id
      }
    }
  }
`;

export const userEditionOverviewRolesSearchQuery = graphql`
  query UserEditionOverviewRolesSearchQuery($search: String) {
    roles(search: $search) {
      edges {
        node {
          id
          name
        }
      }
    }
  }
`;

const userEditionOverviewAddRole = graphql`
  mutation UserEditionOverviewAddRoleMutation(
    $id: ID!
    $input: RelationAddInput!
  ) {
    userEdit(id: $id) {
      relationAdd(input: $input) {
        from {
          ...UserEditionOverview_user
        }
      }
    }
  }
`;

const userEditionOverviewDeleteRole = graphql`
  mutation UserEditionOverviewDeleteRoleMutation($id: ID!, $name: String!) {
    userEdit(id: $id) {
      removeRole(name: $name) {
        ...UserEditionOverview_user
      }
    }
  }
`;

const userValidation = (t) => Yup.object().shape({
  name: Yup.string().required(t('This field is required')),
  user_email: Yup.string()
    .required(t('This field is required'))
    .email(t('The value must be an email address')),
  firstname: Yup.string(),
  lastname: Yup.string(),
  language: Yup.string(),
  description: Yup.string(),
});

class UserEditionOverviewComponent extends Component {
  constructor(props) {
    super(props);
    this.state = { roles: [] };
  }

  handleChangeFocus(name) {
    commitMutation({
      mutation: userEditionOverviewFocus,
      variables: {
        id: this.props.user.id,
        input: {
          focusOn: name,
        },
      },
    });
  }

  handleSubmitField(name, value) {
    userValidation(this.props.t)
      .validateAt(name, { [name]: value })
      .then(() => {
        commitMutation({
          mutation: userMutationFieldPatch,
          variables: {
            id: this.props.user.id,
            input: { key: name, value },
          },
        });
      })
      .catch(() => false);
  }

  searchRoles(event) {
    fetchQuery(userEditionOverviewRolesSearchQuery, {
      search: event && event.target.value !== 0 ? event.target.value : '',
    }).then((data) => {
      const roles = pipe(
        pathOr([], ['roles', 'edges']),
        map((n) => ({ label: n.node.name, value: n.node.id })),
      )(data);
      this.setState({
        roles: union(this.state.roles, roles),
      });
    });
  }

  handleChangeRole(event, values) {
    const { user } = this.props;
    const fieldRoles = map((i) => ({ id: i.value, name: i.label }), values);
    const added = difference(fieldRoles, user.roles);
    const removed = difference(user.roles, fieldRoles);
    if (added.length > 0) {
      commitMutation({
        mutation: userEditionOverviewAddRole,
        variables: {
          id: user.id,
          input: {
            fromRole: 'client',
            toRole: 'position',
            toId: head(added).id,
            through: 'user_role',
          },
        },
      });
    }
    if (removed.length > 0) {
      commitMutation({
        mutation: userEditionOverviewDeleteRole,
        variables: {
          id: user.id,
          name: head(removed).name,
        },
      });
    }
  }

  render() {
    const {
      t, user, context, classes,
    } = this.props;
    const external = user.external === true;
    const userRoles = pipe(map((n) => ({ label: n.name, value: n.id })))(
      user.roles,
    );
    const initialValues = pipe(
      assoc('roles', userRoles),
      pick([
        'name',
        'description',
        'user_email',
        'firstname',
        'lastname',
        'language',
        'roles',
        'token'
      ]),
    )(user);
    return (
      <div>
        <Formik
          enableReinitialize={true}
          initialValues={initialValues}
          validationSchema={userValidation(t)}
        >
          {() => (
            <Form style={{ margin: '20px 0 20px 0' }}>
              <Field
                component={TextField}
                name="name"
                label={t('name')}
                disabled={external}
                fullWidth={true}
                onFocus={this.handleChangeFocus.bind(this)}
                onSubmit={this.handleSubmitField.bind(this)}
                helperText={
                  <SubscriptionFocus context={context} fieldName="name" />
                }
              />
              <Field
                component={TextField}
                name="user_email"
                disabled={external}
                label={t('Email address')}
                fullWidth={true}
                style={{ marginTop: 20 }}
                onFocus={this.handleChangeFocus.bind(this)}
                onSubmit={this.handleSubmitField.bind(this)}
                helperText={
                  <SubscriptionFocus context={context} fieldName="user_email" />
                }
              />
              <Field
                component={TextField}
                name="firstname"
                label={t('Firstname')}
                fullWidth={true}
                style={{ marginTop: 20 }}
                onFocus={this.handleChangeFocus.bind(this)}
                onSubmit={this.handleSubmitField.bind(this)}
                helperText={
                  <SubscriptionFocus context={context} fieldName="firstname" />
                }
              />
              <Field
                component={TextField}
                name="lastname"
                label={t('Lastname')}
                fullWidth={true}
                style={{ marginTop: 20 }}
                onFocus={this.handleChangeFocus.bind(this)}
                onSubmit={this.handleSubmitField.bind(this)}
                helperText={
                  <SubscriptionFocus context={context} fieldName="lastname" />
                }
              />
              <Field
                component={SelectField}
                name="language"
                label={t('Language')}
                fullWidth={true}
                containerstyle={{ marginTop: 20, width: '100%' }}
                onFocus={this.handleChangeFocus.bind(this)}
                onChange={this.handleSubmitField.bind(this)}
                helpertext={
                  <SubscriptionFocus context={context} fieldName="language" />
                }
              >
                <MenuItem value="auto">
                  <em>{t('Automatic')}</em>
                </MenuItem>
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="fr">Français</MenuItem>
              </Field>
              <Field
                component={AutocompleteField}
                name="roles"
                multiple={true}
                noOptionsText={t('No available options')}
                textfieldprops={{
                  label: t('Roles'),
                  helperText: (
                    <SubscriptionFocus context={context} fieldName="roles" />
                  ),
                  onFocus: this.searchRoles.bind(this),
                }}
                options={this.state.roles}
                onInputChange={this.searchRoles.bind(this)}
                onChange={this.handleChangeRole.bind(this)}
                renderOption={(option) => (
                  <React.Fragment>
                    <div className={classes.icon}>
                      <Security />
                    </div>
                    <div className={classes.text}>{option.label}</div>
                  </React.Fragment>
                )}
                style={{ marginTop: 20, width: '100%' }}
              />
              <Field
                component={TextField}
                name="token"
                disabled={true}
                label={t('Token')}
                fullWidth={true}
                style={{ marginTop: 20 }}
                onFocus={this.handleChangeFocus.bind(this)}
                onSubmit={this.handleSubmitField.bind(this)}
                helperText={
                  <SubscriptionFocus context={context} fieldName="token" />
                }
              />
              <Field
                component={TextField}
                name="description"
                label={t('Description')}
                fullWidth={true}
                multiline={true}
                rows={4}
                style={{ marginTop: 20 }}
                onFocus={this.handleChangeFocus.bind(this)}
                onSubmit={this.handleSubmitField.bind(this)}
                helperText={
                  <SubscriptionFocus
                    context={context}
                    fieldName="description"
                  />
                }
              />
            </Form>
          )}
        </Formik>
      </div>
    );
  }
}

UserEditionOverviewComponent.propTypes = {
  classes: PropTypes.object,
  theme: PropTypes.object,
  t: PropTypes.func,
  user: PropTypes.object,
  context: PropTypes.array,
};

const UserEditionOverview = createFragmentContainer(
  UserEditionOverviewComponent,
  {
    user: graphql`
      fragment UserEditionOverview_user on User {
        id
        name
        description
        external
        user_email
        firstname
        lastname
        language
        token
        roles {
          id
          name
        }
      }
    `,
  },
);

export default compose(
  inject18n,
  withStyles(styles, { withTheme: true }),
)(UserEditionOverview);
