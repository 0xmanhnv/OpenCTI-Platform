import gql from 'graphql-tag';
import { queryAsAdmin } from '../../utils/testQuery';

const LIST_QUERY = gql`
  query campaigns(
    $first: Int
    $after: ID
    $orderBy: CampaignsOrdering
    $orderMode: OrderingMode
    $filters: [CampaignsFiltering]
    $filterMode: FilterMode
    $search: String
  ) {
    campaigns(
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

const TIMESERIES_QUERY = gql`
  query campaignsTimeSeries(
    $objectId: String
    $field: String!
    $operation: StatsOperation!
    $startDate: DateTime!
    $endDate: DateTime!
    $interval: String!
    $relationType: String
    $inferred: Boolean
  ) {
    campaignsTimeSeries(
      objectId: $objectId
      field: $field
      operation: $operation
      startDate: $startDate
      endDate: $endDate
      interval: $interval
      relationType: $relationType
      inferred: $inferred
    ) {
      date
      value
    }
  }
`;

const READ_QUERY = gql`
  query campaign($id: String!) {
    campaign(id: $id) {
      id
      name
      description
      toStix
    }
  }
`;

describe('Campaign resolver standard behavior', () => {
  let campaignInternalId;
  let campaignMarkingDefinitionRelationId;
  const campaignStixId = 'campaign--76c42acb-c5d7-4f38-abf2-a8566ac89ac9';
  it('should campaign created', async () => {
    const CREATE_QUERY = gql`
      mutation CampaignAdd($input: CampaignAddInput) {
        campaignAdd(input: $input) {
          id
          name
          description
        }
      }
    `;
    // Create the campaign
    const CAMPAIGN_TO_CREATE = {
      input: {
        name: 'Campaign',
        stix_id_key: campaignStixId,
        description: 'Campaign description',
        first_seen: '2020-03-24T10:51:20+00:00',
        last_seen: '2020-03-24T10:51:20+00:00',
      },
    };
    const campaign = await queryAsAdmin({
      query: CREATE_QUERY,
      variables: CAMPAIGN_TO_CREATE,
    });
    expect(campaign).not.toBeNull();
    expect(campaign.data.campaignAdd).not.toBeNull();
    expect(campaign.data.campaignAdd.name).toEqual('Campaign');
    campaignInternalId = campaign.data.campaignAdd.id;
  });
  it('should campaign loaded by internal id', async () => {
    const queryResult = await queryAsAdmin({ query: READ_QUERY, variables: { id: campaignInternalId } });
    expect(queryResult).not.toBeNull();
    expect(queryResult.data.campaign).not.toBeNull();
    expect(queryResult.data.campaign.id).toEqual(campaignInternalId);
    expect(queryResult.data.campaign.toStix.length).toBeGreaterThan(5);
  });
  it('should campaign loaded by stix id', async () => {
    const queryResult = await queryAsAdmin({ query: READ_QUERY, variables: { id: campaignStixId } });
    expect(queryResult).not.toBeNull();
    expect(queryResult.data.campaign).not.toBeNull();
    expect(queryResult.data.campaign.id).toEqual(campaignInternalId);
  });
  it('should list campaigns', async () => {
    const queryResult = await queryAsAdmin({ query: LIST_QUERY, variables: { first: 10 } });
    expect(queryResult.data.campaigns.edges.length).toEqual(2);
  });
  it('should timeseries campaigns', async () => {
    const queryResult = await queryAsAdmin({
      query: TIMESERIES_QUERY,
      variables: {
        field: 'first_seen',
        operation: 'count',
        startDate: '2020-01-01T00:00:00+00:00',
        endDate: '2021-01-01T00:00:00+00:00',
        interval: 'month',
      },
    });
    expect(queryResult.data.campaignsTimeSeries.length).toEqual(13);
    expect(queryResult.data.campaignsTimeSeries[2].value).toEqual(1);
  });
  it("should timeseries of an entity's campaigns", async () => {
    const queryResult = await queryAsAdmin({
      query: TIMESERIES_QUERY,
      variables: {
        objectId: '82316ffd-a0ec-4519-a454-6566f8f5676c',
        field: 'first_seen',
        operation: 'count',
        startDate: '2020-01-01T00:00:00+00:00',
        endDate: '2021-01-01T00:00:00+00:00',
        interval: 'month',
        relationType: 'attributed-to',
      },
    });
    expect(queryResult.data.campaignsTimeSeries.length).toEqual(13);
    expect(queryResult.data.campaignsTimeSeries[1].value).toEqual(1);
  });
  it('should update campaign', async () => {
    const UPDATE_QUERY = gql`
      mutation CampaignEdit($id: ID!, $input: EditInput!) {
        campaignEdit(id: $id) {
          fieldPatch(input: $input) {
            id
            name
          }
        }
      }
    `;
    const queryResult = await queryAsAdmin({
      query: UPDATE_QUERY,
      variables: { id: campaignInternalId, input: { key: 'name', value: ['Campaign - test'] } },
    });
    expect(queryResult.data.campaignEdit.fieldPatch.name).toEqual('Campaign - test');
  });
  it('should context patch campaign', async () => {
    const CONTEXT_PATCH_QUERY = gql`
      mutation CampaignEdit($id: ID!, $input: EditContext) {
        campaignEdit(id: $id) {
          contextPatch(input: $input) {
            id
          }
        }
      }
    `;
    const queryResult = await queryAsAdmin({
      query: CONTEXT_PATCH_QUERY,
      variables: { id: campaignInternalId, input: { focusOn: 'description' } },
    });
    expect(queryResult.data.campaignEdit.contextPatch.id).toEqual(campaignInternalId);
  });
  it('should context clean campaign', async () => {
    const CONTEXT_PATCH_QUERY = gql`
      mutation CampaignEdit($id: ID!) {
        campaignEdit(id: $id) {
          contextClean {
            id
          }
        }
      }
    `;
    const queryResult = await queryAsAdmin({
      query: CONTEXT_PATCH_QUERY,
      variables: { id: campaignInternalId },
    });
    expect(queryResult.data.campaignEdit.contextClean.id).toEqual(campaignInternalId);
  });
  it('should add relation in campaign', async () => {
    const RELATION_ADD_QUERY = gql`
      mutation CampaignEdit($id: ID!, $input: RelationAddInput!) {
        campaignEdit(id: $id) {
          relationAdd(input: $input) {
            id
            from {
              ... on Campaign {
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
        id: campaignInternalId,
        input: {
          fromRole: 'so',
          toRole: 'marking',
          toId: '43f586bc-bcbc-43d1-ab46-43e5ab1a2c46',
          through: 'object_marking_refs',
        },
      },
    });
    expect(queryResult.data.campaignEdit.relationAdd.from.markingDefinitions.edges.length).toEqual(1);
    campaignMarkingDefinitionRelationId =
      queryResult.data.campaignEdit.relationAdd.from.markingDefinitions.edges[0].relation.id;
  });
  it('should delete relation in campaign', async () => {
    const RELATION_DELETE_QUERY = gql`
      mutation CampaignEdit($id: ID!, $relationId: ID!) {
        campaignEdit(id: $id) {
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
        id: campaignInternalId,
        relationId: campaignMarkingDefinitionRelationId,
      },
    });
    expect(queryResult.data.campaignEdit.relationDelete.markingDefinitions.edges.length).toEqual(0);
  });
  it('should campaign deleted', async () => {
    const DELETE_QUERY = gql`
      mutation campaignDelete($id: ID!) {
        campaignEdit(id: $id) {
          delete
        }
      }
    `;
    // Delete the campaign
    await queryAsAdmin({
      query: DELETE_QUERY,
      variables: { id: campaignInternalId },
    });
    // Verify is no longer found
    const queryResult = await queryAsAdmin({ query: READ_QUERY, variables: { id: campaignStixId } });
    expect(queryResult).not.toBeNull();
    expect(queryResult.data.campaign).toBeNull();
  });
});
