const mongoose = require("mongoose");

let commentSchema = mongoose.Schema({
    text: String,
    //time stamp
    author:{
        id:  {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    }
}, {
    // if timestamps are set to true, mongoose assigns createdAt and updatedAt fields to your schema, the type assigned is Date.
    timestamps: true
});

module.exports = mongoose.model("Comment", commentSchema);
