import { makeStyles, Theme, Grid, Paper, List } from '@material-ui/core';
import { CatalogSearchResultListItem } from '@backstage/plugin-catalog';
import {
  catalogApiRef,
  CATALOG_FILTER_EXISTS,
} from '@backstage/plugin-catalog-react';
import { SearchType } from '@backstage/plugin-search';
import {
  SearchBar,
  SearchFilter,
  SearchResult,
  SearchPagination,
  useSearch,
  DefaultResultListItem,
} from '@backstage/plugin-search-react';
import { CatalogIcon, Content, Header, Page } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import {
  StackOverflowIcon,
  StackOverflowSearchResultListItem,
} from '@stackoverflow/backstage-plugin-stack-overflow-teams';

const useStyles = makeStyles((theme: Theme) => ({
  bar: {
    padding: theme.spacing(1, 0),
  },
  filters: {
    padding: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
  filter: {
    '& + &': {
      marginTop: theme.spacing(2.5),
    },
  },
}));
const SearchPage = () => {
  const classes = useStyles();
  const { types } = useSearch();
  const catalogApi = useApi(catalogApiRef);
  return (
    <Page themeId="home">
      <Header title="Search" />
      <Content>
        <Grid container direction="row">
          <Grid item xs={12}>
            <Paper className={classes.bar}>
              <SearchBar />
            </Paper>
          </Grid>
          <Grid item xs={3}>
            <SearchType.Accordion
              name="Result Type"
              defaultValue="software-catalog"
              types={[
                {
                  value: 'software-catalog',
                  name: 'Software Catalog',
                  icon: <CatalogIcon />,
                },
                {
                  value: 'stack-overflow',
                  name: 'Stack Internal',
                  icon: <StackOverflowIcon />,
                },
              ]}
            />
            <Paper className={classes.filters}>
              {types.includes('techdocs') && (
                <SearchFilter.Select
                  className={classes.filter}
                  label="Entity"
                  name="name"
                  values={async () => {
                    // Return a list of entities which are documented.
                    const { items } = await catalogApi.getEntities({
                      fields: ['metadata.name'],
                      filter: {
                        'metadata.annotations.backstage.io/techdocs-ref':
                          CATALOG_FILTER_EXISTS,
                      },
                    });
                    const names = items.map(entity => entity.metadata.name);
                    names.sort();
                    return names;
                  }}
                />
              )}
              <SearchFilter.Select
                className={classes.filter}
                label="Kind"
                name="kind"
                values={['Component', 'Template']}
              />
              <SearchFilter.Checkbox
                className={classes.filter}
                label="Lifecycle"
                name="lifecycle"
                values={['experimental', 'production']}
              />
            </Paper>
          </Grid>{' '}
          <Grid item xs={9}>
            <SearchPagination />
            <SearchResult>
              {({ results }) => (
                <List>
                  {results.map(result => {
                    switch (result.type) {
                      case 'software-catalog':
                        return (
                          <CatalogSearchResultListItem
                            key={result.document.location}
                            icon={<CatalogIcon />}
                            result={result.document}
                            highlight={result.highlight}
                          />
                        );
                      case 'stack-overflow':
                        return (
                          <StackOverflowSearchResultListItem
                            icon={<StackOverflowIcon />}
                            key={result.document.location}
                            result={result.document}
                          />
                        );
                      default:
                        return (
                          <DefaultResultListItem
                            key={result.document.location}
                            result={result.document}
                            highlight={result.highlight}
                          />
                        );
                    }
                  })}
                </List>
              )}
            </SearchResult>
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
};
export const searchPage = <SearchPage />;
