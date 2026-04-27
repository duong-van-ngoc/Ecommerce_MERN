import { useDispatch, useSelector } from 'react-redux';
import MailOutlineOutlinedIcon from '@mui/icons-material/MailOutlineOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import { setGlobalSearchQuery } from '@/features/admin/state/adminSlice';
import { selectAdminGlobalSearchQuery } from '@/features/admin/state/adminSelectors';

export default function Header({ user }) {
    const dispatch = useDispatch();
    const globalSearchQuery = useSelector(selectAdminGlobalSearchQuery);

    return (
        <header className="admin-topbar">
            <div className="admin-topbar-search">
                <SearchOutlinedIcon />
                <input
                    placeholder="Tìm kiếm sản phẩm, đơn hàng, khách hàng..."
                    type="text"
                    value={globalSearchQuery}
                    onChange={(e) => dispatch(setGlobalSearchQuery(e.target.value))}
                />
            </div>

            <div className="admin-topbar-actions">
                <button type="button" className="admin-topbar-icon-button" aria-label="Tin nhắn">
                    <MailOutlineOutlinedIcon />
                </button>
                <button type="button" className="admin-topbar-icon-button has-dot" aria-label="Thông báo">
                    <NotificationsNoneOutlinedIcon />
                </button>
                <div className="admin-topbar-user">
                    <img
                        src={user?.avatar?.url || '/images/profile.png'}
                        alt={user?.name || 'Admin'}
                    />
                    <div>
                        <strong>{user?.name || 'Admin'}</strong>
                        <span>{user?.role_id?.name || user?.role || 'Manager'}</span>
                    </div>
                </div>
            </div>
        </header>
    );
}
