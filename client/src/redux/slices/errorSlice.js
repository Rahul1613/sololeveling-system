import { createSlice } from '@reduxjs/toolkit';

/**
 * Error Slice - Manages global error state
 */
const initialState = {
  hasError: false,
  message: '',
  source: null,
  timestamp: null
};

export const errorSlice = createSlice({
  name: 'error',
  initialState,
  reducers: {
    setError: (state, action) => {
      state.hasError = true;
      state.message = action.payload.message;
      state.source = action.payload.source;
      state.timestamp = new Date().toISOString();
    },
    clearErrors: (state) => {
      state.hasError = false;
      state.message = '';
      state.source = null;
      state.timestamp = null;
    }
  }
});

export const { setError, clearErrors } = errorSlice.actions;
export default errorSlice.reducer;
