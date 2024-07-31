import { ApplicationCommandDataResolvable, Client, ClientEvents, ClientOptions, Collection } from "discord.js";

import { clientLogo, error, timerEnd, timerStart, debug, info, table, warn, success } from "../util/logger";
import { importFile, loadFiles } from "../util/files-loader";
import { EventsTable, EventStatus, EventType } from "../typings/Event";
import { CommandScope, CommandsTable, CommandStatus, CommandType } from "../typings/Command";
import { TasksTable, TaskStatus, TaskType } from "../typings/Task";
import { mongoConnect } from "../util/storage-connector";
import { testGuildId } from "../../config.json";

export class GetherDevClient extends Client {
  private _commands: Collection<string, CommandType> = new Collection();
  private _events: EventType<keyof ClientEvents>[] = new Array();
  private _tasks: Array<TaskType> = new Array();
  private _activeTaskIds: NodeJS.Timeout[] = new Array();

  constructor(options: ClientOptions) {
    super(options);
  }

  public async start() {
    clientLogo();

    if (!process.env.TOKEN) {
      error("No token provided.");
      process.exit(1);
    }

    this.login(process.env.TOKEN as string).catch((err) => {
      debug(`Token: ${process.env.TOKEN}`);
      error("Invalid token provided.");
      console.log(err);

      process.exit(1);
    });

    await mongoConnect();

    await this.loadEvents();
    await this.loadCommands();
    await this.loadTasks();

    await this.registerEvents();
  }

  private async loadEvents(): Promise<void> {
    info("Loading events...");
    timerStart("Loaded events in");

    this._events = new Array();

    const eventFilePaths = await loadFiles("events");

    const eventsTable: EventsTable = new Array();

    for (const eventFilePath of eventFilePaths) {
      const eventFileName = eventFilePath.split("/").pop() || "Unknown";

      try {
        const event: EventType<keyof ClientEvents> = await importFile(eventFilePath);

        this._events.push(event);

        eventsTable.push({
          Event: eventFileName,
          Type: event.name,
          Status: EventStatus.Enabled,
        });
      } catch (err) {
        eventsTable.push({
          Event: eventFileName,
          Type: "✖",
          Status: EventStatus.Disabled,
        });

        warn(`Unable to load event file "${eventFileName}".`);
        console.log(err);

        debug(`Event file path: ${eventFilePath}`);
      }
    }

    table(eventsTable);
    timerEnd("Loaded events in");

    debug(`Loaded ${this._events.length} event(s).`);
  }

  private async registerEvents(): Promise<void> {
    info("Registering events...");
    timerStart("Registered events in");

    const clientGuilds = await this.guilds.fetch();

    for (const event of this._events) {
      if (event.once) {
        this.once(event.name, (...args) => event.execute(this, ...args));
        debug(`Registered "${event.name}" once event with index: ${this._events.indexOf(event)}.`);
      } else {
        this.on(event.name, (...args) => event.execute(this, ...args));
        debug(`Registered "${event.name}" event with index: ${this._events.indexOf(event)}.`);
      }
    }

    timerEnd("Registered events in");

    debug(`Listening in ${clientGuilds.size} guild(s).`);
  }

  private async loadCommands(): Promise<void> {
    info("Loading commands...");
    timerStart("Loaded commands in");

    this._commands = new Collection();

    const commandFilePaths = await loadFiles("commands");

    const commandsTable: CommandsTable = new Array();

    for (const commandFilePath of commandFilePaths) {
      try {
        const command: CommandType = await importFile(commandFilePath);

        this._commands.set(command.data.name, command);

        commandsTable.push({
          Command: command.data.name,
          Scope: command.test ? CommandScope.Test : CommandScope.Global,
          Status: CommandStatus.Enabled,
        });
      } catch (err) {
        const commandFileName = commandFilePath.split("/").pop() || "Unknown";

        commandsTable.push({
          Command: commandFileName,
          Scope: CommandScope.Unregistered,
          Status: CommandStatus.Disabled,
        });

        warn(`Unable to load command file "${commandFileName}".`);
        console.log(err);

        debug(`Command file path: ${commandFilePath}`);
      }
    }

    table(commandsTable);
    timerEnd("Loaded commands in");

    debug(`Loaded ${this._commands.size} command(s).`);
  }

  private async registerCommands(): Promise<void> {
    info("Registering commands...");
    timerStart("Registered commands in");

    const testCommands: ApplicationCommandDataResolvable[] = new Array();
    const globalCommands: ApplicationCommandDataResolvable[] = new Array();

    for (const command of this._commands.values()) {
      if (!command.test) {
        globalCommands.push(command.data);
      }

      testCommands.push(command.data);
    }

    const clientGuilds = await this.guilds.fetch();

    let testGuildCounter = 0;

    for (const clientGuild of clientGuilds.values()) {
      const guild = await clientGuild.fetch();

      if (testGuildId.includes(guild.id)) {
        await guild.commands.set(testCommands);
        debug(`Registered test command(s) in guild "${guild.id}".`);
        testGuildCounter++;
        continue;
      }

      await guild.commands.set(globalCommands);
      debug(`Registered global command(s) in guild "${guild.id}".`);
    }

    timerEnd("Registered commands in");

    debug(`Registered test command(s) in ${testGuildCounter} guild(s).`);
    debug(`Registered global command(s) in ${clientGuilds.size} guild(s).`);
  }

  private async loadTasks(): Promise<void> {
    info("Loading tasks...");
    timerStart("Loaded tasks in");

    this._tasks = new Array();

    const taskFilePaths = await loadFiles("tasks");

    const tasksTable: TasksTable = new Array();

    for (const taskFilePath of taskFilePaths) {
      const taskFileName = taskFilePath.split("/").pop() || "Unknown";

      try {
        const task: TaskType = await importFile(taskFilePath);

        this._tasks.push(task);

        tasksTable.push({
          Task: taskFileName,
          Time: task.time,
          Status: TaskStatus.Enabled,
        });
      } catch (err) {
        tasksTable.push({
          Task: taskFileName,
          Time: "✖",
          Status: TaskStatus.Disabled,
        });

        warn(`Unable to load task file "${taskFileName}".`);
        console.log(err);

        debug(`Task file path: ${taskFilePath}`);
      }

      table(tasksTable);
      timerEnd("Loaded tasks in");
    }
  }

  private async registerTasks(): Promise<void> {
    info("Registering tasks...");
    timerStart("Registered tasks in");

    const noDelayTasks: TaskType[] = this._tasks.filter((task) => task.noDelay);

    for (const task of this._tasks) {
      const timeoutId = setInterval(() => {
        task.execute({ client: this, time: task.time });
      }, task.time * 1000);

      this._activeTaskIds.push(timeoutId);

      debug(`Registered task with time: ${task.time} seconds.`);
    }

    timerEnd("Registered tasks in");

    debug(`Registered ${this._tasks.length} task(s).`);

    noDelayTasks.forEach((task) => task.execute({ client: this, time: task.time }));
  }

  private async cancelTasks(): Promise<void> {
    this._activeTaskIds.forEach((timeoutId) => clearTimeout(timeoutId));

    this._activeTaskIds = new Array();
  }

  public async ready(): Promise<void> {
    await this.registerCommands();

    await this.registerTasks();
  }

  public async reload(): Promise<boolean> {
    info("Reloading...");

    try {
      await this.loadEvents();
      await this.loadCommands();

      await this.registerEvents();
      await this.registerCommands();

      await this.cancelTasks();

      await this.loadTasks();
      await this.registerTasks();
    } catch (err) {
      warn("An error occurred while reloading.");
      console.log(err);
      return false;
    }

    success("Reloaded successfully.");

    return true;
  }

  public get commands() {
    return this._commands;
  }

  public get events() {
    return this._events;
  }

  public get tasks() {
    return this._tasks;
  }

  public get activeTaskIds() {
    return this._activeTaskIds;
  }
}
