let MINUTES_MS = 60*1000;
let HOUR_MS    = 60*MINUTES_MS;
let DAY_MS     = 24*HOUR_MS;
let WEEK_MS    = 7*DAY_MS;
let MONTH_MS   = 28*DAY_MS;

function getMinuteData(minuteCount : number, targetInterval: EnergyInterval, basedOnInterval: EnergyInterval, threshold: number) : EnergyIntervalData {
  return {
    interpolationThreshold: threshold,
    targetInterval, basedOnInterval,
    isOnSamplePoint:        function(timestamp: number) : boolean {
      let date = new Date(timestamp);
      let samplePoint = date.setMinutes(date.getMinutes() - (date.getMinutes() % minuteCount),0,0);
      return samplePoint === timestamp;
    },
    getPreviousSamplePoint: function(timestamp: number) : number  {
      let date = new Date(timestamp);
      let samplePoint = date.setMinutes(date.getMinutes() - (date.getMinutes() % minuteCount),0,0);
      return samplePoint;
    },
    getNthSamplePoint(fromSamplePoint: number, n: number) : number {
      return fromSamplePoint + n*MINUTES_MS*minuteCount;
    },
    getNumberOfSamplePointsBetween(fromSamplePoint: number, toSamplePoint: number) : number {
      return Math.floor((toSamplePoint - fromSamplePoint) / (MINUTES_MS*minuteCount));
    }
  }
}


function getDayData(targetInterval: EnergyInterval, basedOnInterval: EnergyInterval, threshold: number) : EnergyIntervalData {
  return {
    interpolationThreshold: threshold,
    targetInterval, basedOnInterval,
    isOnSamplePoint: function(timestamp: number) : boolean {
      let date = new Date(timestamp);
      let samplePoint = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
      return samplePoint === timestamp;
    },
    getPreviousSamplePoint: function(timestamp: number) : number  {
      let date = new Date(timestamp);
      let midnight = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
      return midnight;
    },
    getNthSamplePoint(fromSamplePoint: number, n: number) : number {
      return fromSamplePoint + n*DAY_MS;
    },
    getNumberOfSamplePointsBetween(fromSamplePoint: number, toSamplePoint: number) : number {
      return Math.floor((toSamplePoint - fromSamplePoint) / DAY_MS);
    }
  }
}

// function getWeekData(targetInterval: EnergyInterval, basedOnInterval: EnergyInterval, threshold: number) : EnergyIntervalData {
//   return {
//     interpolationThreshold: threshold,
//     targetInterval, basedOnInterval,
//     // gets the upcoming sample point. If the timestamp is on a monday, it will return the provided timestamp.
//     isOnSamplePoint: function(timestamp: number) : boolean {
//       let minutes = new Date(timestamp).getMinutes();
//       let hours   = new Date(timestamp).getHours();
//       let day     = new Date(timestamp).getDay(); // 0 = sunday
//       return minutes === 0 && hours === 0 && day === 1; // 00:00 on Monday morning
//     },
//     getPreviousSamplePoint: function(timestamp: number) : number  {
//       let minutes = new Date(timestamp).getMinutes();
//       let hours   = new Date(timestamp).getHours();
//       let day     = new Date(timestamp).getDay(); // 0 = sunday
//       let mondayOffset = (day+6) % 7; // this maps sunday = 6, monday 0, tuesday 1, ...
//       return timestamp - MINUTES_MS*(minutes) - HOUR_MS*(hours) - DAY_MS*(mondayOffset);
//     },
//     getNthSamplePoint(fromSamplePoint: number, n: number) : number {
//       return fromSamplePoint + n*WEEK_MS;
//     },
//     getNumberOfSamplePointsBetween(fromSamplePoint: number, toSamplePoint: number) : number {
//       let weeks = Math.floor((fromSamplePoint - toSamplePoint) / WEEK_MS);
//       return weeks;
//     }
//   }
// }

function getMonthData(targetInterval: EnergyInterval, basedOnInterval: EnergyInterval, threshold: number) : EnergyIntervalData {
  return {
    interpolationThreshold: threshold,
    targetInterval,
    basedOnInterval,
    isOnSamplePoint: function(timestamp: number) : boolean {
      let date = new Date(timestamp);
      let samplePoint = new Date(date.getFullYear(), date.getMonth(), 1).getTime();
      return timestamp === samplePoint;
    },
    getPreviousSamplePoint: function(timestamp: number) : number  {
      // get the first of the previous month of the timestamp
      let date = new Date(timestamp);
      let firstOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).getTime();
      return firstOfMonth;
    },
    getNthSamplePoint(fromSamplePoint: number, n: number) : number {
      let date = new Date(fromSamplePoint);
      let firstOfMonth = new Date(date.getFullYear(), date.getMonth()+n, 1).getTime();
      return firstOfMonth;
    },
    getNumberOfSamplePointsBetween(fromSamplePoint: number, toSamplePoint: number) : number {
      let dateFrom = new Date(fromSamplePoint);
      let dateTo   = new Date(toSamplePoint);
      let yearsDifference = (dateTo.getFullYear() - dateFrom.getFullYear());
      let monthsDifference = (dateTo.getMonth() - dateFrom.getMonth());
      return yearsDifference*12 + monthsDifference;
    }
  }
}


export const EnergyIntervalDataSet : Record<string, EnergyIntervalData> = {
  // '5m':  getMinuteData(5, '5m', '1m', 4),
  // '10m': getMinuteData(10, '10m', '5m', 4),
  // '15m': getMinuteData(15, '15m', '5m', 4),
  // '30m': getMinuteData(30, '30m', '15m', 4),
  '1h':  getMinuteData(60, '1h', '5m', 4),
  // '3h':  getHourData(3, '3h', '1h', 4),
  // '6h':  getHourData(6, '6h', '3h', 4),
  // '12h': getHourData(12,'12h', '1h', 4),
  '1d':  getDayData('1d', '1h', 4),
  // '1w':  getWeekData('1w','1d', 4),
  '1M':  getMonthData('1M', '1d', 4),
}
