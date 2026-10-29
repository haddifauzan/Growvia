'use client'

import React from 'react'

export default function CareerGapSkeleton() {
  return (
    <div
      style={{ fontFamily: "'Poppins', sans-serif" }}
      className='flex flex-col gap-6 w-full pb-12 animate-pulse text-slate-800 dark:text-slate-200'
    >
      {/* 1. Header */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1'>
        <div className='space-y-2'>
          <div className='h-8 w-60 sm:w-80 rounded-2xl bg-slate-200/80 dark:bg-slate-800' />
          <div className='h-4 w-72 sm:w-96 rounded-xl bg-slate-100 dark:bg-slate-800/60' />
        </div>
        <div className='flex gap-2.5 shrink-0'>
          <div className='h-10 w-36 rounded-2xl bg-slate-100 dark:bg-slate-800' />
          <div className='h-10 w-36 rounded-2xl bg-slate-200/80 dark:bg-slate-800' />
        </div>
      </div>

      {/* 2. Target Career Hero Banner */}
      <div className='p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs'>
        <div className='space-y-3 flex-1'>
          <div className='h-5 w-28 rounded-full bg-slate-100 dark:bg-slate-800' />
          <div className='h-8 w-64 sm:w-80 rounded-2xl bg-slate-200/80 dark:bg-slate-800' />
          <div className='h-4 w-5/6 rounded-md bg-slate-100 dark:bg-slate-800/60' />
        </div>
        <div className='flex items-center gap-4 shrink-0'>
          <div className='w-20 h-20 rounded-3xl bg-slate-100 dark:bg-slate-800' />
          <div className='space-y-1.5'>
            <div className='h-7 w-20 rounded-xl bg-slate-200 dark:bg-slate-700/80' />
            <div className='h-3.5 w-24 rounded bg-slate-100 dark:bg-slate-800/60' />
          </div>
        </div>
      </div>

      {/* 3. Skill Gap Analysis Layout (2 Columns) */}
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
        {/* Left Column (7 cols): Skill Breakdown */}
        <div className='lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-5'>
          <div className='flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800'>
            <div className='h-5 w-44 rounded-xl bg-slate-200/80 dark:bg-slate-800' />
            <div className='h-4 w-20 rounded bg-slate-100 dark:bg-slate-800' />
          </div>
          <div className='space-y-3'>
            {[1, 2, 3, 4, 5].map(n => (
              <div
                key={n}
                className='p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-3'
              >
                <div className='space-y-1.5 flex-1'>
                  <div className='h-4 w-40 rounded bg-slate-200/80 dark:bg-slate-800' />
                  <div className='h-3 w-28 rounded bg-slate-100 dark:bg-slate-800/60' />
                </div>
                <div className='h-6 w-20 rounded-full bg-slate-200 dark:bg-slate-700' />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (5 cols): Gap Recommendation Roadmap */}
        <div className='lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-5'>
          <div className='flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800'>
            <div className='h-5 w-48 rounded-xl bg-slate-200/80 dark:bg-slate-800' />
            <div className='w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800' />
          </div>
          <div className='space-y-3.5'>
            {[1, 2, 3].map(n => (
              <div
                key={n}
                className='p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 space-y-2.5'
              >
                <div className='flex justify-between items-start'>
                  <div className='h-4 w-44 rounded bg-slate-200/80 dark:bg-slate-800' />
                  <div className='h-4 w-12 rounded-full bg-slate-100 dark:bg-slate-800' />
                </div>
                <div className='h-3 w-5/6 rounded bg-slate-100 dark:bg-slate-800/60' />
                <div className='h-7 w-28 rounded-xl bg-slate-200/80 dark:bg-slate-800 pt-1' />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

