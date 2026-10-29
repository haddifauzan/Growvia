'use client'

import React from 'react'

export default function LearningSkeleton() {
  return (
    <div
      style={{ fontFamily: "'Poppins', sans-serif" }}
      className='flex flex-col gap-6 w-full pb-12 animate-pulse text-slate-800 dark:text-slate-200'
    >
      {/* 1. Header Skeleton */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1'>
        <div className='space-y-2'>
          <div className='h-8 w-64 sm:w-80 rounded-2xl bg-slate-200/80 dark:bg-slate-800' />
          <div className='h-4 w-72 sm:w-96 rounded-xl bg-slate-100 dark:bg-slate-800/60' />
        </div>
        <div className='flex gap-2 shrink-0'>
          <div className='h-10 w-28 rounded-2xl bg-slate-100 dark:bg-slate-800' />
          <div className='h-10 w-36 rounded-2xl bg-slate-200/80 dark:bg-slate-800' />
        </div>
      </div>

      {/* 2. Top Gap Alert Banner */}
      <div className='p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-4 shadow-xs'>
        <div className='flex items-center gap-3'>
          <div className='w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800' />
          <div className='space-y-1.5'>
            <div className='h-4 w-52 rounded bg-slate-200/80 dark:bg-slate-800' />
            <div className='h-3 w-72 rounded bg-slate-100 dark:bg-slate-800/60' />
          </div>
        </div>
        <div className='h-8 w-24 rounded-xl bg-slate-100 dark:bg-slate-800' />
      </div>

      {/* 3. Featured Course Hero Skeleton */}
      <div className='w-full h-64 sm:h-72 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 flex flex-col justify-between shadow-xs'>
        <div className='space-y-3'>
          <div className='h-5 w-32 rounded-full bg-slate-100 dark:bg-slate-800' />
          <div className='h-7 w-3/4 rounded-xl bg-slate-200/80 dark:bg-slate-800' />
          <div className='h-4 w-1/2 rounded bg-slate-100 dark:bg-slate-800/60' />
        </div>
        <div className='flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800'>
          <div className='flex gap-2'>
            <div className='h-5 w-20 rounded bg-slate-100 dark:bg-slate-800' />
            <div className='h-5 w-24 rounded bg-slate-100 dark:bg-slate-800' />
          </div>
          <div className='h-9 w-32 rounded-xl bg-slate-200/80 dark:bg-slate-800' />
        </div>
      </div>

      {/* 4. Filter Bar */}
      <div className='flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3'>
        <div className='h-10 w-full sm:w-80 rounded-xl bg-slate-100 dark:bg-slate-800' />
        <div className='flex gap-2 overflow-x-auto'>
          {[1, 2, 3, 4, 5].map(n => (
            <div key={n} className='h-8 w-20 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0' />
          ))}
        </div>
      </div>

      {/* 5. Course Cards Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6'>
        {[1, 2, 3, 4, 5, 6].map(idx => (
          <div
            key={idx}
            className='p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-xs flex flex-col justify-between h-[280px]'
          >
            <div>
              <div className='flex justify-between items-center'>
                <div className='h-4 w-20 rounded-full bg-slate-100 dark:bg-slate-800' />
                <div className='h-4 w-14 rounded-full bg-slate-100 dark:bg-slate-800' />
              </div>
              <div className='space-y-2 mt-3.5'>
                <div className='h-5 w-5/6 rounded-lg bg-slate-200/80 dark:bg-slate-800' />
                <div className='h-3.5 w-full rounded bg-slate-100 dark:bg-slate-800/60' />
                <div className='h-3.5 w-2/3 rounded bg-slate-100 dark:bg-slate-800/60' />
              </div>
            </div>
            <div className='pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center'>
              <div className='h-3.5 w-24 rounded bg-slate-100 dark:bg-slate-800/60' />
              <div className='h-8 w-24 rounded-xl bg-slate-200/80 dark:bg-slate-800' />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

