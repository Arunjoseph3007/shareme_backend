const router = require("express").Router();
const User = require("../models/User");
const bcrpyt = require("bcrypt");

//update user
router.put("/:id", async (req, res) => {
  //confirm that user is updating his acc
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    //check if he is updating the password
    if (req.body.password) {
      try {
        //if yes hash password
        const salt = await bcrpyt.genSalt(10);
        req.body.password = await bcrpyt.hash(req.body.password, salt);
      } catch (err) {
        return res.status(500).json(err);
      }
    }
    try {
      //update the account
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      res.status(200).json("Account updated successfully");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("You can update your account only");
  }
});

//Search users
router.get("/search", async (req, res) => {
  const { q } = req.query;
  try {
    const users = await User.find({username: {"$regex": new RegExp(q,'i')}},{password:0,coverPicture:0});
    res.status(200).json(users);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//search for friends
router.get("/explore/:id", async (req, res) => {
  try {
    //Get requesting user
    const currentUser = await User.findById(req.params.id);

    //get his following
    const followingUsers = await User.find(
      {_id : { $in : currentUser._doc.following } },
      { password : 0 , coverPicture : 0 }
    );

    //get all the following of all the followers
    const newList = followingUsers.map(user=>user._doc.following)
    const list = [].concat(...newList)
    const actualList = await User.find({_id:{$in:list}})

    res.status(200).json(actualList);
  } catch (error) {
    return res.status(500).json(error);
  }
});

//delter user
router.delete("/:id", async (req, res) => {
  //confirm that user is updating his acc
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      //delete the account
      const user = await User.findByIdAndDelete(req.params.id);
      res.status(200).json("Account deleted successfully");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("You can delete your account only");
  }
});

//get a user
router.get("/:id", async (req, res) => {
  //just find and return
  try {
    const user = await User.findById(req.params.id);
    const { password, updatedAt, ...other } = user._doc;
    res.status(200).json(other);
  } catch (error) {
    console.log("umm",error)
    return res.status(500).json(error);
  }
});

//get all users

//follow/unfollow a user
router.put("/:id/follow", async (req, res) => {
  //ensure that he is not following himself
  if (req.body.userId !== req.params.id) {
    try {
      //get ths user and the user he wants to follow
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);

      //ensure he is not foloowing alread
      if (!user.followers.includes(req.body.userId)) {
        await user.updateOne({ $push: { followers: req.body.userId } });
        await currentUser.updateOne({ $push: { following: req.params.id } });

        res.status(200).json("Followed");
      } else {
        await user.updateOne({ $pull: { followers: req.body.userId } });
        await currentUser.updateOne({ $pull: { following: req.params.id } });

        res.status(200).json("Unfollowed");
      }
    } catch (error) {
      return res.status(500).json(err);
    }
  } else {
    res.status(403).json("cant follow yourself");
  }
});

module.exports = router; 
