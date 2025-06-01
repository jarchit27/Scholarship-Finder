import React from 'react'
import { getInitials } from '../../utils/helper'

const ProfileInfo = ({userInfo , onLogout}) => {
  if (!userInfo) return null;
  return (
    <div className='flex items-center gap-3'>
      <div className='h-12 w-12 flex items-center justify-center rounded-full text-slate-950 font-medium bg-slate-100'>
        {getInitials(userInfo.fullname)}
      </div>
      <div>
        <p className='text-sm font-medium'>{userInfo.fullname}</p>
        <button className='text-sm text-slate-700 underline' onClick={onLogout}>
                Logout
        </button>
      </div>


    </div>
  )
}
export default ProfileInfo