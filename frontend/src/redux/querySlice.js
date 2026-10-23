import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const authHeader = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const createQuery = createAsyncThunk('queries/create', async (formData, { getState, rejectWithValue }) => {
    try {
        const { userToken } = getState().auth;
        const config = { headers: { Authorization: `Bearer ${userToken}`, 'Content-Type': 'multipart/form-data' } };
        const { data: res } = await axios.post(`${API}/api/queries`, formData, config);
        return res;
    } catch (err) { return rejectWithValue(err.response?.data?.message || err.message); }
});

export const getMyQueries = createAsyncThunk('queries/myQueries', async (_, { getState, rejectWithValue }) => {
    try {
        const { userToken } = getState().auth;
        const { data } = await axios.get(`${API}/api/queries/myqueries`, authHeader(userToken));
        return data;
    } catch (err) { return rejectWithValue(err.response?.data?.message || err.message); }
});

export const getAllQueries = createAsyncThunk('queries/getAll', async (filters = {}, { getState, rejectWithValue }) => {
    try {
        const { userToken } = getState().auth;
        const { data } = await axios.get(`${API}/api/queries`, { ...authHeader(userToken), params: filters });
        return data;
    } catch (err) { return rejectWithValue(err.response?.data?.message || err.message); }
});

export const getAnalytics = createAsyncThunk('queries/analytics', async (_, { getState, rejectWithValue }) => {
    try {
        const { userToken } = getState().auth;
        const { data } = await axios.get(`${API}/api/queries/analytics`, authHeader(userToken));
        return data;
    } catch (err) { return rejectWithValue(err.response?.data?.message || err.message); }
});

export const addComment = createAsyncThunk('queries/comment', async ({ queryId, text }, { getState, rejectWithValue }) => {
    try {
        const { userToken } = getState().auth;
        const config = { headers: { Authorization: `Bearer ${userToken}` } };
        const { data } = await axios.post(`${API}/api/queries/${queryId}/comment`, { text }, config);
        return data;
    } catch (err) { return rejectWithValue(err.response?.data?.message || err.message); }
});

export const answerQuery = createAsyncThunk('queries/answer', async ({ queryId, answer, status }, { getState, rejectWithValue }) => {
    try {
        const { userToken } = getState().auth;
        const { data } = await axios.put(`${API}/api/queries/${queryId}/answer`, { answer, status }, authHeader(userToken));
        return data;
    } catch (err) { return rejectWithValue(err.response?.data?.message || err.message); }
});

export const updateStatus = createAsyncThunk('queries/updateStatus', async ({ queryId, status }, { getState, rejectWithValue }) => {
    try {
        const { userToken } = getState().auth;
        const { data } = await axios.put(`${API}/api/queries/${queryId}/status`, { status }, authHeader(userToken));
        return data;
    } catch (err) { return rejectWithValue(err.response?.data?.message || err.message); }
});

const qs = createSlice({
    name: 'queries',
    initialState: { queries: [], myQueries: [], analytics: null, loading: false, error: null, createSuccess: false },
    reducers: {
        resetCreateSuccess: (s) => { s.createSuccess = false; },
        clearQueryError: (s) => { s.error = null; }
    },
    extraReducers: (b) => {
        const pending = (s) => { s.loading = true; s.error = null; };
        const rejected = (s, { payload }) => { s.loading = false; s.error = payload; };

        b.addCase(createQuery.pending, pending)
         .addCase(createQuery.fulfilled, (s, { payload }) => { s.loading = false; s.myQueries.unshift(payload); s.createSuccess = true; })
         .addCase(createQuery.rejected, rejected);

        b.addCase(getMyQueries.pending, pending)
         .addCase(getMyQueries.fulfilled, (s, { payload }) => { s.loading = false; s.myQueries = payload; })
         .addCase(getMyQueries.rejected, rejected);

        b.addCase(getAllQueries.pending, pending)
         .addCase(getAllQueries.fulfilled, (s, { payload }) => { s.loading = false; s.queries = payload; })
         .addCase(getAllQueries.rejected, rejected);

        b.addCase(getAnalytics.pending, pending)
         .addCase(getAnalytics.fulfilled, (s, { payload }) => { s.loading = false; s.analytics = payload; })
         .addCase(getAnalytics.rejected, rejected);

        const updateList = (s, { payload }) => {
            s.loading = false;
            const i = s.queries.findIndex(q => q._id === payload._id);
            if (i !== -1) s.queries[i] = payload;
        };
        b.addCase(answerQuery.pending, pending).addCase(answerQuery.fulfilled, updateList).addCase(answerQuery.rejected, rejected);
        b.addCase(updateStatus.pending, pending).addCase(updateStatus.fulfilled, updateList).addCase(updateStatus.rejected, rejected);
        b.addCase(addComment.pending, pending)
         .addCase(addComment.fulfilled, (s, { payload }) => {
             s.loading = false;
             const idx = s.queries.findIndex(q => q._id === payload._id);
             if (idx !== -1) s.queries[idx] = payload;
             const mIdx = s.myQueries.findIndex(q => q._id === payload._id);
             if (mIdx !== -1) s.myQueries[mIdx] = payload;
         })
         .addCase(addComment.rejected, rejected);
    }
});

export const { resetCreateSuccess, clearQueryError } = qs.actions;
export default qs.reducer;
