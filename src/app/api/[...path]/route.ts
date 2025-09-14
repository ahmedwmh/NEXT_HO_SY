import { Hono } from 'hono'
import { handle } from 'hono/nextjs'
import app from '@/api/rpc'

const handler = handle(app)

export { handler as GET, handler as POST, handler as PUT, handler as DELETE, handler as PATCH }
