import gql from 'graphql-tag';
import { v5 as uuid5 } from 'uuid';
import { queryAsAdmin } from '../../utils/testQuery';

const LIST_QUERY = gql`
  query roles($first: Int, $after: ID, $orderBy: RolesOrdering, $orderMode: OrderingMode, $search: String) {
    roles(first: $first, after: $after, orderBy: $orderBy, orderMode: $orderMode, search: $search) {
      edges {
        node {
          id
          name
          description
        }
      }
    }
  }
`;

const READ_QUERY = gql`
  query role($id: String!) {
    role(id: $id) {
      id
      name
      description
    }
  }
`;

describe('Role resolver standard behavior', () => {
  let roleInternalId;
  it('should role created', async () => {
    const CREATE_QUERY = gql`
      mutation RoleAdd($input: RoleAddInput) {
        roleAdd(input: $input) {
          id
          name
          description
        }
      }
    `;
    // Create the role
    const ROLE_TO_CREATE = {
      input: {
        name: 'Role',
        description: 'Role description',
      },
    };
    const role = await queryAsAdmin({
      query: CREATE_QUERY,
      variables: ROLE_TO_CREATE,
    });
    expect(role).not.toBeNull();
    expect(role.data.roleAdd).not.toBeNull();
    expect(role.data.roleAdd.name).toEqual('Role');
    roleInternalId = role.data.roleAdd.id;
  });
  it('should role loaded by internal id', async () => {
    const queryResult = await queryAsAdmin({ query: READ_QUERY, variables: { id: roleInternalId } });
    expect(queryResult).not.toBeNull();
    expect(queryResult.data.role).not.toBeNull();
    expect(queryResult.data.role.id).toEqual(roleInternalId);
  });
  it('should list roles', async () => {
    const queryResult = await queryAsAdmin({ query: LIST_QUERY, variables: { first: 10 } });
    expect(queryResult.data.roles.edges.length).toEqual(3);
  });
  it('should list capabilities', async () => {
    const LIST_CAPABILITIES_QUERY = gql`
      query capabilities($first: Int) {
        capabilities(first: $first) {
          edges {
            node {
              id
              name
              description
            }
          }
        }
      }
    `;
    const queryResult = await queryAsAdmin({ query: LIST_CAPABILITIES_QUERY, variables: { first: 50 } });
    expect(queryResult.data.capabilities.edges.length).toEqual(19);
  });
  it('should update role', async () => {
    const UPDATE_QUERY = gql`
      mutation RoleEdit($id: ID!, $input: EditInput!) {
        roleEdit(id: $id) {
          fieldPatch(input: $input) {
            id
            name
          }
        }
      }
    `;
    const queryResult = await queryAsAdmin({
      query: UPDATE_QUERY,
      variables: { id: roleInternalId, input: { key: 'name', value: ['Role - test'] } },
    });
    expect(queryResult.data.roleEdit.fieldPatch.name).toEqual('Role - test');
  });
  it('should context patch role', async () => {
    const CONTEXT_PATCH_QUERY = gql`
      mutation RoleEdit($id: ID!, $input: EditContext) {
        roleEdit(id: $id) {
          contextPatch(input: $input) {
            id
          }
        }
      }
    `;
    const queryResult = await queryAsAdmin({
      query: CONTEXT_PATCH_QUERY,
      variables: { id: roleInternalId, input: { focusOn: 'description' } },
    });
    expect(queryResult.data.roleEdit.contextPatch.id).toEqual(roleInternalId);
  });
  it('should context clean role', async () => {
    const CONTEXT_PATCH_QUERY = gql`
      mutation RoleEdit($id: ID!) {
        roleEdit(id: $id) {
          contextClean {
            id
          }
        }
      }
    `;
    const queryResult = await queryAsAdmin({
      query: CONTEXT_PATCH_QUERY,
      variables: { id: roleInternalId },
    });
    expect(queryResult.data.roleEdit.contextClean.id).toEqual(roleInternalId);
  });
  it('should add relation in role', async () => {
    const RELATION_ADD_QUERY = gql`
      mutation RoleEdit($id: ID!, $input: RelationAddInput!) {
        roleEdit(id: $id) {
          relationAdd(input: $input) {
            id
            from {
              ... on Role {
                capabilities {
                  id
                  name
                }
              }
            }
          }
        }
      }
    `;
    const queryResult = await queryAsAdmin({
      query: RELATION_ADD_QUERY,
      variables: {
        id: roleInternalId,
        input: {
          fromRole: 'position',
          toId: uuid5('KNOWLEDGE', uuid5.DNS),
          toRole: 'capability',
          through: 'role_capability',
        },
      },
    });
    expect(queryResult.data.roleEdit.relationAdd.from.capabilities.length).toEqual(1);
    expect(queryResult.data.roleEdit.relationAdd.from.capabilities[0].name).toEqual('KNOWLEDGE');
  });
  it('should remove capability in role', async () => {
    const REMOVE_CAPABILITY_QUERY = gql`
      mutation RoleEdit($id: ID!, $name: String!) {
        roleEdit(id: $id) {
          removeCapability(name: $name) {
            id
            capabilities {
              id
            }
          }
        }
      }
    `;
    const queryResult = await queryAsAdmin({
      query: REMOVE_CAPABILITY_QUERY,
      variables: {
        id: roleInternalId,
        name: 'KNOWLEDGE',
      },
    });
    expect(queryResult.data.roleEdit.removeCapability.capabilities.length).toEqual(0);
  });
  it('should role deleted', async () => {
    const DELETE_QUERY = gql`
      mutation roleDelete($id: ID!) {
        roleEdit(id: $id) {
          delete
        }
      }
    `;
    // Delete the role
    await queryAsAdmin({
      query: DELETE_QUERY,
      variables: { id: roleInternalId },
    });
    // Verify is no longer found
    const queryResult = await queryAsAdmin({ query: READ_QUERY, variables: { id: roleInternalId } });
    expect(queryResult).not.toBeNull();
    expect(queryResult.data.role).toBeNull();
  });
});
