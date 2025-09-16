import api from "./api";

export const loginUser = async (credentials) => {
  try {
    const response = await api.post("/login", credentials);
    console.log("Login API raw response:", response);
    return {
      token: response.data.access_token,
      user: response.data.user,
      la_list: response.data.la_list || []
    };
  } catch (error) {
    console.error("Login API error:", error);
    if (error.response) {
      throw {
        message: error.response.data.message || "Login failed",
        errors: error.response.data.errors || {},
        status: error.response.status
      };
    }
    throw { message: "Network error. Please try again." };
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await api.post("/register", {
      name: userData.name,
      email: userData.email,
      mobile: userData.mobile,
      password: userData.password,
      'confirm-password': userData.confirm_password,
    });
    console.log("Register API raw response:", response);
    return response.data;
  } catch (error) {
    console.error("Register API error:", error);
    if (error.response) {
      throw {
        message: error.response.data.message || "Registration failed",
        errors: error.response.data.errors || {},
        status: error.response.status
      };
    }
    throw { message: "Network error. Please try again." };
  }
};

export const submitUserType = async (userType) => {
  try {
    const token = localStorage.getItem('token') || store.getState()?.auth?.token;
    if (!token) {
      throw { message: "Authentication token not found" };
    }

    const response = await api.post("/submitUsertype", 
      { userType: userType },  // Changed from user_type to userType
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error){
    console.error("Submit User Type API error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: error.config
    });
    
    throw {
      message: error.response?.data?.message || "Failed to submit user type",
      errors: error.response?.data?.errors || {},
      status: error.response?.status
    };
  }
};