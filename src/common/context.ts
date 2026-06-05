export interface TimingMetric {
  name: string;
  duration: number;
}

export interface ServerTiming {
  add(metric: TimingMetric): void;
  startTime(name: string): void;
  endTime(name: string): void;
}
