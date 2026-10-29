'use client'

import React from 'react'

export default function ExperienceSkeleton() {
  return (
    <div
      style={{ fontFamily: "'Poppins', sans-serif" }}
      className='flex flex-col gap-6 w-full pb-12 animate-pulse text-slate-800 dark:text-slate-200'
    >
      {/* 1. Header */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1'>
        <div className='space-y-2'>
          <div className='h-8 w-64 sm:w-80 rounded-2xl bg-slate-200/80 dark:bg-slate-800' />
          <div className='h-4 w-72 sm:w-96 rounded-xl bg-slate-100 dark:bg-slate-800/60' />
        </div>
        <div className='h-10 w-44 rounded-2xl bg-slate-200/80 dark:bg-slate-800 shrink-0' />
      </div>

      {/* 2. 4 Stat Cards */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4'>
        {[1, 2, 3, 4].map(i => (
          <div
            key={i}
            className='bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-xs flex flex-col justify-between h-[130px]'
          >
            <div className='flex items-center justify-between'>
              <div className='h-3 w-24 rounded bg-slate-200/80 dark:bg-slate-800' />
              <div className='w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800' />
            </div>
            <div className='space-y-1.5 mt-2'>
              <div className='h-7 w-16 rounded-lg bg-slate-200 dark:bg-slate-700/80' />
              <div className='h-2.5 w-28 rounded bg-slate-100 dark:bg-slate-800/60' />
            </div>
          </div>
        ))}
      </div>

      {/* 3. AI Skill Booster Banner Skeleton */}
      <div className='p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2.5'>
            <div className='w-8 h-8 rounded-xl bg-slate-200/80 dark:bg-slate-800' />
            <div className='h-4 w-48 rounded-md bg-slate-200/80 dark:bg-slate-800' />
          </div>
          <div className='h-7 w-24 rounded-lg bg-slate-100 dark:bg-slate-800/60' />
        </div>
        <div className='h-20 w-full rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800' />
      </div>

      {/* 4. Filter Bar */}
      <div className='flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3'>
        <div className='h-10 w-full sm:w-72 rounded-xl bg-slate-100 dark:bg-slate-800' />
        <div className='flex gap-2 overflow-x-auto'>
          {[1, 2, 3, 4].map(n => (
            <div key={n} className='h-8 w-20 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0' />
          ))}
        </div>
      </div>

      {/* 5. Experience Cards Grid */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5'>
        {[1, 2, 3, 4, 5, 6].map(n => (
          <div
            key={n}
            className='p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 space-y-3.5 shadow-xs'
          >
            <div className='flex justify-between items-start'>
              <div className='w-20 h-5 bg-slate-200/80 dark:bg-slate-800 rounded-full' />
              <div className='w-6 h-6 bg-slate-100 dark:bg-slate-800 rounded-lg' />
            </div>
            <div className='space-y-1.5'>
              <div className='w-3/4 h-5 bg-slate-200 dark:bg-slate-800 rounded-lg' />
              <div className='w-1/2 h-3.5 bg-slate-100 dark:bg-slate-800/60 rounded-md' />
            </div>
            <div className='w-full h-14 bg-slate-50 dark:bg-slate-900/60 rounded-xl pt-2' />
            <div className='pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center'>
              <div className='w-24 h-3 bg-slate-100 dark:bg-slate-800/60 rounded' />
              <div className='w-14 h-3 bg-slate-100 dark:bg-slate-800/60 rounded' />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

