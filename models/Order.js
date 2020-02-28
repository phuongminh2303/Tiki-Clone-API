const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.ObjectId,
    ref: "Product"
  },
  shop: {
    type: mongoose.Schema.ObjectId,
    ref: "Shop"
  },
  quantity: Number,
  address: { 
    type: String, 
    required: [true, 'Please add an address'] 
  },
  phone: { 
    type: String, 
    required: [true, 'Please add a phone number']
   },
  total: { 
    type: Number,
    required: [true, 'Please add total price']
  },
  currentState: {
    type: String,
    required: true,
    enum: ['Ordered Successfully', 'Tiki Received', 'Getting Product', 'Packing', 'Shipping', 'Delivered' ],
    default: 'Ordered Successfully'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }
}, {
  toJSON: {virtuals: true},
  toObject: {virtuals: true}
});

module.exports = mongoose.model('Order', OrderSchema);
