import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { Employee, PaginationMeta } from '../../types';
import { extractApiError } from '../../utils/helpers';

interface EmployeeState {
  employees: Employee[];
  selectedEmployee: Employee | null;
  pagination: PaginationMeta | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: EmployeeState = {
  employees: [], selectedEmployee: null, pagination: null, isLoading: false, error: null,
};

export const fetchEmployeesThunk = createAsyncThunk(
  'employees/fetchAll',
  async (params: Record<string, unknown> = {}, { rejectWithValue }) => {
    try {
      const r = await api.get('/employees', { params });
      return r.data;
    } catch (e) { return rejectWithValue(extractApiError(e)); }
  }
);

export const updateEmployeeThunk = createAsyncThunk(
  'employees/update',
  async ({ id, data }: { id: string; data: Partial<Employee> }, { rejectWithValue }) => {
    try {
      const r = await api.put(`/employees/${id}`, data);
      return r.data.data as Employee;
    } catch (e) { return rejectWithValue(extractApiError(e)); }
  }
);

const employeeSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {
    clearError: (s) => { s.error = null; },
  },
  extraReducers: (b) => {
    b.addCase(fetchEmployeesThunk.pending, (s) => { s.isLoading = true; })
     .addCase(fetchEmployeesThunk.fulfilled, (s, a) => {
       s.isLoading = false;
       s.employees = a.payload.data;
       s.pagination = a.payload.pagination ?? null;
     })
     .addCase(fetchEmployeesThunk.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; })
     .addCase(updateEmployeeThunk.fulfilled, (s, a) => {
       const idx = s.employees.findIndex(e => e.id === a.payload.id);
       if (idx !== -1) s.employees[idx] = a.payload;
     });
  },
});

export const { clearError } = employeeSlice.actions;
export default employeeSlice.reducer;
