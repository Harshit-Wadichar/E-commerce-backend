import express from "express";
import { getUser, newUser, deleteUser } from "../controllers/user.js";
import { getAllUsers } from "../controllers/user.js";
import { adminOnly } from "../middlewares/auth.js";
const app = express.Router();
// /api/v1/user/new
app.post("/new", newUser);
// /api/v1/user/all
app.get("/all", adminOnly, getAllUsers);
// /api/v1/user/:id
app.route("/:id").get(getUser).delete(adminOnly, deleteUser);
export default app;
//# sourceMappingURL=user%20copy.js.map