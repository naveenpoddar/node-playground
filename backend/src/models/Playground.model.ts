import { getModelForClass, prop } from "@typegoose/typegoose";
import { v4 as uuid } from "uuid";

export class PlaygroundClass {
  @prop()
  public name?: string;

  @prop()
  public files?: any;

  @prop()
  public containerId?: string;

  @prop()
  public url?: string;

  @prop()
  public containerIP?: string;

  @prop({ required: true, default: () => uuid() })
  public playgroundId!: string;

  @prop({ required: true })
  public templateId!: string;

  @prop({ required: true, default: false })
  public initilized!: boolean;
}

const Playground = getModelForClass(PlaygroundClass, {
  schemaOptions: {
    timestamps: true,
    collection: "playgrounds",
  },
});

export default Playground;
