import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI as string);
    console.log(`Host: ${conn.connection.host}`);
  } catch (error) {
    console.error("\nInternal Database Error");
    console.error(
      `Error Message: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
    process.exit(1);
  }
};

export default connectDB;
