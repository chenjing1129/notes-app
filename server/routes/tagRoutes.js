import express from "express";
import {
  getAllTags,
  getNotesByTagName,
  getTagById,
} from "../controllers/tagController.js";

const router = express.Router();

router.get("/", getAllTags);

router.get("/:tagId", getTagById);

router.get("/name/:tagName/notes", getNotesByTagName);

export default router;
