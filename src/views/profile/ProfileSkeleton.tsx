'use client'

import React from 'react'

export default function ProfileSkeleton() {
  return (
    <div
      style={{ fontFamily: "'Poppins', sans-serif" }}
      className='flex flex-col gap-6 w-full max-w-4xl mx-auto pb-16 animate-pulse text-slate-800 dark:text-slate-200'
    >
      {/* 1. Header */}
      <div className='space-y-2 pt-1'>
        <div className='h-8 w-48 sm:w-64 rounded-2xl bg-slate-200/80 dark:bg-slate-800' />
        <div className='h-4 w-72 sm:w-96 rounded-xl bg-slate-100 dark:bg-slate-800/60' />
      </div>

      {/* 2. Avatar Card */}
      <div className='p-6 sm:p-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center gap-6'>
        <div className='w-24 h-24 rounded-full bg-slate-200/80 dark:bg-slate-800 shrink-0' />
        <div className='space-y-2 text-center sm:text-left flex-1'>
          <div className='h-5 w-44 rounded-lg bg-slate-200/80 dark:bg-slate-800 mx-auto sm:mx-0' />
          <div className='h-3.5 w-60 rounded bg-slate-100 dark:bg-slate-800/60 mx-auto sm:mx-0' />
          <div className='h-8 w-32 rounded-xl bg-slate-100 dark:bg-slate-800 mt-2 mx-auto sm:mx-0' />
        </div>
      </div>

      {/* 3. Form Sections */}
      <div className='bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6'>
        <div className='space-y-2 pb-4 border-b border-slate-100 dark:border-slate-800'>
          <div className='h-5 w-36 rounded-lg bg-slate-200/80 dark:bg-slate-800' />
          <div className='h-3.5 w-64 rounded bg-slate-100 dark:bg-slate-800/60' />
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
          {[1, 2, 3, 4, 5, 6].map(n => (
            <div key={n} className='space-y-2'>
              <div className='h-3.5 w-28 rounded bg-slate-100 dark:bg-slate-800' />
              <div className='h-11 w-full rounded-xl bg-slate-100 dark:bg-slate-800' />
            </div>
          ))}
        </div>

        <div className='space-y-2 pt-2'>
          <div className='h-3.5 w-36 rounded bg-slate-100 dark:bg-slate-800' />
          <div className='h-24 w-full rounded-2xl bg-slate-100 dark:bg-slate-800' />
        </div>

        <div className='flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800'>
          <div className='h-10 w-40 rounded-2xl bg-slate-200/80 dark:bg-slate-800' />
        </div>
      </div>
    </div>
  )
}

