'use client'

import React from 'react'

export default function PortfolioSkeleton() {
  return (
    <div
      style={{ fontFamily: "'Poppins', sans-serif" }}
      className='flex flex-col gap-6 w-full max-w-[1500px] mx-auto pb-16 animate-pulse text-slate-800 dark:text-slate-200'
    >
      {/* 1. Header with URL & Toggle */}
      <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs'>
        <div className='space-y-2'>
          <div className='h-7 w-64 sm:w-80 rounded-xl bg-slate-200/80 dark:bg-slate-800' />
          <div className='h-4 w-72 sm:w-96 rounded-md bg-slate-100 dark:bg-slate-800/60' />
        </div>
        <div className='flex items-center gap-3 shrink-0'>
          <div className='h-10 w-48 rounded-2xl bg-slate-100 dark:bg-slate-800' />
          <div className='h-10 w-32 rounded-2xl bg-slate-200/80 dark:bg-slate-800' />
        </div>
      </div>

      {/* 2. Dual Panel Builder Layout */}
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
        {/* Left Panel: Settings Controls (5 cols) */}
        <div className='lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-6'>
          <div className='space-y-2 pb-4 border-b border-slate-100 dark:border-slate-800'>
            <div className='h-5 w-40 rounded-lg bg-slate-200/80 dark:bg-slate-800' />
            <div className='h-3.5 w-60 rounded bg-slate-100 dark:bg-slate-800/60' />
          </div>

          {/* Avatar & Basic Info */}
          <div className='flex items-center gap-4'>
            <div className='w-16 h-16 rounded-2xl bg-slate-200/80 dark:bg-slate-800' />
            <div className='space-y-2 flex-1'>
              <div className='h-4 w-36 rounded bg-slate-200/80 dark:bg-slate-800' />
              <div className='h-3 w-48 rounded bg-slate-100 dark:bg-slate-800/60' />
            </div>
          </div>

          {/* Form Fields */}
          <div className='space-y-4'>
            <div className='space-y-1.5'>
              <div className='h-3.5 w-24 rounded bg-slate-100 dark:bg-slate-800' />
              <div className='h-10 w-full rounded-xl bg-slate-100 dark:bg-slate-800' />
            </div>
            <div className='space-y-1.5'>
              <div className='h-3.5 w-24 rounded bg-slate-100 dark:bg-slate-800' />
              <div className='h-20 w-full rounded-xl bg-slate-100 dark:bg-slate-800' />
            </div>
            <div className='space-y-1.5'>
              <div className='h-3.5 w-32 rounded bg-slate-100 dark:bg-slate-800' />
              <div className='flex gap-2'>
                {[1, 2, 3, 4].map(n => (
                  <div key={n} className='h-8 w-16 rounded-lg bg-slate-100 dark:bg-slate-800' />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Live Preview Card (7 cols) */}
        <div className='lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 shadow-xs space-y-6'>
          <div className='flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800'>
            <div className='h-4 w-32 rounded bg-slate-100 dark:bg-slate-800' />
            <div className='h-6 w-20 rounded-full bg-slate-100 dark:bg-slate-800' />
          </div>

          <div className='flex flex-col items-center text-center space-y-3 py-4'>
            <div className='w-24 h-24 rounded-full bg-slate-200/80 dark:bg-slate-800' />
            <div className='h-6 w-48 rounded-xl bg-slate-200/80 dark:bg-slate-800' />
            <div className='h-4 w-64 rounded bg-slate-100 dark:bg-slate-800/60' />
            <div className='h-3.5 w-80 rounded bg-slate-100 dark:bg-slate-800/60' />
          </div>

          <div className='space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800'>
            <div className='h-4 w-36 rounded bg-slate-200/80 dark:bg-slate-800' />
            <div className='flex gap-2 flex-wrap'>
              {[1, 2, 3, 4, 5, 6].map(n => (
                <div key={n} className='h-6 w-20 rounded-full bg-slate-100 dark:bg-slate-800' />
              ))}
            </div>
          </div>

          <div className='space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800'>
            <div className='h-4 w-40 rounded bg-slate-200/80 dark:bg-slate-800' />
            <div className='h-20 w-full rounded-2xl bg-slate-50 dark:bg-slate-800/50' />
          </div>
        </div>
      </div>
    </div>
  )
}

