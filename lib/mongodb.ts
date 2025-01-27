const mongoose = require("mongoose");

const globalWithMongoose = global as typeof global & {
  mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
};

let cached = globalWithMongoose.mongoose;

if (!cached) {
  cached = globalWithMongoose.mongoose = { conn: null, promise: null };
}

export const connectDB = async (): Promise<string> => {
  if (cached.conn) {
    return "Already connected to database";
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGODB_URI)
      .then((mongoose: string) => {
        return mongoose;
      });
  }
  cached.conn = await cached.promise;
  return "Connected to database with success";
};
