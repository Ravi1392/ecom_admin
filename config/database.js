const mongoose = require("mongoose");

const ConnDatabase = () => {
  mongoose.set("strictQuery", true);
  mongoose
    .connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then((res) => {
      console.log("connected");
    })
    .catch((err) => {
      console.log(err);
    });
};

module.exports = ConnDatabase;
