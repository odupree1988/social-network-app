const { Thought, User } = require("../models");

const thoughtController = {
  getAllThoughts(req, res) {
    Thought.find({})
      .then((dbThoughtData) => res.json(dbThoughtData))
      .catch((err) => {
        console.log(err);
        res.sendStatus(400);
      });
  },

  getThoughtById({ params }, res) {
    Thought.findOne({ _id: params.id })
      .then((dbThoughtData) => res.json(dbThoughtData))
      .catch((err) => {
        console.log(err);
        res.sendStatus(400);
      });
  },

  createThought({ body }, res) {
    Thought.create(body)
      .then(({ _id }) => {
        console.log(_id);
        return User.findOneAndUpdate(
          { _id: body.userId },
          { $push: { thoughts: _id } },
          { new: true }
        );
      })
      .then((dbThoughtData) => {
        res.json(dbThoughtData);
      })

      .catch((err) => res.json(err));
  },

  createReaction({ body, params }, res) {
    Thought.findOneAndUpdate(
      { _id: params.thoughtId },
      { $push: { reactions: body } },
      { new: true }
    )
      .then((dbReactionData) => res.json(dbReactionData))
      .catch((err) => res.json(err));
  },

  updateThought({ params, body }, res) {
    Thought.findByIdAndUpdate({ _id: params.id }, body, {
      new: true,
      runValidators: true,
    })
      .then((dbThoughtData) => {
        if (!dbThoughtData) {
          res.status(404).json({ message: "No Thought exists with this id." });
          return;
        }
        res.json(dbThoughtData);
      })
      .catch((err) => res.json(err));
  },

  deleteThought({ params }, res) {
    Thought.findOneAndDelete({ _id: params.id }).then(({ _id }) => {
      console.log(_id);
      User.findOneAndUpdate({ thoughts: _id }, { $pull: { thoughts: _id } })

        .then((dbThoughtData) =>
          res.json({ message: "Thought was successfully deleted!" })
        )
        .catch((err) => res.json(err));
    });
  },

  deleteReaction({ params, body }, res) {
    Thought.findOneAndUpdate(
      { _id: params.thoughtId },
      { $pull: { reactions: { reactionId: body.reactionId } } },
      { new: true }
    )
      .then(({ reactionId }) => {
        Thought.findOneAndDelete({ reactionId: reactionId });
        res.json({ message: "reaction deleted successfully!" });
      })
      .catch((err) => res.json(err));
  },
};

module.exports = thoughtController;
