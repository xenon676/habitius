import React, { useState } from 'react';
import { AppleLogoIcon, GoogleLogoIcon, CaretDownIcon } from '@phosphor-icons/react';
import { updateCronTime } from '../../api/tasksApi';
import { useAuth } from '../../contexts/AuthContext';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [cronTime, setCronTime] = useState(0)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const cronTimeOptions = Array.from({ length: 13 }, (_, i) => ({
    value: i,
    label: i === 0 ? 'Default (12:00 AM)' : `+${i} hours (${(i % 12 || 12)}:00 ${i < 12 ? 'AM' : 'PM'})`
  }))

  const handleCronTimeChange = async (value: number) => {
    try {
      await updateCronTime(value)
      setCronTime(value)
      setIsDropdownOpen(false)
    } catch (error) {
      console.error('Failed to update cron time:', error)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-6">Account</h2>
        <div className="border-b border-main-gray3 mb-3" />
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-main-gray3 pb-3">
            <div className="flex items-center gap-8">
              <h3 className="font-medium w-32">Username</h3>
              <p className="text-main-gray6">{user?.username}</p>
            </div>
            <button className="text-main-teal2 hover:text-main-teal1">Edit</button>
          </div>
          <div className="flex items-center justify-between border-b border-main-gray3 pb-3">
            <div className="flex items-center gap-8">
              <h3 className="font-medium w-32">Email</h3>
              <p className="text-main-gray6">user@example.com</p>
            </div>
            <button className="text-main-teal2 hover:text-main-teal1">Edit</button>
          </div>
          <div className="flex items-center justify-between border-b border-main-gray3 pb-3">
            <div className="flex items-center gap-8">
              <h3 className="font-medium w-32">Display name</h3>
              <p className="text-main-gray6">Example User</p>
            </div>
            <button className="text-main-teal2 hover:text-main-teal1">Edit</button>
          </div>
          <div className="flex items-center justify-between border-b border-main-gray3 pb-3">
            <div className="flex items-center gap-8">
              <h3 className="font-medium w-32">Password</h3>
              <p className="text-main-gray6">••••••••</p>
            </div>
            <button className="text-main-teal2 hover:text-main-teal1">Edit</button>
          </div>
          <div className="flex items-center justify-between border-b border-main-gray3 pb-3">
            <div>
              <h3 className="font-medium">Reset Account</h3>
            </div>
            <button className="text-main-teal2 hover:text-main-teal1">Learn More</button>
          </div>
          <div className="flex items-center justify-between border-b border-main-gray3 pb-3">
            <div>
              <h3 className="font-medium">Delete Account</h3>
            </div>
            <button className="text-main-teal2 hover:text-main-teal1">Learn More</button>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6">Login Methods</h2>
        <div className="border-b border-main-gray3 mb-3" />
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-main-gray3 pb-3">
            <div className="flex items-center gap-3">
              <AppleLogoIcon size={24} weight="bold" />
              <span className="font-medium">Apple</span>
            </div>
            <button className="text-main-teal2 hover:text-main-teal1">Connect</button>
          </div>
          <div className="flex items-center justify-between border-b border-main-gray3 pb-3">
            <div className="flex items-center gap-3">
              <GoogleLogoIcon size={24} weight="bold" />
              <span className="font-medium">Google</span>
            </div>
            <button className="text-main-teal2 hover:text-main-teal1">Connect</button>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6">Site</h2>
        <div className="border-b border-main-gray3 mb-3" />
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-main-gray3 pb-3">
            <div className="flex items-center gap-8">
              <h3 className="font-medium w-32">Date Format</h3>
              <p className="text-main-gray6">MM/dd/yyyy</p>
            </div>
            <button className="text-main-teal2 hover:text-main-teal1">Edit</button>
          </div>
          <div className="flex items-center justify-between border-b border-main-gray3 pb-3">
            <div className="flex items-center gap-8">
              <h3 className="font-medium w-32">Day Start</h3>
              <div className="relative flex-1">
                <div 
                  className="w-full cursor-pointer flex items-center justify-between"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <p className="text-main-gray6">{cronTimeOptions[cronTime].label}</p>
                  <CaretDownIcon 
                    size={16}
                    className={`text-main-gray5 transition-transform ml-16 ${isDropdownOpen ? 'rotate-180' : ''}`}
                  />
                </div>
                
                {isDropdownOpen && (
                  <div className="absolute left-0 right-0 mt-1 bg-white border border-main-gray3 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                    {cronTimeOptions.map((option) => (
                      <div
                        key={option.value}
                        className={`p-2 cursor-pointer hover:bg-main-gray2 ${
                          cronTime === option.value ? 'bg-main-gray2 text-main-teal1' : 'text-main-gray7'
                        }`}
                        onClick={() => handleCronTimeChange(option.value)}
                      >
                        {option.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between border-b border-main-gray3 pb-3">
            <div>
              <h3 className="font-medium">Pause Damage</h3>
            </div>
            <button className="text-main-teal2 hover:text-main-teal1">Learn More</button>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6">Character</h2>
        <div className="border-b border-main-gray3 mb-3" />
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-main-gray3 pb-3">
            <div>
              <h3 className="font-medium">Fix Values</h3>
            </div>
            <button className="text-main-teal2 hover:text-main-teal1">Edit</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Settings; 