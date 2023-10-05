import React from 'react'
import {PageTitle} from "../../common/theme/typography/Tags";
import {AddressLocation, LocalDate} from "@runningdinner/shared";

export default class DashboardTitle extends React.Component {
  render() {
    const basicDetails = this.props.basicDetails;
    const { date, title, zip, city } =  basicDetails;

    return (
        <PageTitle>
          {title} in <AddressLocation cityName={city} zip={zip} /> am <LocalDate date={date} />
        </PageTitle>
    );
  }
}
