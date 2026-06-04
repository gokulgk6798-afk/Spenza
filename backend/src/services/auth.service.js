const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const env = require("../config/env");
const HttpError = require("../utils/httpError");

function createToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      email: user.email,
    },
    env.jwtSecret,
    { expiresIn: "7d" }
  );
}

function toPublicUser(user) {
  return {
    id: user._id.toString(),
    email: user.email,
    displayName: user.displayName || "",
    authProviders: user.authProviders,
    createdAt: user.createdAt,
  };
}

async function login(payload) {
  const email = payload.email?.trim().toLowerCase();
  const provider = payload.provider || "email";
  const password = payload.password || "";

  if (!email) {
    throw new HttpError(400, "Email is required.");
  }

  let user = await User.findOne({ email });

  if (user) {
    if (provider === "email") {
      if (!user.passwordHash) {
        throw new HttpError(400, "This account was created with social login.");
      }

      const passwordMatches = await bcrypt.compare(password, user.passwordHash);
      if (!passwordMatches) {
        throw new HttpError(401, "Invalid credentials.");
      }
    } else if (!user.authProviders.includes(provider)) {
      user.authProviders.push(provider);
      await user.save();
    }
  } else {
    if (provider === "email" && !password) {
      throw new HttpError(400, "Password is required for email login.");
    }

    user = await User.create({
      email,
      displayName: payload.displayName?.trim() || email.split("@")[0],
      passwordHash: provider === "email" ? await bcrypt.hash(password, 10) : null,
      authProviders: [provider],
    });
  }

  return {
    token: createToken(user),
    user: toPublicUser(user),
  };
}

module.exports = {
  login,
};

