import express, { Express, Request, Response } from "express";
import {
  createUser,
  deleteUser,
  updateUser,
} from "../controllers/user.controller";

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
      item: user,
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

router.delete("/:userId", async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;

    await deleteUser(userId);

    res.json({
      item: null,
      status: 200,
      message: "User and unsent jobs deleted successfully",
    });
  } catch (err) {
    res.json({
      item: null,
      status: err?.code || err.statusCode || 500,
      message: err.message || "Something went wrong while deleting the user!",
    });
  }
});

router.patch("/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { email, firstname, lastname, location, birthdate } = req.body;

    const user = await updateUser(userId, {
      email,
      firstname,
      lastname,
      location,
      birthdate,
    });

    res.json({
      item: user,
      status: 200,
      message: "User and jobs update successfully",
    });
  } catch (err) {
    res.json({
      item: null,
      status: err?.code || err.statusCode || 500,
      message: err.message || "Something went wrong while deleting the user!",
    });
  }
});
export default router;
