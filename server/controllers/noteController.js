import pool from "../config/db.js";

// 创建笔记
export const createNote = async (req, res) => {
  const { userId, title, content, categoryId, tags: tagNames } = req.body;

  if (!userId || !title || !content) {
    return res.status(400).json({ error: "用户id、标题和内容是必填项" });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [noteResult] = await connection.query(
      "INSERT INTO notes (user_id, title, content, category_id) VALUES (?, ?, ?, ?)",
      [userId, title, content, categoryId]
    );

    if (!noteResult || noteResult.insertId === 0) {
      await connection.rollback();
      console.error("数据库插入笔记失败");
      return res.status(500).json({ error: "创建笔记失败" });
    }
    const noteId = noteResult.insertId;

    const processedTags = [];
    if (tagNames && Array.isArray(tagNames) && tagNames.length > 0) {
      for (const tagName of tagNames) {
        if (typeof tagName !== "string" || tagName.trim() === "") continue;

        const currentTagName = tagName.trim();
        let tagId;

        const [existingTags] = await connection.query(
          "SELECT id FROM tags WHERE name = ?",
          [currentTagName]
        );

        if (existingTags.length > 0) {
          tagId = existingTags[0].id;
        } else {
          const [newTagResult] = await connection.query(
            "INSERT INTO tags (name) VALUES (?)",
            [currentTagName]
          );
          if (!newTagResult || newTagResult.insertId === 0) {
            console.warn(`创建标签 "${currentTagName}" 失败，已跳过此标签。`);
            continue;
          }
          tagId = newTagResult.insertId;
        }

        try {
          await connection.query(
            "INSERT INTO note_tags (note_id, tag_id) VALUES (?, ?)",
            [noteId, tagId]
          );
          processedTags.push(currentTagName);
        } catch (linkError) {
          if (linkError.code === "ER_DUP_ENTRY") {
            console.warn(
              `笔记 ${noteId} 和标签 ${currentTagName} (ID: ${tagId}) 已存在关联，跳过重复插入。`
            );
            if (!processedTags.includes(currentTagName)) {
              processedTags.push(currentTagName);
            }
          } else {
            console.error(
              `关联笔记 ${noteId} 和标签 ${currentTagName} (ID: ${tagId}) 失败:`,
              linkError
            );
          }
        }
      }
    }

    await connection.commit();

    res.status(201).json({
      id: noteId,
      userId,
      title,
      content,
      categoryId,
      tags: processedTags,
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("创建笔记过程中发生错误:", error);
    res.status(500).json({ error: "服务器内部错误", details: error.message });
  } finally {
    if (connection) connection.release();
  }
};

// 获取笔记列表 - 只获取未删除的
export const getNotes = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: "用户ID是必填项" });
    }
    const [notes] = await pool.query(
      "SELECT * FROM notes WHERE user_id = ? AND deleted_at IS NULL ORDER BY updated_at DESC",
      [userId]
    );
    const notesWithTags = await Promise.all(
      notes.map(async (note) => {
        const [tagsResult] = await pool.query(
          "SELECT t.name FROM tags t INNER JOIN note_tags nt ON t.id = nt.tag_id WHERE nt.note_id = ?",
          [note.id]
        );
        return { ...note, tags: tagsResult.map((tag) => tag.name) };
      })
    );
    res.status(200).json(notesWithTags);
  } catch (error) {
    console.error("获取笔记列表时发生错误:", error);
    res.status(500).json({ error: "服务器内部错误", details: error.message });
  }
};

// 根据分类获取笔记列表 - 只获取未删除的
export const getNotesByCategory = async (req, res) => {
  try {
    const { userId, categoryId } = req.params;
    if (!userId || !categoryId) {
      return res.status(400).json({ error: "用户ID和分类ID是必填项" });
    }
    const [notes] = await pool.query(
      "SELECT * FROM notes WHERE user_id = ? AND category_id = ? AND deleted_at IS NULL ORDER BY updated_at DESC",
      [userId, categoryId]
    );
    const notesWithTags = await Promise.all(
      notes.map(async (note) => {
        const [tagsResult] = await pool.query(
          "SELECT t.name FROM tags t INNER JOIN note_tags nt ON t.id = nt.tag_id WHERE nt.note_id = ?",
          [note.id]
        );
        return { ...note, tags: tagsResult.map((tag) => tag.name) };
      })
    );
    res.status(200).json(notesWithTags);
  } catch (error) {
    console.error("根据分类获取笔记列表时发生错误:", error);
    res.status(500).json({ error: "服务器内部错误", details: error.message });
  }
};

// 获取单个笔记 - 只获取未删除的
export const getNote = async (req, res) => {
  try {
    const { id: noteId } = req.params;
    if (!noteId) {
      return res.status(400).json({ error: "笔记ID是必填项" });
    }
    const [noteRows] = await pool.query(
      "SELECT * FROM notes WHERE id = ? AND deleted_at IS NULL",
      [noteId]
    );
    if (noteRows.length > 0) {
      const note = noteRows[0];
      const [tagsResult] = await pool.query(
        "SELECT t.name FROM tags t INNER JOIN note_tags nt ON t.id = nt.tag_id WHERE nt.note_id = ?",
        [note.id]
      );
      note.tags = tagsResult.map((tag) => tag.name);
      res.status(200).json(note);
    } else {
      res.status(404).json({ error: "未找到指定笔记或笔记已被删除" });
    }
  } catch (error) {
    console.error("获取单个笔记时发生错误:", error);
    res.status(500).json({ error: "服务器内部错误", details: error.message });
  }
};

// 更新笔记 (保持大部分不变，但要确保操作的是未删除的笔记)
export const updateNote = async (req, res) => {
  const { id: noteId } = req.params;
  const { title, content, categoryId, tags: tagNames, userId } = req.body;

  if (!noteId || !title || !content || !userId) {
    return res
      .status(400)
      .json({ error: "笔记ID、用户ID、标题和内容是必填项" });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [noteCheck] = await connection.query(
      "SELECT id FROM notes WHERE id = ? AND user_id = ? AND deleted_at IS NULL",
      [noteId, userId]
    );
    if (noteCheck.length === 0) {
      await connection.rollback();
      return res
        .status(404)
        .json({ error: "笔记未找到、不属于当前用户或已被删除" });
    }

    const [updateResult] = await connection.query(
      "UPDATE notes SET title = ?, content = ?, category_id = ?, updated_at = NOW() WHERE id = ? AND user_id = ?",
      [title, content, categoryId, noteId, userId]
    );

    if (updateResult.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "笔记未找到或更新失败" });
    }

    await connection.query("DELETE FROM note_tags WHERE note_id = ?", [noteId]);

    const processedTags = [];
    if (tagNames && Array.isArray(tagNames) && tagNames.length > 0) {
      for (const tagName of tagNames) {
        if (typeof tagName !== "string" || tagName.trim() === "") continue;

        const currentTagName = tagName.trim();
        let tagId;

        const [existingTags] = await connection.query(
          "SELECT id FROM tags WHERE name = ?",
          [currentTagName]
        );

        if (existingTags.length > 0) {
          tagId = existingTags[0].id;
        } else {
          const [newTagResult] = await connection.query(
            "INSERT INTO tags (name) VALUES (?)",
            [currentTagName]
          );
          if (!newTagResult || newTagResult.insertId === 0) {
            console.warn(
              `(更新笔记时) 创建标签 "${currentTagName}" 失败，已跳过此标签。`
            );
            continue;
          }
          tagId = newTagResult.insertId;
        }

        try {
          await connection.query(
            "INSERT INTO note_tags (note_id, tag_id) VALUES (?, ?)",
            [noteId, tagId]
          );
          processedTags.push(currentTagName);
        } catch (linkError) {
          if (linkError.code === "ER_DUP_ENTRY") {
            console.warn(
              `笔记 ${noteId} 和标签 ${currentTagName} (ID: ${tagId}) 已存在关联，跳过重复插入。`
            );
            if (!processedTags.includes(currentTagName)) {
              processedTags.push(currentTagName);
            }
          } else {
            console.error(
              `关联笔记 ${noteId} 和标签 ${currentTagName} (ID: ${tagId}) 失败:`,
              linkError
            );
          }
        }
      }
    }

    await connection.commit();

    res.status(200).json({
      id: noteId,
      title,
      content,
      categoryId,
      tags: processedTags,
      userId,
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("更新笔记过程中发生错误:", error);
    res.status(500).json({ error: "服务器内部错误", details: error.message });
  } finally {
    if (connection) connection.release();
  }
};

// 删除笔记 (软删除)
export const deleteNote = async (req, res) => {
  const { id: noteId } = req.params;
  const { userId } = req.body;

  if (!noteId || !userId) {
    return res.status(400).json({ error: "笔记ID和用户ID是必填项" });
  }

  try {
    const [result] = await pool.query(
      "UPDATE notes SET deleted_at = NOW() WHERE id = ? AND user_id = ? AND deleted_at IS NULL",
      [noteId, userId]
    );
    if (result.affectedRows > 0) {
      res.status(200).json({ message: "笔记已移入垃圾箱" });
    } else {
      res.status(404).json({ error: "未找到指定笔记或笔记已在垃圾箱中" });
    }
  } catch (error) {
    console.error("软删除笔记时发生错误:", error);
    res.status(500).json({ error: "服务器内部错误", details: error.message });
  }
};

// --- 新增垃圾箱相关 API 控制器 ---

// 获取垃圾箱中的笔记列表
export const getTrashedNotes = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: "用户ID是必填项" });
    }

    const [notes] = await pool.query(
      "SELECT id, title, deleted_at FROM notes WHERE user_id = ? AND deleted_at IS NOT NULL ORDER BY deleted_at DESC",
      [userId]
    );
    res.status(200).json(notes);
  } catch (error) {
    console.error("获取垃圾箱笔记列表时发生错误:", error);
    res.status(500).json({ error: "服务器内部错误", details: error.message });
  }
};

// 从垃圾箱恢复笔记
export const restoreNote = async (req, res) => {
  const { noteId } = req.params;
  const { userId } = req.body;

  if (!noteId || !userId) {
    return res.status(400).json({ error: "笔记ID和用户ID是必填项" });
  }

  try {
    const [result] = await pool.query(
      "UPDATE notes SET deleted_at = NULL, updated_at = NOW() WHERE id = ? AND user_id = ? AND deleted_at IS NOT NULL",
      [noteId, userId]
    );
    if (result.affectedRows > 0) {
      res.status(200).json({ message: "笔记已从垃圾箱恢复" });
    } else {
      res
        .status(404)
        .json({ error: "未在垃圾箱中找到指定笔记或笔记不属于当前用户" });
    }
  } catch (error) {
    console.error("恢复笔记时发生错误:", error);
    res.status(500).json({ error: "服务器内部错误", details: error.message });
  }
};

// 永久删除笔记
export const permanentlyDeleteNote = async (req, res) => {
  const { noteId } = req.params;
  const { userId } = req.body;

  if (!noteId || !userId) {
    return res.status(400).json({ error: "笔记ID和用户ID是必填项" });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [noteCheck] = await connection.query(
      "SELECT id FROM notes WHERE id = ? AND user_id = ? AND deleted_at IS NOT NULL",
      [noteId, userId]
    );
    if (noteCheck.length === 0) {
      await connection.rollback();
      return res
        .status(404)
        .json({ error: "未在垃圾箱中找到指定笔记或笔记不属于当前用户" });
    }

    await connection.query("DELETE FROM note_tags WHERE note_id = ?", [noteId]);

    const [deleteResult] = await connection.query(
      "DELETE FROM notes WHERE id = ? AND user_id = ?",
      [noteId, userId]
    );

    if (deleteResult.affectedRows > 0) {
      await connection.commit();
      res.status(200).json({ message: "笔记已永久删除" });
    } else {
      await connection.rollback();
      res
        .status(404)
        .json({ error: "永久删除笔记失败，笔记可能已被恢复或不存在" });
    }
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("永久删除笔记时发生错误:", error);
    res.status(500).json({ error: "服务器内部错误", details: error.message });
  } finally {
    if (connection) connection.release();
  }
};
