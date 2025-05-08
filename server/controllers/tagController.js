import pool from "../config/db.js";

// 获取所有标签
export const getAllTags = async (req, res) => {
  try {
    // 查询 tags 表，获取所有标签的 id 和 name
    const [tags] = await pool.query(
      "SELECT id, name FROM tags ORDER BY name ASC"
    );
    res.status(200).json(tags);
  } catch (error) {
    console.error("获取所有标签时发生错误:", error);
    res.status(500).json({ error: "服务器内部错误", details: error.message });
  }
};

// 根据标签名称（或id）获取使用该标签的所有笔记
export const getNotesByTagName = async (req, res) => {
  try {
    const { tagName } = req.params;
    if (!tagName) {
      return res.status(400).json({ error: "标签名称是必填项" });
    }

    // 1. 根据标签名称找到标签id
    const [tagResult] = await pool.query("SELECT id FROM tags WHERE name = ?", [
      tagName,
    ]);
    if (tagResult.length === 0) {
      return res.status(404).json({ error: `未找到标签: ${tagName}` });
    }
    const tagId = tagResult[0].id;

    // 2. 根据标签id在 note_tags 表中找到所有关联的 note_id
    const [notes] = await pool.query(
      `SELECT n.* FROM notes n JOIN note_tags nt ON n.id = nt.note_id WHERE nt.tag_id = ? ORDER BY n.updated_at DESC`,
      [tagId]
    );

    // 3. 为每篇找到的笔记填充其所有标签
    const notesWithAllTheirTags = await Promise.all(
      notes.map(async (note) => {
        const [tagsForNote] = await pool.query(
          "SELECT t.name FROM tags t INNER JOIN note_tags nt_detail ON t.id = nt_detail.tag_id WHERE nt_detail.note_id = ?",
          [note.id]
        );
        return { ...note, tags: tagsForNote.map((t) => t.name) };
      })
    );

    res.status(200).json(notesWithAllTheirTags);
  } catch (error) {
    console.error(
      `根据标签 '${req.params.tagName}' 获取笔记时发生错误:`,
      error
    );
    res.status(500).json({ error: "服务器内部错误", details: error.message });
  }
};

// 获取指定ID的标签
export const getTagById = async (req, res) => {
  try {
    const { tagId } = req.params;
    if (!tagId || isNaN(parseInt(tagId))) {
      // 确保 tagId 是一个有效的数字
      return res.status(400).json({ error: "无效的标签ID" });
    }
    const [tags] = await pool.query("SELECT id, name FROM tags WHERE id = ?", [
      parseInt(tagId),
    ]);
    if (tags.length === 0) {
      return res.status(404).json({ error: "未找到指定ID的标签" });
    }
    res.status(200).json(tags[0]);
  } catch (error) {
    console.error(`获取ID为 ${req.params.tagId} 的标签时发生错误:`, error);
    res.status(500).json({ error: "服务器内部错误", details: error.message });
  }
};
