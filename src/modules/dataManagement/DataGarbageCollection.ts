/**
 * This module is responsibe for removing energy data from the database after a certain amount of time.
 */
import {Dbs} from "../containers/RepoContainer";

export async function DataGarbageCollection() : Promise<string> {
  let returnResult = {fiveMin: "Failed to delete data", oneHour: "Failed to delete data", switchStateHistory: "Failed to delete data"};

  // remove 5m interval data that is older than 24 hours.
  try {
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

  // remove 1h interval data that is older than 14 days
  try {
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

  // remove stoneSwitchState history that is older than 1 day, exclusing the active ids.
  try {
    let stoneData = await Dbs.stone.find({where:{currentSwitchStateId: {neq: null}}, fields:{currentSwitchStateId: true}});
    let currentSwitchStateIdArray = stoneData.map((stone) => { return stone.currentSwitchStateId; });
    let stoneSwitchStateCount = await Dbs.stoneSwitchState.deleteAll({id:{nin: currentSwitchStateIdArray}, timestamp: {lt: new Date(Date.now() - 24 * 60 * 60 * 1000)}});
    console.log("Successfully deleted switchStateHistory", stoneSwitchStateCount.count);
    returnResult.switchStateHistory = "Successfully deleted switchStateHistory: " + stoneSwitchStateCount.count;
  }
  catch (err: any) {
    console.log("Failed to delete switchStateHistory", err);
  }

  return JSON.stringify(returnResult, null, 2);
}
