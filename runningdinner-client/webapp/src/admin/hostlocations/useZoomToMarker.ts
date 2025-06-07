import { GeocodingResult, isDefined, isGeocodingResultValid } from "@runningdinner/shared";
import { useMap } from "@vis.gl/react-google-maps";

export function useZoomToMarker() {

  const mapRef = useMap();

  return {
    handleZoomTo: (geocodingResult?: GeocodingResult) => {
      const lat = geocodingResult?.lat;
      const lng = geocodingResult?.lng;
      if (!isDefined(lat) || !isDefined(lng)) {
        return;
      }
      if (!mapRef) {
        return;
      }
      if (!isGeocodingResultValid(geocodingResult)) {
        return;
      }
      mapRef.panTo({lat, lng});
      mapRef.setZoom(15);
    }
  }

}