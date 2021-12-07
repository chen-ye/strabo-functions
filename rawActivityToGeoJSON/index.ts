import { AzureFunction, Context } from "@azure/functions";

interface RawActivity {
  id: String;
  streams: {
    latlng?: ActivityStream<GeoJSON.Position>;
    time?: ActivityStream<Number>;
    altitude?: ActivityStream<Number>;
    velocity_smooth?: ActivityStream<Number>;
    heartrate?: ActivityStream<Number>;
    cadence?: ActivityStream<Number>;
    watts?: ActivityStream<Number>;
    temp?: ActivityStream<Number>;
    moving?: ActivityStream<Boolean>;
    grade_smooth?: ActivityStream<Number>;
  };
}

interface ActivityStream<T> {
  data: T[];
  series_type: String;
  original_size: Number;
  resolution: String;
}

interface ActivityPointFeature extends GeoJSON.Feature<GeoJSON.Point> {
  properties: {
    activity_id: String;
    time?: Number;
    altitude?: Number;
    velocity_smooth?: Number;
    heartrate?: Number;
    cadence?: Number;
    watts?: Number;
    temp?: Number;
    moving?: Number;
    grade_smooth?: Number;
  };
}

const handleRawActivityUpdate: AzureFunction = async function (
  context: Context,
  rawActivities: RawActivity[]
): Promise<void> {
  if (rawActivities) {
    const allPointFeatures: ActivityPointFeature[] = rawActivities.flatMap(
      (rawActivity) => {
        const streams = rawActivity?.streams;
        const latLngStream = streams?.latlng;
        if (!latLngStream) {
          return [];
        }
        return latLngStream.data.map((latLng, i) => ({
          id: `${rawActivity.id}_${i}`,
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: latLng,
          },
          properties: {
            activity_id: rawActivity.id,
            ...Object.fromEntries(
              Object.entries(streams)
                .filter(([streamId, stream]) => streamId !== "latlng")
                .map(([streamId, stream]) => [streamId, stream.data[i]])
            ),
          },
        }));
      }
    );
    context.bindings.activityPointFeatures = JSON.stringify(allPointFeatures);
    // context.bindings.activityPointFeatures = JSON.stringify(
    //   allPointFeatures[0]
    // );
    console.log(`Inserting ${allPointFeatures.length} points.`);
  }
};

export default handleRawActivityUpdate;
