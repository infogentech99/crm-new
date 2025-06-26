import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  id: string | null;
  name: string | null;
  email: string | null;
  role: string | null;
}

const storedUser =
  typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('userData') || 'null')
    : null;

const initialState: UserState = storedUser || {
  id: null,
  name: null,
  email: null,
  role: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    addUser: (state, action: PayloadAction<{ id: string; name: string; email: string; role: string }>) => {
      state.id = action.payload.id;
      state.name = action.payload.name;
      state.email = action.payload.email;
      state.role = action.payload.role;

      if (typeof window !== 'undefined') {
        localStorage.setItem('userData', JSON.stringify(action.payload));
      }
    },
    removeUser: (state) => {
      state.id = null;
      state.name = null;
      state.email = null;
      state.role = null;

      if (typeof window !== 'undefined') {
        localStorage.removeItem('userData');
      }
    },
  },
});

export const { addUser, removeUser } = userSlice.actions;
export default userSlice.reducer;

