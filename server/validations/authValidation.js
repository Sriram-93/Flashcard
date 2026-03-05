const { z } = require("zod");

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (err) {
    if (err instanceof z.ZodError) {
      const errorMessages = (err.issues || err.errors || []).map((e) => e.message);
      return res.status(400).json({ message: "Validation Failed", errors: errorMessages });
    }
    next(err);
  }
};

module.exports = {
  signupSchema,
  loginSchema,
  validate
};
