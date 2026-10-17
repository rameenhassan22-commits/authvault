
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const rateLimit = require("express-rate-limit");

const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const { firebaseAuth } = require("../config/firebaseAdmin");
const router = express.Router();

// Limit login attempts to 5 per 15-minute window.
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        message: "Too many login attempts. Please try again in 15 minutes.",
    },
});

// -------------------- REGISTER VALIDATION --------------------

const registerSchema = z.object({
    name: z.preprocess(
        (value) => value === undefined ? "" : value,
        z.string()
            .trim()
            .min(1, "Name is required")
            .min(3, "Name must be at least 3 characters")
            .max(80, "Name cannot exceed 80 characters")
            .refine(
                (value) => /[a-zA-Z]/.test(value),
                "Name must contain at least one letter (A-Z)"
            )
    ),

    email: z.preprocess(
        (value) => value === undefined ? "" : value,
        z.string()
            .trim()
            .max(254, "Email cannot exceed 254 characters")
            .refine(
                (value) => value.length > 0,
                "Email is required"
            )
            .refine(
                (value) =>
                    value.length === 0 ||
                    z.string().email().safeParse(value).success,
                "Please enter a valid email address"
            )
    ),

    password: z.preprocess(
        (value) => value === undefined ? "" : value,
        z.string()
            .min(8, "Password must be at least 8 characters")
            .max(72, "Password cannot exceed 72 characters")
    ),
});

// -------------------- REGISTER --------------------

router.post("/register", async (req, res) => {
    try {
        const parsed = registerSchema.safeParse(req.body);

        if (!parsed.success) {
            const errors = parsed.error.issues.map((issue) => ({
                field: String(issue.path[0] || "request"),
                message: issue.message,
            }));

            return res.status(400).json({
                message: "Please correct the highlighted fields",
                errors,
            });
        }

        const name = parsed.data.name;
        const email = parsed.data.email.toLowerCase();
        const password = parsed.data.password;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({
                message: "This email is already registered",
                field: "email",
            });
        }

        // Hash the password with bcrypt cost factor 12.
        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        return res.status(201).json({
            message: "Account created successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: "An account with this email already exists",
            });
        }

        console.error("Registration error:", error.message);

        return res.status(500).json({
            message: "Unable to create account",
        });
    }
});

// -------------------- LOGIN VALIDATION --------------------

const loginSchema = z.object({
    email: z.string().trim().email().max(254),
    // Login checks credentials; it does not enforce registration rules.
    password: z.string().min(1).max(72),
});

// -------------------- LOGIN --------------------

router.post("/login", loginLimiter, async (req, res) => {
    try {
        const parsed = loginSchema.safeParse(req.body);

        if (!parsed.success) {
            return res.status(400).json({
                message: "Please provide a valid email and password",
            });
        }

        const email = parsed.data.email.toLowerCase();
        const password = parsed.data.password;

        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        // Issue a JWT only after successful authentication.
        const token = jwt.sign(
            { sub: user._id.toString() },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN || "15m",
            }
        );

        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        console.error("Login error:", error.message);

        return res.status(500).json({
            message: "Unable to log in",
        });
    }
});

// -------------------- GET PROFILE --------------------


router.get("/profile", authMiddleware, (req, res) => {
    res.set("Cache-Control", "no-store");

    return res.status(200).json({
        message: "Profile fetched successfully",
        user: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            createdAt: req.user.createdAt,
        },
    });
});


// -------------------- UPDATE PROFILE --------------------

const updateProfileSchema = z.object({
    name: z.string()
        .trim()
        .min(3, "Name must be at least 3 characters")
        .max(80, "Name cannot exceed 80 characters")
        .refine(
            (value) => /[a-zA-Z]/.test(value),
            "Name must contain at least one letter (A-Z)"
        ),
});

router.put("/profile", authMiddleware, async (req, res) => {
    const parsed = updateProfileSchema.safeParse(req.body);

    if (!parsed.success) {
        return res.status(400).json({
            message: "Please correct the highlighted fields",
            errors: parsed.error.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message,
            })),
        });
    }

    try {
        req.user.name = parsed.data.name;
        await req.user.save();

        return res.status(200).json({
            message: "Profile updated successfully",
            user: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                createdAt: req.user.createdAt,
            },
        });
    } catch (error) {
        console.error("Profile update error:", error.message);

        return res.status(500).json({
            message: "Unable to update profile",
        });
    }
});

// -------------------- CHANGE PASSWORD VALIDATION --------------------

const changePasswordSchema = z.object({
    currentPassword: z.string()
        .min(1, "Current password is required")
        .max(72, "Current password cannot exceed 72 characters"),

    newPassword: z.string()
        .min(8, "New password must be at least 8 characters")
        .max(72, "New password cannot exceed 72 characters"),
});

// -------------------- CHANGE PASSWORD --------------------

router.put("/change-password", authMiddleware, async (req, res) => {
    const parsed = changePasswordSchema.safeParse(req.body);

    if (!parsed.success) {
        return res.status(400).json({
            message: "Please correct the highlighted fields",
            errors: parsed.error.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message,
            })),
        });
    }

    try {
        const user = await User.findById(req.user._id).select("+password");

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        const isCurrentPasswordValid = await bcrypt.compare(
            parsed.data.currentPassword,
            user.password
        );

        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                message: "Current password is incorrect",
                field: "currentPassword",
            });
        }

        const isSamePassword = await bcrypt.compare(
            parsed.data.newPassword,
            user.password
        );

        if (isSamePassword) {
            return res.status(400).json({
                message: "New password must differ from your current password",
                field: "newPassword",
            });
        }

        // Hash the new password with the same cost factor as registration.
        user.password = await bcrypt.hash(parsed.data.newPassword, 12);
        await user.save();

        return res.status(200).json({
            message: "Password changed successfully. Please log in again.",
        });
    } catch (error) {
        console.error("Change password error:", error.message);

        return res.status(500).json({
            message: "Unable to change password",
        });
    }
});

// -------------------- GOOGLE OAUTH --------------------

const googleSchema = z.object({
    idToken: z.string().min(1, "Google ID token is required"),
});

router.post("/google", async (req, res) => {
    try {
        const parsed = googleSchema.safeParse(req.body);

        if (!parsed.success) {
            return res.status(400).json({
                message: "Google ID token is required",
            });
        }

        // Verify the Firebase ID token
        let decoded;
        try {
            decoded = await firebaseAuth.verifyIdToken(parsed.data.idToken);
            console.log("✅ verifyIdToken success for:", decoded.email);
        } catch (err) {
            console.error("❌ verifyIdToken FAILED");
            console.error("   Code:", err.code);
            console.error("   Message:", err.message);
            return res.status(401).json({
                message: "Invalid or expired Google token",
            });
        }

        const { email, name } = decoded;

        if (!email) {
            return res.status(400).json({
                message: "Google account does not have an email",
            });
        }

        // Find or create the user
        let user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            const crypto = require("crypto");
            const randomPassword = crypto.randomBytes(32).toString("hex");
            const hashedPassword = await bcrypt.hash(randomPassword, 12);

            user = await User.create({
                name: name || email.split("@")[0],
                email: email.toLowerCase(),
                password: hashedPassword,
            });
        }

        // Issue our own JWT
        const token = jwt.sign(
            { sub: user._id.toString() },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || "15m" }
        );

        return res.status(200).json({
            message: "Google login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        console.error("Google auth error:", error.message);
        return res.status(500).json({
            message: "Unable to sign in with Google",
        });
    }
});


module.exports = router;
