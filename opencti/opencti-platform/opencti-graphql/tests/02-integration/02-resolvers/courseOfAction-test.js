import gql from 'graphql-tag';
import { queryAsAdmin } from '../../utils/testQuery';

const LIST_QUERY = gql`
  query coursesOfAction(
    $first: Int
    $after: ID
    $orderBy: CoursesOfActionOrdering
    $orderMode: OrderingMode
    $filters: [CoursesOfActionFiltering]
    $filterMode: FilterMode
    $search: String
  ) {
    coursesOfAction(
      first: $first
      after: $after
      orderBy: $orderBy
      orderMode: $orderMode
      filters: $filters
      filterMode: $filterMode
      search: $search
    ) {
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
  query courseOfAction($id: String!) {
    courseOfAction(id: $id) {
      id
      name
      description
      attackPatterns {
        edges {
          node {
            id
          }
        }
      }
      toStix
    }
  }
`;

describe('CourseOfAction resolver standard behavior', () => {
  let courseOfActionInternalId;
  let courseOfActionMarkingDefinitionRelationId;
  const courseOfActionStixId = 'course-of-action--1a80c59c-d839-4984-af04-04f3286d8f89';
  it('should courseOfAction created', async () => {
    const CREATE_QUERY = gql`
      mutation CourseOfActionAdd($input: CourseOfActionAddInput) {
        courseOfActionAdd(input: $input) {
          id
          name
          description
        }
      }
    `;
    // Create the courseOfAction
    const COURSE_OF_ACTION_TO_CREATE = {
      input: {
        name: 'CourseOfAction',
        stix_id_key: courseOfActionStixId,
        description: 'CourseOfAction description',
      },
    };
    const courseOfAction = await queryAsAdmin({
      query: CREATE_QUERY,
      variables: COURSE_OF_ACTION_TO_CREATE,
    });
    expect(courseOfAction).not.toBeNull();
    expect(courseOfAction.data.courseOfActionAdd).not.toBeNull();
    expect(courseOfAction.data.courseOfActionAdd.name).toEqual('CourseOfAction');
    courseOfActionInternalId = courseOfAction.data.courseOfActionAdd.id;
  });
  it('should courseOfAction loaded by internal id', async () => {
    const queryResult = await queryAsAdmin({ query: READ_QUERY, variables: { id: courseOfActionInternalId } });
    expect(queryResult).not.toBeNull();
    expect(queryResult.data.courseOfAction).not.toBeNull();
    expect(queryResult.data.courseOfAction.id).toEqual(courseOfActionInternalId);
    expect(queryResult.data.courseOfAction.toStix.length).toBeGreaterThan(5);
  });
  it('should courseOfAction loaded by stix id', async () => {
    const queryResult = await queryAsAdmin({ query: READ_QUERY, variables: { id: courseOfActionStixId } });
    expect(queryResult).not.toBeNull();
    expect(queryResult.data.courseOfAction).not.toBeNull();
    expect(queryResult.data.courseOfAction.id).toEqual(courseOfActionInternalId);
  });
  it('should courseOfAction coursesOfAction be accurate', async () => {
    const queryResult = await queryAsAdmin({
      query: READ_QUERY,
      variables: { id: '326b7708-d4cf-4020-8cd1-9726b99895db' },
    });
    expect(queryResult).not.toBeNull();
    expect(queryResult.data.courseOfAction).not.toBeNull();
    expect(queryResult.data.courseOfAction.id).toEqual('326b7708-d4cf-4020-8cd1-9726b99895db');
    expect(queryResult.data.courseOfAction.attackPatterns.edges.length).toEqual(1);
    expect(queryResult.data.courseOfAction.attackPatterns.edges[0].node.id).toEqual(
      'dcbadcd2-9359-48ac-8b86-88e38a092a2b'
    );
  });
  it('should list coursesOfAction', async () => {
    const queryResult = await queryAsAdmin({ query: LIST_QUERY, variables: { first: 10 } });
    expect(queryResult.data.coursesOfAction.edges.length).toEqual(2);
  });
  it('should update courseOfAction', async () => {
    const UPDATE_QUERY = gql`
      mutation CourseOfActionEdit($id: ID!, $input: EditInput!) {
        courseOfActionEdit(id: $id) {
          fieldPatch(input: $input) {
            id
            name
          }
        }
      }
    `;
    const queryResult = await queryAsAdmin({
      query: UPDATE_QUERY,
      variables: { id: courseOfActionInternalId, input: { key: 'name', value: ['CourseOfAction - test'] } },
    });
    expect(queryResult.data.courseOfActionEdit.fieldPatch.name).toEqual('CourseOfAction - test');
  });
  it('should context patch courseOfAction', async () => {
    const CONTEXT_PATCH_QUERY = gql`
      mutation CourseOfActionEdit($id: ID!, $input: EditContext) {
        courseOfActionEdit(id: $id) {
          contextPatch(input: $input) {
            id
          }
        }
      }
    `;
    const queryResult = await queryAsAdmin({
      query: CONTEXT_PATCH_QUERY,
      variables: { id: courseOfActionInternalId, input: { focusOn: 'description' } },
    });
    expect(queryResult.data.courseOfActionEdit.contextPatch.id).toEqual(courseOfActionInternalId);
  });
  it('should context clean courseOfAction', async () => {
    const CONTEXT_PATCH_QUERY = gql`
      mutation CourseOfActionEdit($id: ID!) {
        courseOfActionEdit(id: $id) {
          contextClean {
            id
          }
        }
      }
    `;
    const queryResult = await queryAsAdmin({
      query: CONTEXT_PATCH_QUERY,
      variables: { id: courseOfActionInternalId },
    });
    expect(queryResult.data.courseOfActionEdit.contextClean.id).toEqual(courseOfActionInternalId);
  });
  it('should add relation in courseOfAction', async () => {
    const RELATION_ADD_QUERY = gql`
      mutation CourseOfActionEdit($id: ID!, $input: RelationAddInput!) {
        courseOfActionEdit(id: $id) {
          relationAdd(input: $input) {
            id
            from {
              ... on CourseOfAction {
                markingDefinitions {
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
        id: courseOfActionInternalId,
        input: {
          fromRole: 'so',
          toRole: 'marking',
          toId: '43f586bc-bcbc-43d1-ab46-43e5ab1a2c46',
          through: 'object_marking_refs',
        },
      },
    });
    expect(queryResult.data.courseOfActionEdit.relationAdd.from.markingDefinitions.edges.length).toEqual(1);
    courseOfActionMarkingDefinitionRelationId =
      queryResult.data.courseOfActionEdit.relationAdd.from.markingDefinitions.edges[0].relation.id;
  });
  it('should delete relation in courseOfAction', async () => {
    const RELATION_DELETE_QUERY = gql`
      mutation CourseOfActionEdit($id: ID!, $relationId: ID!) {
        courseOfActionEdit(id: $id) {
          relationDelete(relationId: $relationId) {
            id
            markingDefinitions {
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
        id: courseOfActionInternalId,
        relationId: courseOfActionMarkingDefinitionRelationId,
      },
    });
    expect(queryResult.data.courseOfActionEdit.relationDelete.markingDefinitions.edges.length).toEqual(0);
  });
  it('should courseOfAction deleted', async () => {
    const DELETE_QUERY = gql`
      mutation courseOfActionDelete($id: ID!) {
        courseOfActionEdit(id: $id) {
          delete
        }
      }
    `;
    // Delete the courseOfAction
    await queryAsAdmin({
      query: DELETE_QUERY,
      variables: { id: courseOfActionInternalId },
    });
    // Verify is no longer found
    const queryResult = await queryAsAdmin({ query: READ_QUERY, variables: { id: courseOfActionStixId } });
    expect(queryResult).not.toBeNull();
    expect(queryResult.data.courseOfAction).toBeNull();
  });
});
