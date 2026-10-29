'use client'

import React from 'react'

export default function SettingsSkeleton() {
  return (
    <div
      style={{ fontFamily: "'Poppins', sans-serif" }}
      className='flex flex-col gap-6 w-full max-w-4xl mx-auto pb-16 animate-pulse text-slate-800 dark:text-slate-200'
    >
      {/* 1. Header */}
      <div className='space-y-2 pt-1'>
        <div className='h-8 w-52 sm:w-64 rounded-2xl bg-slate-200/80 dark:bg-slate-800' />
        <div className='h-4 w-72 sm:w-96 rounded-xl bg-slate-100 dark:bg-slate-800/60' />
      </div>

      {/* 2. Tabs Bar */}
      <div className='flex gap-2.5 overflow-x-auto pb-1 border-b border-slate-200/80 dark:border-slate-800'>
        {[1, 2, 3, 4].map(n => (
          <div key={n} className='h-9 w-28 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0' />
        ))}
      </div>

      {/* 3. Settings Card */}
      <div className='bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6'>
        <div className='space-y-2 pb-4 border-b border-slate-100 dark:border-slate-800'>
          <div className='h-5 w-44 rounded-lg bg-slate-200/80 dark:bg-slate-800' />
          <div className='h-3.5 w-72 rounded bg-slate-100 dark:bg-slate-800/60' />
        </div>

        <div className='space-y-4 max-w-lg'>
          {[1, 2, 3].map(n => (
            <div key={n} className='space-y-2'>
              <div className='h-3.5 w-32 rounded bg-slate-100 dark:bg-slate-800' />
              <div className='h-11 w-full rounded-xl bg-slate-100 dark:bg-slate-800' />
            </div>
          ))}
        </div>

        <div className='flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800'>
          <div className='h-10 w-44 rounded-2xl bg-slate-200/80 dark:bg-slate-800' />
        </div>
      </div>
    </div>
  )
}

