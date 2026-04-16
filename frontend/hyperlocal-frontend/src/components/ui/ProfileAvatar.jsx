import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from '../../hooks/useDarkMode';

/**
 * ProfileAvatar Component
 * Displays user avatar with initials or photo and dropdown menu
 */
export default function ProfileAvatar({ user, onLogout }) {
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const { dark } = useDarkMode();
    const canAccessProfile = (user?.profileCompletion ?? 0) >= 100
        && (user?.verificationStatus === 'VERIFIED' || user?.isVerified === true);

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
                <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-white font-bold text-base shadow-md">
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
                <span className={`material-symbols-outlined text-base hidden sm:block ${dark ? 'text-white/70' : 'text-muted-green'}`}>
                    {showDropdown ? 'expand_less' : 'expand_more'}
                </span>
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
                <div className={`absolute right-0 mt-2 w-60 rounded-xl shadow-lg border py-2 z-50 animate-scale-in ${dark ? 'bg-[#10251f] border-white/10 shadow-black/35' : 'bg-white border-gray-200'}`}>
                    {/* User Info */}
                    <div className={`px-4 py-3 border-b ${dark ? 'border-white/10' : 'border-gray-100'}`}>
                        <p className="text-base font-semibold text-charcoal">{user?.profile?.name || 'User'}</p>
                        <p className="text-sm text-muted-green">{user?.email || ''}</p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                        <button
                            onClick={() => {
                                if (!canAccessProfile) return;
                                setShowDropdown(false);
                                navigate('/profile');
                            }}
                            disabled={!canAccessProfile}
                            title={!canAccessProfile ? 'Complete 100% verification and get approved to access profile' : 'Open profile'}
                            className={`w-full px-4 py-2.5 text-left text-base transition-colors flex items-center gap-3 ${
                                canAccessProfile
                                    ? dark ? 'text-white/90 hover:bg-white/8' : 'text-charcoal hover:bg-gray-50'
                                    : dark ? 'text-white/45 cursor-not-allowed' : 'text-muted-green/70 cursor-not-allowed'
                            }`}
                        >
                            <span className="material-symbols-outlined text-xl">{canAccessProfile ? 'person' : 'lock'}</span>
                            {canAccessProfile ? 'Profile' : 'Profile (Locked)'}
                        </button>
                    </div>

                    {/* Logout */}
                    <div className={`border-t pt-1 ${dark ? 'border-white/10' : 'border-gray-100'}`}>
                        <button
                            onClick={handleLogout}
                            className={`w-full px-4 py-2.5 text-left text-base transition-colors flex items-center gap-3 ${dark ? 'text-red-400 hover:bg-red-500/12' : 'text-red-600 hover:bg-red-50'}`}
                        >
                            <span className="material-symbols-outlined text-xl">logout</span>
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
