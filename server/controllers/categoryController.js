import pool from "../config/db.js";

// 创建分类
export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Category name is required" });
    }

    const [existingCategory] = await pool.query(
      "SELECT * FROM categories WHERE name = ?",
      [name]
    );

    if (existingCategory.length > 0) {
      return res.status(409).json({ error: "Category already exists" });
    }

    const [result] = await pool.query(
      "INSERT INTO categories (name) VALUES (?)",
      [name]
    );

    if (!result) {
      console.error("Database insert failed:", error);
      return res.status(500).json({ error: "Failed to create category" });
    }

    res.status(201).json({ id: result.insertId, name });
  } catch (error) {
    console.error("Error in createCategory:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};

// 获取分类列表
export const getCategories = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM categories");

    if (!rows) {
      console.error("Database query failed:", error);
      return res.status(500).json({ error: "Failed to fetch categories" });
    }

    res.status(200).json(rows);
  } catch (error) {
    console.error("Error in getCategories:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};

// 获取单个分类
export const getCategory = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Category ID is required" });
    }

    const [rows] = await pool.query("SELECT * FROM categories WHERE id = ?", [
      id,
    ]);

    if (!rows) {
      console.error("Database query failed:", error);
      return res.status(500).json({ error: "Failed to fetch category" });
    }

    if (rows.length > 0) {
      res.status(200).json(rows[0]);
    } else {
      res.status(404).json({ error: "Category not found" });
    }
  } catch (error) {
    console.error("Error in getCategory:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};

// 更新分类
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!id || !name) {
      return res
        .status(400)
        .json({ error: "Category ID and name are required" });
    }

    const [result] = await pool.query(
      "UPDATE categories SET name = ? WHERE id = ?",
      [name, id]
    );

    if (!result) {
      console.error("Database update failed:", error);
      return res.status(500).json({ error: "Failed to update category" });
    }

    res.status(200).json({ id, name });
  } catch (error) {
    console.error("Error in updateCategory:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};

// 删除分类
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Category ID is required" });
    }

    const [result] = await pool.query("DELETE FROM categories WHERE id = ?", [
      id,
    ]);

    if (!result) {
      console.error("Database delete failed:", error);
      return res.status(500).json({ error: "Failed to delete category" });
    }

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error in deleteCategory:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};
