/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là file Mảnh quản lý trạng thái Người dùng (User Redux Slice).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Quản lý toàn bộ vòng đời của người dùng trên Frontend: Từ Đăng ký, Đăng nhập cho đến Cập nhật hồ sơ và Đăng xuất.
 *    - Duy trì trạng thái xác thực (`isAuthenticated`) và thông tin cá nhân (`user`) để các Component khác (như Header, Profile) có thể sử dụng.
 *    - Tự động hóa việc lưu trữ và xóa thông tin phiên đăng nhập trong LocalStorage của trình duyệt.
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Xác thực (Authentication) & Quản lý Tài khoản (User Management Flow).
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - `createAsyncThunk`: Kỹ thuật xử lý các tác vụ bất đồng bộ (gọi API) trong Redux Toolkit. Nó tự động tạo ra 3 trạng thái: `pending` (đang chờ), `fulfilled` (thành công) và `rejected` (thất bại).
 *    - `createSlice`: Hàm gom nhóm các Reducers và Actions liên quan đến một đối tượng duy nhất (ở đây là User).
 *    - LocalStorage Persistence: Thủ thuật lưu dữ liệu vào bộ nhớ trình duyệt để người dùng không bị mất trạng thái đăng nhập khi nhấn F5 (Refresh).
 *    - Axios Interceptor: Sử dụng instance axios tùy chỉnh để tự động đính kèm Token/Header cần thiết.
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Thông tin đăng nhập/đăng ký từ các Form ở giao diện.
 *    - Output: Trạng thái User toàn cục (Object User, trạng thái Loading, thông báo Lỗi).
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - `user`: Chứa toàn bộ thông tin tài khoản (Tên, Email, Ảnh đại diện, Role).
 *    - `isAuthenticated`: Biến logic quan trọng để quyết định xem User có được vào các trang "Protected" hay không.
 *    - `loading`: Dùng để hiển thị các biểu tượng xoay (Spinner) khi đang chờ API phản hồi.
 * 
 * 7. CÁC HÀM / CHỨC NĂNG CHÍNH:
 *    - `register/login/logout`: Bộ ba nguyên tử quản lý phiên làm việc.
 *    - `loaderUser`: Hàm "thần thánh" tự động lấy lại thông tin Profile khi người dùng quay lại trang web (dùng Token từ Cookie/Local).
 *    - `updateProfile/updatePassword`: Các hàm chỉnh sửa thông tin cá nhân.
 *    - `persistAuthState`: Helper lưu trạng thái Auth vào bộ nhớ máy tính người dùng.
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: Component gọi `dispatch(login)`.
 *    - Bước 2: `createAsyncThunk` chuyển sang trạng thái `pending` (Loading bắt đầu).
 *    - Bước 3: Gọi API Backend thông qua Axios.
 *    - Bước 4: Backend trả về dữ liệu -> Chạy vào `fulfilled` -> Lưu vào Redux + LocalStorage.
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - Component -> Dispatch -> Thunk -> Axios -> Backend API -> MongoDB -> Trả kết quả về Slice -> Cập nhật UI.
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - Xử lý mã lỗi 401 (Hết hạn login): Tự động xóa sạch LocalStorage (`clearAuthState`) để bảo mật.
 *    - Phân loại lỗi: Phân biệt lỗi do mạng, lỗi do sai mật khẩu để hiển thị thông báo chính xác cho người dùng.
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - Sử dụng `createAsyncThunk` kết hợp với `async/await` cho toàn bộ các chức năng gọi API.
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - Lưu ý về `Content-Type`: Khi đăng ký hoặc cập nhật ảnh đại diện, ta dùng `multipart/form-data`, còn đăng nhập thông thường dùng `application/json`.
 *    - Đây là file "nhạy cảm" về bảo mật, hãy cẩn thận khi thay đổi cách lưu Token hoặc các hàm xóa trạng thái đăng nhập.
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from '../../api/http.js'

const getErrorPayload = (error, fallbackMessage) => ({
    message: error.response?.data?.message || fallbackMessage,
    statusCode: error.response?.status || 500
})

const persistAuthState = (user, isAuthenticated, token) => {
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('isAuthenticated', JSON.stringify(isAuthenticated))
    if (token) {
        localStorage.setItem('token', token)
    }
}

const clearAuthState = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('token')
}

export const register = createAsyncThunk('user/register', async (userData, { rejectWithValue }) => {
    try {
        const { data } = await axios.post('/api/v1/register', userData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })

        return data
    } catch (error) {
        console.log('API error:', error.response || error)
        return rejectWithValue(getErrorPayload(error, 'Dang ky khong thanh cong'))
    }
})

export const login = createAsyncThunk('user/login', async ({ email, password }, { rejectWithValue }) => {
    try {
        const { data } = await axios.post('/api/v1/login', { email, password }, {
            headers: {
                'Content-Type': 'application/json'
            }
        })

        return data
    } catch (error) {
        console.log('API error:', error.response || error)
        return rejectWithValue(getErrorPayload(error, 'Dang nhap khong thanh cong'))
    }
})

export const logout = createAsyncThunk('user/logout', async (_, { rejectWithValue }) => {
    try {
        const { data } = await axios.post('/api/v1/logout')
        return data
    } catch (error) {
        console.log('API error:', error.response || error)
        return rejectWithValue(getErrorPayload(error, 'Dang xuat that bai'))
    }
})

export const loaderUser = createAsyncThunk('user/loadUser', async (_, { rejectWithValue }) => {
    try {
        const { data } = await axios.get('/api/v1/profile')
        return data
    } catch (error) {
        return rejectWithValue(getErrorPayload(error, 'Khong the tai du lieu nguoi dung'))
    }
})

export const updateProfile = createAsyncThunk('user/updateProfile', async (userData, { rejectWithValue }) => {
    try {
        const { data } = await axios.put('/api/v1/profile/update', userData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })

        return data
    } catch (error) {
        return rejectWithValue(getErrorPayload(error, 'Cap nhat ho so that bai'))
    }
})

export const updatePassword = createAsyncThunk('user/updatePassword', async (formData, { rejectWithValue }) => {
    try {
        const { data } = await axios.put('/api/v1/password/update', formData, {
            headers: {
                'Content-Type': 'application/json'
            }
        })

        return data
    } catch (error) {
        return rejectWithValue(getErrorPayload(error, 'Cap nhat mat khau that bai'))
    }
})

export const forgotPassword = createAsyncThunk('user/forgotPassword', async (email, { rejectWithValue }) => {
    try {
        const { data } = await axios.post('/api/v1/password/forgot', email, {
            headers: {
                'Content-Type': 'application/json'
            }
        })

        return data
    } catch (error) {
        return rejectWithValue(getErrorPayload(error, 'Gui email that bai'))
    }
})

export const resetPassword = createAsyncThunk(
    'user/resetPassword',
    async ({ token, userData }, { rejectWithValue }) => {
        try {
            const { data } = await axios.post(`/api/v1/reset/${token}`, userData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            return data
        } catch (error) {
            return rejectWithValue(getErrorPayload(error, 'Cap nhat mat khau that bai'))
        }
    }
)

const initialState = {
    user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null,
    loading: false,
    error: null,
    success: false,
    isAuthenticated: localStorage.getItem('isAuthenticated') === 'true',
    message: null
}

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        removeErrors: (state) => {
            state.error = null
        },
        removeSuccess: (state) => {
            state.success = false
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(register.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(register.fulfilled, (state, action) => {
                state.loading = false
                state.error = null
                state.success = action.payload?.success || false
                state.user = action.payload?.user || null
                state.isAuthenticated = Boolean(action.payload?.user)
                persistAuthState(state.user, state.isAuthenticated, action.payload?.token)
            })
            .addCase(register.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload?.message || 'Dang ky khong thanh cong'
                state.user = null
                state.isAuthenticated = false
            })

            .addCase(login.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false
                state.error = null
                state.success = action.payload?.success || false
                state.user = action.payload?.user || null
                state.isAuthenticated = Boolean(action.payload?.user)
                persistAuthState(state.user, state.isAuthenticated, action.payload?.token)
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload?.message || 'Dang nhap khong thanh cong'
                state.user = null
                state.isAuthenticated = false
            })

            .addCase(loaderUser.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(loaderUser.fulfilled, (state, action) => {
                state.loading = false
                state.error = null
                state.user = action.payload?.user || null
                state.isAuthenticated = Boolean(action.payload?.user)
                persistAuthState(state.user, state.isAuthenticated)
            })
            .addCase(loaderUser.rejected, (state, action) => {
                state.loading = false
                const isUnauthorized = action.payload?.statusCode === 401
                state.error = isUnauthorized ? null : action.payload?.message || 'Khong the tai du lieu nguoi dung'
                state.user = null
                state.isAuthenticated = false

                if (isUnauthorized) {
                    clearAuthState()
                }
            })

            .addCase(logout.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(logout.fulfilled, (state) => {
                state.loading = false
                state.error = null
                state.user = null
                state.isAuthenticated = false
                clearAuthState()
            })
            .addCase(logout.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload?.message || 'Dang xuat that bai'
            })

            .addCase(updateProfile.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(updateProfile.fulfilled, (state, action) => {
                state.loading = false
                state.error = null
                state.user = action.payload?.user || null
                state.success = action.payload?.success || false
                state.message = action.payload?.message || null
                state.isAuthenticated = Boolean(action.payload?.user)
                persistAuthState(state.user, state.isAuthenticated)
            })
            .addCase(updateProfile.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload?.message || 'Cap nhat ho so that bai'
            })

            .addCase(updatePassword.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(updatePassword.fulfilled, (state, action) => {
                state.loading = false
                state.error = null
                state.success = action.payload?.success || false
            })
            .addCase(updatePassword.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload?.message || 'Cap nhat mat khau that bai'
            })

            .addCase(forgotPassword.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(forgotPassword.fulfilled, (state, action) => {
                state.loading = false
                state.error = null
                state.success = action.payload?.success || false
                state.message = action.payload?.message || null
            })
            .addCase(forgotPassword.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload?.message || 'Gui email that bai'
            })

            .addCase(resetPassword.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(resetPassword.fulfilled, (state, action) => {
                state.loading = false
                state.error = null
                state.success = action.payload?.success || false
                state.user = null
                state.isAuthenticated = false
                clearAuthState()
            })
            .addCase(resetPassword.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload?.message || 'Cap nhat mat khau that bai'
            })
    }
})

export const { removeErrors, removeSuccess } = userSlice.actions
export default userSlice.reducer
