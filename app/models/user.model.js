module.exports = (mongoose) => {
  var schema = mongoose.Schema({
    u_id: Number,
    name: String,
    contactNumber: String,
    email: {
      type: String,
      unique: true,
    },
    password: String,
    status: String,
    role: String,
  });

  const User = mongoose.model("user", schema);
  return User;
};
