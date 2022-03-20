import mongoose from "mongoose";
import { MONGO_URI } from "../config";

export default async function connect() {
  await mongoose.connect(MONGO_URI);

  console.log("Connected to MongoDB");
}
