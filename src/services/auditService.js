const { AuditLog } = require('../models/AuditLog');

async function audit(req, action, entity, entityId, metadata = {}) {
  try {
    await AuditLog.create({
      actor: req.user?._id,
      action,
      entity,
      entityId,
      metadata,
      ip: req.ip
    });
  } catch (error) {
    console.warn(`Audit failed: ${error.message}`);
  }
}

module.exports = { audit };
