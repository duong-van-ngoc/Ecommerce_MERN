import React, { useEffect, useState } from 'react'
import '../UserStyles/UpdateProfile.css'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { removeSuccess, updateProfile } from '../features/user/userSlice';
import { removeErrors } from '../features/user/userSlice';
import Loader from '../components/Loader'

function UpdateProfile() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [avatar, setAvatar] = useState("");
    const [avatarPreview, setAvatarPreview] = useState("./images/profile.png");

    const { user, error, success, message, loading } = useSelector(state => state.user)

    const dispatch = useDispatch()
    const navigate = useNavigate()
    const profileImageUpdate = (e) => {
        const reader = new FileReader();
        reader.onload = () => {
            if (reader.readyState === 2) {
                setAvatarPreview(reader.result)
                setAvatar(reader.result)
            }
        }
        reader.onerror = (error) => {
             toast.error('Lỗi tải file', error);

        }
        reader.readAsDataURL(e.target.files[0])
    }

    const updateSubmit = (e) => {
        e.preventDefault();
        const myForm = new FormData()
        myForm.set("name", name)
        myForm.set("email", email)
        myForm.set("avatar", avatar)
        dispatch(updateProfile(myForm))
    }

    useEffect(() => {
        if (error) {
            toast.error(error, { position: 'top-center', autoClose: 3000 })
            dispatch(removeErrors())
        }
    }, [dispatch, error])

    useEffect(() => {
        if (success) {
            toast.success(message, { position: 'top-center', autoClose: 3000 })
            dispatch(removeSuccess())
            navigate("/profile")
        }
    }, [dispatch, success])

    useEffect(() => {
        if (user) {
            setName(user.name)
            setEmail(user.email)
            setAvatarPreview(user.avatar?.url || './images/profile.png')

        }
    }, [user])

    return (
        <>
            {loading ? (<Loader />) : (
                <>
                    <Navbar />
                    <main className="update-profile-page">
                        <section className="update-profile-card">
                            <form
                                className="update-profile-form"
                                encType='multipart/form-data'
                                onSubmit={updateSubmit}
                            >
                                <input
                                    id="update-profile-avatar"
                                    type="file"
                                    name="avatar"
                                    accept="image/*"
                                    className="update-profile-file-input"
                                    onChange={profileImageUpdate}
                                />

                                <label htmlFor="update-profile-avatar" className="update-profile-avatar-upload">
                                    <div className="update-profile-avatar-frame">
                                        <img
                                            src={avatarPreview}
                                            alt="User Profile"
                                            className="update-profile-avatar-image"
                                        />
                                        <div className="update-profile-avatar-overlay">
                                            <svg
                                                className="update-profile-avatar-icon"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                                viewBox="0 0 24 24"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                                <path
                                                    d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                            <span>Change Photo</span>
                                        </div>
                                    </div>
                                </label>

                                <h1 className="update-profile-title">Update Profile</h1>

                                <div className="update-profile-field">
                                    <label htmlFor="update-profile-name">Full Name</label>
                                    <input
                                        id="update-profile-name"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        name="name"
                                        placeholder="e.g., Jane Doe"
                                    />
                                </div>

                                <div className="update-profile-field">
                                    <label htmlFor="update-profile-email">Email Address</label>
                                    <input
                                        id="update-profile-email"
                                        type="text"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        name="email"
                                        placeholder="e.g., jane.doe@example.com"
                                    />
                                </div>

                                <button className="update-profile-submit" type="submit">
                                    Update Profile
                                </button>
                            </form>
                        </section>
                    </main>
                    <Footer />
                </>
            )}
        </>
    )
}

export default UpdateProfile
