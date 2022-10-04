/**
 * This module is responsibe for removing energy data from the database after a certain amount of time.
 */
import {Dbs} from "../containers/RepoContainer";

export async function DataGarbageCollection() : Promise<string> {
  let returnResult = {fiveMin: "Failed to get data", oneHour: "Failed to get data"};

  try {
    // remove 5m interval data that is older than 24 hours.
    let fiveMinCount = await Dbs.stoneEnergyProcessed.deleteAll({
      interval: '5m',
      timestamp: {lt: new Date(Date.now() - 24 * 60 * 60 * 1000)}
    })
    console.log("Successfully deleted 5m datapoints", fiveMinCount.count);
    returnResult.fiveMin = "Successfully deleted 5m datapoints: " + fiveMinCount.count;
  }
  catch (err : any) {
    console.log("Failed to delete 5m datapoints", err);
  }

  try {
    // remove 1h interval data that is older than 14 days
    let oneHourCount = await Dbs.stoneEnergyProcessed.deleteAll({
      interval: '1h',
      timestamp: {lt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)}
    });
    console.log("Successfully deleted 1h datapoints", oneHourCount.count);
    returnResult.oneHour = "Successfully deleted 1h datapoints: " + oneHourCount.count;
  }
  catch (err: any) {
    console.log("Failed to delete 1h datapoints", err);
  }

  return JSON.stringify(returnResult, null, 2);
}
