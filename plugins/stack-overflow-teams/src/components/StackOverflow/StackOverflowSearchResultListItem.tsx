/*
 * This specific component is a modified version of https://github.com/backstage/community-plugins/blob/main/workspaces/stack-overflow/plugins/stack-overflow/src/search/StackOverflowSearchResultListItem/StackOverflowSearchResultListItem.tsx
 *
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
import {
  Avatar,
  Box,
  Chip,
  Divider,
  ListItem,
  ListItemIcon,
  Typography,
} from '@material-ui/core';
import { makeStyles, Theme } from '@material-ui/core/styles';
import { Link } from '@backstage/core-components';
import { useAnalytics } from '@backstage/core-plugin-api';
import type { ResultHighlight } from '@backstage/plugin-search-common';
import { HighlightedSearchResultText } from '@backstage/plugin-search-react';
import { decodeHtml, getTimeAgo } from '../../utils';

const useStyles = makeStyles((theme: Theme) => ({
  result: {
    alignItems: 'flex-start',
    gap: theme.spacing(2),
    padding: theme.spacing(2.5, 0),
    [theme.breakpoints.down('xs')]: {
      flexDirection: 'column',
      gap: theme.spacing(1.5),
    },
  },
  icon: {
    minWidth: 32,
    marginTop: theme.spacing(0.5),
    color: theme.palette.text.secondary,
    [theme.breakpoints.down('xs')]: {
      display: 'none',
    },
  },
  statistics: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    flexShrink: 0,
    minWidth: 76,
    gap: theme.spacing(0.5),
    paddingTop: theme.spacing(0.25),
    [theme.breakpoints.down('xs')]: {
      width: '100%',
      minWidth: 0,
      alignItems: 'center',
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
  },
  statistic: {
    color: theme.palette.text.secondary,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  answerCount: {
    color: theme.palette.text.secondary,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  answerCountPositive: {
    color: theme.palette.type === 'dark' ? '#8ED6A3' : '#176C35',
  },
  accepted: {
    height: 24,
    color: theme.palette.type === 'dark' ? '#B8EDC7' : '#135C2D',
    backgroundColor: theme.palette.type === 'dark' ? '#173E26' : '#E4F6E9',
    fontWeight: 700,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: theme.palette.type === 'dark' ? '#8BC8FF' : '#0063A6',
    fontSize: '1.05rem',
    fontWeight: 700,
    lineHeight: 1.4,
    textDecoration: 'none',
    overflowWrap: 'anywhere',
    '&:hover': {
      textDecoration: 'underline',
      textUnderlineOffset: 3,
    },
    '&:focus-visible': {
      outline: `3px solid ${theme.palette.type === 'dark' ? '#FFB679' : '#A84200'}`,
      outlineOffset: 3,
      borderRadius: 2,
    },
  },
  authorLine: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing(0.75),
    marginTop: theme.spacing(1.25),
    color: theme.palette.text.secondary,
  },
  avatar: {
    width: 24,
    height: 24,
  },
  authorLink: {
    color: theme.palette.text.primary,
    fontWeight: 600,
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  reputation: {
    color: theme.palette.text.secondary,
    fontVariantNumeric: 'tabular-nums',
  },
  role: {
    height: 22,
    fontWeight: 700,
  },
  moderator: {
    color: theme.palette.type === 'dark' ? '#B7DEFF' : '#075985',
    backgroundColor: theme.palette.type === 'dark' ? '#17344D' : '#E5F3FF',
  },
  admin: {
    color: theme.palette.type === 'dark' ? '#FFD0C7' : '#8A2417',
    backgroundColor: theme.palette.type === 'dark' ? '#4A201B' : '#FFF0ED',
  },
  tags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(0.75),
    marginTop: theme.spacing(1.5),
  },
  tag: {
    height: 26,
    color: theme.palette.type === 'dark' ? '#C8DDF0' : '#315A78',
    backgroundColor: theme.palette.type === 'dark' ? '#253746' : '#EAF3F8',
    borderRadius: 4,
    fontWeight: 600,
  },
}));

/**
 * Props for {@link StackOverflowSearchResultListItem}
 *
 * @public
 */
export type StackOverflowSearchResultListItemProps = {
  result?: any; // TODO: type to StackOverflowDocument.
  icon?: React.ReactNode;
  rank?: number;
  highlight?: ResultHighlight;
};

export const StackOverflowSearchResultListItem = (
  props: StackOverflowSearchResultListItemProps,
) => {
  const classes = useStyles();
  const { result, highlight } = props;
  const analytics = useAnalytics();

  if (!result) {
    return null;
  }

  const questionUrl = result.location?.includes('?r=')
    ? result.location
    : `${result.location}?r=Backstage_Plugin`;
  const timeAgo = getTimeAgo(result.creationDate);
  const isModerator = result.userRole === 'Moderator';
  const isAdmin = result.userRole === 'Admin';
  const answerCount = result.answers || 0;

  const handleClick = () => {
    analytics.captureEvent('discover', result.title, {
      attributes: { to: result.location },
      value: props.rank,
    });
  };

  return (
    <>
      <ListItem className={classes.result} disableGutters>
        {props.icon && (
          <ListItemIcon className={classes.icon}>{props.icon}</ListItemIcon>
        )}
        <Box className={classes.statistics} aria-label="Question statistics">
          <Typography variant="body2" className={classes.statistic}>
            {result.score || 0} {result.score === 1 ? 'vote' : 'votes'}
          </Typography>
          <Typography
            variant="body2"
            className={`${classes.answerCount} ${
              answerCount > 0 ? classes.answerCountPositive : ''
            }`}
          >
            {answerCount} {answerCount === 1 ? 'answer' : 'answers'}
          </Typography>
          {result.isAnswered && (
            <Chip label="Accepted" size="small" className={classes.accepted} />
          )}
        </Box>

        <Box className={classes.content}>
          <Link
            to={questionUrl}
            noTrack
            onClick={handleClick}
            className={classes.title}
          >
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

          <Box className={classes.authorLine}>
            {result.avatar && (
              <Avatar
                src={result.avatar}
                alt=""
                className={classes.avatar}
              />
            )}
            {result.userProfile ? (
              <Link
                to={result.userProfile}
                noTrack
                className={classes.authorLink}
              >
                {decodeHtml(result.text || result.author || 'Unknown author')}
              </Link>
            ) : (
              <Typography variant="body2" color="textPrimary">
                {decodeHtml(result.text || result.author || 'Unknown author')}
              </Typography>
            )}
            {result.userReputation !== undefined && (
              <Typography variant="body2" className={classes.reputation}>
                {Number(result.userReputation).toLocaleString()} reputation
              </Typography>
            )}
            {(isModerator || isAdmin) && (
              <Chip
                label={isModerator ? 'Moderator' : 'Admin'}
                size="small"
                className={`${classes.role} ${
                  isModerator ? classes.moderator : classes.admin
                }`}
              />
            )}
            <Typography variant="body2" color="textSecondary">
              asked {timeAgo}
            </Typography>
          </Box>

          {result.tags?.length > 0 && (
            <Box className={classes.tags} aria-label="Question tags">
              {result.tags.map(
                (tag: { name: string; location?: string; webUrl?: string }) => {
                  const tagUrl = tag.location || tag.webUrl;
                  return tagUrl ? (
                    <Link key={tag.name} to={tagUrl} noTrack>
                      <Chip
                        label={tag.name}
                        size="small"
                        clickable
                        className={classes.tag}
                      />
                    </Link>
                  ) : (
                    <Chip
                      key={tag.name}
                      label={tag.name}
                      size="small"
                      className={classes.tag}
                    />
                  );
                },
              )}
            </Box>
          )}
        </Box>
      </ListItem>
      <Divider />
    </>
  );
};
