import mongoose from 'mongoose';

const ItemSchema = new mongoose.Schema({
  description: String,
  quantity: Number,
  price: Number,
  hsn: String
}, { timestamps: true });

const Item = mongoose.model('Item', ItemSchema);
export default Item;
