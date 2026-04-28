import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/constants";

// Export function useBatteries
export function useBatteries() {
  const [batteries, setBatteries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  useEffect(() => {
    async function fetchBatteries() {
      try {
        const response = await fetch(`${API_BASE_URL}/batteries`)
        if (!response.ok) {
          throw new Error(`Erreur HTTP : ${response.status}`)
        }
        const data = await response.json()
        setBatteries(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    
    fetchBatteries()
  }, [])

  return {batteries, loading, error}    
}