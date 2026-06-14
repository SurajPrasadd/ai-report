import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/services/api';
import { Employee, PaginationMeta } from '@/types';
import { extractApiError } from '@/utils/helpers';

interface State { employees: Employee[]; pagination: PaginationMeta | null; isLoading: boolean; error: string | null; }
const init: State = { employees: [], pagination: null, isLoading: false, error: null };

export const fetchEmployeesThunk = createAsyncThunk('employees/fetchAll',
  async (params: Record<string, unknown> = {}, { rejectWithValue }) => {
    try { return (await api.get('/employees', { params })).data; }
    catch (e) { return rejectWithValue(extractApiError(e)); }
  });

export const updateEmployeeThunk = createAsyncThunk('employees/update',
  async ({ id, data }: { id: string; data: Partial<Employee> }, { rejectWithValue }) => {
    try { return (await api.put(`/employees/${id}`, data)).data.data as Employee; }
    catch (e) { return rejectWithValue(extractApiError(e)); }
  });

const slice = createSlice({
  name: 'employees', initialState: init,
  reducers: { clearError: s => { s.error = null; } },
  extraReducers: b => {
    b.addCase(fetchEmployeesThunk.pending, s => { s.isLoading = true; })
     .addCase(fetchEmployeesThunk.fulfilled, (s, a) => { s.isLoading = false; s.employees = a.payload.data; s.pagination = a.payload.pagination ?? null; })
     .addCase(fetchEmployeesThunk.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; })
     .addCase(updateEmployeeThunk.fulfilled, (s, a) => {
       const i = s.employees.findIndex(e => e.id === a.payload.id);
       if (i !== -1) s.employees[i] = a.payload;
     });
  },
});
export const { clearError } = slice.actions;
export default slice.reducer;
