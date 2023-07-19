module.exports = (mongoose) => {
  var schema = mongoose.Schema({
    c_id: Number,
    name: {
      type: String,
      unique: true,
    },
  });

  const Category = mongoose.model("category", schema);
  return Category;
};
