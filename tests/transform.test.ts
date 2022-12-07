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

test("With actual data", async () => {
  let data_iphone_1 = {
    '12399_Min:26559': -70.11111111111111,
    '15433_Min:6247': -75.55555555555556,
    '17452_Min:54653': -87,
    '18652_Min:50338': -74,
    '20161_Min:10414': -74.8,
    '20675_Min:31553': -79,
    '23546_Min:6110': -81.44444444444444,
    '24959_Min:41807': -87.5,
    '26910_Min:44873': -53.9,
    '302_Min:11314': -60,
    '3145_Min:34773': -70.875,
    '32562_Min:44536': -59.9,
    '34060_Min:7621': -77.88888888888889,
    '36655_Min:39097': -69.6,
    '38643_Min:9749': -87.2,
    '46798_Min:59413': -80.22222222222223,
    '47254_Min:57646': -79,
    '47912_Min:57777': -90,
    '51826_Min:3597': -73.5,
    '53424_Min:12784': -83.44444444444444,
    '56053_Min:25176': -70.4,
    '64810_Min:33239': -86.66666666666667,
    '8569_Min:45914': -73.625,
    '9524_Min:56756': -79
  }
  let data_ipad_1 = {
    '12399_Min:26559': -67.77777777777777,
    '15433_Min:6247': -72.33333333333333,
    '17452_Min:54653': -79.375,
    '18652_Min:50338': -69.2,
    '20161_Min:10414': -69.5,
    '20675_Min:31553': -75.6,
    '23546_Min:6110': -79,
    '24959_Min:41807': -79,
    '26910_Min:44873': -52.4,
    '302_Min:11314': -57.2,
    '3145_Min:34773': -69,
    '32562_Min:44536': -66.8,
    '34060_Min:7621': -77,
    '36655_Min:39097': -73.11111111111111,
    '38643_Min:9749': -77.66666666666667,
    '46798_Min:59413': -78.44444444444444,
    '47254_Min:57646': -72,
    '47912_Min:57777': -81.5,
    '51826_Min:3597': -75.71428571428571,
    '53424_Min:12784': -83,
    '56053_Min:25176': -68.4,
    '64810_Min:33239': -79.4,
    '8569_Min:45914': -72.42857142857143,
    '9524_Min:56756': -74.125
  }

  let data_ipad_2 = {
    '11282_Min:27384': -85.14285714285714,
    '12399_Min:26559': -57.1,
    '15433_Min:6247': -75.55555555555556,
    '15968_Min:23173': -90.33333333333333,
    '17452_Min:54653': -82.25,
    '18652_Min:50338': -73.71428571428571,
    '19567_Min:61824': -89.2,
    '20161_Min:10414': -60.8,
    '20675_Min:31553': -76.77777777777777,
    '23546_Min:6110': -78.77777777777777,
    '24511_Min:2529': -86.5,
    '24959_Min:41807': -81.11111111111111,
    '26910_Min:44873': -45.4,
    '302_Min:11314': -56,
    '3145_Min:34773': -67.8,
    '32562_Min:44536': -70.3,
    '34060_Min:7621': -77.5,
    '34819_Min:14002': -87.66666666666667,
    '36655_Min:39097': -61.3,
    '38643_Min:9749': -77.125,
    '46798_Min:59413': -86.71428571428571,
    '47254_Min:57646': -79.625,
    '47912_Min:57777': -84.8,
    '50001_Min:43540': -90,
    '51826_Min:3597': -72.1,
    '53424_Min:12784': -77.1,
    '56053_Min:25176': -63.6,
    '64810_Min:33239': -76.5,
    '8569_Min:45914': -63.1,
    '9524_Min:56756': -86.5
  }
  let data_iphone_2 ={
    '12399_Min:26559': -72.6,
    '15433_Min:6247': -69.4,
    '17452_Min:54653': -87.22222222222223,
    '18652_Min:50338': -82.11111111111111,
    '20161_Min:10414': -70,
    '20675_Min:31553': -79.9,
    '23546_Min:6110': -73.9,
    '24959_Min:41807': -82.75,
    '26910_Min:44873': -46.9,
    '302_Min:11314': -61.7,
    '3145_Min:34773': -72.3,
    '32562_Min:44536': -76.4,
    '34060_Min:7621': -78.7,
    '36655_Min:39097': -65.3,
    '38643_Min:9749': -88.14285714285714,
    '46798_Min:59413': -87.11111111111111,
    '47254_Min:57646': -78.2,
    '47912_Min:57777': -87.4,
    '51826_Min:3597': -75.5,
    '53424_Min:12784': -74.4,
    '56053_Min:25176': -62.1,
    '64810_Min:33239': -81.88888888888889,
    '8569_Min:45914': -68.7,
    '9524_Min:56756': -86.75
  }

  let sets_From = [data_ipad_1, data_ipad_2];
  let sets_To = [data_iphone_1, data_iphone_2];

  let ipadToIphone = TransformUtil.getTransFormSet(sets_From, sets_To);
  let iphoneToIpad = TransformUtil.getTransFormSet(sets_To, sets_From);

  expect(ipadToIphone).toMatchSnapshot();
  expect(iphoneToIpad).toMatchSnapshot();
});
