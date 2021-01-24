import React from 'react'
import {PageTitle} from "../../common/theme/typography/Tags";
import {AddressLocation} from "../../shared/AddressLocation";
import {LocalDate} from "../../shared/date/LocalDate";

export default class DashboardTitle extends React.Component {
  render() {
    const basicDetails = this.props.basicDetails;
    const { date } =  basicDetails;
    const { title } =  basicDetails;
    const { zip, city } =  basicDetails;

    return (
        <PageTitle>
          {title} in <AddressLocation cityName={city} zip={zip}></AddressLocation> am <LocalDate date={date}></LocalDate>
        </PageTitle>
    );
  }
}
