import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import userModel from "../models/userModel.js";

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        let user = await userModel.findOne({
          $or: [
            { email: profile.emails[0].value },
            { providerId: profile.id, provider: "google" },
          ],
        });

        if (user) {
          // Update user info if needed
          if (!user.providerId) {
            user.providerId = profile.id;
            user.provider = "google";
            user.avatar = profile.photos[0].value;
            user.isVerified = true;
            await user.save();
          }
          return done(null, user);
        }

        // Create new user
        user = new userModel({
          name: profile.displayName,
          email: profile.emails[0].value,
          provider: "google",
          providerId: profile.id,
          avatar: profile.photos[0].value,
          isVerified: true,
        });

        await user.save();
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// GitHub OAuth Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "/api/auth/github/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        let user = await userModel.findOne({
          $or: [
            { email: profile.emails?.[0]?.value },
            { providerId: profile.id, provider: "github" },
          ],
        });

        if (user) {
          // Update user info if needed
          if (!user.providerId) {
            user.providerId = profile.id;
            user.provider = "github";
            user.avatar = profile.photos[0].value;
            user.isVerified = true;
            await user.save();
          }
          return done(null, user);
        }

        // Create new user
        user = new userModel({
          name: profile.displayName || profile.username,
          email:
            profile.emails?.[0]?.value || `${profile.username}@github.local`,
          provider: "github",
          providerId: profile.id,
          avatar: profile.photos[0].value,
          isVerified: true,
        });

        await user.save();
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await userModel.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
