import { createSlice } from '@reduxjs/toolkit';

const loadInitialState = () => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    const userType = localStorage.getItem('userType');
    const slug = localStorage.getItem('slug');

    console.log('🔍 Loading initial state from localStorage:', {
      token: !!token,
      user: !!user,
      userType,
      slug,
    });

    if (token && user) {
      try {
        const parsedUser = JSON.parse(user);
        console.log('👤 Parsed user:', parsedUser);
        
        // Generate slug fallback more reliably
        let finalSlug = null;
        if (slug && slug !== '' && slug !== 'null' && slug !== 'undefined') {
          finalSlug = slug;
        } else if (parsedUser.slug) {
          finalSlug = parsedUser.slug;
        } else if (parsedUser.id) {
          finalSlug = parsedUser.id.toString();
        }
        
        console.log('🏷️ Final slug resolved:', finalSlug);
        
        return {
          user: parsedUser,
          token,
          userType: userType || parsedUser.user_type,
          slug: finalSlug,
          isOnline: parsedUser.is_online || false, // Default to false if not present
          isLoading: false,
          error: null,
          isAuthenticated: true,
        };
      } catch (error) {
        console.error('❌ Error loading auth state from localStorage:', error);
        // Clear corrupted localStorage data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userType');
        localStorage.removeItem('slug');
      }
    }
  }

  return {
    user: null,
    token: null,
    userType: null,
    slug: null,
    isOnline: false,
    isLoading: false,
    error: null,
    isAuthenticated: false,
  };
};

const authSlice = createSlice({
  name: 'auth',
  initialState: loadInitialState(),
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      console.log('🎉 Login success payload:', action.payload);
      
      state.isLoading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.userType = action.payload.userType || action.payload.user?.user_type;
      
      // More robust slug generation with debugging
      let slug = null;
      if (action.payload.slug) {
        slug = action.payload.slug;
      } else if (action.payload.user?.slug) {
        slug = action.payload.user.slug;
      } else if (action.payload.user?.id) {
        slug = action.payload.user.id.toString();
      }
      
      console.log('🏷️ Generated slug:', slug);
      
      state.slug = slug;
      state.isOnline = action.payload.isOnline || action.payload.user?.is_online || false;
      state.error = null;
      state.isAuthenticated = true;

      if (typeof window !== 'undefined') {
        console.log('💾 Saving to localStorage:', {
          token: !!action.payload.token,
          user: !!action.payload.user,
          userType: state.userType,
          slug: slug,
          mobile_verify: action.payload.user?.mobile_verify
        });
        
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
        localStorage.setItem('userType', state.userType || '');
        
        // Only store slug if it exists and is not empty
        if (slug && slug.trim() !== '') {
          localStorage.setItem('slug', slug);
          console.log('✅ Slug saved to localStorage:', slug);
        } else {
          console.warn('⚠️ No valid slug to save');
          localStorage.removeItem('slug'); // Remove any existing slug
        }
      }
    },
    loginFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
    },
    setUserType: (state, action) => {
      state.userType = action.payload;
      if (state.user) {
        state.user.user_type = action.payload;
        // Update localStorage as well
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(state.user));
          localStorage.setItem('userType', action.payload);
        }
      }
    },
    updateUserProfile: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        // Update localStorage with new user data
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(state.user));
        }
      }
    },
    setAuthLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.userType = null;
      state.slug = null; // Clear slug on logout
      state.isAuthenticated = false;
      state.error = null;
      state.isLoading = false;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userType');
        localStorage.removeItem('slug');
      }
    },
    // Action for when user returns from email verification
    emailVerified: (state) => {
      if (state.user) {
        state.user.email_verified_at = new Date().toISOString();
        // Update localStorage with new user data
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(state.user));
        }
      }
    },
    // Action for when mobile number is verified
    mobileVerified: (state, action) => {
      if (state.user) {
        state.user.mobile_verify = action.payload.timestamp || new Date().toISOString();
        // Update localStorage with new user data
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(state.user));
        }
      }
    },
    // Action to update online status
    updateOnlineStatus: (state, action) => {
      state.isOnline = action.payload;
      if (state.user) {
        state.user.is_online = action.payload;
        // Update localStorage with new user data
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(state.user));
        }
      }
    },
    // Action to restore auth state from localStorage
    restoreAuthState: (state, action) => {
      console.log('🔄 Restoring auth state:', action.payload);
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.userType = action.payload.userType;
      
      // More robust slug restoration
      let slug = null;
      if (action.payload.slug && action.payload.slug !== '' && action.payload.slug !== 'null') {
        slug = action.payload.slug;
      } else if (action.payload.user?.slug) {
        slug = action.payload.user.slug;
      } else if (action.payload.user?.id) {
        slug = action.payload.user.id.toString();
      }
      
      console.log('🏷️ Restored slug:', slug);
      state.slug = slug;
      state.isOnline = action.payload.isOnline || action.payload.user?.is_online || false;
      state.isAuthenticated = true;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  setUserType,
  updateUserProfile,
  setAuthLoading,
  clearAuthError,
  logout,
  emailVerified,
  mobileVerified,
  updateOnlineStatus,
  restoreAuthState
} = authSlice.actions;

export default authSlice.reducer;