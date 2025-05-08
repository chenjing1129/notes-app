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

// 获取笔记列表
export const getNotes = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: "用户ID是必填项" });
    }

    // 1. 获取用户的所有笔记基本信息
    const [notes] = await pool.query(
      "SELECT * FROM notes WHERE user_id = ? ORDER BY updated_at DESC",
      [userId]
    );

    // 2. 为每条笔记获取其关联的标签
    // 使用 Promise.all 来并行处理每条笔记的标签查询
    const notesWithTags = await Promise.all(
      notes.map(async (note) => {
        const [tagsResult] = await pool.query(
          "SELECT t.name FROM tags t INNER JOIN note_tags nt ON t.id = nt.tag_id WHERE nt.note_id = ?",
          [note.id]
        );
        // 将查询到的标签名称数组附加到笔记对象上
        return { ...note, tags: tagsResult.map((tag) => tag.name) };
      })
    );

    res.status(200).json(notesWithTags);
  } catch (error) {
    console.error("获取笔记列表时发生错误:", error);
    res.status(500).json({ error: "服务器内部错误", details: error.message });
  }
};

// 根据分类获取笔记列表
export const getNotesByCategory = async (req, res) => {
  try {
    const { userId, categoryId } = req.params;
    if (!userId || !categoryId) {
      return res.status(400).json({ error: "用户ID和分类ID是必填项" });
    }

    // 1. 根据用户ID和分类ID获取笔记基本信息
    const [notes] = await pool.query(
      "SELECT * FROM notes WHERE user_id = ? AND category_id = ? ORDER BY updated_at DESC",
      [userId, categoryId]
    );

    // 2. 为每条笔记获取其关联的标签
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

// 获取单个笔记
export const getNote = async (req, res) => {
  try {
    const { id: noteId } = req.params; // 将 id 重命名为 noteId 更清晰
    if (!noteId) {
      return res.status(400).json({ error: "笔记ID是必填项" });
    }

    // 1. 获取单个笔记的基本信息
    const [noteRows] = await pool.query("SELECT * FROM notes WHERE id = ?", [
      noteId,
    ]);

    if (noteRows.length > 0) {
      const note = noteRows[0];
      // 2. 获取该笔记的标签
      const [tagsResult] = await pool.query(
        "SELECT t.name FROM tags t INNER JOIN note_tags nt ON t.id = nt.tag_id WHERE nt.note_id = ?",
        [note.id]
      );
      // 将标签名称数组附加到笔记对象
      note.tags = tagsResult.map((tag) => tag.name);
      res.status(200).json(note);
    } else {
      res.status(404).json({ error: "未找到指定笔记" });
    }
  } catch (error) {
    console.error("获取单个笔记时发生错误:", error);
    res.status(500).json({ error: "服务器内部错误", details: error.message });
  }
};

// 更新笔记
export const updateNote = async (req, res) => {
  const { id: noteId } = req.params;
  const { title, content, categoryId, tags: tagNames } = req.body;

  if (!noteId || !title || !content) {
    return res.status(400).json({ error: "笔记ID、标题和内容是必填项" });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [updateResult] = await connection.query(
      "UPDATE notes SET title = ?, content = ?, category_id = ? WHERE id = ?",
      [title, content, categoryId, noteId]
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
              `(更新笔记时) 笔记 ${noteId} 和标签 ${currentTagName} (ID: ${tagId}) 已存在关联，跳过重复插入。`
            );
            if (!processedTags.includes(currentTagName)) {
              processedTags.push(currentTagName);
            }
          } else {
            console.error(
              `(更新笔记时) 关联笔记 ${noteId} 和标签 ${currentTagName} (ID: ${tagId}) 失败:`,
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
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("更新笔记过程中发生错误:", error);
    res.status(500).json({ error: "服务器内部错误", details: error.message });
  } finally {
    if (connection) connection.release();
  }
};

// 删除笔记
export const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Note ID is required" });
    }

    const [result] = await pool.query("DELETE FROM notes WHERE id = ?", [id]);

    if (!result) {
      console.error("Database delete failed:", error);
      return res.status(500).json({ error: "Failed to delete note" });
    }

    res.status(200).json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error("Error in deleteNote:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};
