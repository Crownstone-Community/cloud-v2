import {TransformUtil} from "../src/modules/fingerprintTransform/TransformUtil";

test("Test dataparsing", async () => {
  let phoneA_data : MeasurementMap = {
    1: -71,
    2: -62,
    3: -56,
    4: -75,
    5: -85,
    6: -94,
    7: -72,
    8: -72,
    9: -40,
  }

  let phoneB_data : MeasurementMap = {
    1: -78,
    2: -65,
    3: -58,
    4: -79,
    5: -84,
    6: -90,
    7: -72,
    8: -74,
    9: -43,
  }

  let projection    : TransformArray = TransformUtil.getRawMap_AtoB(phoneA_data, phoneB_data);
  let normalizedMap : TransformArray = TransformUtil.getNormalizedMap(projection);
  let buckets = TransformUtil.getBuckets();
  let bucketedData = TransformUtil.fillBuckets(buckets, normalizedMap);
  let bucketedAverages = TransformUtil.getAveragedBucketMap(bucketedData);
  let interpolatedValues = TransformUtil.getInterpolatedValues(bucketedAverages);

  let transformSet = [...bucketedAverages, ...interpolatedValues].filter((item) => { return item.data[0] !== null });
  transformSet.sort((a,b) => { return b.x - a.x });

  // console.log('projection', projection);
  // console.log('normalizedMap', normalizedMap);
  // console.log('bucketedData', bucketedData);
  // console.log('bucketedAverages',bucketedAverages)
  // console.log('interpolatedValues',interpolatedValues)
  // console.log('transformSet',transformSet)

  expect(transformSet).toMatchSnapshot();

  let transformedSet = TransformUtil.transformDataset(Object.values(phoneA_data), transformSet);
  // console.log('phoneA_data',Object.values(phoneA_data))
  // console.log('phoneB_data',Object.values(phoneB_data))
  // console.log('transformedSet',transformedSet)
  let error = Object.values(phoneB_data).map((value, index) => { return value - transformedSet[index] });
  console.log(error)
  expect(transformedSet).toMatchSnapshot();
});
