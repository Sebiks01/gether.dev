import { TaskType } from "../typings/Task";

export class Task {
  constructor(taskOptions: TaskType) {
    Object.assign(this, taskOptions);
  }
}
