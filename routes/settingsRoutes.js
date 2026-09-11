const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');

// All Users Endpoints (Global Operations)
router.get('/', settingsController.getAllSettings);          // GET ALL
router.post('/', settingsController.createSettings);          // POST (Create single)
router.put('/', settingsController.updateAllSettings);        // PUT ALL (Update all users)
router.delete('/', settingsController.deleteAllSettings);     // DELETE ALL (Clear file)

// Single User Specific Endpoints
router.get('/:userId', settingsController.getSettings);       // GET BY ID
router.put('/:userId', settingsController.updateSettings);    // PUT BY ID (Update fields or change ID)
router.delete('/:userId', settingsController.deleteSettings); // DELETE BY ID

module.exports = router;