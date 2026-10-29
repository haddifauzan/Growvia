'use client'

import React from 'react'

export default function OpportunitiesSkeleton() {
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
        <div className='h-10 w-44 rounded-2xl bg-slate-100 dark:bg-slate-800 shrink-0' />
      </div>

      {/* 2. Search & Filter Bar */}
      <div className='p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-xs'>
        <div className='grid grid-cols-1 md:grid-cols-12 gap-3'>
          <div className='md:col-span-6 h-10 rounded-xl bg-slate-100 dark:bg-slate-800' />
          <div className='md:col-span-3 h-10 rounded-xl bg-slate-100 dark:bg-slate-800' />
          <div className='md:col-span-3 h-10 rounded-xl bg-slate-100 dark:bg-slate-800' />
        </div>
        <div className='flex gap-2 overflow-x-auto pt-1 border-t border-slate-100 dark:border-slate-800'>
          {[1, 2, 3, 4, 5].map(n => (
            <div key={n} className='h-7 w-24 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0' />
          ))}
        </div>
      </div>

      {/* 3. Job Opportunity Cards Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div
            key={i}
            className='p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-xs flex flex-col justify-between h-[280px]'
          >
            <div>
              <div className='flex justify-between items-start gap-2'>
                <div className='space-y-1.5 flex-1'>
                  <div className='h-3.5 w-24 rounded bg-slate-100 dark:bg-slate-800' />
                  <div className='h-5 w-4/5 rounded-lg bg-slate-200/80 dark:bg-slate-800' />
                  <div className='h-3.5 w-1/2 rounded bg-slate-100 dark:bg-slate-800/60' />
                </div>
                <div className='w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800' />
              </div>
              <div className='flex gap-1.5 flex-wrap mt-3'>
                <div className='h-5 w-16 rounded-full bg-slate-100 dark:bg-slate-800' />
                <div className='h-5 w-20 rounded-full bg-slate-100 dark:bg-slate-800' />
                <div className='h-5 w-24 rounded-full bg-slate-100 dark:bg-slate-800' />
              </div>
            </div>
            <div className='pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center'>
              <div className='h-4 w-28 rounded bg-slate-100 dark:bg-slate-800/60' />
              <div className='h-8 w-24 rounded-xl bg-slate-200/80 dark:bg-slate-800' />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

