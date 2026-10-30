import { cookies } from 'next/headers'

import { prisma } from '@/libs/prisma'
import { AUTH_COOKIE_NAME, verifyJwtToken } from '@/server/utils/auth'
import { apiSuccess, apiError } from '@/server/utils/response'

async function getAuthenticatedUserId(req: Request): Promise<string | null> {
  const cookieStore = await cookies()
  let token = cookieStore.get(AUTH_COOKIE_NAME)?.value

  if (!token) {
    const authHeader = req.headers.get('authorization')

    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    }
  }

  if (!token) return null

  const decoded = await verifyJwtToken(token)

  return decoded?.userId || null
}

export async function GET(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req)

    if (!userId) {
      return apiError('Tidak terautentikasi', 401)
    }

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20
    })

    const unreadCount = notifications.filter(n => !n.isRead).length

    return apiSuccess({
      notifications,
      unreadCount
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)

    return apiError('Gagal memuat notifikasi', 500, error)
  }
}

export async function PATCH(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req)

    if (!userId) {
      return apiError('Tidak terautentikasi', 401)
    }

    const body = await req.json().catch(() => ({}))
    const { id, markAllAsRead } = body

    if (markAllAsRead) {
      await prisma.notification.updateMany({
        where: {
          userId,
          isRead: false
        },
        data: {
          isRead: true,
          readAt: new Date()
        }
      })

      return apiSuccess({ unreadCount: 0 }, 'Semua notifikasi ditandai telah dibaca')
    }

    if (id) {
      await prisma.notification.update({
        where: {
          id,
          userId
        },
        data: {
          isRead: true,
          readAt: new Date()
        }
      })

      const remainingUnread = await prisma.notification.count({
        where: {
          userId,
          isRead: false
        }
      })

      return apiSuccess({ unreadCount: remainingUnread }, 'Notifikasi ditandai telah dibaca')
    }

    return apiError('Parameter tidak valid', 400)
  } catch (error) {
    console.error('Error updating notification:', error)

    return apiError('Gagal memperbarui notifikasi', 500, error)
  }
}
