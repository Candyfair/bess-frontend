'use client'

import { useBatteries } from "@/hooks/useBatteries"

export default function Home() {
  const {batteries, loading, error} = useBatteries()

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error: {error}</p>

  return (
    <main>
      <p>{batteries.length} loaded batteries</p>
    </main>
  )
}