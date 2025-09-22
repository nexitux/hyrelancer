import { createSlice } from '@reduxjs/toolkit';

const jobSlice = createSlice({
  name: 'job',
  initialState: {
    selectedJobId: null,
    selectedJobData: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    setSelectedJobId: (state, action) => {
      state.selectedJobId = action.payload;
      state.error = null;
    },
    setSelectedJobData: (state, action) => {
      state.selectedJobData = action.payload;
    },
    clearSelectedJob: (state) => {
      state.selectedJobId = null;
      state.selectedJobData = null;
      state.error = null;
    },
    setJobLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setJobError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearJobError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setSelectedJobId,
  setSelectedJobData,
  clearSelectedJob,
  setJobLoading,
  setJobError,
  clearJobError,
} = jobSlice.actions;

export default jobSlice.reducer;
