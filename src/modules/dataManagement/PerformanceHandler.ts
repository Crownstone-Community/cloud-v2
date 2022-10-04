import {PerformanceEntry, PerformanceObserverEntryList} from "perf_hooks";

const { performance, PerformanceObserver } = require("perf_hooks")




export class PerformanceHandler {
  perfObserver: PerformanceObserver;
  labelLog :string[] = [];

  observations : PerformanceEntry[] = [];

  constructor() {
    this.perfObserver = new PerformanceObserver((items : PerformanceObserverEntryList) => {
      items.getEntries().forEach((entry) => {
        this.observations.push(entry);
      })
    })
    this.observe("measure");
  }

  observe(type: string) {
    this.perfObserver.observe({ entryTypes: [type], buffered: true});
  }

  start(label: string, type = 'measure') {
    this.labelLog.push(`${type}-${label}`);
    performance.mark(`${type}-${label}-start`);
  }

  end() {
    let label = this.labelLog.pop();
    performance.mark(label + "-end");
    performance.measure(label, label + "-start", label + "-end");
  }

  destroy() {
    this.perfObserver.disconnect();
  }

  filter(by: string) {
    return this.observations.filter((entry) => entry.name.includes(by));
  }

  getAverageTimes(by: string) : {all: number, labels: Record<string, {time: number, count: number, average: number, std: number}> } {
    let entries = this.filter(by);
    let sum = 0;
    let perEntry : Record<string, PerformanceEntry[]> = {};
    let labels : Record<string, {time: number, count: number, average: number, std: number}> = {};
    entries.forEach((entry) => {
      if (perEntry[entry.name] === undefined) {
        perEntry[entry.name] = [];
      }
      perEntry[entry.name].push(entry);

      sum += entry.duration;
    })

    for (let key in perEntry) {
      labels[key] =  {time: 0, count: 0, average: 0, std: 0};
      for (let entry of perEntry[key]) {
        labels[key].time += entry.duration;
        labels[key].count++;
      }
      labels[key].average = labels[key].time / labels[key].count;
      let stdSum = 0;
      for (let entry of perEntry[key]) {
        stdSum = Math.pow(entry.duration - labels[key].average, 2);
      }
      stdSum /= labels[key].count;
      labels[key].std = Math.sqrt(stdSum);
    }


    return {all: sum / entries.length, labels};
  }
}

