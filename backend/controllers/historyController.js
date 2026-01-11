const Calculation = require('../models/Calculation');
const Chat = require('../models/Chat');

const getCalcHistory = async (req, res) => {
  try {
    const history = await Calculation
      .find()
      .sort({ timestamp: -1 })     
      .limit(50)
      .select('-__v');           

    res.json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (err) {
    console.error('Get calc history error:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch calculation history',
      message: err.message
    });
  }
};

const getChatHistory = async (req, res) => {
  try {
    const history = await Chat
      .find()
      .sort({ timestamp: -1 })
      .limit(50)
      .select('-__v -messages._id'); 

    res.json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (err) {
    console.error('Get chat history error:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch chat history',
      message: err.message
    });
  }
};

const updateCalc = async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;

  // Basic validation
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Title is required and must be a non-empty string'
    });
  }

  try {
    const calc = await Calculation.findByIdAndUpdate(
      id,
      { title: title.trim() },
      { new: true, runValidators: true }
    ).select('-__v');

    if (!calc) {
      return res.status(404).json({
        success: false,
        error: 'Calculation not found'
      });
    }

    res.json({
      success: true,
      data: calc
    });
  } catch (err) {
    console.error('Update calc error:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to update calculation',
      message: err.message
    });
  }
};

const deleteCalc = async (req, res) => {
  const { id } = req.params;

  try {
    const calc = await Calculation.findByIdAndDelete(id);

    if (!calc) {
      return res.status(404).json({
        success: false,
        error: 'Calculation not found'
      });
    }

    res.json({
      success: true,
      message: 'Calculation deleted successfully',
      deletedId: id
    });
  } catch (err) {
    console.error('Delete calc error:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to delete calculation',
      message: err.message
    });
  }
};

const updateChat = async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Title is required and must be a non-empty string'
    });
  }

  try {
    const chat = await Chat.findByIdAndUpdate(
      id,
      { title: title.trim() },
      { new: true, runValidators: true }
    ).select('-__v -messages._id');

    if (!chat) {
      return res.status(404).json({
        success: false,
        error: 'Chat not found'
      });
    }

    res.json({
      success: true,
      data: chat
    });
  } catch (err) {
    console.error('Update chat error:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to update chat',
      message: err.message
    });
  }
};

const deleteChat = async (req, res) => {
  const { id } = req.params;

  try {
    const chat = await Chat.findByIdAndDelete(id);

    if (!chat) {
      return res.status(404).json({
        success: false,
        error: 'Chat not found'
      });
    }

    res.json({
      success: true,
      message: 'Chat deleted successfully',
      deletedId: id
    });
  } catch (err) {
    console.error('Delete chat error:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to delete chat',
      message: err.message
    });
  }
};

module.exports = {
  getCalcHistory,
  getChatHistory,
  updateCalc,
  deleteCalc,
  updateChat,
  deleteChat
};