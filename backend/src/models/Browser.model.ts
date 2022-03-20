import { prop, getModelForClass, Ref } from "@typegoose/typegoose";
import { v4 as uuid } from "uuid";
import { PlaygroundClass } from "./Playground.model";

export class BrowserClass {
  @prop({ required: true, default: () => uuid() })
  public id!: string;

  @prop({ required: true, default: [], ref: PlaygroundClass })
  public playgrounds!: Ref<PlaygroundClass>[];
}

const Browser = getModelForClass(BrowserClass);

export default Browser;
