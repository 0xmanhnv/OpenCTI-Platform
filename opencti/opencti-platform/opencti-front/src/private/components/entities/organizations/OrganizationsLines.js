import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { createPaginationContainer } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import { pathOr } from 'ramda';
import ListLinesContent from '../../../../components/list_lines/ListLinesContent';
import { OrganizationLine, OrganizationLineDummy } from './OrganizationLine';
import { setNumberOfElements } from '../../../../utils/Number';

const nbOfRowsToLoad = 25;

class OrganizationsLines extends Component {
  componentDidUpdate(prevProps) {
    setNumberOfElements(
      prevProps,
      this.props,
      'organizations',
      this.props.setNumberOfElements.bind(this),
    );
  }

  render() {
    const {
      initialLoading,
      dataColumns,
      relay,
      paginationOptions,
      onTagClick,
    } = this.props;
    return (
      <ListLinesContent
        initialLoading={initialLoading}
        loadMore={relay.loadMore.bind(this)}
        hasMore={relay.hasMore.bind(this)}
        isLoading={relay.isLoading.bind(this)}
        dataList={pathOr([], ['organizations', 'edges'], this.props.data)}
        globalCount={pathOr(
          nbOfRowsToLoad,
          ['organizations', 'pageInfo', 'globalCount'],
          this.props.data,
        )}
        LineComponent={<OrganizationLine />}
        DummyLineComponent={<OrganizationLineDummy />}
        dataColumns={dataColumns}
        nbOfRowsToLoad={nbOfRowsToLoad}
        paginationOptions={paginationOptions}
        onTagClick={onTagClick.bind(this)}
      />
    );
  }
}

OrganizationsLines.propTypes = {
  classes: PropTypes.object,
  paginationOptions: PropTypes.object,
  dataColumns: PropTypes.object.isRequired,
  data: PropTypes.object,
  relay: PropTypes.object,
  initialLoading: PropTypes.bool,
  onTagClick: PropTypes.func,
  setNumberOfElements: PropTypes.func,
};

export const organizationsLinesQuery = graphql`
  query OrganizationsLinesPaginationQuery(
    $search: String
    $count: Int!
    $cursor: ID
    $orderBy: OrganizationsOrdering
    $orderMode: OrderingMode
    $filters: [OrganizationsFiltering]
  ) {
    ...OrganizationsLines_data
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
  OrganizationsLines,
  {
    data: graphql`
      fragment OrganizationsLines_data on Query
        @argumentDefinitions(
          search: { type: "String" }
          count: { type: "Int", defaultValue: 25 }
          cursor: { type: "ID" }
          orderBy: { type: "OrganizationsOrdering", defaultValue: "name" }
          orderMode: { type: "OrderingMode", defaultValue: "asc" }
          filters: { type: "[OrganizationsFiltering]" }
        ) {
        organizations(
          search: $search
          first: $count
          after: $cursor
          orderBy: $orderBy
          orderMode: $orderMode
          filters: $filters
        ) @connection(key: "Pagination_organizations") {
          edges {
            node {
              id
              name
              description
              ...OrganizationLine_node
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
      return props.data && props.data.organizations;
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
    query: organizationsLinesQuery,
  },
);
