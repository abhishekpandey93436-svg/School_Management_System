import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

let userInfo = null;
let userToken = null;
try {
    const storedInfo = localStorage.getItem('userInfo');
    if (storedInfo && storedInfo !== 'undefined') userInfo = JSON.parse(storedInfo);
    userToken = localStorage.getItem('userToken') || null;
} catch (e) { console.error('localStorage parse error', e); }

// Step 1 — Request OTP
export const sendOTP = createAsyncThunk('auth/sendOTP', async (email, { rejectWithValue }) => {
    try {
        const { data } = await axios.post(`${API}/api/auth/send-otp`, { email });
        return data;
    } catch (err) { return rejectWithValue(err.response?.data?.message || err.message); }
});

// Step 2 — Register with OTP
export const registerUser = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
    try {
        const { data } = await axios.post(`${API}/api/auth/register`, userData);
        localStorage.setItem('userToken', data.token);
        localStorage.setItem('userInfo', JSON.stringify(data));
        return data;
    } catch (err) { return rejectWithValue(err.response?.data?.message || err.message); }
});

// Login
export const loginUser = createAsyncThunk('auth/login', async ({ email, password }, { rejectWithValue }) => {
    try {
        const { data } = await axios.post(`${API}/api/auth/login`, { email, password });
        localStorage.setItem('userToken', data.token);
        localStorage.setItem('userInfo', JSON.stringify(data));
        return data;
    } catch (err) { return rejectWithValue(err.response?.data?.message || err.message); }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (userData, { getState, rejectWithValue }) => {
    try {
        const { userToken } = getState().auth;
        const config = { headers: { Authorization: `Bearer ${userToken}` } };
        const { data } = await axios.put(`${API}/api/auth/profile`, userData, config);
        localStorage.setItem('userToken', data.token);
        localStorage.setItem('userInfo', JSON.stringify(data));
        return data;
    } catch (err) { return rejectWithValue(err.response?.data?.message || err.message); }
});

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        loading: false,
        userInfo,
        userToken,
        error: null,
        otpSent: false,
        otpLoading: false,
        otpError: null,
    },
    reducers: {
        logout: (state) => {
            localStorage.removeItem('userToken');
            localStorage.removeItem('userInfo');
            state.userInfo = null;
            state.userToken = null;
            state.error = null;
            state.otpSent = false;
        },
        clearError: (state) => { state.error = null; state.otpError = null; },
        resetOtp: (state) => { state.otpSent = false; state.otpError = null; },
    },
    extraReducers: (builder) => {
        // Send OTP
        builder.addCase(sendOTP.pending, (s) => { s.otpLoading = true; s.otpError = null; })
            .addCase(sendOTP.fulfilled, (s) => { s.otpLoading = false; s.otpSent = true; })
            .addCase(sendOTP.rejected, (s, { payload }) => { s.otpLoading = false; s.otpError = payload; });
        // Register
        builder.addCase(registerUser.pending, (s) => { s.loading = true; s.error = null; })
            .addCase(registerUser.fulfilled, (s, { payload }) => { s.loading = false; s.userInfo = payload; s.userToken = payload.token; })
            .addCase(registerUser.rejected, (s, { payload }) => { s.loading = false; s.error = payload; });
        // Login
        builder.addCase(loginUser.pending, (s) => { s.loading = true; s.error = null; })
            .addCase(loginUser.fulfilled, (s, { payload }) => { s.loading = false; s.userInfo = payload; s.userToken = payload.token; })
            .addCase(loginUser.rejected, (s, { payload }) => { s.loading = false; s.error = payload; });
        // Update Profile
        builder.addCase(updateProfile.pending, (s) => { s.loading = true; s.error = null; })
            .addCase(updateProfile.fulfilled, (s, { payload }) => { s.loading = false; s.userInfo = payload; s.userToken = payload.token; })
            .addCase(updateProfile.rejected, (s, { payload }) => { s.loading = false; s.error = payload; });
    }
});

export const { logout, clearError, resetOtp } = authSlice.actions;
export default authSlice.reducer;
