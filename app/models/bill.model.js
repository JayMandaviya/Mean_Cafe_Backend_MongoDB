module.exports = (mongoose) => {
  const { Schema } = mongoose;
  var schema = mongoose.Schema({
    b_id: Number,
    uuid: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    contactNumber: {
      type: String,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    productDetails: {
      type: Schema.Types.Mixed,
      default: null,
    },
    createdBy: {
      type: String,
      required: true,
    },
  });

  const Bill = mongoose.model("bill", schema);
  return Bill;
};
