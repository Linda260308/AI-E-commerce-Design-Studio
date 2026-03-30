/**
 * Vercel Serverless Function - Direct ASGI handler
 */
const path = require('path');

// Vercel Python runtime 会执行 Python 代码
// 这里我们导出一个兼容的 handler
module.exports = async (req, res) => {
  // 这个文件会被 Vercel Python runtime 覆盖
  // 实际执行的是 api/index.py
  res.status(200).json({ status: 'ok' });
};
