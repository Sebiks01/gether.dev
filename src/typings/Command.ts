import {
  ChatInputCommandInteraction,
  CommandInteractionOptionResolver,
  AutocompleteInteraction,
  SlashCommandBuilder,
  CacheType,
  GuildMember,
  SlashCommandOptionsOnlyBuilder,
} from "discord.js";

import { GetherDevClient } from "../structures/GetherDevClient";

export enum CommandScope {
  Test = "Test",
  Global = "Global",
  Unregistered = "✖",
}

export enum CommandStatus {
  Enabled = "✅",
  Disabled = "🛑",
}

interface CommandsTableElement {
  Command: string;
  Scope: CommandScope;
  Status: CommandStatus;
}

export type CommandsTable = CommandsTableElement[];

export interface ExtendedChatInputCommandInteraction extends ChatInputCommandInteraction {
  member: GuildMember;
}

interface ExecuteOptions {
  client: GetherDevClient;
  interaction: ExtendedChatInputCommandInteraction;
  args: Omit<CommandInteractionOptionResolver<CacheType>, "getMessage" | "getFocused">;
}

interface AutocompleteOptions {
  client: GetherDevClient;
  interaction: AutocompleteInteraction;
}

type ExecuteFunction = (options: ExecuteOptions) => unknown;

type AutocompleteFunction = (options: AutocompleteOptions) => unknown;

export type CommandType = {
  test?: boolean;
  data:
    | SlashCommandBuilder
    | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">
    | Omit<
        SlashCommandBuilder,
        | "addBooleanOption"
        | "addUserOption"
        | "addChannelOption"
        | "addRoleOption"
        | "addAttachmentOption"
        | "addMentionableOption"
        | "addStringOption"
        | "addIntegerOption"
        | "addNumberOption"
      >
    | SlashCommandOptionsOnlyBuilder;
  execute: ExecuteFunction;
  autocomplete?: AutocompleteFunction;
};
