import userModel from "../models/userModel.js";
export const getUserData = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await userModel.findById(userId);
    if (!user) {
        return res.json({ success: false, message: 'User Not found' });
    }
    res.json({
        success: true,
        userData: {
            name: user.name,
            email: user.email,
            isVerified: user.isVerified,
        }
    })
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
