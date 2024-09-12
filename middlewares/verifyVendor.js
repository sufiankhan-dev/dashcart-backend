const jwt = require("jsonwebtoken");
const Vendor = require("../models/Vendor");

module.exports = async (req, res, next) => {
  const fullToken = req.header("Authorization");
  if (!fullToken) return res.status(401).send({ message: "Access denied." });
  const token = fullToken.split(" ")[1];
  try {
    const verified = jwt.verify(token, process.env.TOKEN_KEY);
    let user = await Vendor.findById(verified._id);
    if (!user) return res.status(400).send({ message: "Invalid Token" });
    req.user = user;
    if (user.status !== "active") return res.status(400).send({ message: "Vendor is not active" });
    if (user.type !== "vendor" && user.type !== "admin") return res.status(400).send({ message: "Vendor is not an admin" });
    // if (req.method === "GET" && user.permissions?.includes("read") === false) return res.status(400).send({ message: "User does not have read permission" });
    // if (req.method === "POST" && user.permissions?.includes("create") === false) return res.status(400).send({ message: "User does not have create permission" });
    // if (req.method === "PUT" && user.permissions?.includes("update") === false) return res.status(400).send({ message: "User does not have update permission" });
    // if (req.method === "DELETE" && user.permissions?.includes("delete") === false) return res.status(400).send({ message: "User does not have delete permission" });
    // console.log("Time: ", new Date().toLocaleString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }), " User: " + user.email, " Method: " + req.method, " IP: " + req.ip);
    next();
  } catch (error) {
    res.status(400).send({ message: "Invalid Token" });
  }
};