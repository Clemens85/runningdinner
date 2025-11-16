import React from 'react';

function AddressLocation(props) {
  const location = props.zip + ' ' + props.cityName;

  if (props.street && props.street.length > 0) {
    return (
      <>
        {location}
        <br />
        <span>
          {props.street} {props.streetNr}
        </span>
      </>
    );
  }
  return <>{location}</>;
}

export { AddressLocation };
