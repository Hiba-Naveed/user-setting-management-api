const fs = require('fs/promises');
const path = require('path');

const filePath = path.join(__dirname, '../data/userSettings.json');

// Helper: File read karne ke liye
const readData = async () => {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data || '[]');
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.writeFile(filePath, '[]', 'utf8');
      return [];
    }
    throw error;
  }
};

// Helper: File write karne ke liye
const writeData = async (data) => {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
};

// Helper: Validation check karne ke liye
const validateSettingsInput = ({ userId, language, notificationsEnabled, timezone }, isUpdate = false) => {
  const errors = [];

  if (!isUpdate && (!userId || typeof userId !== 'string' || !userId.trim())) {
    errors.push('userId is required and must be a non-empty string.');
  }

  if (language !== undefined && !['EN', 'UR'].includes(language)) {
    errors.push('language must be either "EN" or "UR".');
  }

  if (notificationsEnabled !== undefined && typeof notificationsEnabled !== 'boolean') {
    errors.push('notificationsEnabled must be a boolean.');
  }

  if (timezone !== undefined && (typeof timezone !== 'string' || !timezone.trim())) {
    errors.push('timezone must be a valid non-empty string.');
  }

  return errors;
};

// 1. GET ALL: Sabhi users ki settings list get karein
exports.getAllSettings = async (req, res) => {
  try {
    const settingsList = await readData();
    return res.status(200).json(settingsList);
  } catch (error) {
    console.error('Error fetching all settings:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// 2. GET BY ID: Single user get karein
exports.getSettings = async (req, res) => {
  try {
    const { userId } = req.params;
    const settingsList = await readData();

    const userSetting = settingsList.find((s) => s.userId === userId);

    if (!userSetting) {
      return res.status(404).json({ error: `User settings for userId '${userId}' not found.` });
    }

    return res.status(200).json(userSetting);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// 3. CREATE: Naya user add karein
exports.createSettings = async (req, res) => {
  try {
    const { userId, language = 'EN', notificationsEnabled = true, timezone = 'UTC' } = req.body;

    const validationErrors = validateSettingsInput({ userId, language, notificationsEnabled, timezone });
    if (validationErrors.length > 0) {
      return res.status(400).json({ errors: validationErrors });
    }

    const settingsList = await readData();
    const existingUser = settingsList.find((s) => s.userId === userId);

    if (existingUser) {
      return res.status(409).json({ error: `User settings with userId '${userId}' already exists.` });
    }

    const now = new Date().toISOString();
    const newSetting = {
      userId,
      language,
      notificationsEnabled,
      timezone,
      createdAt: now,
      updatedAt: now,
    };

    settingsList.push(newSetting);
    await writeData(settingsList);
    console.log(`[CREATE] Settings created for userId: ${userId}`);

    return res.status(201).json(newSetting);
  } catch (error) {
    console.error('Error creating settings:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// 4. PUT BY ID: Single user ki details (ya userId) change karein
exports.updateSettings = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newUserId, language, notificationsEnabled, timezone } = req.body;

    const validationErrors = validateSettingsInput({ userId: newUserId, language, notificationsEnabled, timezone }, true);
    if (validationErrors.length > 0) {
      return res.status(400).json({ errors: validationErrors });
    }

    const settingsList = await readData();
    const index = settingsList.findIndex((s) => s.userId === userId);

    if (index === -1) {
      return res.status(404).json({ error: `User settings for userId '${userId}' not found.` });
    }

    // Agar user ID change ki ja rahi hai, to check karein ki new ID kisi aur ke paas to nahi hai
    if (newUserId && newUserId !== userId) {
      const duplicateUser = settingsList.find((s) => s.userId === newUserId);
      if (duplicateUser) {
        return res.status(409).json({ error: `Target userId '${newUserId}' is already in use by another user.` });
      }
    }

    const currentSetting = settingsList[index];
    const updatedSetting = {
      ...currentSetting,
      userId: newUserId ? newUserId : currentSetting.userId, // User ID rename karne ka option
      ...(language !== undefined && { language }),
      ...(notificationsEnabled !== undefined && { notificationsEnabled }),
      ...(timezone !== undefined && { timezone }),
      updatedAt: new Date().toISOString(),
    };

    settingsList[index] = updatedSetting;
    await writeData(settingsList);
    console.log(`[UPDATE] Settings updated for userId: ${userId} -> ${updatedSetting.userId}`);

    return res.status(200).json(updatedSetting);
  } catch (error) {
    console.error('Error updating settings:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// 5. PUT ALL: Sabhi users ki global settings ek sath update karein
exports.updateAllSettings = async (req, res) => {
  try {
    const { language, notificationsEnabled, timezone } = req.body;

    const validationErrors = validateSettingsInput({ language, notificationsEnabled, timezone }, true);
    if (validationErrors.length > 0) {
      return res.status(400).json({ errors: validationErrors });
    }

    const settingsList = await readData();
    const now = new Date().toISOString();

    const updatedList = settingsList.map((setting) => ({
      ...setting,
      ...(language !== undefined && { language }),
      ...(notificationsEnabled !== undefined && { notificationsEnabled }),
      ...(timezone !== undefined && { timezone }),
      updatedAt: now,
    }));

    await writeData(updatedList);
    console.log(`[UPDATE ALL] All user settings updated globally.`);

    return res.status(200).json({
      message: 'All user settings updated successfully.',
      updatedCount: updatedList.length,
      data: updatedList
    });
  } catch (error) {
    console.error('Error updating all settings:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// 6. DELETE BY ID: Single user delete karein
exports.deleteSettings = async (req, res) => {
  try {
    const { userId } = req.params;

    const settingsList = await readData();
    const index = settingsList.findIndex((s) => s.userId === userId);

    if (index === -1) {
      return res.status(404).json({ error: `User settings for userId '${userId}' not found.` });
    }

    settingsList.splice(index, 1);
    await writeData(settingsList);
    console.log(`[DELETE] Settings removed for userId: ${userId}`);

    return res.status(200).json({ message: `User settings for userId '${userId}' deleted successfully.` });
  } catch (error) {
    console.error('Error deleting settings:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// 7. DELETE ALL: Tamam users delete karein
exports.deleteAllSettings = async (req, res) => {
  try {
    await writeData([]);
    console.log(`[DELETE ALL] All user settings cleared.`);
    return res.status(200).json({ message: 'All user settings deleted successfully.' });
  } catch (error) {
    console.error('Error deleting all settings:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};