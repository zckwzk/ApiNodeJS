import express, { Express, Request, Response } from "express";
import { createUser } from "../controllers/user.controller";

const router = express.Router();

router.get("/test", (req: Request, res: Response) => {
  res.send("test api");
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const { email, firstname, lastname, location, birthdate } = req.body;

    const user = await createUser({
      email,
      firstname,
      lastname,
      location,
      birthdate,
    });

    res.json({
      user,
      status: 200,
      message: "User created successfully!",
    });
  } catch (err) {
    res.json({
      item: null,
      status: err?.code || err.statusCode || 500,
      message: err.message || "Something went wrong while creating new item!",
    });
  }
});

export default router;
