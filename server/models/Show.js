import mongoose from "mongoose";

const showSchema = new mongoose.Schema(
  {
    movie: { type: String, ref: 'Movie', required: true },  // _id of Movie is a String
    showDateTime: { type: Date, required: true },
    showPrice: { type: Number, required: true },
    occupiedSeats: { type: Object, default: {} },
  },
  { minimize: false } // So empty objects are stored
);

const Show = mongoose.model("Show", showSchema);
export default Show;
