import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from  'axios'
// register API

 export const register = createAsyncThunk('user/register', async(userData,
     {rejectWithValue}) => {
    try {
        const config = {
            headers: {
                'Content-Type':'multipart/form-data'
            }
        }
            const {data} = await axios.post('/api/v1/register', userData, config)
            console.log('register data', data);
            
            return data;
    }catch(error) {
        console.log("Lỗi API:", error.response);
        return rejectWithValue(error.response?.data || ' Đăng ký không thành công vui lòng thử lại sau')
    }
 })
 
//  Login API 
 export const login = createAsyncThunk('user/login', async({email, password}, {rejectWithValue}) => {
    try {
        const config = {
            headers: {
                'Content-Type':'application/json'
            }
        }
            const {data} = await axios.post('/api/v1/login', {email, password}, config)
            console.log('Login data', data);
            
            return data;
    }catch(error) {
        console.log("Lỗi API:", error.response);
        return rejectWithValue(error.response?.data || ' Đăng ký không thành công vui lòng thử lại sau')
    }
 })

//  Logout
 export const logout = createAsyncThunk('user/logout', async(_, {rejectWithValue}) => {
    try {
    
            const {data} = await axios.post('/api/v1/logout',{withCredenntails:true})
  
            return data;
    }catch(error) {
        console.log("Lỗi API:", error.response);
        return rejectWithValue(error.response?.data || ' Đăng xuất thành công')
    }
 })
//  profile 
 export const loaderUser = createAsyncThunk('user/loadUser', async(_, {rejectWithValue}) => {
    try {
            const {data} = await axios.get('/api/v1/profile')
            console.log('Load user data', data);    
            return data;
        }catch(error) {
            return rejectWithValue(error.response?.data || ' Không thể tải dữ liệu người dùng'  )
    }
    })

const userSlice  = createSlice({
    name:'user',
    initialState:{
        user:null,
        loading:false,
        error:null,
        success:false,
        isAuthenticated:false
    },
    reducers:{
        removeErrors:(state) => {
            state.error = null
        },
        removeSuccess:(state) => {
            state.success = false
        }
    },
    extraReducers:(builder) => {
        // register cases 
        builder
        .addCase(register.pending,(state) => {
            state.loading = true
            state.error = null
            
        })
        .addCase(register.fulfilled, (state, action) => {
            state.loading = false
            state.error = null
            state.success = action.payload.success
            state.user = action.payload?.user || null
            state.isAuthenticated = Boolean(action.payload?.user)
        })
        .addCase(register.rejected, (state, action) => {
            state.loading = false 
            state.error = action.payload?.message || 'Đăng ký không thành công'
            state.user = null
            state.isAuthenticated = false
        })

        // login cases
  
        .addCase(login.pending,(state) => {
            state.loading = true
            state.error = null
            
        })
        .addCase(login.fulfilled, (state, action) => {
            state.loading = false
            state.error = null
            state.success = action.payload.success
            state.user = action.payload?.user || null
            state.isAuthenticated = Boolean(action.payload?.user)
            console.log(state.user);
            
        })
        .addCase(login.rejected, (state, action) => {
            state.loading = false 
            state.error = action.payload?.message || 'Đăng nhập không thành công'
            state.user = null
            state.isAuthenticated = false
        })

        // Loading user 
            .addCase(loaderUser.pending,(state) => {
            state.loading = true
            state.error = null
            
        })
        .addCase(loaderUser.fulfilled, (state, action) => {
            state.loading = false
            state.error = null
            state.user = action.payload?.user || null
            state.isAuthenticated = Boolean(action.payload?.user)
            
        })
        .addCase(loaderUser.rejected, (state, action) => {
            state.loading = false 
            state.error = action.payload?.message || ' Không thể tải dữ liệu người dùng'
            state.user = null
            state.isAuthenticated = false
        })


        // logout 
        .addCase(logout.pending,(state) => {
            state.loading = true
            state.error = null
            
        })
        .addCase(logout.fulfilled, (state, action) => {
            state.loading = false
            state.error = null
            state.user =  null
            state.isAuthenticated = false
            
        })
        .addCase(logout.rejected, (state, action) => {
            state.loading = false 
            state.error = action.payload?.message || ' Không thể tải dữ liệu người dùng'
 
        })

    }
})


export const {removeErrors, removeSuccess} = userSlice.actions
export default userSlice.reducer