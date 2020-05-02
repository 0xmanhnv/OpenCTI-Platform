import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { createPaginationContainer } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import { pathOr } from 'ramda';
import ListLinesContent from '../../../../components/list_lines/ListLinesContent';
import { IndicatorLine, IndicatorLineDummy } from './IndicatorLine';
import { setNumberOfElements } from '../../../../utils/Number';

const nbOfRowsToLoad = 25;

class IndicatorsLines extends Component {
  componentDidUpdate(prevProps) {
    setNumberOfElements(
      prevProps,
      this.props,
      'indicators',
      this.props.setNumberOfElements.bind(this),
    );
  }

  render() {
    const {
      initialLoading,
      dataColumns,
      relay,
      onTagClick,
      paginationOptions,
    } = this.props;
    return (
      <ListLinesContent
        initialLoading={initialLoading}
        loadMore={relay.loadMore.bind(this)}
        hasMore={relay.hasMore.bind(this)}
        isLoading={relay.isLoading.bind(this)}
        dataList={pathOr([], ['indicators', 'edges'], this.props.data)}
        globalCount={pathOr(
          nbOfRowsToLoad,
          ['indicators', 'pageInfo', 'globalCount'],
          this.props.data,
        )}
        LineComponent={<IndicatorLine />}
        DummyLineComponent={<IndicatorLineDummy />}
        dataColumns={dataColumns}
        nbOfRowsToLoad={nbOfRowsToLoad}
        onTagClick={onTagClick.bind(this)}
        paginationOptions={paginationOptions}
      />
    );
  }
}

IndicatorsLines.propTypes = {
  classes: PropTypes.object,
  paginationOptions: PropTypes.object,
  dataColumns: PropTypes.object.isRequired,
  data: PropTypes.object,
  relay: PropTypes.object,
  indicators: PropTypes.object,
  initialLoading: PropTypes.bool,
  onTagClick: PropTypes.func,
  setNumberOfElements: PropTypes.func,
};

export const indicatorsLinesQuery = graphql`
  query IndicatorsLinesPaginationQuery(
    $search: String
    $count: Int!
    $cursor: ID
    $filters: [IndicatorsFiltering]
    $orderBy: IndicatorsOrdering
    $orderMode: OrderingMode
  ) {
    ...IndicatorsLines_data
      @arguments(
        search: $search
        count: $count
        cursor: $cursor
        filters: $filters
        orderBy: $orderBy
        orderMode: $orderMode
      )
  }
`;

export default createPaginationContainer(
  IndicatorsLines,
  {
    data: graphql`
      fragment IndicatorsLines_data on Query
        @argumentDefinitions(
          search: { type: "String" }
          count: { type: "Int", defaultValue: 25 }
          cursor: { type: "ID" }
          filters: { type: "[IndicatorsFiltering]" }
          orderBy: { type: "IndicatorsOrdering", defaultValue: "valid_from" }
          orderMode: { type: "OrderingMode", defaultValue: "desc" }
        ) {
        indicators(
          search: $search
          first: $count
          after: $cursor
          filters: $filters
          orderBy: $orderBy
          orderMode: $orderMode
        ) @connection(key: "Pagination_indicators") {
          edges {
            node {
              id
              ...IndicatorLine_node
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
      return props.data && props.data.indicators;
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
        filters: fragmentVariables.filters,
        orderBy: fragmentVariables.orderBy,
        orderMode: fragmentVariables.orderMode,
      };
    },
    query: indicatorsLinesQuery,
  },
);
