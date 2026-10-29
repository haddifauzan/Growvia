'use client'

import React from 'react'

export default function SkillMatrixSkeleton() {
  return (
    <div
      style={{ fontFamily: "'Poppins', sans-serif" }}
      className='flex flex-col gap-6 w-full pb-12 animate-pulse text-slate-800 dark:text-slate-200'
    >
      {/* 1. Header */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1'>
        <div className='space-y-2'>
          <div className='h-8 w-56 sm:w-72 rounded-2xl bg-slate-200/80 dark:bg-slate-800' />
          <div className='h-4 w-72 sm:w-96 rounded-xl bg-slate-100 dark:bg-slate-800/60' />
        </div>
        <div className='flex gap-2.5 shrink-0'>
          <div className='h-10 w-36 rounded-2xl bg-slate-100 dark:bg-slate-800' />
          <div className='h-10 w-36 rounded-2xl bg-slate-200/80 dark:bg-slate-800' />
        </div>
      </div>

      {/* 2. Competency Banner Skeleton */}
      <div className='p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-xs'>
        <div className='flex items-center gap-4'>
          <div className='w-16 h-16 rounded-2xl bg-slate-200/80 dark:bg-slate-800 shrink-0' />
          <div className='space-y-2'>
            <div className='h-5 w-48 sm:w-64 rounded-xl bg-slate-200/80 dark:bg-slate-800' />
            <div className='h-3.5 w-60 sm:w-80 rounded-md bg-slate-100 dark:bg-slate-800/60' />
          </div>
        </div>
        <div className='h-10 w-40 rounded-2xl bg-slate-100 dark:bg-slate-800 shrink-0' />
      </div>

      {/* 3. Category Summaries (4 columns) */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
        {[1, 2, 3, 4].map(n => (
          <div
            key={n}
            className='p-5 rounded-[16px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between h-[125px]'
          >
            <div className='flex items-center justify-between'>
              <div className='w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800' />
              <div className='h-4 w-14 rounded-full bg-slate-100 dark:bg-slate-800' />
            </div>
            <div className='space-y-1 mt-2'>
              <div className='h-6 w-12 rounded bg-slate-200 dark:bg-slate-700/80' />
              <div className='h-3 w-20 rounded bg-slate-100 dark:bg-slate-800/60' />
            </div>
          </div>
        ))}
      </div>

      {/* 4. Filter & Search Bar */}
      <div className='flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3'>
        <div className='h-10 w-full sm:w-80 rounded-xl bg-slate-100 dark:bg-slate-800' />
        <div className='flex gap-2 overflow-x-auto'>
          {[1, 2, 3, 4, 5].map(n => (
            <div key={n} className='h-8 w-20 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0' />
          ))}
        </div>
      </div>

      {/* 5. Skill Cards Grid */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
        {[1, 2, 3, 4, 5, 6].map(n => (
          <div
            key={n}
            className='p-5 rounded-[16px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between h-[180px]'
          >
            <div>
              <div className='flex items-start justify-between'>
                <div className='space-y-1.5 flex-1'>
                  <div className='h-4 w-3/4 rounded bg-slate-200/80 dark:bg-slate-800' />
                  <div className='h-3 w-1/2 rounded bg-slate-100 dark:bg-slate-800/60' />
                </div>
                <div className='w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800' />
              </div>
              <div className='flex items-center justify-between mt-4'>
                <div className='h-4 w-16 rounded-full bg-slate-100 dark:bg-slate-800' />
                <div className='h-3.5 w-20 rounded bg-slate-100 dark:bg-slate-800/60' />
              </div>
              <div className='h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 mt-2' />
            </div>
            <div className='pt-2.5 border-t border-slate-100 dark:border-slate-800 flex justify-between'>
              <div className='h-3 w-24 rounded bg-slate-100 dark:bg-slate-800/60' />
              <div className='h-3 w-16 rounded bg-slate-100 dark:bg-slate-800/60' />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

