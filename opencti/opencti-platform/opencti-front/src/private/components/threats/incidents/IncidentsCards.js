import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { createPaginationContainer } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import { pathOr } from 'ramda';
import ListCardsContent from '../../../../components/list_cards/ListCardsContent';
import { IncidentCard, IncidentCardDummy } from './IncidentCard';
import { setNumberOfElements } from '../../../../utils/Number';

const nbOfCardsToLoad = 25;

class IncidentsCards extends Component {
  componentDidUpdate(prevProps) {
    setNumberOfElements(
      prevProps,
      this.props,
      'incidents',
      this.props.setNumberOfElements.bind(this),
    );
  }

  render() {
    const { initialLoading, relay, onTagClick } = this.props;
    return (
      <ListCardsContent
        initialLoading={initialLoading}
        loadMore={relay.loadMore.bind(this)}
        hasMore={relay.hasMore.bind(this)}
        isLoading={relay.isLoading.bind(this)}
        dataList={pathOr([], ['incidents', 'edges'], this.props.data)}
        globalCount={pathOr(
          nbOfCardsToLoad,
          ['incidents', 'pageInfo', 'globalCount'],
          this.props.data,
        )}
        CardComponent={<IncidentCard />}
        DummyCardComponent={<IncidentCardDummy />}
        nbOfCardsToLoad={nbOfCardsToLoad}
        onTagClick={onTagClick.bind(this)}
      />
    );
  }
}

IncidentsCards.propTypes = {
  classes: PropTypes.object,
  paginationOptions: PropTypes.object,
  data: PropTypes.object,
  relay: PropTypes.object,
  incidents: PropTypes.object,
  initialLoading: PropTypes.bool,
  searchTerm: PropTypes.string,
  onTagClick: PropTypes.func,
  setNumberOfElements: PropTypes.func,
};

export const incidentsCardsQuery = graphql`
  query IncidentsCardsPaginationQuery(
    $search: String
    $count: Int!
    $cursor: ID
    $orderBy: IncidentsOrdering
    $orderMode: OrderingMode
    $filters: [IncidentsFiltering]
  ) {
    ...IncidentsCards_data
      @arguments(
        search: $search
        count: $count
        cursor: $cursor
        orderBy: $orderBy
        orderMode: $orderMode
        filters: $filters
      )
  }
`;

export default createPaginationContainer(
  IncidentsCards,
  {
    data: graphql`
      fragment IncidentsCards_data on Query
        @argumentDefinitions(
          search: { type: "String" }
          count: { type: "Int", defaultValue: 25 }
          cursor: { type: "ID" }
          orderBy: { type: "IncidentsOrdering", defaultValue: "name" }
          orderMode: { type: "OrderingMode", defaultValue: "asc" }
          filters: { type: "[IncidentsFiltering]" }
        ) {
        incidents(
          search: $search
          first: $count
          after: $cursor
          orderBy: $orderBy
          orderMode: $orderMode
          filters: $filters
        ) @connection(key: "Pagination_incidents") {
          edges {
            node {
              id
              name
              description
              ...IncidentCard_node
            }
          }
          pageInfo {
            endCursor
            hasNextPage
            globalCount
          }
        }
      }
    `,
  },
  {
    direction: 'forward',
    getConnectionFromProps(props) {
      return props.data && props.data.incidents;
    },
    getFragmentVariables(prevVars, totalCount) {
      return {
        ...prevVars,
        count: totalCount,
      };
    },
    getVariables(props, { count, cursor }, fragmentVariables) {
      return {
        search: fragmentVariables.search,
        count,
        cursor,
        orderBy: fragmentVariables.orderBy,
        orderMode: fragmentVariables.orderMode,
        filters: fragmentVariables.filters,
      };
    },
    query: incidentsCardsQuery,
  },
);
