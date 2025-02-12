/*
 * Copyright 2022 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react';
import { Link } from '@backstage/core-components';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Box from '@material-ui/core/Box';
import Chip from '@material-ui/core/Chip';
import { useAnalytics } from '@backstage/core-plugin-api';
import type { ResultHighlight } from '@backstage/plugin-search-common';
import { HighlightedSearchResultText } from '@backstage/plugin-search-react';
import { decodeHtml, getTimeAgo } from './utils';
import { Avatar, Typography } from '@material-ui/core';

/**
 * Props for {@link StackOverflowSearchResultListItem}
 *
 * @public
 */
export type StackOverflowSearchResultListItemProps = {
  result?: any; // TODO(emmaindal): type to StackOverflowDocument.
  icon?: React.ReactNode;
  rank?: number;
  highlight?: ResultHighlight;
};

export const StackOverflowSearchResultListItem = (
  props: StackOverflowSearchResultListItemProps,
) => {
  const { result, highlight } = props;

  const analytics = useAnalytics();

  const handleClick = () => {
    analytics.captureEvent('discover', result.title, {
      attributes: { to: result.location },
      value: props.rank,
    });
  };

  if (!result) {
    return null;
  }

  const timeAgo = getTimeAgo(result.creationDate);

  // Recording role of the user
  const userRole = result.userRole;
  const isModerator = userRole === 'Moderator';
  const isAdmin = userRole === 'Admin';

  return (
    <>
      <ListItem alignItems="center">
        {props.icon && <ListItemIcon>{props.icon}</ListItemIcon>}
        <Box
          display={'flex'}
          flexDirection={'column'}
          alignItems={'center'}
          mr={2}
          minWidth={'80px'}
        >
          <Typography variant="subtitle2" color="textSecondary">
            {result.score} votes
          </Typography>
          <Typography
            variant="subtitle2"
            color={result.answers > 0 ? 'primary' : 'textSecondary'}
            style={{
              fontWeight: result.isAnswered ? 'bold' : 'normal',
            }}
          >
            {result.answers} answers
          </Typography>
          {result.isAnswered && (
            <Typography
              variant="subtitle2"
              color="primary"
              style={{ fontWeight: 'bold' }}
            >
              ✔ Accepted
            </Typography>
          )}
        </Box>

        <Box flexWrap="wrap">
          <ListItemText
            primaryTypographyProps={{ variant: 'h6' }}
            primary={
              <Link to={result.location} noTrack onClick={handleClick}>
                {highlight?.fields?.title ? (
                  <HighlightedSearchResultText
                    text={decodeHtml(highlight.fields.title)}
                    preTag={highlight.preTag}
                    postTag={highlight.postTag}
                  />
                ) : (
                  decodeHtml(result.title)
                )}
              </Link>
            }
            secondary={
              <Box display="flex" alignItems="center">
                {/* Author Avatar */}
                {result.avatar && (
                  <Link to={result.userProfile} noTrack>
                    <Avatar
                      src={result.avatar}
                      alt={result.text}
                      style={{ width: 20, height: 20, marginRight: 8 }}
                    />
                  </Link>
                )}

                {/* Author Name and Reputation */}
                <Link key={result.text} to={result.userProfile} noTrack>
                  <Typography
                    variant="body2"
                    color="textPrimary"
                    component="span"
                  >
                    {decodeHtml(result.text)}
                  </Typography>
                </Link>

                {/* User Reputation */}
                {result.userReputation && (
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    component="span"
                    style={{ marginLeft: 4 }}
                  >
                    ({result.userReputation})
                  </Typography>
                )}

                {(isModerator || isAdmin) && (
                  <Chip
                    label={isModerator ? 'Moderator' : 'Admin'}
                    size="small"
                    style={{
                      marginTop: 6,
                      marginLeft: 8,
                      backgroundColor: isModerator ? 'lightblue' : 'lightcoral',
                      color: isModerator? 'black': '#fff',
                      fontWeight: 'bold',
                    }}
                  />
                )}

                {/* Time Ago */}
                <Typography
                  variant="body2"
                  color="textSecondary"
                  component="span"
                  style={{ marginLeft: 4 }}
                >
                  asked {timeAgo}
                </Typography>
              </Box>
            }
          />
          {result.tags &&
            result.tags.map((tag: { name: string; location: string }) => (
              <Link key={tag.name} to={tag.location} noTrack>
                <Chip label={tag.name} size="small" clickable />
              </Link>
            ))}
        </Box>
      </ListItem>
      <Divider />
    </>
  );
};
