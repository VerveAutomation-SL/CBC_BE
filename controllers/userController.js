import User from "../models/user.js";
import UserActivity from "../models/userActivity.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

export async function newUser(req, res) {
  const newUserData = req.body;

  if (newUserData.type == "admin") {
    if (req.user == null) {
      res.json({
        message: "Please login as an admin to create a new admin account",
      });
      return;
    }

    if (req.user.type != "admin") {
      res.json({
        message: "Please login as an admin to create a new admin account",
      });
      return;
    }
  }

  newUserData.password = bcrypt.hashSync(newUserData.password, 10);

  const user = new User(newUserData);

  try {
    await user.save();
    res.json({
      message: "The user was added to the database succesfully",
    });
  } catch (error) {
    res.json({
      message:
        "The user was not added to the database due to an error " + error,
    });
  }
}

export async function userLogin(req, res) {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.json({
        message: "The specified user was not found",
        success: false,
      });
    }

    if (user.isBlocked) {
      return res.json({
        message:
          "Your account has been blocked. Contact support for assistance.",
        success: false,
        blocked: true,
      });
    }

    const isPasswordCorrect = bcrypt.compareSync(
      req.body.password,
      user.password
    );

    if (isPasswordCorrect) {
      const token = jwt.sign(
        {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isBlocked: user.isBlocked,
          type: user.type,
          profilePicture: user.profilePicture,
        },
        process.env.JWT_SECRET_KEY
      );

      await UserActivity.findOneAndUpdate(
        { userId: user._id },
        {
          lastLogin: new Date(),
          isActive: true,
          email: user.email,
          type: user.type,
        },
        { upsert: true }
      );

      return res.json({
        message: "Your login details are correct",
        success: true,
        token: token,
        user: {
          firstName: user.firstName,
          lastName: user.lastName,
          type: user.type,
          profilePicture: user.profilePicture,
          email: user.email,
        },
      });
    } else {
      return res.json({
        message: "Your password is incorrect. Please try again",
        success: false,
      });
    }
  } catch (error) {
    console.error(error);
    return res.json({
      message: "The login attempt failed due to an error: " + error,
      success: false,
    });
  }
}

export async function logoutUser(req, res) {
  try {
    console.log("Logout request received.");

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("No token provided.");
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];
    console.log("Extracted Token:", token);

    const jwtSecret = process.env.JWT_SECRET_KEY || process.env.JWT_SECRET;
    console.log("JWT Secret:", jwtSecret ? "Loaded" : "Not Found");

    if (!jwtSecret) {
      console.log("Error: JWT Secret is missing.");
      return res
        .status(500)
        .json({ message: "Server error: Missing JWT secret" });
    }

    try {
      const decoded = jwt.verify(token, jwtSecret);

      const userEmail = decoded.email;
      if (!userEmail) {
        console.log("User email missing in decoded token:", decoded);
        return res.status(400).json({ message: "Invalid token data" });
      }

      console.log("Logging out user email:", userEmail);

      const updatedUser = await UserActivity.findOneAndUpdate(
        { email: userEmail },
        { $set: { isActive: false, lastLogin: new Date() } },
        { new: true }
      );

      if (!updatedUser) {
        console.log("No matching user found for logout:", userEmail);
        return res.status(404).json({ message: "User activity not found" });
      }

      return res.json({ message: "User logged out successfully" });
    } catch (error) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ message: "Logout failed" });
  }
}

export async function getUser(req, res) {
  if (req.user == null) {
    res.json({
      message: "Please login to view user details",
    });
    return;
  }
  res.json(req.user);
}

export async function listUser(req, res) {
  console.log(req.user);

  if (req.user == null) {
    res.json({
      message: "You are not logged in",
    });
    return;
  }

  if (!isAdmin(req)) {
    res.json({
      message:
        "You are not an admin and are not authorized to do this function",
    });
    return;
  }

  try {
    const userList = await User.find();
    res.json({
      list: userList,
    });
  } catch (error) {
    res.json({
      message: "An error blocked the loading of the User List " + error,
    });
  }
}

export async function delUser(req, res) {
  try {
    await User.deleteOne({ email: req.body.email });
    res.json({
      message: "The user was succesfully deleted from the database",
    });
  } catch (error) {
    res.json({
      message:
        "The user was not deleted from the database due to an error " + error,
    });
  }
}

export function isAdmin(req) {
  if (req.user == null) {
    return false;
  }

  if (req.user.type != "admin") {
    return false;
  }

  return true;
}

export function isCustomer(req) {
  if (req.user == null) {
    return false;
  }

  if (req.user.type != "customer") {
    return false;
  }

  return true;
}

export async function googleLogin(req, res) {
  const token = req.body.token;

  try {
    const response = await axios.get(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const email = response.data.email;

    const userList = await User.find({ email: email });

    if (userList.length > 0) {
      const user = userList[0];
      const token = jwt.sign(
        {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isBlocked: user.isBlocked,
          type: user.type,
          profilePicture: user.profilePicture,
        },
        process.env.JWT_SECRET_KEY
      );

      res.json({
        message: "Google Login Succesful",
        token: token,
        user: {
          firstName: user.firstName,
          lastName: user.lastName,
          type: user.type,
          profilePicture: user.profilePicture,
          email: user.email,
        },
      });
    } else {
      const newUserData = {
        email: email,
        firstName: response.data.given_name,
        lastName: response.data.family_name,
        type: "customer",
        password: "newuser",
        profilePicture: response.data.picture,
      };
      const user = new User(newUserData);
      await user
        .save()
        .then(() => {
          res.json({
            message: "The New User Was Succesfully Created ",
          });
        })
        .catch((error) => {
          res.json({
            message: "The New User Was Not Created",
          });
        });
    }
  } catch (error) {
    res.json({
      message: "Google Login Failed",
    });
  }
}

export async function blockUser(req, res) {
  if (req.user == null) {
    res.json({
      message: "Please login to view user details",
    });
    return;
  }

  try {
    const { email, isBlocked } = req.body;

    if (email && typeof isBlocked === "boolean") {
      await User.updateOne({ email }, { $set: { isBlocked } });

      res.json({
        message: `User ${isBlocked ? "blocked" : "unblocked"} successfully`,
      });
      return;
    }

    res.json(req.user);
  } catch (error) {
    res.status(500).json({
      message: "Error updating user status: " + error,
    });
  }
}

export async function updateUser(req, res) {
  const { email } = req.params;
  const updateData = req.body;

  try {
    const updatedUser = await User.findOneAndUpdate({ email }, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res.json({
        message: "The user with email " + email + " was not found",
      });
    }

    return res.json({
      message: "User details updated successfully",
      updatedUser,
    });
  } catch (error) {
    return res.json({
      message: "User update failed due to an error: " + error,
    });
  }
}

export const getUserActivity = async (req, res) => {
  try {
    const activeUsers = await UserActivity.find({ isActive: true }).select(
      "email type"
    );
    const recentLogins = await UserActivity.find()
      .sort({ lastLogin: -1 })
      .limit(5)
      .select("email lastLogin type");

    res.json({ activeUsers, recentLogins });
  } catch (error) {
    console.error("Error fetching user activity:", error);
    res.status(500).json({ message: "Error fetching user activity" });
  }
};
