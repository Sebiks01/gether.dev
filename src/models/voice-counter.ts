import { Schema, model, models } from "mongoose";

const reqString = {
  type: String,
  required: true,
};

const voiceCounterSchema = new Schema({
  guildId: reqString,
  userId: reqString,
  timer: {
    type: Number,
    default: 0,
  },
});

export type VoiceCounter = {
  guildId: string;
  token: string;
  timer: number;
};

const name = "voice-counter";

export default models[name] || model(name, voiceCounterSchema, name);
