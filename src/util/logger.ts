import { blue, green, yellow, red, magenta } from "chalk";
import { vice } from "gradient-string";

import { CommandsTable } from "../typings/Command";
import { EventsTable } from "../typings/Event";
import { TasksTable } from "../typings/Task";
import { GetherDevClient } from "../structures/GetherDevClient";

// Starter log
export const clientLogo = () => {
  console.log(
    vice(
      "* * * * * * * * * * * * * * * * * * * * * * * * *\n" +
        "*              __  __               __          *\n" +
        "*    ___ ____ / /_/ /  ___ ____ ___/ /__ _  __  *\n" +
        "*   / _ `/ -_) __/ _ \\/ -_) __// _  / -_) |/ /  *\n" +
        "*   \\_, /\\__/\\__/_//_/\\__/_/ (_)_,_/\\__/|___/   *\n" +
        "*  /___/                                        *\n" +
        "*                                               *\n" +
        "* * * * * * * * * * * * * * * * * * * * * * * * *\n"
    )
  );

  info("Starting the client...");
};

// Default logger
export const log = (msg: string) => console.log(msg);

// Custom loggers
export const info = (msg: string) => log(blue(`[INFO] ${msg}`));

export const success = (msg: string) => log(green(`[INFO] ${msg}`));

export const warn = (msg: string) => log(yellow(`[WARN] ${msg}`));

export const error = (msg: string) => log(red(`[ERROR] ${msg}`));

export const debug = (msg: string) => {
  const debugEnabled = GetherDevClient.instance.config.debug;

  if (debugEnabled) log(magenta(`[DEBUG] ${msg}`));
};

// Timers
const { time, timeEnd } = console;

export const timerStart = (msg: string) => time(green(`[INFO] ${msg}`));

export const timerEnd = (msg: string) => timeEnd(green(`[INFO] ${msg}`));

// Tables
export const table = (data: CommandsTable | EventsTable | TasksTable) => console.table(data);
