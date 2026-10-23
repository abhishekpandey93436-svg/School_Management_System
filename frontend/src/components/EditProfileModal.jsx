import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile } from '../redux/authSlice';
import { BRANCHES } from '../utils/constants';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, CircularProgress, Alert as MuiAlert } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { FiEdit3, FiSave, FiX } from 'react-icons/fi';

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: { main: '#818cf8' },
        background: { paper: '#1e293b', default: '#0f172a' },
    },
    typography: { fontFamily: '"Inter", "system-ui", sans-serif' },
    components: {
        MuiDialog: { styleOverrides: { paper: { borderRadius: '16px', backgroundImage: 'none', border: '1px solid rgba(255,255,255,0.1)' } } },
        MuiOutlinedInput: { styleOverrides: { root: { borderRadius: '8px' } } },
        MuiButton: { styleOverrides: { root: { textTransform: 'none', fontWeight: 600, borderRadius: '8px', padding: '8px 16px' } } }
    }
});

export default function EditProfileModal({ open, onClose }) {
    const dispatch = useDispatch();
    const { userInfo, loading } = useSelector(s => s.auth);

    const [form, setForm] = useState({
        name: userInfo?.name || '',
        branch: userInfo?.branch || '',
        password: '',
        confirmPassword: ''
    });
    const [localError, setLocalError] = useState('');

    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError('');
        
        if (form.password) {
            if (form.password.length < 6) return setLocalError('Password must be at least 6 characters.');
            if (form.password !== form.confirmPassword) return setLocalError('Passwords do not match.');
        }

        try {
            await dispatch(updateProfile({ name: form.name, branch: form.branch, password: form.password || undefined })).unwrap();
            onClose();
        } catch (err) {
            setLocalError(err || 'Failed to update profile.');
        }
    };

    return (
        <ThemeProvider theme={darkTheme}>
            <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="sm" fullWidth PaperProps={{ elevation: 24 }}>
                <form onSubmit={handleSubmit}>
                    <DialogTitle style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.25rem', fontWeight: 700 }}>
                        <FiEdit3 style={{ color: '#818cf8' }} /> Edit Profile
                    </DialogTitle>
                    <DialogContent dividers style={{ borderColor: 'rgba(255,255,255,0.05)', padding: '24px' }}>
                        
                        {localError && <MuiAlert severity="error" sx={{ mb: 3, borderRadius: '8px' }}>{localError}</MuiAlert>}
                        
                        <TextField 
                            label="Full Name" fullWidth variant="outlined" margin="normal"
                            value={form.name} onChange={e => set('name', e.target.value)} required
                        />
                        
                        <TextField 
                            label="Email Address" fullWidth variant="outlined" margin="normal"
                            value={userInfo?.email || ''} disabled 
                            helperText="Email cannot be changed."
                        />

                        {userInfo?.role === 'Student' && (
                            <TextField 
                                select label="Branch" fullWidth variant="outlined" margin="normal"
                                value={form.branch} onChange={e => set('branch', e.target.value)} required
                            >
                                {BRANCHES.map(b => (
                                    <MenuItem key={b} value={b}>{b}</MenuItem>
                                ))}
                            </TextField>
                        )}
                        
                        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '8px', fontWeight: 500 }}>Update Password (Optional)</p>
                            <TextField 
                                label="New Password" type="password" fullWidth variant="outlined" margin="normal"
                                value={form.password} onChange={e => set('password', e.target.value)}
                            />
                            <TextField 
                                label="Confirm New Password" type="password" fullWidth variant="outlined" margin="normal"
                                value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)}
                                disabled={!form.password}
                            />
                        </div>
                    </DialogContent>
                    
                    <DialogActions style={{ padding: '16px 24px', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                        <Button onClick={onClose} disabled={loading} startIcon={<FiX />} sx={{ color: '#94a3b8' }}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="contained" disabled={loading} startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <FiSave />}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </ThemeProvider>
    );
}
