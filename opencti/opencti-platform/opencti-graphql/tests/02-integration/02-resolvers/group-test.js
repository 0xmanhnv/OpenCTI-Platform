import gql from 'graphql-tag';
import { queryAsAdmin } from '../../utils/testQuery';

const LIST_QUERY = gql`
  query groups($first: Int, $after: ID, $orderBy: GroupsOrdering, $orderMode: OrderingMode, $search: String) {
    groups(first: $first, after: $after, orderBy: $orderBy, orderMode: $orderMode, search: $search) {
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
  query group($id: String!) {
    group(id: $id) {
      id
      name
      description
    }
  }
`;

describe('Group resolver standard behavior', () => {
  let groupInternalId;
  let groupMarkingDefinitionRelationId;
  it('should group created', async () => {
    const CREATE_QUERY = gql`
      mutation GroupAdd($input: GroupAddInput) {
        groupAdd(input: $input) {
          id
          name
          description
        }
      }
    `;
    // Create the group
    const GROUP_TO_CREATE = {
      input: {
        name: 'Group',
        description: 'Group description',
      },
    };
    const group = await queryAsAdmin({
      query: CREATE_QUERY,
      variables: GROUP_TO_CREATE,
    });
    expect(group).not.toBeNull();
    expect(group.data.groupAdd).not.toBeNull();
    expect(group.data.groupAdd.name).toEqual('Group');
    groupInternalId = group.data.groupAdd.id;
  });
  it('should group loaded by internal id', async () => {
    const queryResult = await queryAsAdmin({ query: READ_QUERY, variables: { id: groupInternalId } });
    expect(queryResult).not.toBeNull();
    expect(queryResult.data.group).not.toBeNull();
    expect(queryResult.data.group.id).toEqual(groupInternalId);
  });
  it('should list groups', async () => {
    const queryResult = await queryAsAdmin({ query: LIST_QUERY, variables: { first: 10 } });
    expect(queryResult.data.groups.edges.length).toEqual(1);
  });
  it('should update group', async () => {
    const UPDATE_QUERY = gql`
      mutation GroupEdit($id: ID!, $input: EditInput!) {
        groupEdit(id: $id) {
          fieldPatch(input: $input) {
            id
            name
          }
        }
      }
    `;
    const queryResult = await queryAsAdmin({
      query: UPDATE_QUERY,
      variables: { id: groupInternalId, input: { key: 'name', value: ['Group - test'] } },
    });
    expect(queryResult.data.groupEdit.fieldPatch.name).toEqual('Group - test');
  });
  it('should context patch group', async () => {
    const CONTEXT_PATCH_QUERY = gql`
      mutation GroupEdit($id: ID!, $input: EditContext) {
        groupEdit(id: $id) {
          contextPatch(input: $input) {
            id
          }
        }
      }
    `;
    const queryResult = await queryAsAdmin({
      query: CONTEXT_PATCH_QUERY,
      variables: { id: groupInternalId, input: { focusOn: 'description' } },
    });
    expect(queryResult.data.groupEdit.contextPatch.id).toEqual(groupInternalId);
  });
  it('should context clean group', async () => {
    const CONTEXT_PATCH_QUERY = gql`
      mutation GroupEdit($id: ID!) {
        groupEdit(id: $id) {
          contextClean {
            id
          }
        }
      }
    `;
    const queryResult = await queryAsAdmin({
      query: CONTEXT_PATCH_QUERY,
      variables: { id: groupInternalId },
    });
    expect(queryResult.data.groupEdit.contextClean.id).toEqual(groupInternalId);
  });
  it('should add relation in group', async () => {
    const RELATION_ADD_QUERY = gql`
      mutation GroupEdit($id: ID!, $input: RelationAddInput!) {
        groupEdit(id: $id) {
          relationAdd(input: $input) {
            id
            from {
              ... on Group {
                permissions {
                  edges {
                    node {
                      id
                    }
                    relation {
                      id
                    }
                  }
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
        id: groupInternalId,
        input: {
          fromRole: 'allowed',
          toId: '43f586bc-bcbc-43d1-ab46-43e5ab1a2c46',
          toRole: 'allow',
          through: 'permission',
        },
      },
    });
    expect(queryResult.data.groupEdit.relationAdd.from.permissions.edges.length).toEqual(1);
    groupMarkingDefinitionRelationId = queryResult.data.groupEdit.relationAdd.from.permissions.edges[0].relation.id;
  });
  it('should delete relation in group', async () => {
    const RELATION_DELETE_QUERY = gql`
      mutation GroupEdit($id: ID!, $relationId: ID!) {
        groupEdit(id: $id) {
          relationDelete(relationId: $relationId) {
            id
            permissions {
              edges {
                node {
                  id
                }
              }
            }
          }
        }
      }
    `;
    const queryResult = await queryAsAdmin({
      query: RELATION_DELETE_QUERY,
      variables: {
        id: groupInternalId,
        relationId: groupMarkingDefinitionRelationId,
      },
    });
    expect(queryResult.data.groupEdit.relationDelete.permissions.edges.length).toEqual(0);
  });
  it('should group deleted', async () => {
    const DELETE_QUERY = gql`
      mutation groupDelete($id: ID!) {
        groupEdit(id: $id) {
          delete
        }
      }
    `;
    // Delete the group
    await queryAsAdmin({
      query: DELETE_QUERY,
      variables: { id: groupInternalId },
    });
    // Verify is no longer found
    const queryResult = await queryAsAdmin({ query: READ_QUERY, variables: { id: groupInternalId } });
    expect(queryResult).not.toBeNull();
    expect(queryResult.data.group).toBeNull();
  });
});
