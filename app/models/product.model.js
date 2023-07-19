module.exports = (mongoose) => {
  var schema = mongoose.Schema({
    name: {
      type: String,
      required: true,
    },
    categoryId: {
      type: Number,
      ref: "Category",
      required: true,
    },
    description: String,
    price: Number,
    status: String,
  });

  const Product = mongoose.model("product", schema);
  return Product;
};
