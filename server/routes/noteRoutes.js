import express from "express";
import {
  createNote,
  getNotes,
  getNotesByCategory,
  getNote,
  updateNote,
  deleteNote,
  getTrashedNotes,
  restoreNote,
  permanentlyDeleteNote,
} from "../controllers/noteController.js";

const router = express.Router();

router.post("/", createNote);
router.get("/user/:userId", getNotes);
router.get("/user/:userId/category/:categoryId", getNotesByCategory);
router.get("/:id", getNote);
router.put("/:id", updateNote);
router.delete("/:id", deleteNote);
router.get("/trash/:userId", getTrashedNotes);
router.put("/:noteId/restore", restoreNote);
router.delete("/:noteId/force", permanentlyDeleteNote);

export default router;
