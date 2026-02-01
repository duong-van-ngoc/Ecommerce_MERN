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
    
            const {data} = await axios.post('/api/v1/logout',{withCredentials:true})
  
            return data;
    }catch(error) {
        console.log("Lỗi API:", error.response);
        return rejectWithValue(error.response?.data || ' Đăng xuất that bai')
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

// update profile 
 export const updateProfile = createAsyncThunk('user/updateProfile', async(userData, {rejectWithValue}) => {
    try {
            const config={
                headers: {
                    'Content-Type': 'multipart/form-data'    
                }
            }
            const {data} = await axios.put('/api/v1/profile/update',userData, config)
            console.log('Load user data', data);    
            return data;
        }catch(error) {
            return rejectWithValue(error.response?.data || {mesage:'Cập nhật hồ sơ thất bại'}  )
        }
    })

    // updatePassword 
 export const updatePassword = createAsyncThunk('user/updatePassword', async(formData, {rejectWithValue}) => {
    try {
            const config={
                headers: {
                    'Content-Type': 'application/json'    
                }
            }
            const {data} = await axios.put('/api/v1/password/update',formData, config)
            console.log('Load user data', data);    
            return data;
        }catch(error) {
            return rejectWithValue(error.response?.data || 'Cập nhật mật khẩu thất bại' )
        }
    })

    // forgot password 
export const forgotPassword = createAsyncThunk('user/forgotPassword', async(email, {rejectWithValue}) => {
    try {
            const config={
                headers: {
                    'Content-Type': 'application/json'    
                }
            }
            const {data} = await axios.post('/api/v1/password/forgot',email, config)
            console.log('Load user data', data);    
            return data;
        }catch(error) {
            return rejectWithValue(error.response?.data || {message:'Cập nhật mật khẩu thất bại' })
        }
})
    // reset password 
export const resetPassword = createAsyncThunk('user/resetPassword',
async({token, userData}, {rejectWithValue}) => {
    try {
            const config={
                headers: {
                    'Content-Type': 'application/json'    
                }
            }
            // const {data} = await axios.post(`/api/v1/reset/${token}`,userData, config) 
            const { data } = await axios.post(`/api/v1/reset/${token}`, userData, config)
            console.log('Load user data', data);    
            return data;
        }catch(error) {
            return rejectWithValue(error.response?.data || {message:'Cập nhật mật khẩu thất bại' })
        }
})

const userSlice  = createSlice({
    name:'user',
    initialState:{
        user:localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null, // lấy user từ localStorage nếu có
        loading:false,
        error:null,
        success:false,
        isAuthenticated:localStorage.getItem('isAuthenticated') ==='true',
        message:null
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

            // lưu user vào localStorage
            localStorage.setItem('user', JSON.stringify(state.user))
            localStorage.setItem('isAuthenticated', JSON.stringify(state.isAuthenticated))
        })
        .addCase(register.rejected, (state, action) => {
            state.loading = false 
            state.error = action.payload?.message || 'Đăng ký không thành công'
            state.user = null
            state.isAuthenticated = false
        })

        // login cases
        builder
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
            
            // lưu user vào localStorage
            localStorage.setItem('user', JSON.stringify(state.user))
            localStorage.setItem('isAuthenticated', JSON.stringify(state.isAuthenticated))
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
            
            // lưu user vào localStorage
            localStorage.setItem('user', JSON.stringify(state.user))
            localStorage.setItem('isAuthenticated', JSON.stringify(state.isAuthenticated))
        })
        .addCase(loaderUser.rejected, (state, action) => {
            state.loading = false 
            state.error = action.payload?.message || ' Không thể tải dữ liệu người dùng'
            state.user = null
            state.isAuthenticated = false

            // xóa user khỏi localStorage nếu lỗi 401 
            if(action.payload?.statusCode === 401) {
                state.user = null,
                state.isAuthenticated = false,
                localStorage.removeItem('user')
                localStorage.removeItem('isAuthenticated')
            }
        })


        // logout 
        .addCase(logout.pending,(state) => {
            state.loading = true
            state.error = null
            
        })
        .addCase(logout.fulfilled, (state) => {
            state.loading = false
            state.error = null
            state.user =  null
            state.isAuthenticated = false
            

            // xóa user khỏi localStorage
            localStorage.removeItem('user')
            localStorage.removeItem('isAuthenticated')
            // nếu có token:
            localStorage.removeItem('token')
        })
        .addCase(logout.rejected, (state, action) => {
            state.loading = false 
            state.error = action.payload?.message || ' Không thể tải dữ liệu người dùng'
 
        })
        
        // update profile 
        .addCase(updateProfile.pending,(state) => {
            state.loading = true
            state.error = null
            
        })
        .addCase(updateProfile.fulfilled, (state, action) => {
            state.loading = false
            state.error = null
            state.user =  action.payload?.user || null
            state.success = action.payload?.success || null 
            state.message = action.payload?.mesage
            
        })
        .addCase(updateProfile.rejected, (state, action) => {
            state.loading = false 
            state.error = action.payload?.message || ' Cập nhật hồ sơ  người dùng thất bại'
 
        })

        //  update Password 
        .addCase(updatePassword.pending,(state) => {
            state.loading = true
            state.error = null
            
        })
        .addCase(updatePassword.fulfilled, (state, action) => {
            state.loading = false
            state.error = null
            state.success = action.payload?.success || null 
            
        })
        .addCase(updatePassword.rejected, (state, action) => {
            state.loading = false 
            state.error = action.payload?.message || ' Cập nhật mật khẩu thất bại'
        })
        //  forgot Password 
        .addCase(forgotPassword.pending,(state) => {
            state.loading = true
            state.error = null
            
        })
        .addCase(forgotPassword.fulfilled, (state, action) => {
            state.loading = false
            state.error = null
            state.success = action.payload?.success 
            state.message = action.payload?.message 
            
        })
        .addCase(forgotPassword.rejected, (state, action) => {
            state.loading = false 
            state.error = action.payload?.message || 'Gửi email thất bại'
        })

          //  reset Password 
        .addCase(resetPassword.pending,(state) => {
            state.loading = true
            state.error = null
            
        })
        .addCase(resetPassword.fulfilled, (state, action) => {
            state.loading = false
            state.error = null
            state.success = action.payload?.success 
            state.user = null,
            state.isAuthenticated = false
            
        })
        .addCase(resetPassword.rejected, (state, action) => {
            state.loading = false 
            state.error = action.payload?.message || 'Gửi email thất bại'
        })
    }
})


export const {removeErrors, removeSuccess} = userSlice.actions
export default userSlice.reducer