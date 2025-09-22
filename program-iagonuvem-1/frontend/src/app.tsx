import { AppProviders } from '@/components/app-providers.tsx'
import { AppLayout } from '@/components/app-layout.tsx'
import { RouteObject, useRoutes } from 'react-router'
import { lazy } from 'react'

const links = [
  //
  { label: 'Home', path: '/' },
  { label: 'Account', path: '/account' },
  { label: 'Tweets', path: '/tweets'}
]
const LazyDashboard = lazy(() => import('@/components/dashboard/dashboard-feature'))
const LazyAccountIndex = lazy(() => import('@/components/account/account-index-feature'))
const LazyAccountDetail = lazy(() => import('@/components/account/account-detail-feature'))
const LazyTwitterIndex = lazy(() => import('@/components/twitter/twitter-index-feature'))
const LazyTwitterDetail = lazy(() => import('@/components/twitter/twitter-detail-feature'))


const routes: RouteObject[] = [
  { index: true, element: <LazyDashboard /> },
  {
    path: 'account',
    children: [
      { index: true, element: <LazyAccountIndex /> },
      { path: ':address', element: <LazyAccountDetail /> },
    ],
  },
  {
    path: 'tweets',
    children: [
      { index: true, element: <LazyTwitterIndex /> },
      { path: ':address', element: <LazyTwitterDetail /> },
    ],
  }
]

export function App() {
  const router = useRoutes(routes)
  return (
    <AppProviders>
      <AppLayout links={links}>{router}</AppLayout>
    </AppProviders>
  )
}
