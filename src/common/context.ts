export interface TimingMetric {
  name: string;
  duration: number;
}

export interface ServerTime {
  add(metric: TimingMetric): void;
  startTime(name: string): void;
  endTime(name: string): void;
}
