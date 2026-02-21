import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * ProfileAvatar Component
 * Displays user avatar with initials or photo and dropdown menu
 */
export default function ProfileAvatar({ user, onLogout }) {
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Get initials from user name
    const getInitials = () => {
        if (!user?.profile?.name) return 'U';

        const nameParts = user.profile.name.trim().split(' ');
        if (nameParts.length === 1) {
            return nameParts[0].charAt(0).toUpperCase();
        }

        // First letter of first name + first letter of last name
        const firstInitial = nameParts[0].charAt(0).toUpperCase();
        const lastInitial = nameParts[nameParts.length - 1].charAt(0).toUpperCase();
        return firstInitial + lastInitial;
    };

    const handleLogout = () => {
        setShowDropdown(false);
        onLogout();
        navigate('/');
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Avatar Button */}
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
                {/* Avatar Circle */}
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm shadow-md">
                    {user?.profile?.photo ? (
                        <img
                            src={user.profile.photo}
                            alt={user.profile.name}
                            className="w-full h-full rounded-full object-cover"
                        />
                    ) : (
                        <span>{getInitials()}</span>
                    )}
                </div>

                {/* Dropdown Arrow */}
                <span className="material-symbols-outlined text-muted-green text-sm hidden sm:block">
                    {showDropdown ? 'expand_less' : 'expand_more'}
                </span>
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 animate-scale-in">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-semibold text-charcoal">{user?.profile?.name || 'User'}</p>
                        <p className="text-xs text-muted-green">{user?.email || ''}</p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                        <button
                            onClick={() => {
                                setShowDropdown(false);
                                navigate('/profile');
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-charcoal hover:bg-gray-50 transition-colors flex items-center gap-3"
                        >
                            <span className="material-symbols-outlined text-lg">person</span>
                            Profile
                        </button>
                        <button
                            onClick={() => {
                                setShowDropdown(false);
                                navigate('/settings');
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-charcoal hover:bg-gray-50 transition-colors flex items-center gap-3"
                        >
                            <span className="material-symbols-outlined text-lg">settings</span>
                            Settings
                        </button>
                    </div>

                    {/* Logout */}
                    <div className="border-t border-gray-100 pt-1">
                        <button
                            onClick={handleLogout}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3"
                        >
                            <span className="material-symbols-outlined text-lg">logout</span>
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
