
let MINUTES_MS = 60*1000;
let HOUR_MS    = 60*MINUTES_MS;
let DAY_MS     = 24*HOUR_MS;
let WEEK_MS    = 7*DAY_MS;
let MONTH_MS   = 28*DAY_MS;

var moment = require('moment-timezone');

function getMinuteData(minuteCount : number, targetInterval: EnergyInterval, basedOnInterval: EnergyInterval, threshold: number) : EnergyIntervalData {
  return {
    interpolationThreshold: threshold,
    targetInterval, basedOnInterval,
    isOnSamplePoint:        function(timestamp: timestamp, timezone: timezone) : boolean {
      let date = moment(timestamp).tz(timezone);
      let samplePoint = date.minutes(date.minutes() - (date.minutes() % minuteCount)).seconds(0).milliseconds(0).valueOf();
      return samplePoint === timestamp;
    },
    getPreviousSamplePoint: function(timestamp: timestamp, timezone: timezone) : number  {
      let date = moment(timestamp).tz(timezone);
      let samplePoint = date.minutes((date.minutes() - (date.minutes() % minuteCount))).seconds(0).milliseconds(0).valueOf();
      return samplePoint;
    },
    getNthSamplePoint(fromSamplePoint: timestamp, n: number, timezone: timezone) : number {
      let date = moment(fromSamplePoint).tz(timezone);
      return date.add(n*minuteCount, 'minutes').valueOf();
    },
    getNumberOfSamplePointsBetween(fromSamplePoint: timestamp, toSamplePoint: timestamp, timezone: timezone) : number {
      let fromDate = moment(fromSamplePoint).tz(timezone);
      let toDate = moment(toSamplePoint).tz(timezone);
      let diff = toDate.diff(fromDate, "minutes");
      return Math.floor(diff/minuteCount);
    }
  }
}


function getDayData(targetInterval: EnergyInterval, basedOnInterval: EnergyInterval, threshold: number) : EnergyIntervalData {
  return {
    interpolationThreshold: threshold,
    targetInterval, basedOnInterval,
    isOnSamplePoint: function(timestamp: timestamp, timezone: timezone) : boolean {
      let date = moment(timestamp).tz(timezone);
      // get midnight of the moment date
      let midnight = date.hours(0).minutes(0).seconds(0).milliseconds(0).valueOf();
      return midnight === timestamp;
    },
    getPreviousSamplePoint: function(timestamp: timestamp, timezone: timezone) : number  {
      let date = moment(timestamp).tz(timezone);
      let midnight = date.hours(0).minutes(0).seconds(0).milliseconds(0).valueOf();
      return midnight;
    },
    getNthSamplePoint(fromSamplePoint: timestamp, n: number, timezone: timezone) : number {
      let date = moment(fromSamplePoint).tz(timezone);
      return date.add(n, 'days').valueOf();
    },
    getNumberOfSamplePointsBetween(fromSamplePoint: timestamp, toSamplePoint: timestamp, timezone: timezone) : number {
      let fromDate = moment(fromSamplePoint).tz(timezone);
      let toDate = moment(toSamplePoint).tz(timezone);
      let diff = toDate.diff(fromDate, 'days');
      return diff;
    }
  }
}

// function getWeekData(targetInterval: EnergyInterval, basedOnInterval: EnergyInterval, threshold: number) : EnergyIntervalData {
//   return {
//     interpolationThreshold: threshold,
//     targetInterval, basedOnInterval,
//     // gets the upcoming sample point. If the timestamp is on a monday, it will return the provided timestamp.
//     isOnSamplePoint: function(timestamp: timestamp) : boolean {
//       let minutes = new Date(timestamp).getMinutes();
//       let hours   = new Date(timestamp).getHours();
//       let day     = new Date(timestamp).getDay(); // 0 = sunday
//       return minutes === 0 && hours === 0 && day === 1; // 00:00 on Monday morning
//     },
//     getPreviousSamplePoint: function(timestamp: timestamp) : number  {
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
    isOnSamplePoint: function(timestamp: timestamp, timezone: timezone) : boolean {
      let date = moment(timestamp).tz(timezone);
      let firstOfMonth = date.date(1).hour(0).minute(0).second(0).millisecond(0).valueOf();
      return timestamp === firstOfMonth;
    },
    getPreviousSamplePoint: function(timestamp: timestamp, timezone: timezone) : number  {
      // get the first of the previous month of the timestamp
      let date = moment(timestamp).tz(timezone);
      let firstOfMonth = date.date(1).hour(0).minute(0).second(0).millisecond(0).valueOf();
      return firstOfMonth;
    },
    getNthSamplePoint(fromSamplePoint: timestamp, n: number, timezone: timezone) : number {
      let date = moment(fromSamplePoint).tz(timezone);
      let firstOfMonth = date.month(date.month() + n).date(1).hour(0).minute(0).second(0).millisecond(0).valueOf();
      return firstOfMonth;
    },
    getNumberOfSamplePointsBetween(fromSamplePoint: timestamp, toSamplePoint: timestamp, timezone: timezone) : number {
      let fromDate = moment(fromSamplePoint).tz(timezone);
      let toDate = moment(toSamplePoint).tz(timezone);

      let diff = toDate.diff(fromDate, 'months');
      return diff;
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
