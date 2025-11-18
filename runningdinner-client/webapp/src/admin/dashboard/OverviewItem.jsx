import React from 'react';
import Typography from '@mui/material/Typography';

export default class OverviewItem extends React.Component {
  render() {
    return (
      <>
        <Typography variant="subtitle2">{this.props.headline}</Typography>
        <Typography variant="body1" gutterBottom>
          {this.props.content}
        </Typography>
      </>
    );
  }
}
