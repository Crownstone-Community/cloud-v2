
test("Test dataparsing", async () => {
  let phoneA_data = {
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

  let phoneB_data = {
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

  let diffs = [];
  for (let key in phoneA_data) {
    if (phoneA_data[key] > -50) { continue; }
    diffs.push([phoneA_data[key],phoneB_data[key]/phoneA_data[key]]);
  }

  diffs.sort((a,b) => { return b[0] - a[0] });
  let bucketSize = 2.5;
  let buckets = [];
  let start = -50;
  for (let i = start; i >= -95; i -= bucketSize) {
    buckets.push(i);
  }


  // go through the buckets and fill them with the data points inside of it
  let bucketedData : Record<string, [number, number][]> = {};
  for (let i = 0; i < buckets.length; i++) {
    let bucket = buckets[i];
    bucketedData[bucket] = [];
    for (let j = 0; j < diffs.length; j++) {
      let diff = diffs[j];
      if (diff[0] <= bucket && diff[0] > bucket - bucketSize) {
        bucketedData[bucket].push(diff);
      }
    }
  }

  // average the data in the buckets
  let bucketedAverages : Record<string, [number, number]> = {};
  for (let key in bucketedData) {
    let data = bucketedData[key];
    if (data.length === 0) {
      bucketedAverages[key] = [null,null];
      continue;
    }
    let keySum = 0
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      keySum += data[i][0];
      sum += data[i][1];
    }
    bucketedAverages[key] = [keySum/data.length, sum / data.length];
  }


  // loop over the bucketedAverages and if there is no data in the bucket, linearly interpolate between the previous and next buckets. If there is no data in the previous bucket, use the next bucket. If there is no data in the next bucket, use the previous bucket. If there is no data in either, use 1.
  let interpolatedAverages = {};
  for (let i = 0; i < buckets.length; i++) {
    let bucket = buckets[i];
    let interpolationXTarget = bucket;

    if (bucketedAverages[bucket][0] === null) {
      // check if we have data in a previous bucket
      let previousValue = findPreviousValue(buckets, bucketedAverages, i);
      if (previousValue === null) {
        // find 2 buckets in the future
        let nextValue = findNextValue(buckets, bucketedAverages, i);
        if (!nextValue) { interpolatedAverages[bucket] = 1; }
        else {
          let nextNextValue = findNextValue(buckets, bucketedAverages, nextValue.keyIndex);
          if (!nextNextValue) { interpolatedAverages[bucket] = [interpolationXTarget, nextValue.data[1]] }
          else {
            interpolatedAverages[bucket] = [interpolationXTarget, interpolate(nextValue.data, nextNextValue.data, interpolationXTarget)];
          }
        }
      }
      else {
        // find a single bucket in the future and interpolate
        let nextValue = findNextValue(buckets, bucketedAverages, i);
        if (!nextValue) {
          // find another previous value and interpolate
          let previousPreviousValue = findPreviousValue(buckets, bucketedAverages, previousValue.keyIndex);
          if (!previousPreviousValue) { interpolatedAverages[bucket] = [interpolationXTarget, previousValue.data[1]] }
          else {
            interpolatedAverages[bucket] = [interpolationXTarget, interpolate(previousValue.data, previousPreviousValue.data, interpolationXTarget)];
          }
        }
        else {
          interpolatedAverages[bucket] = [interpolationXTarget, interpolate(nextValue.data, previousValue.data, interpolationXTarget)];
        }
      }
    }
  }

  // merge the interpolated data with the bucketed data
  for (let key in interpolatedAverages) {
    bucketedData[key] = [interpolatedAverages[key]];
    bucketedAverages[key] = interpolatedAverages[key];
  }

  // collapse the bucketed data into a single array
  let datapoints = [];
  for (let key in bucketedData) {
    for (let data in bucketedData[key]) {
      datapoints.push(bucketedData[key][data]);
    }
  }
});

function findNextValue<T>(keys, map : Record<string, T[]>, startKeyIndex) : {keyIndex: number, data: T[]} | null {
  for (let i = startKeyIndex + 1; i < keys.length; i++) {
    if (map[keys[i]].length > 0 && map[keys[i]][0] !== null) {
      return {keyIndex: i, data: map[keys[i]]};
    }
  }
  return null;
}


function findPreviousValue<T>(keys, map : Record<string, T[]>, startKeyIndex) : {keyIndex: number, data: T[]} | null {
  for (let i = startKeyIndex - 1; i >= 0; i--) {
    if (map[keys[i]].length > 0 && map[keys[i]][0] !== null) {
      return {keyIndex: i, data: map[keys[i]]};
    }
  }
  return null;
}

function interpolate(a:number[], b:number[], target: number) : number {
  let dx = b[0] - a[0];
  let dy = b[1] - a[1];
  let slope = dy / dx;
  let distanceToTarget = target - a[0];
  return a[1] + slope * distanceToTarget;
}
