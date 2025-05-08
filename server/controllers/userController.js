import pool from "../config/db.js";

// 注册用户
export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const [existingUser] = await pool.query(
      "SELECT * FROM users WHERE username = ? OR email = ?",
      [username, email]
    );

    if (existingUser.length > 0) {
      return res
        .status(409)
        .json({ error: "Username or email already exists" });
    }

    const [result] = await pool.query(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [username, email, password]
    );

    if (!result) {
      console.error("Database insert failed:", error);
      return res.status(500).json({ error: "Failed to create user" });
    }

    res.status(201).json({ id: result.insertId, username, email });
  } catch (error) {
    console.error("Error in registerUser:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};

//登录用户
export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }

    const [rows] = await pool.query(
      "SELECT * FROM users WHERE username = ? AND password = ?",
      [username, password]
    );

    if (!rows) {
      console.error("Database query failed:", error);
      return res.status(500).json({ error: "Failed to authenticate user" });
    }

    if (rows.length > 0) {
      res.status(200).json(rows[0]);
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Error in loginUser:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};

// 获取用户信息
export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);

    if (!rows) {
      console.error("Database query failed:", error);
      return res.status(500).json({ error: "Failed to fetch user" });
    }

    if (rows.length > 0) {
      res.status(200).json(rows[0]);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error("Error in getUser:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};
