const Post = require("./models/Post");

const resolver = {
  // method that gets data from database. Returns data with a number of posts (limit) from the (offset) number post
  // based on input, tags and sorts by wanted order.
  Query: {
    getPost: async (parent, args, context, info) => {
      let data;
      let count = 0;

      //sets the sort orders for sorting on the queries
      let sortOrder = -1; //sets standard as descending
      if (args.sortBy === "asc") {
        sortOrder = 1; //sets ascending
      } else {
        sortOrder = -1; //sets descending
      }

      //search on the whole input, caseinsensitive
      var regExp = new RegExp("\\b" + args.input + "\\b", "i");

      //filter on tag and search
      if (
        args.tag != null &&
        args.tag != "" &&
        args.input != null &&
        args.input != ""
      ) {
        data = await Post.find({
          tags: args.tag,
          title: { $regex: regExp },
        })
          .sort({ reactions: sortOrder, _id: 1 })
          .limit(parseInt(args.limit))
          .skip(parseInt(args.offset));

        count = await Post.find({
          tags: args.tag,
          title: { $regex: regExp },
        }).count();
        //filter on tag
      } else if (args.tag != "" && args.tag != null) {
        data = await Post.find({ tags: args.tag })
          .sort({
            reactions: sortOrder,
            _id: 1,
          })
          .limit(parseInt(args.limit))
          .skip(parseInt(args.offset));

        count = await Post.find({ tags: args.tag }).count();
        //filter on search
      } else if (args.input != null && args.input != "") {
        data = await Post.find({ title: { $regex: regExp } })
          .sort({
            reactions: sortOrder,
            _id: 1,
          })
          .limit(parseInt(args.limit))
          .skip(parseInt(args.offset));

        count = await Post.find({ title: { $regex: regExp } }).count();
      } else {
        //no search or filter is chosen, sets data to all the results
        data = await Post.find()
          .sort({ reactions: sortOrder, _id: 1 })
          .limit(parseInt(args.limit))
          .skip(parseInt(args.offset));

        count = await Post.find().count();
      }

      let response = {
        posts: data,
        count,
      };

      return response;
    },
  },

  //methods that changes/updates fields in the database
  Mutation: {
    //increments the reaction count of the spesific post by id
    incrementReaction: async (_, { id }) => {
      try {
        const data = await Post.find({ id: id });
        //returns a default IncrementReactionResponse if data is null
        if (data.length === 0) {
          return {
            code: 404,
            success: false,
            message: "Post not found",
            post: null,
          };
        }
        const reaction = data[0].reactions;
        const post = await Post.findOneAndUpdate(
          { id: id },
          { $set: { reactions: reaction + 1 } },
          { returnOriginal: false }
        );
        //returns post if succsessfull
        return {
          code: 200,
          success: true,
          message: `Succsessfully incremented number of reactions for post ${id}`,
          post,
        };
      } catch (error) {
        //returns a default respons
        return {
          code: 404,
          success: false,
          message: "Unknown error",
          post: null,
        };
      }
    },
    //decreases the reaction count of the spesific post by id
    decreaseReaction: async (_, { id }) => {
      try {
        const data = await Post.find({ id: id });
        //returns a default DecreaseReactionResponse if data is null
        if (data.length === 0) {
          return {
            code: 404,
            success: false,
            message: "Post not found",
            post: null,
          };
        }
        const reaction = data[0].reactions;
        const post = await Post.findOneAndUpdate(
          { id: id },
          { $set: { reactions: reaction - 1 } },
          { returnOriginal: false }
        );
        //returns post if succsessfull
        return {
          code: 200,
          success: true,
          message: `Succsessfully incremented number of reactions for post ${id}`,
          post,
        };
      } catch (error) {
        // returns a default response
        return {
          code: 404,
          success: false,
          message: "Unknown error",
          post: null,
        };
      }
    },
  },
};

module.exports = resolver;
